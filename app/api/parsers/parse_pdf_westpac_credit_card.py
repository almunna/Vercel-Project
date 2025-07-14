#!/usr/bin/env python3

import sys
import pdfplumber
import re
import uuid
from datetime import datetime
import json

if len(sys.argv) < 2:
    print("Usage: parse_pdf_westpac_credit.py /path/to/file.pdf", file=sys.stderr)
    sys.exit(1)

pdf_path = sys.argv[1]

transactions = []
date_pattern = re.compile(r"^(\d{2}/\d{2}/\d{2})\s+(.*)")

try:
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    lines = full_text.splitlines()

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        m = date_pattern.match(line)
        if m:
            raw_date = m.group(1)
            try:
                parsed_date = datetime.strptime(raw_date, "%d/%m/%y").strftime("%Y-%m-%d")
            except Exception:
                i += 1
                continue

            description_parts = [m.group(2).strip()]
            amounts_line = ""

            while True:
                if i + 1 >= len(lines):
                    break
                next_line = lines[i + 1].strip()

                if len(re.findall(r"\d{1,3}(?:,\d{3})*\.\d{2}", next_line)) >= 2:
                    amounts_line = next_line
                    i += 1
                    break

                description_parts.append(next_line)
                i += 1

            full_description = " ".join(description_parts)

            amounts = re.findall(r"\d{1,3}(?:,\d{3})*\.\d{2}", amounts_line)
            debit = ""
            credit = ""

            if len(amounts) == 3:
                debit, credit, _ = amounts
            elif len(amounts) == 2:
                amt, _ = amounts
                if "Deposit" in full_description or "Refund" in full_description:
                    credit = amt
                else:
                    debit = amt

            amount = None
            if debit:
                amount = -float(debit.replace(",", ""))
            elif credit:
                amount = float(credit.replace(",", ""))
            else:
                i += 1
                continue

            transactions.append({
                "id": str(uuid.uuid4()),
                "date": parsed_date,
                "description": full_description,
                "amount": amount
            })

        i += 1

    print(json.dumps(transactions))

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
