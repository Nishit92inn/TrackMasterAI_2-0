import os
import json

def analyze_json(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Print the total number of entries
    print(f"Total entries: {len(data)}")
    
    # Print the first entry to see the structure
    if data:
        print("First entry:")
        print(json.dumps(data[0], indent=4))
    else:
        print("No data found in the file.")

    # Validate the structure of all entries
    for i, entry in enumerate(data):
        if 'features' not in entry or not isinstance(entry['features'], list):
            print(f"Invalid entry at index {i}: {entry}")
            break
    else:
        print("All entries are valid.")

if __name__ == '__main__':
    file_path = 'Processed_DataSet/kristen_stewart_features.json'
    analyze_json(file_path)