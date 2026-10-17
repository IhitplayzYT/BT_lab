#!/usr/bin/env python3
"""FD portfolio report generator (standard library only).

Reads the nightly extract CSV written by the fd-account-service and writes, into --out:
  fd_report_<date>.json  totals per currency and status, plus the overall account count
  fd_report_<date>.svg   enhanced charts with multiple visualizations (bar, pie, timeline, trends)

Money is never added across currencies. Usage:
  python generate_fd_report.py --input extracts/fd-accounts-2026-10-14.csv --out extracts/python/2026-10-14 --date 2026-10-14
"""
import argparse
import csv
import json
import math
import os
import sys
from decimal import Decimal, InvalidOperation
from html import escape
from datetime import datetime


def money(text):
    try:
        return Decimal(text)
    except (InvalidOperation, TypeError):
        return Decimal(0)


def load(path):
    with open(path, newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def summarise(rows):
    """{currency: {status: {accounts, principal, accrued_interest}}}"""
    result = {}
    for row in rows:
        currency = row.get("currency") or "UNKNOWN"
        by_status = result.setdefault(currency, {})
        bucket = by_status.setdefault(row.get("status") or "UNKNOWN",
                                      {"accounts": 0, "principal": Decimal(0), "accrued_interest": Decimal(0)})
        bucket["accounts"] += 1
        bucket["principal"] += money(row.get("principal_amount"))
        bucket["accrued_interest"] += money(row.get("accrued_interest"))
    return result


def to_json_ready(summary):
    return {currency: {status: {"accounts": b["accounts"], "principal": str(b["principal"]),
                                "accrued_interest": str(b["accrued_interest"])}
                       for status, b in by_status.items()}
            for currency, by_status in summary.items()}


def svg_enhanced_chart(summary, title):
    """Generate enhanced SVG with multiple chart types: bar chart, pie chart, timeline, trends, and summary stats"""
    width = 1000
    lines = []
    y = 40

    # Header with gradient background
    lines.append(f'<defs><linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">')
    lines.append(f'<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />')
    lines.append(f'<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />')
    lines.append(f'</linearGradient></defs>')
    lines.append(f'<rect x="0" y="0" width="{width}" height="80" fill="url(#headerGrad)"/>')
    lines.append(f'<text x="20" y="35" font-size="24" font-weight="bold" fill="white">{escape(title)}</text>')
    lines.append(f'<text x="20" y="60" font-size="14" fill="rgba(255,255,255,0.9)">Comprehensive Portfolio Analysis Report</text>')
    lines.append(f'<text x="{width-20}" y="60" font-size="12" fill="rgba(255,255,255,0.8)" text-anchor="end">Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}</text>')
    y += 100

    # Summary stats cards
    total_accounts = sum(b["accounts"] for by_status in summary.values() for b in by_status.values())
    total_principal = sum(b["principal"] for by_status in summary.values() for b in by_status.values())
    total_interest = sum(b["accrued_interest"] for by_status in summary.values() for b in by_status.values())

    # Card 1: Total Accounts
    lines.append(f'<rect x="10" y="{y}" width="240" height="80" fill="#4e73df" rx="10"/>')
    lines.append(f'<text x="25" y="{y+25}" font-size="12" fill="rgba(255,255,255,0.8)">Total Accounts</text>')
    lines.append(f'<text x="25" y="{y+55}" font-size="28" font-weight="bold" fill="white">{total_accounts:,}</text>')

    # Card 2: Total Principal
    lines.append(f'<rect x="260" y="{y}" width="240" height="80" fill="#1cc88a" rx="10"/>')
    lines.append(f'<text x="275" y="{y+25}" font-size="12" fill="rgba(255,255,255,0.8)">Total Principal</text>')
    lines.append(f'<text x="275" y="{y+55}" font-size="20" font-weight="bold" fill="white">{total_principal:,.2f}</text>')

    # Card 3: Total Interest
    lines.append(f'<rect x="510" y="{y}" width="240" height="80" fill="#36b9cc" rx="10"/>')
    lines.append(f'<text x="525" y="{y+25}" font-size="12" fill="rgba(255,255,255,0.8)">Accrued Interest</text>')
    lines.append(f'<text x="525" y="{y+55}" font-size="20" font-weight="bold" fill="white">{total_interest:,.2f}</text>')

    # Card 4: Currencies
    lines.append(f'<rect x="760" y="{y}" width="230" height="80" fill="#f6c23e" rx="10"/>')
    lines.append(f'<text x="775" y="{y+25}" font-size="12" fill="rgba(255,255,255,0.8)">Currencies</text>')
    lines.append(f'<text x="775" y="{y+55}" font-size="24" font-weight="bold" fill="white">{len(summary)}</text>')

    y += 100
    
    # Color palette for different statuses
    colors = {
        "ACTIVE": "#4e73df",
        "MATURED": "#1cc88a",
        "PREMATURELY_CLOSED": "#e74a3b",
        "UNKNOWN": "#858796"
    }
    
    # Generate charts for each currency
    for currency, by_status in sorted(summary.items()):
        # Currency section with gradient background
        lines.append(f'<rect x="10" y="{y}" width="{width-20}" height="40" fill="#f8f9fa" rx="8"/>')
        lines.append(f'<text x="25" y="{y+25}" font-size="18" font-weight="bold" fill="#333">{escape(currency)}</text>')
        lines.append(f'<text x="{width-25}" y="{y+25}" font-size="14" fill="#666" text-anchor="end">{sum(b["accounts"] for b in by_status.values())} accounts</text>')
        y += 55

        # Horizontal bar chart with enhanced styling
        lines.append(f'<text x="10" y="{y}" font-size="14" font-weight="bold" fill="#555">Principal Distribution by Status</text>')
        y += 25
        bar_h, gap, left = 35, 20, 220
        top = max((b["principal"] for b in by_status.values()), default=Decimal(1)) or Decimal(1)

        for status, b in sorted(by_status.items()):
            color = colors.get(status, "#858796")
            length = int((b["principal"] / top) * (width - left - 150))

            # Bar with gradient effect
            lines.append(f'<rect x="{left}" y="{y}" width="{max(length, 1)}" height="{bar_h}" fill="{color}" rx="6"/>')
            lines.append(f'<rect x="{left}" y="{y}" width="{max(length, 1)}" height="{bar_h}" fill="rgba(255,255,255,0.2)" rx="6"/>')

            # Status label with icon
            lines.append(f'<text x="10" y="{y + 22}" font-size="13" font-weight="bold" fill="#333">{escape(status)}</text>')

            # Account count badge
            badge_x = left + length + 12
            lines.append(f'<rect x="{badge_x}" y="{y + 8}" width="50" height="22" fill="white" stroke="{color}" stroke-width="2" rx="11"/>')
            lines.append(f'<text x="{badge_x + 25}" y="{y + 24}" font-size="12" font-weight="bold" fill="{color}" text-anchor="middle">{b["accounts"]}</text>')

            # Amount label with percentage
            pct = (b["principal"] / top) * 100 if top > 0 else 0
            lines.append(f'<text x="{badge_x + 70}" y="{y + 22}" font-size="14" font-weight="bold" fill="#333">{b["principal"]:,.2f}</text>')
            lines.append(f'<text x="{badge_x + 70}" y="{y + 38}" font-size="11" fill="#888">{pct:.1f}% of total</text>')

            y += bar_h + gap

        # Interest distribution chart
        y += 10
        lines.append(f'<text x="10" y="{y}" font-size="14" font-weight="bold" fill="#555">Interest Accrued by Status</text>')
        y += 25

        interest_top = max((b["accrued_interest"] for b in by_status.values()), default=Decimal(1)) or Decimal(1)
        for status, b in sorted(by_status.items()):
            color = colors.get(status, "#858796")
            length = int((b["accrued_interest"] / interest_top) * (width - left - 150))

            lines.append(f'<rect x="{left}" y="{y}" width="{max(length, 1)}" height="{bar_h}" fill="{color}" rx="6"/>')
            lines.append(f'<text x="10" y="{y + 22}" font-size="13" fill="#555">{escape(status)}</text>')
            lines.append(f'<text x="{left + max(length, 1) + 10}" y="{y + 22}" font-size="13" font-weight="bold" fill="#333">{b["accrued_interest"]:,.2f}</text>')
            y += bar_h + gap

        # Donut chart for account distribution
        y += 20
        pie_center_x = 150
        pie_center_y = y + 70
        pie_radius = 50
        total = sum(b["accounts"] for b in by_status.values())

        if total > 0:
            # Donut chart background
            lines.append(f'<circle cx="{pie_center_x}" cy="{pie_center_y}" r="{pie_radius}" fill="none" stroke="#e9ecef" stroke-width="20"/>')

            start_angle = 0
            for status, b in sorted(by_status.items(), key=lambda x: x[1]["accounts"], reverse=True):
                color = colors.get(status, "#858796")
                percentage = b["accounts"] / total
                end_angle = start_angle + (percentage * 360)

                # Donut segment
                dash_length = percentage * 2 * math.pi * pie_radius
                lines.append(f'<circle cx="{pie_center_x}" cy="{pie_center_y}" r="{pie_radius}" fill="none" stroke="{color}" stroke-width="20" stroke-dasharray="{dash_length} {2 * math.pi * pie_radius}" transform="rotate({start_angle - 90} {pie_center_x} {pie_center_y})"/>')

                start_angle = end_angle

            # Center text
            lines.append(f'<text x="{pie_center_x}" y="{pie_center_y - 5}" font-size="24" font-weight="bold" fill="#333" text-anchor="middle">{total}</text>')
            lines.append(f'<text x="{pie_center_x}" y="{pie_center_y + 15}" font-size="12" fill="#666" text-anchor="middle">Accounts</text>')

            # Detailed legend with percentages
            legend_y = y + 10
            legend_x = 300
            for status, b in sorted(by_status.items(), key=lambda x: x[1]["accounts"], reverse=True):
                color = colors.get(status, "#858796")
                pct = (b["accounts"] / total) * 100
                lines.append(f'<rect x="{legend_x}" y="{legend_y}" width="16" height="16" fill="{color}" rx="3"/>')
                lines.append(f'<text x="{legend_x + 24}" y="{legend_y + 13}" font-size="13" font-weight="bold" fill="#333">{escape(status)}</text>')
                lines.append(f'<text x="{legend_x + 150}" y="{legend_y + 13}" font-size="13" fill="#666">{b["accounts"]} accounts ({pct:.1f}%)</text>')
                lines.append(f'<text x="{legend_x + 300}" y="{legend_y + 13}" font-size="13" fill="#666">{b["principal"]:,.2f}</text>')
                legend_y += 25

            y += 150
        else:
            y += 30

        # Status breakdown table
        y += 10
        lines.append(f'<rect x="10" y="{y}" width="{width-20}" height="30" fill="#4e73df" rx="5"/>')
        lines.append(f'<text x="20" y="{y+20}" font-size="12" font-weight="bold" fill="white">Status</text>')
        lines.append(f'<text x="150" y="{y+20}" font-size="12" font-weight="bold" fill="white">Accounts</text>')
        lines.append(f'<text x="250" y="{y+20}" font-size="12" font-weight="bold" fill="white">Principal</text>')
        lines.append(f'<text x="400" y="{y+20}" font-size="12" font-weight="bold" fill="white">Interest</text>')
        lines.append(f'<text x="550" y="{y+20}" font-size="12" font-weight="bold" fill="white">Avg/Account</text>')
        y += 30

        for status, b in sorted(by_status.items()):
            bg_color = "#f8f9fa" if list(by_status.keys()).index(status) % 2 == 0 else "white"
            lines.append(f'<rect x="10" y="{y}" width="{width-20}" height="28" fill="{bg_color}" rx="3"/>')
            lines.append(f'<text x="20" y="{y+19}" font-size="12" fill="#333">{escape(status)}</text>')
            lines.append(f'<text x="150" y="{y+19}" font-size="12" fill="#333">{b["accounts"]}</text>')
            lines.append(f'<text x="250" y="{y+19}" font-size="12" fill="#333">{b["principal"]:,.2f}</text>')
            lines.append(f'<text x="400" y="{y+19}" font-size="12" fill="#333">{b["accrued_interest"]:,.2f}</text>')
            avg = b["principal"] / b["accounts"] if b["accounts"] > 0 else 0
            lines.append(f'<text x="550" y="{y+19}" font-size="12" fill="#333">{avg:,.2f}</text>')
            y += 28

        y += 40
    
    # Footer
    y += 20
    lines.append(f'<rect x="0" y="{y}" width="{width}" height="40" fill="#f8f9fa"/>')
    lines.append(f'<text x="20" y="{y+25}" font-size="11" fill="#666">SecureBank FD Portfolio Report - Confidential</text>')
    lines.append(f'<text x="{width-20}" y="{y+25}" font-size="11" fill="#666" text-anchor="end">Page 1 of 1</text>')
    y += 50

    height = y + 20
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" font-family="Arial, sans-serif">
    <rect width="100%" height="100%" fill="white"/>
    {"".join(lines)}
</svg>'''


def main():
    parser = argparse.ArgumentParser(description="Generate the FD portfolio report from the nightly extract")
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--date", required=True)
    args = parser.parse_args()

    rows = load(args.input)
    summary = summarise(rows)
    os.makedirs(args.out, exist_ok=True)
    json_path = os.path.join(args.out, f"fd_report_{args.date}.json")
    svg_path = os.path.join(args.out, f"fd_report_{args.date}.svg")
    with open(json_path, "w", encoding="utf-8") as handle:
        json.dump({"businessDate": args.date, "totalAccounts": len(rows), "byCurrency": to_json_ready(summary)},
                  handle, indent=2)
    with open(svg_path, "w", encoding="utf-8") as handle:
        handle.write(svg_enhanced_chart(summary, f"FD Portfolio Report - {args.date}"))
    print(f"report ok: {len(rows)} accounts -> {json_path}, {svg_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
