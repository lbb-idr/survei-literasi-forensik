"""
Create Google Form from simple text format.

Usage:
  python create_form.py < survey.txt
  gemini prompt "..." | python create_form.py
  python create_form.py --file survey.txt

Text format:
  TITLE=Judul Form
  DESC=Deskripsi
  SEC=Nama Section
  short|Teks pertanyaan|id|placeholder:...
  choice|Teks|id|Opsi1,Opsi2,Opsi3
  scale|Teks|id|1-5|LabelMin|LabelMax
  checkbox|Teks|id|Opsi1,Opsi2
  paragraph|Teks|id|placeholder:...
  dropdown|Teks|id|Opsi1,Opsi2
  CMT=Pesan konfirmasi

  # untuk tidak wajib, tambah ~ di akhir: short|Teks|id|placeholder|~
"""

import sys
import json
import urllib.request
import urllib.parse
import os


APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzONajUKfrNsONkDJCgNI7N4WyGbq66e5D9pFz7WVc06L0U_Wf4ZJchYEBLpQm-PeTQ/exec"


def parse_line(line):
    line = line.strip()
    if not line or line.startswith('#') or line.startswith('//'):
        return None
    return line


def parse_survey(text):
    lines = text.strip().split('\n')
    title = ""
    description = ""
    confirmation = "Terima kasih atas partisipasi Anda."
    sections = []
    current_section = None
    errors = []

    for i, raw in enumerate(lines):
        line = parse_line(raw)
        if line is None:
            continue

        if line.startswith('TITLE='):
            title = line[6:].strip()
        elif line.startswith('DESC='):
            description = line[5:].strip()
        elif line.startswith('CMT='):
            confirmation = line[4:].strip()
        elif line.startswith('SEC='):
            current_section = {
                "title": line[4:].strip(),
                "questions": []
            }
            sections.append(current_section)
        elif '|' in line:
            parts = [p.strip() for p in line.split('|')]
            qtype = parts[0].lower()
            qtext = parts[1] if len(parts) > 1 else ""
            qid = parts[2] if len(parts) > 2 else "q" + str(i)
            required = True
            if parts[-1] == '~' or '~' in parts:
                required = False
                parts = [p for p in parts if p != '~']

            q = {"id": qid, "text": qtext, "required": required}

            if qtype == 'short':
                q['type'] = 'short_answer'
                if len(parts) > 3 and parts[3].startswith('placeholder:'):
                    q['placeholder'] = parts[3][12:]

            elif qtype == 'paragraph':
                q['type'] = 'paragraph'
                if len(parts) > 3 and parts[3].startswith('placeholder:'):
                    q['placeholder'] = parts[3][12:]

            elif qtype == 'choice':
                q['type'] = 'multiple_choice'
                if len(parts) > 3:
                    q['options'] = [o.strip() for o in parts[3].split(',') if o.strip()]

            elif qtype == 'checkbox':
                q['type'] = 'checkbox'
                if len(parts) > 3:
                    q['options'] = [o.strip() for o in parts[3].split(',') if o.strip()]

            elif qtype == 'dropdown':
                q['type'] = 'dropdown'
                if len(parts) > 3:
                    q['options'] = [o.strip() for o in parts[3].split(',') if o.strip()]

            elif qtype == 'scale':
                q['type'] = 'linear_scale'
                if len(parts) > 3 and '-' in parts[3]:
                    bounds = parts[3].split('-')
                    q['min'] = int(bounds[0].strip())
                    q['max'] = int(bounds[1].strip())
                if len(parts) > 4:
                    q['minLabel'] = parts[4]
                if len(parts) > 5:
                    q['maxLabel'] = parts[5]

            else:
                errors.append(f"Baris {i+1}: tipe '{qtype}' tidak dikenal")
                continue

            if current_section:
                current_section['questions'].append(q)
            else:
                sec = {"title": "", "questions": [q]}
                sections.append(sec)
                current_section = sec

    return {
        "title": title or "Untitled Form",
        "description": description,
        "confirmationMessage": confirmation,
        "sections": sections
    }, errors


def create_form(data):
    payload = urllib.parse.urlencode({
        "action": "createForm",
        "definition": json.dumps(data)
    }).encode('utf-8')

    req = urllib.request.Request(APP_SCRIPT_URL, data=payload)
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        html = resp.read().decode('utf-8')
        return html
    except urllib.error.HTTPError as e:
        return f"HTTP Error {e.code}: {e.read().decode('utf-8')[:500]}"
    except Exception as e:
        return f"Error: {e}"


def extract_urls(html):
    """Extract form URLs from the HTML response."""
    import re
    urls = re.findall(r'https://[^\s"\']+(?:forms\.gle|docs\.google\.com/forms)[^\s"\']*', html)
    return urls


def main():
    text = ""

    if len(sys.argv) > 1 and sys.argv[1] == '--file' and len(sys.argv) > 2:
        with open(sys.argv[2], 'r', encoding='utf-8') as f:
            text = f.read()
    elif not sys.stdin.isatty():
        text = sys.stdin.read()
    elif len(sys.argv) > 1:
        text = "TITLE=" + " ".join(sys.argv[1:])
    else:
        print("Usage:")
        print("  python create_form.py < file.txt")
        print("  gemini prompt ... | python create_form.py")
        print("  python create_form.py --file survey.txt")
        print("  python create_form.py \"TITLE=Nama Form\"")
        print()
        print("Text format (stdin/file):")
        print("  TITLE=Judul")
        print("  DESC=Deskripsi")
        print("  SEC=Nama Section")
        print("  short|Teks|id|placeholder:...")
        print("  choice|Teks|id|Opsi1,Opsi2")
        print("  scale|Teks|id|1-5|LabelMin|LabelMax")
        print("  paragraph|Teks|id|placeholder:...")
        print("  checkbox|Teks|id|Opsi1,Opsi2")
        print("  CMT=Pesan konfirmasi")
        print("  ~ di akhir = tidak wajib")
        return

    if not text.strip():
        print("Error: tidak ada input")
        return

    data, errors = parse_survey(text)

    if errors:
        for e in errors:
            print(f"⚠ {e}", file=sys.stderr)

    if not data['sections'] or all(len(s['questions']) == 0 for s in data['sections']):
        print("Error: tidak ada pertanyaan yang berhasil diparse", file=sys.stderr)
        return

    total_q = sum(len(s['questions']) for s in data['sections'])
    print(f"Membuat form: {data['title']}")
    print(f"  {len(data['sections'])} section, {total_q} pertanyaan")
    print(f"  Mengirim ke Apps Script...")

    result = create_form(data)

    if 'https://' in result and ('forms.gle' in result or 'docs.google.com/forms' in result):
        urls = extract_urls(result)
        print()
        print("✅ BERHASIL!")
        for u in urls:
            print(f"  {u}")
    elif '✗ Gagal' in result or 'Error' in result:
        print()
        print(f"❌ GAGAL:")
        print(result[:1000])
    else:
        print()
        print("✅ Terkirim! Cek tab browser yang terbuka:")
        print(result[:2000])


if __name__ == '__main__':
    main()
