import { Component, inject, OnInit, AfterViewInit, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../services/api-client.service';

@Component({
  selector: 'app-relation-nets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relation-nets.component.html',
  styleUrls: ['./relation-nets.component.scss']
})
export class RelationNetsComponent implements OnInit, AfterViewInit {
  private apiClient = inject(ApiClientService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = '';
  searchType = 'name'; // 'name' or 'id'
  selectedCustomer: any = null;
  isLoading = false;
  error = '';

  // Graph data
  nodes: any[] = [];
  links: any[] = [];
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

      // Build nodes and links from applications
      const customerMap = new Map<string, any>();
      const links: any[] = [];

      console.log('Relation Nets: Processing applications to build customer map');
      const processedCustomerIds = new Set<string>();

      (applications || []).forEach((app: any, index: number) => {
        const customerId = app.customerId || app.fdAccountNo;
        const customerName = app.applicantFullName || `${app.applicantFirstName || ''} ${app.applicantLastName || ''}`.trim() || 'Unknown';

        if (!customerId) {
          console.warn(`Relation Nets: Application ${index} has no customerId or fdAccountNo`, app);
          return;
        }

        processedCustomerIds.add(customerId);

        // Add customer node if not exists
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            name: customerName,
            email: app.applicantEmail,
            phone: app.applicantPhone,
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

      console.log('Relation Nets: Processed unique customer IDs:', processedCustomerIds.size);
      console.log('Relation Nets: Customer IDs:', Array.from(processedCustomerIds));

      // Create links based on shared attributes (e.g., same phone, same email, similar names)
      const customers = Array.from(customerMap.values());
      console.log('Relation Nets: Total customers:', customers.length);

      for (let i = 0; i < customers.length; i++) {
        for (let j = i + 1; j < customers.length; j++) {
          const c1 = customers[i];
          const c2 = customers[j];

          // Link if same phone
          if (c1.phone && c2.phone && c1.phone === c2.phone) {
            links.push({
              source: c1.id,
              target: c2.id,
              type: 'phone',
              strength: 0.9
            });
          }

          // Link if same email
          if (c1.email && c2.email && c1.email === c2.email) {
            links.push({
              source: c1.id,
              target: c2.id,
              type: 'email',
              strength: 0.95
            });
          }

          // Link if similar names (Levenshtein distance)
          if (this.areNamesSimilar(c1.name, c2.name)) {
            links.push({
              source: c1.id,
              target: c2.id,
              type: 'name',
              strength: 0.7
            });
          }
        }
      }

      this.nodes = customers;
      this.links = links;
      console.log('Relation Nets: Nodes created:', this.nodes.length);
      console.log('Relation Nets: Links created:', this.links.length);
      console.log('Relation Nets: Sample nodes:', this.nodes.slice(0, 3));
      console.log('Relation Nets: Sample links:', this.links.slice(0, 3));

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

  private areNamesSimilar(name1: string, name2: string): boolean {
    // Simple similarity check based on common words
    const words1 = name1.toLowerCase().split(' ');
    const words2 = name2.toLowerCase().split(' ');
    
    let commonWords = 0;
    words1.forEach(w1 => {
      if (words2.includes(w1) && w1.length > 2) {
        commonWords++;
      }
    });
    
    return commonWords >= 2;
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
      .attr('stroke', (d: any) => {
        const linkId = `${d.source.id}-${d.target.id}`;
        return this.highlightedLinks.has(linkId) ? '#2be0cc' : '#cbd5e1';
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
