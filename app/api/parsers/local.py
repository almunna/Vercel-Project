#!/usr/bin/env python3

import sys
import pdfplumber
import re
import uuid
from datetime import datetime
import json

# === Argument Validation ===
if len(sys.argv) < 2:
    print("Usage: python parse_pdf_westpac.py /path/to/file.pdf", file=sys.stderr)
    sys.exit(1)

pdf_path = sys.argv[1]
year_fallback = "2023"

# === PDF Reading ===
full_text = ""
try:
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
except Exception as e:
    print(f"Error reading PDF: {e}", file=sys.stderr)
    sys.exit(1)

lines = full_text.splitlines()
transactions = []

# === Regex Patterns ===
date_pattern = re.compile(
    r"""^
        (\d{1,2})\s+               # Day
        ([A-Za-z]{3})\s+           # Month
        ([A-Z]{2})\s+              # Type (CR, DR, etc)
        (.*?)\s+                   # Description
        ([\d,.]+)?\s*              # Optional Money Out
        ([\d,.]+)?\s*              # Optional Money In
        ([\d,.]+)?\s*$             # Optional Balance
    """, re.VERBOSE
)

fallback_pattern = re.compile(
    r"""^
        (\d{1,2})\s+
        ([A-Za-z]{3})\s+
        (.*?)\s+
        ([\d,.]+)\s*$
    """, re.VERBOSE
)

month_map = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
    "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
    "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",
}

# === Primary Pattern Matching ===
for line in lines:
    m = date_pattern.match(line.strip())
    if m:
        day = m.group(1).zfill(2)
        month = month_map.get(m.group(2), "01")
        date_str = f"{year_fallback}-{month}-{day}"
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y-%m-%d")
        except Exception:
            continue

        description = m.group(4).strip()
        money_out = m.group(5)
        money_in = m.group(6)

        if money_out:
            amount = -float(money_out.replace(",", ""))
        elif money_in:
            amount = float(money_in.replace(",", ""))
        else:
            continue

        transactions.append({
            "id": str(uuid.uuid4()),
            "date": parsed_date,
            "description": description,
            "amount": amount
        })

# === Fallback Matching (if primary fails) ===
if not transactions:
    for line in lines:
        m = fallback_pattern.match(line.strip())
        if m:
            day = m.group(1).zfill(2)
            month = month_map.get(m.group(2), "01")
            date_str = f"{year_fallback}-{month}-{day}"
            try:
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y-%m-%d")
            except Exception:
                continue

            description = m.group(3).strip()
            amount = -float(m.group(4).replace(",", ""))

            transactions.append({
                "id": str(uuid.uuid4()),
                "date": parsed_date,
                "description": description,
                "amount": amount
            })

# === Output JSON ===
print(json.dumps(transactions, indent=2))
