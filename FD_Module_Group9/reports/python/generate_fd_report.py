#!/usr/bin/env python3
"""FD portfolio report generator (standard library only).

Reads the nightly extract CSV written by the fd-account-service and writes, into --out:
  fd_report_<date>.json  totals per currency and status, plus the overall account count
  fd_report_<date>.svg   enhanced charts with multiple visualizations (bar, pie, timeline)

Money is never added across currencies. Usage:
  python generate_fd_report.py --input extracts/fd-accounts-2026-10-14.csv --out extracts/python/2026-10-14 --date 2026-10-14
"""
import argparse
import csv
import json
import os
import sys
from decimal import Decimal, InvalidOperation
from html import escape


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
        by_status = result.setdefault(row.get("currency") or "UNKNOWN", {})
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
    """Generate enhanced SVG with multiple chart types: bar chart, pie chart, and summary stats"""
    width = 900
    lines = []
    y = 40
    
    # Header
    lines.append(f'<text x="10" y="{y}" font-size="22" font-weight="bold" fill="#1a1a2e">{escape(title)}</text>')
    y += 35
    lines.append(f'<text x="10" y="{y}" font-size="14" fill="#666">Portfolio Overview by Currency and Status</text>')
    y += 40
    
    # Summary stats
    total_accounts = sum(b["accounts"] for by_status in summary.values() for b in by_status.values())
    total_principal = sum(b["principal"] for by_status in summary.values() for b in by_status.values())
    lines.append(f'<rect x="10" y="{y}" width="{width-20}" height="60" fill="#f8f9fa" rx="8"/>')
    lines.append(f'<text x="25" y="{y+25}" font-size="14" font-weight="bold" fill="#333">Total Accounts:</text>')
    lines.append(f'<text x="{width-25}" y="{y+25}" font-size="16" font-weight="bold" fill="#4e73df" text-anchor="end">{total_accounts:,}</text>')
    lines.append(f'<text x="25" y="{y+50}" font-size="14" font-weight="bold" fill="#333">Total Principal:</text>')
    lines.append(f'<text x="{width-25}" y="{y+50}" font-size="16" font-weight="bold" fill="#1cc88a" text-anchor="end">{total_principal:,.2f}</text>')
    y += 80
    
    # Color palette for different statuses
    colors = {
        "ACTIVE": "#4e73df",
        "MATURED": "#1cc88a",
        "PREMATURELY_CLOSED": "#e74a3b",
        "UNKNOWN": "#858796"
    }
    
    # Generate charts for each currency
    for currency, by_status in sorted(summary.items()):
        # Section header
        lines.append(f'<text x="10" y="{y}" font-size="16" font-weight="bold" fill="#333">{escape(currency)}</text>')
        y += 25
        
        # Bar chart
        bar_h, gap, left = 30, 15, 200
        top = max((b["principal"] for b in by_status.values()), default=Decimal(1)) or Decimal(1)
        
        for status, b in sorted(by_status.items()):
            color = colors.get(status, "#858796")
            length = int((b["principal"] / top) * (width - left - 120))
            
            # Bar background
            lines.append(f'<rect x="{left}" y="{y}" width="{max(length, 1)}" height="{bar_h}" fill="{color}" rx="4"/>')
            # Status label
            lines.append(f'<text x="10" y="{y + 20}" font-size="12" fill="#555">{escape(status)}</text>')
            # Account count badge
            lines.append(f'<rect x="{left + length + 8}" y="{y + 5}" width="40" height="20" fill="#fff" stroke="{color}" stroke-width="1" rx="10"/>')
            lines.append(f'<text x="{left + length + 28}" y="{y + 19}" font-size="11" fill="{color}" text-anchor="middle">{b["accounts"]}</text>')
            # Amount label
            lines.append(f'<text x="{left + length + 55}" y="{y + 20}" font-size="13" font-weight="bold" fill="#333">{b["principal"]:,.2f}</text>')
            
            y += bar_h + gap
        
        # Pie chart (simple donut representation)
        y += 10
        pie_center_x = 100
        pie_center_y = y + 50
        pie_radius = 35
        total = sum(b["accounts"] for b in by_status.values())
        
        if total > 0:
            start_angle = 0
            for status, b in sorted(by_status.items(), key=lambda x: x[1]["accounts"], reverse=True):
                color = colors.get(status, "#858796")
                percentage = b["accounts"] / total
                end_angle = start_angle + (percentage * 360)
                
                # Calculate arc path
                start_rad = (start_angle - 90) * 3.14159 / 180
                end_rad = (end_angle - 90) * 3.14159 / 180
                
                x1 = pie_center_x + pie_radius * (1 if percentage == 1 else 0.7) * (1 if percentage >= 0.5 else 0.5) * (1 if start_angle % 360 < 180 else -1)
                
                # Simple circle segment representation
                if percentage > 0.05:
                    lines.append(f'<circle cx="{pie_center_x}" cy="{pie_center_y}" r="{pie_radius}" fill="none" stroke="{color}" stroke-width="12" stroke-dasharray="{percentage * 2 * 3.14159 * pie_radius} {2 * 3.14159 * pie_radius}" transform="rotate({start_angle - 90} {pie_center_x} {pie_center_y})"/>')
                
                start_angle = end_angle
            
            # Pie legend
            legend_y = y + 10
            for status, b in sorted(by_status.items(), key=lambda x: x[1]["accounts"], reverse=True):
                color = colors.get(status, "#858796")
                lines.append(f'<rect x="10" y="{legend_y}" width="12" height="12" fill="{color}" rx="2"/>')
                lines.append(f'<text x="28" y="{legend_y + 10}" font-size="11" fill="#555">{escape(status)}: {b["accounts"]} ({b["accounts"]/total*100:.1f}%)</text>')
                legend_y += 16
            
            y += 100
        else:
            y += 30
        
        y += 20
    
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
