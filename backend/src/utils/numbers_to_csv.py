import sys
import csv
import warnings

# Suppress library warnings
warnings.filterwarnings("ignore")

try:
    from numbers_parser import Document
except ImportError:
    print("Error: numbers-parser Python library not installed.", file=sys.stderr)
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 numbers_to_csv.py <path_to_numbers_file>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    try:
        doc = Document(file_path)
        if not doc.sheets:
            print("Error: No sheets found in document", file=sys.stderr)
            sys.exit(1)
        
        sheet = doc.sheets[0]
        if not sheet.tables:
            print("Error: No tables found in first sheet", file=sys.stderr)
            sys.exit(1)
            
        table = sheet.tables[0]
        
        writer = csv.writer(sys.stdout)
        for row in table.rows(values_only=True):
            writer.writerow(["" if v is None else v for v in row])
            
    except Exception as e:
        print(f"Error parsing Numbers file: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
