# src/Face_Detection/label_map.py

import os
import json

LABEL_MAP_DIR = os.path.join(os.path.dirname(__file__), '../../Label_Maps')
PROCESSED_DATASET_DIR = os.path.join(os.path.dirname(__file__), '../../Processed_DataSet')

def create_label_map():
    if not os.path.exists(LABEL_MAP_DIR):
        os.makedirs(LABEL_MAP_DIR)

    label_map = {}
    current_label = 0

    for filename in os.listdir(PROCESSED_DATASET_DIR):
        if filename.endswith('_features.json'):
            celebrity_name = filename.replace('_features.json', '')
            label_map[current_label] = celebrity_name
            current_label += 1

    label_map_file = os.path.join(LABEL_MAP_DIR, 'label_map.json')
    with open(label_map_file, 'w') as f:
        json.dump(label_map, f, indent=4)

    print(f"Label map created with {current_label} entries.")