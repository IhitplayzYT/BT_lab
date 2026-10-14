#!/usr/bin/env python3
"""FD portfolio report generator (standard library only).

Reads the nightly extract CSV written by the fd-account-service and writes, into --out:
  fd_report_<date>.json  totals per currency and status, plus the overall account count
  fd_report_<date>.svg   a bar chart of principal per status (one chart per currency, never mixed)

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


def svg_chart(summary, title):
    width, bar_h, gap, left = 640, 26, 12, 190
    lines, y = [], 50
    for currency, by_status in sorted(summary.items()):
        top = max((b["principal"] for b in by_status.values()), default=Decimal(1)) or Decimal(1)
        lines.append(f'<text x="10" y="{y}" font-size="14" font-weight="bold">Principal by status ({escape(currency)})</text>')
        y += 14
        for status, b in sorted(by_status.items()):
            length = int((b["principal"] / top) * (width - left - 90))
            lines.append(f'<text x="10" y="{y + 18}" font-size="12">{escape(status)} ({b["accounts"]})</text>')
            lines.append(f'<rect x="{left}" y="{y}" width="{max(length, 1)}" height="{bar_h}" fill="#3b6fb6"/>')
            lines.append(f'<text x="{left + length + 6}" y="{y + 18}" font-size="12">{b["principal"]:,.2f}</text>')
            y += bar_h + gap
        y += 24
    height = y + 10
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" font-family="Arial">'
            '<rect width="100%%" height="100%%" fill="white"/>'
            '<text x="10" y="26" font-size="18" font-weight="bold">%s</text>%s</svg>'
            % (width, height, escape(title), "".join(lines)))


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
        handle.write(svg_chart(summary, f"FD portfolio {args.date}"))
    print(f"report ok: {len(rows)} accounts -> {json_path}, {svg_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
