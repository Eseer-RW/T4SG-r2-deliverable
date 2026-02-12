"""
Animal Data Cleaning Script for Google Colab
=============================================
1. Open colab.research.google.com and create a new notebook
2. Copy each cell below into separate cells (or run as one block)
3. Download the messy dataset as CSV from:
   https://docs.google.com/spreadsheets/d/14IIKsZ0DGCcrqbMdGjDznhG1C6iSlAyOiKbIcC15iW0/edit?usp=sharing
   (File > Download > Comma-separated values)
4. Run the first cell to install word2number, then run the rest
"""

# Cell 1: Install word2number (run first)
# !pip install word2number

import re
import numpy as np
import pandas as pd
from word2number import w2n

# Cell 2: Upload CSV to Colab (run after installing word2number)
from google.colab import files
uploaded = files.upload()
filename = list(uploaded.keys())[0]

# ========== STEP 2: Load the dataset ==========
df = pd.read_csv(filename)

# ========== STEP 3: Find name, speed, diet columns (case-insensitive) ==========
def find_column(df, possible_names, contains_ok=True):
    """Find column by exact match or by containing the string (case-insensitive)."""
    for col in df.columns:
        col_lower = col.lower().strip()
        for name in possible_names:
            if col_lower == name.lower():
                return col
            if contains_ok and name.lower() in col_lower:
                return col
    return None

name_col = find_column(df, ["name", "animal", "species"])
speed_col = find_column(df, ["speed", "velocity"])
diet_col = find_column(df, ["diet"])

if name_col is None:
    name_col = df.columns[0]
if speed_col is None:
    speed_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]
if diet_col is None:
    diet_col = df.columns[2] if len(df.columns) > 2 else df.columns[0]

# Select only the columns we need and standardize names for output
df_clean = df[[name_col, speed_col, diet_col]].copy()
df_clean.columns = ["name", "speed", "diet"]

# ========== STEP 4: Trim whitespace ==========
df_clean["name"] = df_clean["name"].astype(str).str.strip()
df_clean["speed"] = df_clean["speed"].astype(str).str.strip()
df_clean["diet"] = df_clean["diet"].astype(str).str.strip()

# ========== STEP 5: Remove rows with missing values ==========
df_clean = df_clean.replace("", np.nan)
df_clean = df_clean.replace("nan", np.nan)
df_clean = df_clean.dropna(subset=["name", "speed", "diet"])

# ========== STEP 6: Convert words to numbers (for speed) ==========
def parse_speed(val):
    """Convert speed value to number. Handles ranges (e.g. 30-40), words (e.g. thirty), and plain numbers."""
    if pd.isna(val) or str(val).strip() == "":
        return np.nan
    s = str(val).strip().lower()
    # Remove common units/suffixes (km/h, kmh, mph, etc.)
    s = re.sub(r"\s*(km/h|kmh|mph|km\/h)\s*", "", s, flags=re.I)
    s = s.strip()
    # Check for range (e.g. "30-40", "30 to 40", "30–50")
    range_match = re.search(r"(\d+(?:\.\d+)?|[\w\s]+)\s*[-–—to]\s*(\d+(?:\.\d+)?|[\w\s]+)", s, re.I)
    if range_match:
        low, high = range_match.group(1).strip(), range_match.group(2).strip()
        try:
            low_n = float(low) if re.match(r"^\d+(\.\d+)?$", low) else w2n.word_to_num(low)
            high_n = float(high) if re.match(r"^\d+(\.\d+)?$", high) else w2n.word_to_num(high)
            return (low_n + high_n) / 2
        except (ValueError, AttributeError):
            pass
    # Single number (digit or word)
    num_match = re.search(r"(\d+(?:\.\d+)?)", s)
    if num_match:
        return float(num_match.group(1))
    try:
        return float(w2n.word_to_num(s))
    except (ValueError, AttributeError):
        return np.nan

df_clean["speed"] = df_clean["speed"].apply(parse_speed)
df_clean = df_clean.dropna(subset=["speed"])

# ========== STEP 7: Standardize diet (carnivore, herbivore, omnivore only) ==========
def standardize_diet(val):
    """Map diet values to carnivore, herbivore, or omnivore."""
    if pd.isna(val) or str(val).strip() == "":
        return np.nan
    s = str(val).strip().lower()
    if re.search(r"carnivor|meat|predator|hunt", s):
        return "carnivore"
    if re.search(r"herbivor|plant|vegetation|grazer", s):
        return "herbivore"
    if re.search(r"omnivor|both|mixed|varied", s):
        return "omnivore"
    return np.nan

df_clean["diet"] = df_clean["diet"].apply(standardize_diet)
df_clean = df_clean.dropna(subset=["diet"])

# Ensure speed is numeric (int for display if whole number)
df_clean["speed"] = pd.to_numeric(df_clean["speed"], errors="coerce")
df_clean = df_clean.dropna(subset=["speed"])
df_clean["speed"] = df_clean["speed"].round(1)

# ========== STEP 8: Export cleaned CSV ==========
# Replace YOUR_NAME with your actual name for the downloadable file
YOUR_NAME = "Cleaned"  # Change this to your name
output_filename = f"{YOUR_NAME} - Cleaned Animal Data.csv"
df_clean.to_csv(output_filename, index=False)
print(f"Exported: {output_filename}")
files.download(output_filename)

# Also save for codebase - when running locally, this saves to current directory
# In Colab, you can download this file and place it in public/sample_animals.csv
df_clean.to_csv("sample_animals.csv", index=False)
print("Also saved as sample_animals.csv - download and place in your project's public/ folder as sample_animals.csv")
