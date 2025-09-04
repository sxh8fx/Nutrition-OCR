import os
from flask import Flask, render_template, request
from werkzeug.utils import secure_filename
import pytesseract
from PIL import Image
import re

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "uploads"

# Set tesseract path if needed (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ----------------------------
# Nutri-Score Calculation
# ----------------------------
def calculate_nutriscore(nutrients):
    energy = nutrients.get("energy", 0)   # kJ
    sugar = nutrients.get("sugar", 0)     # g
    sat_fat = nutrients.get("saturated_fat", 0)  # g
    sodium = nutrients.get("sodium", 0)   # mg
    fiber = nutrients.get("fiber", 0)     # g
    protein = nutrients.get("protein", 0) # g

    # Negative points
    points_neg = 0
    points_neg += energy / 335
    points_neg += sugar / 4.5
    points_neg += sat_fat / 1
    points_neg += sodium / 90

    # Positive points
    points_pos = 0
    points_pos += fiber / 0.9
    points_pos += protein / 1.6

    score = int(round(points_neg - points_pos))

    # Clamp score between -15 and 40
    score = max(-15, min(score, 40))

    # Determine Nutri-Score label
    if score <= -1:
        label = "A"
    elif score <= 2:
        label = "B"
    elif score <= 10:
        label = "C"
    elif score <= 18:
        label = "D"
    else:
        label = "E"

    return score, label

# ----------------------------
# Extract Nutrients from OCR
# ----------------------------
def extract_nutrients(text):
    nutrients = {}

    # Flexible regex for common label variations
    energy_match = re.search(r"(?:Energy|ENERGY|energy)\s*[:]?[\s]*([0-9]+)\s*k[JK]?", text)
    sugar_match = re.search(r"(?:Sugar|Sugars|sugar)\s*[:]?[\s]*([0-9]+)", text, re.I)
    sat_fat_match = re.search(r"(?:Saturated Fat|Saturates|saturated fat)\s*[:]?[\s]*([0-9]+)", text, re.I)
    sodium_match = re.search(r"(?:Sodium|Salt|sodium)\s*[:]?[\s]*([0-9]+)", text, re.I)
    fiber_match = re.search(r"(?:Fiber|Fibre|fiber)\s*[:]?[\s]*([0-9]+)", text, re.I)
    protein_match = re.search(r"(?:Protein|protein)\s*[:]?[\s]*([0-9]+)", text, re.I)

    if energy_match: nutrients["Energy (kJ)"] = int(energy_match.group(1))
    if sugar_match: nutrients["Sugar (g)"] = int(sugar_match.group(1))
    if sat_fat_match: nutrients["Saturated Fat (g)"] = int(sat_fat_match.group(1))
    if sodium_match: nutrients["Sodium (mg)"] = int(sodium_match.group(1))
    if fiber_match: nutrients["Fiber (g)"] = int(fiber_match.group(1))
    if protein_match: nutrients["Protein (g)"] = int(protein_match.group(1))

    return nutrients

# ----------------------------
# Routes
# ----------------------------
@app.route("/", methods=["GET", "POST"])
def index():
    ocr_text = None
    nutrients = None
    score = None
    label = None

    if request.method == "POST":
        file = request.files.get("file")
        if not file or file.filename == "":
            return render_template("index.html", error="No file selected")

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        file.save(filepath)

        # OCR
        img = Image.open(filepath)
        ocr_text = pytesseract.image_to_string(img)

        # Nutrients
        nutrients = extract_nutrients(ocr_text)

        if nutrients:
            score, label = calculate_nutriscore({
                "energy": nutrients.get("Energy (kJ)", 0),
                "sugar": nutrients.get("Sugar (g)", 0),
                "saturated_fat": nutrients.get("Saturated Fat (g)", 0),
                "sodium": nutrients.get("Sodium (mg)", 0),
                "fiber": nutrients.get("Fiber (g)", 0),
                "protein": nutrients.get("Protein (g)", 0),
            })

    return render_template("index.html",
                           ocr_text=ocr_text,
                           nutrients=nutrients,
                           score=score,
                           label=label)

# ----------------------------
# Run on LAN
# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
