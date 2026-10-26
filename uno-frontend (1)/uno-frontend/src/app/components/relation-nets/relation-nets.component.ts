import { Component, inject, OnInit, AfterViewInit, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';
import { ApiClientService } from '../../services/api-client.service';

interface RiskGroup {
  id: string;
  score: number;
  tier: 'Low' | 'Review' | 'High';
  customerCount: number;
  relationshipCount: number;
  longestChain: number;
  sharedNominees: number;
  hasCycle: boolean;
  reasons: string[];
}

@Component({
  selector: 'app-relation-nets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relation-nets.component.html',
  styleUrls: ['./relation-nets.component.scss']
})
export class RelationNetsComponent implements OnInit, AfterViewInit {
  private apiClient = inject(ApiClientService);
  private http = inject(HttpClient);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private readonly assistantEndpoint = 'http://127.0.0.1:8091';

  searchQuery = '';
  searchType = 'name'; // 'name' or 'id'
  selectedCustomer: any = null;
  isLoading = false;
  error = '';

  // Graph data
  nodes: any[] = [];
  links: any[] = [];
  riskGroups: RiskGroup[] = [];
  aiInsights: Record<string, string> = {};
  aiInsightErrors: Record<string, string> = {};
  aiInsightLoading: Record<string, boolean> = {};
  highlightedNodes: Set<string> = new Set();
  highlightedLinks: Set<string> = new Set();

  // Graph visualization state
  private svg: any;
  private simulation: any;
  private zoom: any;
  private g: any;

  ngOnInit(): void {
    this.loadGraphData();
  }

  ngAfterViewInit(): void {
    // Don't initialize graph here - wait for data to load first
  }

  async loadGraphData(): Promise<void> {
    try {
      this.isLoading = true;
      this.apiClient.loadToken();

      // Load all applications to build relationship graph
      const applications = await this.apiClient.getAllApplications().toPromise();
      console.log('Relation Nets: Applications loaded:', applications?.length || 0);
      console.log('Relation Nets: Sample application:', applications?.[0]);

      // Build customer nodes from account owners, then add only declared nominee edges.
      const customerMap = new Map<string, any>();
      const links: any[] = [];
      const applicationRows = applications || [];
      applicationRows.forEach((app: any) => {
        const customerId = app.customerId || app.fdAccountNo;
        const customerName = app.applicantFullName || `${app.applicantFirstName || ''} ${app.applicantLastName || ''}`.trim() || 'Unknown';
        if (!customerId) return;

        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            name: customerName,
            group: 'customer',
            fdCount: 0,
            totalInvestment: 0,
            color: '#fde7b0'
          });
        }

        const customer = customerMap.get(customerId);
        customer.fdCount++;
        customer.totalInvestment += parseFloat(app.principalAmount) || 0;
      });

      const customers = Array.from(customerMap.values());
      const customersByName = new Map<string, any[]>();
      customers.forEach(customer => {
        const key = this.normalizeName(customer.name);
        if (!key) return;
        customersByName.set(key, [...(customersByName.get(key) || []), customer]);
      });

      const nomineeNodes = new Map<string, any>();
      applicationRows.forEach((app: any) => {
        const sourceId = app.customerId || app.fdAccountNo;
        if (!sourceId || !customerMap.has(sourceId)) return;
        const declarations = Array.isArray(app.nominees) && app.nominees.length
          ? app.nominees
          : (app.nomineeName ? [{ name: app.nomineeName, relation: app.nomineeRelation }] : []);

        declarations.forEach((nominee: any) => {
          const nomineeName = String(nominee?.name || nominee?.nomineeName || '').trim();
          const normalized = this.normalizeName(nomineeName);
          if (!normalized) return;

          // Link to an existing customer only on an exact, unique name match.
          // Ambiguous names remain separate nominee nodes rather than being guessed.
          const matches = customersByName.get(normalized) || [];
          let targetId: string;
          if (matches.length === 1) {
            targetId = matches[0].id;
          } else {
            targetId = `nominee:${normalized}`;
            if (!nomineeNodes.has(targetId)) {
              nomineeNodes.set(targetId, {
                id: targetId,
                name: nomineeName,
                group: 'nominee',
                fdCount: 0,
                totalInvestment: 0,
                color: '#c7d2fe',
                identityMatch: matches.length > 1 ? 'ambiguous' : 'unmatched',
              });
            }
          }

          links.push({
            source: sourceId,
            target: targetId,
            type: 'nominee',
            relation: String(nominee?.relation || nominee?.nomineeRelation || 'Unspecified'),
            fdAccountNo: app.fdAccountNo,
          });
        });
      });

      this.nodes = [...customers, ...nomineeNodes.values()];
      this.links = links;
      this.riskGroups = this.assessGraphRisk();

      // Set loading to false first so the container renders
      this.isLoading = false;

      // Force change detection to update the DOM
      this.cdr.detectChanges();

      // Wait for the DOM to update, then initialize/update graph
      setTimeout(() => {
        const container = this.elementRef.nativeElement.querySelector('.graph-container');
        console.log('Relation Nets: Container check after setTimeout:', !!container);

        if (!this.svg && container) {
          // If SVG not initialized yet, initialize it now
          this.initializeGraph();
        } else if (this.svg) {
          // If SVG already exists, just update the graph
          this.updateGraph();
        } else {
          console.error('Relation Nets: Container still not found after timeout');
        }
      }, 150);
    } catch (error: any) {
      console.error('Error loading graph data:', error);
      this.error = 'Failed to load relationship data';
      this.isLoading = false;
    }
  }

  private normalizeName(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private assessGraphRisk(): RiskGroup[] {
    const nodeById = new Map<string, any>(this.nodes.map(node => [node.id, node]));
    const undirected = new Map<string, Set<string>>();
    const outgoing = new Map<string, Set<string>>();
    const incoming = new Map<string, Set<string>>();
    this.nodes.forEach(node => {
      undirected.set(node.id, new Set());
      outgoing.set(node.id, new Set());
      incoming.set(node.id, new Set());
    });
    this.links.forEach(link => {
      const source = String(typeof link.source === 'object' ? link.source.id : link.source);
      const target = String(typeof link.target === 'object' ? link.target.id : link.target);
      if (!nodeById.has(source) || !nodeById.has(target)) return;
      undirected.get(source)!.add(target);
      undirected.get(target)!.add(source);
      outgoing.get(source)!.add(target);
      incoming.get(target)!.add(source);
    });

    const seen = new Set<string>();
    const groups: RiskGroup[] = [];
    for (const node of this.nodes) {
      if (seen.has(node.id) || !undirected.get(node.id)!.size) continue;
      const component = new Set<string>();
      const queue = [node.id];
      while (queue.length) {
        const current = queue.pop()!;
        if (component.has(current)) continue;
        component.add(current);
        seen.add(current);
        undirected.get(current)!.forEach(neighbor => { if (!component.has(neighbor)) queue.push(neighbor); });
      }

      const customerIds = [...component].filter(id => nodeById.get(id)?.group === 'customer');
      const edges = this.links.filter(link => {
        const source = String(typeof link.source === 'object' ? link.source.id : link.source);
        const target = String(typeof link.target === 'object' ? link.target.id : link.target);
        return component.has(source) && component.has(target);
      });
      const indegree = new Map([...component].map(id => [id, 0]));
      component.forEach(id => incoming.get(id)!.forEach(source => {
        if (component.has(source)) indegree.set(id, indegree.get(id)! + 1);
      }));
      const ready = [...component].filter(id => indegree.get(id) === 0);
      const depth = new Map([...component].map(id => [id, 0]));
      let processed = 0;
      while (ready.length) {
        const current = ready.shift()!;
        processed++;
        outgoing.get(current)!.forEach(next => {
          if (!component.has(next)) return;
          depth.set(next, Math.max(depth.get(next)!, depth.get(current)! + 1));
          indegree.set(next, indegree.get(next)! - 1);
          if (indegree.get(next) === 0) ready.push(next);
        });
      }
      const hasCycle = processed < component.size;
      const longestChain = Math.max(0, ...depth.values());
      const sharedNominees = [...component].filter(id =>
        nodeById.get(id)?.group === 'nominee' && incoming.get(id)!.size > 1
      ).length;

      const reasons: string[] = [];
      let score = 0;
      if (longestChain >= 3) { score += 30; reasons.push(`A nominee chain spans ${longestChain} recorded links`); }
      else if (longestChain >= 2) { score += 15; reasons.push(`A nominee chain spans ${longestChain} recorded links`); }
      if (sharedNominees) { score += Math.min(30, sharedNominees * 15); reasons.push(`${sharedNominees} nominee node(s) are linked from multiple customers`); }
      if (hasCycle) { score += 35; reasons.push('The directed nominee links contain a cycle'); }
      if (customerIds.length >= 5) { score += 10; reasons.push(`The connected group contains ${customerIds.length} customer nodes`); }
      score = Math.min(100, score);

      const group: RiskGroup = {
        id: `Network ${groups.length + 1}`,
        score,
        tier: score >= 60 ? 'High' : score >= 30 ? 'Review' : 'Low',
        customerCount: customerIds.length,
        relationshipCount: edges.length,
        longestChain,
        sharedNominees,
        hasCycle,
        reasons: reasons.length ? reasons : ['No elevated structural signal found in the recorded nominee links'],
      };
      groups.push(group);
      component.forEach(id => {
        nodeById.get(id).riskGroup = group;
      });
    }
    return groups.sort((a, b) => b.score - a.score);
  }

  generateRiskInsight(group: RiskGroup): void {
    if (this.aiInsightLoading[group.id]) return;
    this.apiClient.loadToken();
    const token = this.apiClient.getToken();
    if (!token) {
      this.aiInsightErrors[group.id] = 'Please sign in with an authorized staff account to request an AI insight.';
      return;
    }

    this.aiInsightLoading[group.id] = true;
    delete this.aiInsightErrors[group.id];
    this.http.post<{ insight: string }>(
      `${this.assistantEndpoint}/api/assistant/risk-insight`,
      {
        score: group.score,
        tier: group.tier.toLowerCase(),
        customer_count: group.customerCount,
        relationship_count: group.relationshipCount,
        longest_chain: group.longestChain,
        shared_nominees: group.sharedNominees,
        has_cycle: group.hasCycle,
      },
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
    ).pipe(
      timeout(35000),
      finalize(() => {
        this.aiInsightLoading[group.id] = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: result => {
        const insight = typeof result?.insight === 'string' ? result.insight.trim() : '';
        if (!insight) {
          this.aiInsightErrors[group.id] = 'The assistant returned an empty response. Please try again.';
          return;
        }
        this.aiInsights[group.id] = insight;
        this.cdr.detectChanges();
      },
      error: error => {
        if (error?.status === 401 || error?.status === 403) {
          this.aiInsightErrors[group.id] = 'Your staff session is not authorized for AI insights. Sign in again with a bank officer or admin account.';
        } else if (error?.status === 0) {
          this.aiInsightErrors[group.id] = 'Cannot reach the local AI assistant at 127.0.0.1:8091. Start the assistant and Ollama, then try again.';
        } else {
          this.aiInsightErrors[group.id] = 'The AI assistant or its Ollama model is unavailable. The deterministic graph score is still available; please try again later.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  private initializeGraph(): void {
    console.log('Relation Nets: Initializing graph, loading D3.js');
    // Load D3.js dynamically
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.onload = () => {
      console.log('Relation Nets: D3.js loaded successfully');
      this.setupGraph();
    };
    script.onerror = () => {
      console.error('Relation Nets: Failed to load D3.js');
    };
    document.head.appendChild(script);
  }

  private setupGraph(): void {
    console.log('Relation Nets: Setting up graph');
    const container = this.elementRef.nativeElement.querySelector('.graph-container');
    if (!container) {
      console.error('Relation Nets: Graph container not found');
      return;
    }

    const width = container.clientWidth;
    const height = 600;
    console.log('Relation Nets: Container dimensions:', width, height);

    // Create SVG
    this.svg = (window as any).d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    console.log('Relation Nets: SVG created');

    // Add zoom behavior
    this.zoom = (window as any).d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    // Create group for zoom
    this.g = this.svg.append('g');

    // Create arrow markers for directed links
    this.g.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', (d: any) => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    console.log('Relation Nets: Graph setup complete, calling updateGraph');
    this.updateGraph();
  }

  private updateGraph(): void {
    if (!this.svg || !this.g) {
      console.log('Relation Nets: updateGraph called but svg or g not ready');
      return;
    }

    console.log('Relation Nets: updateGraph called with', this.nodes.length, 'nodes and', this.links.length, 'links');

    const d3 = (window as any).d3;

    // Clear existing
    this.g.selectAll('*').remove();
    console.log('Relation Nets: Cleared existing graph elements');

    // Re-add markers
    this.g.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', (d: any) => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Initialize random positions for nodes to scatter them
    this.nodes.forEach((node: any) => {
      if (!node.x || !node.y) {
        node.x = Math.random() * 800;
        node.y = Math.random() * 600;
      }
    });
    console.log('Relation Nets: Node positions initialized');

    // Create force simulation for knowledge graph layout
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(400, 300))
      .force('collision', d3.forceCollide().radius(60))
      .force('x', d3.forceX(400).strength(0.02))
      .force('y', d3.forceY(300).strength(0.02));
    console.log('Relation Nets: Force simulation created');

    // Draw links (smooth curved lines)
    const link = this.g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('marker-end', 'url(#end)')
      .attr('stroke', (d: any) => {
        const linkId = `${d.source.id}-${d.target.id}`;
        return this.highlightedLinks.has(linkId) ? '#2be0cc' : '#64748b';
      })
      .attr('stroke-opacity', (d: any) => {
        const linkId = `${d.source.id}-${d.target.id}`;
        return this.highlightedLinks.has(linkId) ? 0.8 : 0.4;
      })
      .attr('stroke-width', (d: any) => {
        const linkId = `${d.source.id}-${d.target.id}`;
        return this.highlightedLinks.has(linkId) ? 2 : 1.5;
      });
    console.log('Relation Nets: Links created:', link.size());

    // Draw nodes (knowledge graph style - circles)
    const node = this.g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(this.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', (event: any, d: any) => {
          if (!event.active) this.simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) this.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));
    console.log('Relation Nets: Nodes created:', node.size());

    // Node circles (knowledge graph style - smaller)
    node.append('circle')
      .attr('r', (d: any) => {
        const baseRadius = 20;
        const sizeMultiplier = Math.min(1.5, 1 + (d.fdCount * 0.1));
        return this.highlightedNodes.has(d.id) ? baseRadius * sizeMultiplier * 1.2 : baseRadius * sizeMultiplier;
      })
      .attr('fill', (d: any) => {
        return this.highlightedNodes.has(d.id) ? '#baf3e9' : d.color;
      })
      .attr('stroke', (d: any) => {
        return this.highlightedNodes.has(d.id) ? '#0f766e' : '#b7791f';
      })
      .attr('stroke-width', (d: any) => {
        return this.highlightedNodes.has(d.id) ? 2.5 : 1.5;
      })
      .attr('filter', 'drop-shadow(0px 3px 5px rgba(0,0,0,0.2))')
      .style('cursor', 'pointer')
      .on('click', (event: any, d: any) => {
        this.selectCustomer(d);
        event.stopPropagation();
      })
      .on('mouseover', (event: any) => {
        (window as any).d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', (d: any) => {
            const baseRadius = 20;
            const sizeMultiplier = Math.min(1.5, 1 + (d.fdCount * 0.1));
            return this.highlightedNodes.has(d.id) ? baseRadius * sizeMultiplier * 1.3 : baseRadius * sizeMultiplier * 1.15;
          });
      })
      .on('mouseout', (event: any) => {
        (window as any).d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', (d: any) => {
            const baseRadius = 20;
            const sizeMultiplier = Math.min(1.5, 1 + (d.fdCount * 0.1));
            return this.highlightedNodes.has(d.id) ? baseRadius * sizeMultiplier * 1.2 : baseRadius * sizeMultiplier;
          });
      });

    // Node labels (inside circles)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => {
        const baseRadius = 20;
        const sizeMultiplier = Math.min(1.5, 1 + (d.fdCount * 0.1));
        return this.highlightedNodes.has(d.id) ? -baseRadius * sizeMultiplier * 1.2 + 10 : -baseRadius * sizeMultiplier + 8;
      })
      .text((d: any) => {
        // Truncate long names
        const maxLength = 10;
        return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
      })
      .attr('font-size', (d: any) => this.highlightedNodes.has(d.id) ? '11px' : '10px')
      .attr('fill', '#172033')
      .attr('font-weight', '600')
      .style('pointer-events', 'none');

    node.append('title').text((d: any) => `${d.group === 'customer' ? 'Customer' : 'Nominee'}: ${d.name}`);

    // Node details (FD count below circle)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => {
        const baseRadius = 20;
        const sizeMultiplier = Math.min(1.5, 1 + (d.fdCount * 0.1));
        return this.highlightedNodes.has(d.id) ? baseRadius * sizeMultiplier * 1.2 + 15 : baseRadius * sizeMultiplier + 13;
      })
      .text((d: any) => `${d.fdCount} FD${d.fdCount > 1 ? 's' : ''}`)
      .attr('font-size', '9px')
      .attr('fill', '#64748b')
      .attr('font-weight', '500')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      // Update link positions (straight lines)
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      // Update node positions
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  searchCustomer(): void {
    if (!this.searchQuery.trim()) {
      this.clearHighlights();
      return;
    }

    this.clearHighlights();

    const query = this.searchQuery.toLowerCase();
    let foundNode: any = null;

    if (this.searchType === 'name') {
      foundNode = this.nodes.find(n => n.name.toLowerCase().includes(query));
    } else {
      foundNode = this.nodes.find(n => n.id.toLowerCase().includes(query));
    }

    if (foundNode) {
      this.highlightConnections(foundNode);
      this.selectCustomer(foundNode);
    } else {
      alert('Customer not found');
    }
  }

  private highlightConnections(node: any): void {
    // Highlight the selected node
    this.highlightedNodes.add(node.id);

    // Find all connected nodes (direct and indirect)
    const visited = new Set<string>();
    const queue = [node.id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      // Find neighbors
      this.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sourceId === currentId && !visited.has(targetId)) {
          this.highlightedLinks.add(`${sourceId}-${targetId}`);
          this.highlightedNodes.add(targetId);
          queue.push(targetId);
        }
        if (targetId === currentId && !visited.has(sourceId)) {
          this.highlightedLinks.add(`${sourceId}-${targetId}`);
          this.highlightedNodes.add(sourceId);
          queue.push(sourceId);
        }
      });
    }

    this.updateGraph();
  }

  private clearHighlights(): void {
    this.highlightedNodes.clear();
    this.highlightedLinks.clear();
    this.selectedCustomer = null;
    this.updateGraph();
  }

  selectCustomer(customer: any): void {
    const selectedId = String(customer.id);
    customer.relationshipSummary = this.links.flatMap(link => {
      const sourceId = String(typeof link.source === 'object' ? link.source.id : link.source);
      const targetId = String(typeof link.target === 'object' ? link.target.id : link.target);
      if (sourceId !== selectedId && targetId !== selectedId) return [];
      const otherId = sourceId === selectedId ? targetId : sourceId;
      const otherName = this.nodes.find(node => node.id === otherId)?.name || 'Unknown';
      return [sourceId === selectedId
        ? `Named ${otherName} as nominee (${link.relation})`
        : `${otherName} named this node as nominee (${link.relation})`];
    });
    this.selectedCustomer = customer;
  }

  resetGraph(): void {
    this.clearHighlights();
    this.searchQuery = '';
    if (this.zoom) {
      const d3 = (window as any).d3;
      this.svg.transition().duration(750).call(
        this.zoom.transform,
        d3.zoomIdentity
      );
    }
  }

  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString();
  }
}
