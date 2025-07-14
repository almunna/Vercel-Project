#!/usr/bin/env python3

import sys
import pdfplumber
import re
import uuid
import json
from datetime import datetime

if len(sys.argv) < 2:
    print("Usage: parse_pdf.py /path/to/file.pdf", file=sys.stderr)
    sys.exit(1)

pdf_path = sys.argv[1]
transactions = []

line_start_pattern = re.compile(r"^\s*(\d{1,2}\s+[A-Za-z]{3}\s+\d{2})\s+(.*)")
amount_pattern = re.compile(r"([\d,]+\.\d{2})")

try:
    with pdfplumber.open(pdf_path) as pdf:
        for page_num in [2, 3, 4]:
            if page_num >= len(pdf.pages):
                continue
            page = pdf.pages[page_num]
            text = page.extract_text(layout=True)
            if not text:
                continue
            lines = text.split('\n')
            for line in lines:
                line_match = line_start_pattern.match(line)
                if not line_match:
                    continue

                date_str, rest_of_line = line_match.groups()
                amounts_found = amount_pattern.findall(rest_of_line)
                if not amounts_found:
                    continue

                amount_str = amounts_found[-1]
                last_amount_pos = rest_of_line.rfind(amount_str)
                description = rest_of_line[:last_amount_pos].strip()

                if not description or description.isnumeric():
                    description = "-"

                try:
                    date_obj = datetime.strptime(date_str, "%d %b %y")
                    formatted_date = date_obj.strftime("%Y-%m-%d")
                except ValueError:
                    continue

                amount = float(amount_str.replace(",", ""))
                if "CRED VOUCHER" not in description:
                    amount *= -1

                transactions.append({
                    "id": str(uuid.uuid4()),
                    "date": formatted_date,
                    "description": re.sub(r'\s{2,}', ' ', description),
                    "amount": amount
                })

    print(json.dumps(transactions))
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
