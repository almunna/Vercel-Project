#!/usr/bin/env python3

import sys
import pdfplumber
import re
import uuid
from datetime import datetime
import json

if len(sys.argv) < 2:
    print("Usage: parse_pdf_cba.py /path/to/file.pdf", file=sys.stderr)
    sys.exit(1)

pdf_path = sys.argv[1]

# Regex patterns
date_pattern = re.compile(r"^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})")
amount_pattern = re.compile(r"(-?\d{1,3}(?:,\d{3})*(?:\.\d{2}))")

MONTH_MAP = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12"
}

transactions = []

try:
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            lines = text.splitlines()
            for line in lines:
                line = line.strip()

                # Check for Opening/Closing Balance
                if "OPENING BALANCE" in line or "CLOSING BALANCE" in line:
                    date_match = date_pattern.search(line)
                    if date_match:
                        day, month, year = date_match.groups()
                        date_iso = f"{year}-{MONTH_MAP.get(month, '01')}-{day.zfill(2)}"
                    else:
                        date_iso = ""

                    description = "OPENING BALANCE" if "OPENING" in line else "CLOSING BALANCE"

                    transactions.append({
                        "id": str(uuid.uuid4()),
                        "date": date_iso,
                        "description": description,
                        "amount": 0
                    })

                else:
                    # Try extracting transactions if line has a date
                    date_match = date_pattern.match(line)
                    if date_match:
                        day, month, year = date_match.groups()
                        date_iso = f"{year}-{MONTH_MAP.get(month, '01')}-{day.zfill(2)}"

                        remaining = line[date_match.end():].strip()

                        amounts = amount_pattern.findall(remaining)
                        amount = 0
                        if amounts:
                            amount_str = amounts[-1].replace(",", "")
                            amount = float(amount_str)

                        if amounts:
                            last_amount_pos = remaining.rfind(amounts[-1])
                            description = remaining[:last_amount_pos].strip()
                        else:
                            description = remaining

                        transactions.append({
                            "id": str(uuid.uuid4()),
                            "date": date_iso,
                            "description": description,
                            "amount": -amount
                        })

    print(json.dumps(transactions))
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
