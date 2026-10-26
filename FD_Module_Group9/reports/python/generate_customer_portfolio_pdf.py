#!/usr/bin/env python3
"""
Professional Customer Portfolio PDF Generator
Generates styled financial reports with charts for individual customers.
Requires: reportlab, matplotlib, pandas
Install: pip install reportlab matplotlib pandas
"""
import argparse
import csv
import html
import os
import sys
from datetime import datetime
from decimal import Decimal
from io import BytesIO

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    import matplotlib.pyplot as plt
    import matplotlib
    matplotlib.use('Agg')
    from matplotlib.figure import Figure
    import pandas as pd
except ImportError as e:
    print(f"Missing required library: {e}")
    print("Install with: pip install reportlab matplotlib pandas")
    sys.exit(1)


# Color scheme matching the frontend theme
COLORS = {
    'gold': '#f6b945',
    'gold_hi': '#ffe3a3',
    'gold_lo': '#c9a227',
    'teal': '#2be0cc',
    'violet': '#9d7dff',
    'rose': '#f87171',
    'dark_bg': '#1a1a2e',
    'light_bg': '#f8f9fa',
    'text_primary': '#333333',
    'text_secondary': '#666666',
    'border': '#e0e0e0'
}


def load_customer_data(csv_path):
    """Load customer portfolio data from CSV"""
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)


def decimal_value(value):
    try:
        return Decimal(str(value or '0'))
    except Exception:
        return Decimal(0)


def safe_text(value):
    return html.escape(str(value if value not in (None, '') else '-'))


def create_bar_chart(data, title, x_label, y_label, color, output_path):
    """Create a horizontal bar chart"""
    fig, ax = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor('white')
    
    labels = list(data.keys())
    values = list(data.values())

    if not values:
        ax.text(0.5, 0.5, 'No portfolio data available', ha='center', va='center', transform=ax.transAxes,
                color=COLORS['text_secondary'], fontsize=12)
        ax.set_axis_off()
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
        plt.close()
        return
    
    bars = ax.barh(labels, values, color=color, edgecolor='white', linewidth=2)
    ax.set_xlabel(x_label, fontsize=11, fontweight='bold', color=COLORS['text_primary'])
    ax.set_ylabel(y_label, fontsize=11, fontweight='bold', color=COLORS['text_primary'])
    ax.set_title(title, fontsize=14, fontweight='bold', color=COLORS['text_primary'], pad=15)
    
    # Add value labels on bars
    for i, (bar, value) in enumerate(zip(bars, values)):
        ax.text(value, i, f' {value:,.0f}', va='center', fontsize=10, fontweight='bold')
    
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['border'])
    ax.spines['bottom'].set_color(COLORS['border'])
    ax.tick_params(colors=COLORS['text_secondary'])
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()


def create_donut_chart(data, title, output_path):
    """Create a donut/pie chart"""
    fig, ax = plt.subplots(figsize=(8, 8))
    fig.patch.set_facecolor('white')
    
    labels = list(data.keys())
    values = list(data.values())
    if not values or sum(values) == 0:
        ax.text(0.5, 0.5, 'No portfolio data available', ha='center', va='center', transform=ax.transAxes,
                color=COLORS['text_secondary'], fontsize=12)
        ax.set_axis_off()
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
        plt.close()
        return
    colors_list = [COLORS['gold'], COLORS['teal'], COLORS['violet'], COLORS['rose'], '#4e73df']
    
    wedges, texts, autotexts = ax.pie(values, labels=labels, autopct='%1.1f%%',
                                        colors=colors_list[:len(labels)],
                                        startangle=90, pctdistance=0.85,
                                        wedgeprops=dict(width=0.4, edgecolor='white', linewidth=2))
    
    # Style the percentage text
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
        autotext.set_fontsize(10)
    
    ax.set_title(title, fontsize=14, fontweight='bold', color=COLORS['text_primary'], pad=20)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()


