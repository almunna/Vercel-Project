#!/usr/bin/env python3

import sys
import pdfplumber
import re
from uuid import uuid4
import json

if len(sys.argv) < 2:
    print("Usage: parse_pdf_amex.py /path/to/file.pdf", file=sys.stderr)
    sys.exit(1)

pdf_path = sys.argv[1]
transactions = []

# Read PDF text
full_text = ""
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"

lines = full_text.splitlines()

# Month mapping
month_map = {
    "January": "01",
    "February": "02",
    "March": "03",
    "April": "04",
    "May": "05",
    "June": "06",
    "July": "07",
    "August": "08",
    "September": "09",
    "October": "10",
    "November": "11",
    "December": "12",
}

# Regex example: "May28 TRANSPORTFORNSWTRAVEL SYDNEY 2.24"
date_line_pattern = re.compile(
    r"^(January|February|March|April|May|June|July|August|September|October|November|December)"
    r"(\d{1,2})\s+(.+?)\s+(\d+\.\d{2})$"
)

i = 0
while i < len(lines):
    line = lines[i].strip()

    m = date_line_pattern.match(line)
    if m:
        month_name = m.group(1)
        day = m.group(2).zfill(2)
        description = m.group(3).strip()
        amount = float(m.group(4))

        date_str = f"2025-{month_map[month_name]}-{day}"

        # Check if next line has reference
        i += 1
        reference_line = ""
        if i < len(lines):
            next_line = lines[i].strip()
            if "Reference:" in next_line:
                reference_line = next_line.split("Reference:")[1].strip()

        full_description = description
        if reference_line:
            full_description += f" Ref:{reference_line}"

        transactions.append({
            "id": str(uuid4()),
            "date": date_str,
            "description": full_description,
            "amount": -amount
        })

    else:
        i += 1

# Output JSON
print(json.dumps(transactions))
