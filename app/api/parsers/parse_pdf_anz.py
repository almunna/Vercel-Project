#!/usr/bin/env python3

import sys
import pdfplumber
import re
import uuid
from datetime import datetime
import json

if len(sys.argv) < 2:
    print("Usage: parse_pdf_anz.py /path/to/file.pdf", file=sys.stderr)
    sys.exit(1)

pdf_path = sys.argv[1]

# Regex pattern matching ANZ statement rows
pattern = re.compile(
    r"""(
        (?P<date_processed>\d{2}/\d{2}/\d{4})\s+
        (?P<date_transaction>\d{2}/\d{2}/\d{4})\s+
        (?P<card>\d{4})\s+
        (?P<description>.*?)\s+
        \$?(?P<amount>[\d,]+\.\d{2})\s*
        (?P<credit_label>CR)?\s+
        \$?(?P<balance>[\d,]+\.\d{2})
    )""",
    re.VERBOSE
)

transactions = []

try:
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    # Parse all matching lines
    for m in pattern.finditer(full_text):
        raw_date = m.group("date_transaction")
        date_obj = datetime.strptime(raw_date, "%d/%m/%Y")
        date_iso = date_obj.strftime("%Y-%m-%d")

        amount_str = m.group("amount").replace(",", "")
        amount = float(amount_str)

        credit_label = m.group("credit_label")
        signed_amount = amount if credit_label else -amount

        transactions.append({
            "id": str(uuid.uuid4()),
            "date": date_iso,
            "description": m.group("description").strip(),
            "amount": signed_amount
        })

    print(json.dumps(transactions))
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