def create_line_chart(data, title, x_label, y_label, color, output_path):
    """Create a line chart for trends"""
    fig, ax = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor('white')
    
    x_values = list(data.keys())
    y_values = list(data.values())
    
    ax.plot(x_values, y_values, color=color, linewidth=3, marker='o', markersize=8,
            markerfacecolor='white', markeredgewidth=2, markeredgecolor=color)
    ax.fill_between(x_values, y_values, alpha=0.2, color=color)
    
    ax.set_xlabel(x_label, fontsize=11, fontweight='bold', color=COLORS['text_primary'])
    ax.set_ylabel(y_label, fontsize=11, fontweight='bold', color=COLORS['text_primary'])
    ax.set_title(title, fontsize=14, fontweight='bold', color=COLORS['text_primary'], pad=15)
    
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(COLORS['border'])
    ax.spines['bottom'].set_color(COLORS['border'])
    ax.tick_params(colors=COLORS['text_secondary'])
    ax.grid(True, alpha=0.3, linestyle='--')
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()


def generate_pdf(data, customer_name, output_path, activity=None, accruals=None):
    """Generate the professional PDF report"""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=COLORS['gold'],
        spaceAfter=20,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=COLORS['text_secondary'],
        spaceAfter=30,
        fontName='Helvetica'
    )
    
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=COLORS['teal'],
        spaceBefore=20,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=COLORS['text_primary'],
        spaceAfter=8,
        fontName='Helvetica'
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=11,
        textColor='white',
        fontName='Helvetica-Bold',
        alignment=TA_CENTER
    )
    
    # Build content
    story = []
    
    # Header
    story.append(Paragraph(f"Fixed Deposit Portfolio Report", title_style))
    story.append(Paragraph(f"Customer: {customer_name}", subtitle_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", 
                          ParagraphStyle('Date', parent=styles['Normal'], fontSize=9, 
                                        textColor=COLORS['text_secondary'], spaceAfter=40)))
    
    # Summary Statistics
    activity = activity or []
    accruals = accruals or []
    total_principal = sum((decimal_value(row.get('principal_amount')) for row in data), Decimal(0))
    total_interest = sum((decimal_value(row.get('accrued_interest')) for row in data), Decimal(0))
    total_accounts = len(data)
    by_currency = {}
    for row in data:
        currency = row.get('currency') or 'N/A'
        totals = by_currency.setdefault(currency, {'principal': Decimal(0), 'interest': Decimal(0), 'accounts': 0})
        totals['principal'] += decimal_value(row.get('principal_amount'))
        totals['interest'] += decimal_value(row.get('accrued_interest'))
        totals['accounts'] += 1

    summary_data = [['Portfolio measure', 'Currency', 'Value'], ['FD accounts', 'All', str(total_accounts)]]
    for currency, totals in sorted(by_currency.items()):
        summary_data.extend([
            ['Principal', currency, f"{totals['principal']:,.2f}"],
            ['Accrued interest', currency, f"{totals['interest']:,.2f}"],
            ['Principal + accrued interest', currency, f"{totals['principal'] + totals['interest']:,.2f}"]
        ])
    summary_table = Table(summary_data, colWidths=[2.8*inch, 1.1*inch, 2*inch], repeatRows=1)
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLORS['gold']),
        ('TEXTCOLOR', (0, 0), (-1, 0), 'white'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), COLORS['light_bg']),
        ('TEXTCOLOR', (0, 1), (-1, -1), COLORS['text_primary']),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, COLORS['border']),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [COLORS['light_bg'], 'white']),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    story.append(Paragraph("Portfolio Summary", section_style))
    story.append(summary_table)
    story.append(Spacer(1, 0.12*inch))
    story.append(Paragraph(
        f"This report contains {total_accounts} approved fixed deposit account(s), "
        f"{len(accruals)} recorded daily accrual row(s), and {len(activity)} posted ledger event(s). "
        "Principal and interest totals are grouped by currency; amounts in different currencies are not combined.",
        normal_style))
    story.append(Paragraph(
        "Accrued interest is the interest currently recorded for an account. Posted interest and closure payments "
        "appear in the activity ledger below. Daily accrual rows show the accrual date, amount, running total, "
        "and whether that interest is pending, capitalized, or paid.", normal_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Generate charts
    chart_dir = os.path.join(os.path.dirname(output_path), 'temp_charts')
    os.makedirs(chart_dir, exist_ok=True)
    
    # Principal distribution by product
    product_principal = {}
    for row in data:
        product = f"{row.get('product_code', 'Unknown')} ({row.get('currency') or 'N/A'})"
        product_principal[product] = product_principal.get(product, Decimal(0)) + decimal_value(row.get('principal_amount'))
    
    bar_chart_path = os.path.join(chart_dir, 'principal_by_product.png')
    create_bar_chart({k: float(v) for k, v in product_principal.items()}, 
                     'Principal Distribution by Product and Currency', 'Principal Amount', 'Product / Currency', 
                     COLORS['gold'], bar_chart_path)
    
    story.append(Paragraph("Principal Distribution by Product", section_style))
    story.append(Image(bar_chart_path, width=6*inch, height=3*inch))
    story.append(Spacer(1, 0.3*inch))
    
    # Account status distribution
    status_counts = {}
    for row in data:
        status = row.get('status', 'Unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    donut_chart_path = os.path.join(chart_dir, 'status_distribution.png')
    create_donut_chart(status_counts, 'Account Status Distribution', donut_chart_path)
    
    story.append(Paragraph("Account Status Distribution", section_style))
    story.append(Image(donut_chart_path, width=4*inch, height=4*inch))
    story.append(Spacer(1, 0.3*inch))
    
    # Interest rate distribution
    rate_ranges = {'5-6%': 0, '6-7%': 0, '7-8%': 0, '8-9%': 0, '9%+': 0}
    for row in data:
        rate = float(decimal_value(row.get('interest_rate')))
        if rate < 6:
            rate_ranges['5-6%'] += 1
        elif rate < 7:
            rate_ranges['6-7%'] += 1
        elif rate < 8:
            rate_ranges['7-8%'] += 1
        elif rate < 9:
            rate_ranges['8-9%'] += 1
        else:
            rate_ranges['9%+'] += 1
    
    rate_chart_path = os.path.join(chart_dir, 'rate_distribution.png')
    create_bar_chart(rate_ranges, 'Interest Rate Distribution', 'Number of Accounts', 'Interest Rate Range',
                     COLORS['teal'], rate_chart_path)
    
    story.append(Paragraph("Interest Rate Distribution", section_style))
    story.append(Image(rate_chart_path, width=6*inch, height=3*inch))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(PageBreak())
    
    # Detailed account text gives customers readable terms and current status beside the charts.
    story.append(Paragraph("Detailed Account Information", section_style))
    story.append(Paragraph("Each account entry lists the original principal, contracted rate and tenure, maturity date, current status, and latest accrued interest snapshot.", normal_style))
    for row in data:
        currency = safe_text(row.get('currency') or 'N/A')
        account_text = (
            f"<b>FD {safe_text(row.get('fd_account_no'))}</b> &nbsp; | &nbsp; {safe_text(row.get('product_code'))}<br/>"
            f"Principal: {currency} {decimal_value(row.get('principal_amount')):,.2f} &nbsp; | &nbsp; "
            f"Rate: {decimal_value(row.get('interest_rate')):.2f}% p.a. &nbsp; | &nbsp; "
            f"Tenure: {safe_text(row.get('tenure_months'))} months<br/>"
            f"Opened: {safe_text(row.get('created_at'))} &nbsp; | &nbsp; Matures: {safe_text(row.get('maturity_date'))} &nbsp; | &nbsp; "
            f"Status: <b>{safe_text(row.get('status'))}</b> &nbsp; | &nbsp; "
            f"Accrued interest: {currency} {decimal_value(row.get('accrued_interest')):,.2f}"
        )
        account_card = Table([[Paragraph(account_text, normal_style)]], colWidths=[6.7*inch])
        account_card.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), COLORS['light_bg']), ('BOX', (0, 0), (-1, -1), .5, COLORS['border']), ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9), ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7)]))
        story.append(account_card)
        story.append(Spacer(1, 0.08*inch))

    story.append(PageBreak())
    story.append(Paragraph("Daily Interest Accrual History", section_style))
    story.append(Paragraph("Every persisted accrual day is included, including catch-up accruals processed before maturity or premature closure.", normal_style))
    accrual_rows = [['Accrual date', 'FD account', 'Product', 'Accrued', 'Cumulative', 'State']]
    for row in accruals:
        accrual_rows.append([
            safe_text(row.get('accrual_date')), safe_text(row.get('fd_account_no')), safe_text(row.get('product_code')),
            f"{decimal_value(row.get('interest_amount')):,.6f} {safe_text(row.get('currency') or '')}",
            f"{decimal_value(row.get('cumulative_interest')):,.6f}",
            'Capitalized' if str(row.get('capitalized_flag', '')).lower() == 'true' else safe_text(row.get('settlement_status'))
        ])
    if len(accrual_rows) == 1:
        accrual_rows.append(['No accrual rows recorded', '', '', '', '', ''])
    accrual_table = Table(accrual_rows, colWidths=[0.9*inch, 1.05*inch, 0.9*inch, 1.35*inch, 1.15*inch, 1.1*inch], repeatRows=1)
    accrual_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), COLORS['teal']), ('TEXTCOLOR', (0, 0), (-1, 0), 'white'), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, -1), 7), ('GRID', (0, 0), (-1, -1), .4, COLORS['border']), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [COLORS['light_bg'], 'white']), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(accrual_table)

    story.append(Paragraph("Posted Account Activity", section_style))
    story.append(Paragraph("This append-only ledger includes interest accrual postings, interest paid, premature withdrawal payouts and penalties, maturity settlement, and deposit entries.", normal_style))
    activity_rows = [['Date / time', 'FD account', 'Operation', 'Amount', 'Currency', 'Details']]
    for row in activity:
        details = f"{row.get('remarks') or ''}"
        if row.get('debit_gl_account') or row.get('credit_gl_account'):
            details += f" | Dr {row.get('debit_gl_account') or '-'} / Cr {row.get('credit_gl_account') or '-'}"
        activity_rows.append([
            safe_text(row.get('txn_timestamp')), safe_text(row.get('fd_account_no')), safe_text(row.get('txn_type')),
            f"{decimal_value(row.get('amount')):,.2f}", safe_text(row.get('currency')), Paragraph(safe_text(details), normal_style)
        ])
    if len(activity_rows) == 1:
        activity_rows.append(['No posted activity recorded', '', '', '', '', ''])
    activity_table = Table(activity_rows, colWidths=[1.0*inch, 0.9*inch, 1.0*inch, 0.9*inch, 0.55*inch, 2.1*inch], repeatRows=1)
    activity_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), COLORS['violet']), ('TEXTCOLOR', (0, 0), (-1, 0), 'white'), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, -1), 7), ('GRID', (0, 0), (-1, -1), .4, COLORS['border']), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [COLORS['light_bg'], 'white']), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(activity_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Footer
    story.append(Paragraph("Confidential Document - For Customer Use Only", 
                          ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, 
                                        textColor=COLORS['text_secondary'], alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(story)
    
    # Cleanup temp charts
    import shutil
    shutil.rmtree(chart_dir, ignore_errors=True)


def main():
    parser = argparse.ArgumentParser(description="Generate professional customer portfolio PDF")
    parser.add_argument("--input", required=True, help="Input CSV file path")
    parser.add_argument("--activity", help="Posted FD ledger activity CSV file")
    parser.add_argument("--accruals", help="Daily interest accrual CSV file")
    parser.add_argument("--output", required=True, help="Output PDF file path")
    parser.add_argument("--customer", default="Customer", help="Customer name")
    args = parser.parse_args()
    
    data = load_customer_data(args.input)
    activity = load_customer_data(args.activity) if args.activity else []
    accruals = load_customer_data(args.accruals) if args.accruals else []
    generate_pdf(data, args.customer, args.output, activity, accruals)
    print(f"PDF generated successfully: {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
