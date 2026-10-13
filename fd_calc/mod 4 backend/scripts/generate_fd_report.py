#!/usr/bin/env python3
"""
FD Calculator - Fixed Deposit Report Generator
Banking Technology Lab (L6 / L11 Compliance Script)

This script can be executed standalone or called via external orchestration.
It safely fetches calculation audit results via authenticated REST API
or processes local calculation data without command injection risks.

Usage:
    python3 generate_fd_report.py --calc-id CALC-20261008-0001 --token <JWT> --url http://localhost:8080
    python3 generate_fd_report.py --offline --calc-id CALC-20261008-0001 --principal 100000 --rate 7.50 --term 12
"""

import sys
import os
import argparse
import csv
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

def fetch_calculation(base_url, calc_id, jwt_token):
    url = f"{base_url}/api/v1/fd/calculations/{calc_id}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {jwt_token}",
        "Accept": "application/json"
    })
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"Error fetching calculation: HTTP {e.code} - {e.reason}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Connection failed: {e}", file=sys.stderr)
        sys.exit(1)

def export_to_csv(data, output_file):
    fieldnames = [
        "Calculation ID", "UUID", "Product Code", "Principal", "Term (Months)",
        "Base Rate (%)", "Effective Rate (%)", "Interest Type", "Interest Earned",
        "Maturity Amount", "APY (%)", "Start Date", "Estimated Maturity Date", "Created At"
    ]
    with open(output_file, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerow({
            "Calculation ID": data.get("calculationId", ""),
            "UUID": data.get("uuid", ""),
            "Product Code": data.get("productCode", ""),
            "Principal": data.get("principal", ""),
            "Term (Months)": data.get("term", {}).get("value", "") if isinstance(data.get("term"), dict) else data.get("term", ""),
            "Base Rate (%)": data.get("baseRate", ""),
            "Effective Rate (%)": data.get("effectiveRate", ""),
            "Interest Type": data.get("interestType", ""),
            "Interest Earned": data.get("interestEarned", ""),
            "Maturity Amount": data.get("maturityAmount", ""),
            "APY (%)": data.get("apy", ""),
            "Start Date": data.get("startDate", ""),
            "Estimated Maturity Date": data.get("estimatedMaturityDate", ""),
            "Created At": data.get("generatedAt", datetime.now(timezone.utc).isoformat())
        })
    print(f"Report successfully generated at: {output_file}")

from decimal import Decimal, ROUND_HALF_UP

def round_money(val: Decimal) -> Decimal:
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def main():
    parser = argparse.ArgumentParser(description="FD Calculator Report Generator (Lab Manual L11)")
    parser.add_argument("--calc-id", required=True, help="Calculation ID (e.g. CALC-20261008-0001)")
    parser.add_argument("--token", help="Bearer JWT token for authentication")
    parser.add_argument("--url", default="http://localhost:8080", help="Base URL of FD Calculator service")
    parser.add_argument("--output", help="Output CSV path (default: fd_report_<calc_id>.csv)")
    parser.add_argument("--offline", action="store_true", help="Generate report from arguments without network call")
    parser.add_argument("--principal", default="100000.00", help="Offline principal amount")
    parser.add_argument("--rate", default="7.50", help="Offline effective rate")
    parser.add_argument("--term", type=int, default=12, help="Offline term in months")
    parser.add_argument("--interest-type", default="COMPOUND", choices=["COMPOUND", "SIMPLE"], help="Interest calculation method")

    args = parser.parse_args()
    output_path = args.output or f"fd_report_{args.calc_id}.csv"

    if args.offline:
        p = Decimal(str(args.principal))
        r = Decimal(str(args.rate))
        t_months = Decimal(args.term)
        t_years = t_months / Decimal("12")
        hundred = Decimal("100")

        if args.interest_type == "SIMPLE":
            interest = round_money(p * r * t_years / hundred)
            maturity = p + interest
        else:
            # Compound monthly (n=12)
            n = Decimal("12")
            rate_per_period = r / (hundred * n)
            base = Decimal("1") + rate_per_period
            powered = base ** int(args.term)
            maturity = round_money(p * powered)
            interest = maturity - p

        calc_data = {
            "calculationId": args.calc_id,
            "uuid": "offline-sim-uuid",
            "productCode": "FD001",
            "principal": str(round_money(p)),
            "term": {"value": args.term, "unit": "MONTHS"},
            "baseRate": str(r),
            "effectiveRate": str(r),
            "interestType": args.interest_type,
            "interestEarned": str(round_money(interest)),
            "maturityAmount": str(round_money(maturity)),
            "apy": str(r),
            "startDate": datetime.now().strftime("%Y-%m-%d"),
            "estimatedMaturityDate": "",
            "generatedAt": datetime.now(timezone.utc).isoformat()
        }
    else:
        if not args.token:
            print("Error: --token is required when not in --offline mode.", file=sys.stderr)
            sys.exit(1)
        calc_data = fetch_calculation(args.url, args.calc_id, args.token)

    export_to_csv(calc_data, output_path)

if __name__ == "__main__":
    main()
