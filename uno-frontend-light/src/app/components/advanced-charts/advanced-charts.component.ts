import { Component, Input, OnChanges, AfterViewInit, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartType, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-advanced-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advanced-charts.component.html',
  styleUrls: ['./advanced-charts.component.scss']
})
export class AdvancedChartsComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() accounts: any[] = [];
  private charts: Chart[] = [];
  private viewReady = false;
  private readonly colors = ['#2be0cc', '#f6b945', '#ff5c9a', '#8b5cf6', '#06b6d4'];

  constructor() { Chart.register(...registerables, annotationPlugin); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accounts'] && this.viewReady) setTimeout(() => this.renderCharts());
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderCharts();
  }

  private renderCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
    const rows = (this.accounts || []).map(account => ({
      ...account,
      amount: this.number(account.principalAmount),
      interest: this.number(account.accruedInterest),
      rate: this.number(account.interestRate),
      tenure: this.number(account.tenureMonths),
      created: this.date(account.createdAt),
      maturity: this.date(account.maturityDate),
      customer: String(account.customerId || account.fdAccountNo || 'Unknown'),
      product: String(account.productCode || 'Unknown')
    }));
    const monthLabels = Array.from({ length: 12 }, (_, i) => new Date(new Date().getFullYear(), i, 1).toLocaleString('en', { month: 'short' }));
    const currentYear = new Date().getFullYear();
    const monthly = (field: 'amount' | 'interest') => monthLabels.map((_, month) => rows
      .filter(row => row.created?.getFullYear() === currentYear && row.created?.getMonth() === month)
      .reduce((sum, row) => sum + row[field], 0));
    const products = [...new Set(rows.map(row => row.product))];
    const productTotals = products.map(product => rows.filter(row => row.product === product).reduce((sum, row) => sum + row.amount, 0));
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    this.add('lineChart', 'line', { labels: monthLabels, datasets: [{ label: 'Deposits opened (principal)', data: monthly('amount'), borderColor: this.colors[0], backgroundColor: 'rgba(43,224,204,.15)', fill: true, tension: .35 }] });
    this.add('areaChart', 'line', { labels: monthLabels, datasets: [{ label: 'Current accrued interest', data: monthly('interest'), borderColor: this.colors[2], backgroundColor: 'rgba(255,92,154,.25)', fill: true, tension: .35 }] });
    this.add('donutChart', 'doughnut', { labels: products, datasets: [{ data: productTotals, backgroundColor: products.map((_, i) => this.colors[i % this.colors.length]), borderColor: '#1a1a2e', borderWidth: 2 }] });
    this.add('scatterChart', 'scatter', { datasets: [{ label: 'FD accounts', data: rows.filter(r => r.tenure > 0 && r.rate > 0).map(r => ({ x: r.tenure, y: r.rate })), backgroundColor: this.colors[1] }] }, { scales: { x: { title: { display: true, text: 'Tenure (months)' } }, y: { title: { display: true, text: 'Interest rate (%)' } } } });

    this.add('stackedBarChart', 'bar', { labels: quarters, datasets: products.map((product, i) => ({
      label: product,
      data: quarters.map((_, q) => rows.filter(r => r.product === product && r.created && Math.floor(r.created.getMonth() / 3) === q && r.created.getFullYear() === currentYear).length),
      backgroundColor: this.colors[i % this.colors.length]
    })) }, { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } });

    const amountGroups = [
      { label: 'Under 50K', values: rows.filter(r => r.amount < 50000).map(r => r.amount) },
      { label: '50K–2L', values: rows.filter(r => r.amount >= 50000 && r.amount < 200000).map(r => r.amount) },
      { label: '2L+', values: rows.filter(r => r.amount >= 200000).map(r => r.amount) }
    ];
    const quantile = (values: number[], p: number) => values.length ? values[Math.floor((values.length - 1) * p)] : 0;
    const sortedGroups = amountGroups.map(group => [...group.values].sort((a, b) => a - b));
    const stats = (p: number) => sortedGroups.map(values => quantile(values, p));
    this.add('boxPlotChart', 'bar', { labels: amountGroups.map(group => group.label), datasets: [
      { label: 'Min', data: stats(0), backgroundColor: 'rgba(43,224,204,.3)' },
      { label: '25th percentile', data: stats(.25), backgroundColor: 'rgba(43,224,204,.55)' },
      { label: 'Median', data: stats(.5), backgroundColor: this.colors[0] },
      { label: '75th percentile', data: stats(.75), backgroundColor: 'rgba(246,185,69,.55)' },
      { label: 'Max', data: stats(1), backgroundColor: 'rgba(246,185,69,.3)' }
    ] });

    const heat: { x: number; y: number; v: number }[] = [];
    rows.filter(r => r.maturity?.getFullYear() === currentYear).forEach(r => {
      const x = r.maturity!.getDate(); const y = r.maturity!.getMonth();
      const found = heat.find(point => point.x === x && point.y === y);
      if (found) found.v++; else heat.push({ x, y, v: 1 });
    });
    this.add('heatmapChart', 'scatter', { datasets: [{ label: 'Maturing FDs', data: heat, backgroundColor: this.colors[2], pointRadius: (ctx: any) => 5 + (ctx.raw?.v || 0) }] }, {
      scales: { x: { min: 1, max: 31, title: { display: true, text: 'Day of month' } }, y: { min: 0, max: 11, ticks: { stepSize: 1, callback: (v: any) => monthLabels[v] || '' }, title: { display: true, text: 'Maturity month' } } },
      plugins: { tooltip: { callbacks: { label: (ctx: any) => `${monthLabels[ctx.raw.y]} ${ctx.raw.x}: ${ctx.raw.v} maturities` } } }
    });

    const customerTotals = new Map<string, number>();
    rows.forEach(row => customerTotals.set(row.customer, (customerTotals.get(row.customer) || 0) + row.amount));
    const customerValues = [...customerTotals.values()].sort((a, b) => a - b);
    const cohortCount = 5;
    const cohorts = Array.from({ length: cohortCount }, (_, i) => customerValues.slice(Math.floor(i * customerValues.length / cohortCount), Math.floor((i + 1) * customerValues.length / cohortCount)));
    const maxAmount = Math.max(...customerValues, 0);
    const binCount = 20;
    const bins = Array.from({ length: binCount }, (_, i) => i + 1);
    this.add('violinChart', 'line', { labels: bins, datasets: cohorts.map((values, i) => ({
      label: `Customer value cohort ${i + 1}`,
      data: bins.map(bin => values.filter(value => maxAmount === 0 ? false : Math.min(binCount - 1, Math.floor(value / maxAmount * binCount)) === bin - 1).length),
      borderColor: this.colors[i], backgroundColor: `${this.colors[i]}33`, fill: true, tension: .35, pointRadius: 0
    })) });
  }

  private add(id: string, type: ChartType, data: any, options: any = {}): void {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    if (!canvas) return;
    this.charts.push(new Chart(canvas, { type, data, options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e0e0e0' } }, ...options.plugins },
      scales: options.scales ? this.colorScales(options.scales) : undefined,
      ...options
    } as any }));
  }

  private colorScales(scales: any): any {
    const styled: any = {};
    for (const [key, value] of Object.entries(scales) as [string, any][]) {
      styled[key] = { ticks: { color: '#b0b0c0', ...(value.ticks || {}) }, grid: { color: 'rgba(255,255,255,.1)', ...(value.grid || {}) }, ...value };
    }
    return styled;
  }

  private number(value: any): number { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  private date(value: any): Date | null { const date = value ? new Date(value) : null; return date && Number.isFinite(date.getTime()) ? date : null; }
  ngOnDestroy(): void { this.charts.forEach(chart => chart.destroy()); }
}
