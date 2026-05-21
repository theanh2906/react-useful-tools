import sys
import json

def main():
    # Read inputs from stdin or arguments
    # Standard format for skills input is JSON via CLI/stdin
    try:
        input_data = json.loads(sys.stdin.read())
    except Exception:
        input_data = {"input_text": "Hello World"}

    text = input_data.get("input_text", "")
    
    # Process
    result = {
        "status": "success",
        "processed_text": text.upper()
    }
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()
