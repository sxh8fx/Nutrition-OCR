# Nutrition-OCR

```markdown
# 🥗 Nutrition-OCR

Nutrition-OCR is a web application that extracts nutritional information from images using Optical Character Recognition (OCR). Powered by [Flask](https://flask.palletsprojects.com/) and [Tesseract OCR](https://github.com/tesseract-ocr/tesseract), this tool enables users to upload images of nutrition labels and receive readable, extracted text.

---

## 📖 Introduction

Nutrition-OCR simplifies the process of digitizing nutrition facts from product labels. By leveraging OCR technology, it helps users, researchers, and developers automate the extraction of nutritional data from images, making it easier to analyze, store, and share nutritional information.

---

## ✨ Features

- 📷 Upload images of nutrition labels
- 📝 Extract and display nutrition facts using Tesseract OCR
- 💻 Simple, user-friendly web interface (Flask)
- 🗂 Secure file uploads
- 🪄 Easy integration and customization

---

## ⚡ Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/Nutrition-OCR.git
   cd Nutrition-OCR
   ```

2. **Create and Activate a Virtual Environment** (optional but recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate          # On Unix/Linux
   venv\Scripts\activate             # On Windows
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   _If `requirements.txt` is not present, install dependencies manually:_
   ```bash
   pip install flask pillow pytesseract
   ```

4. **Install Tesseract OCR**

   - **Linux (Ubuntu):**
     ```bash
     sudo apt-get install tesseract-ocr
     ```
   - **macOS (Homebrew):**
     ```bash
     brew install tesseract
     ```
   - **Windows:**
     - Download and install from [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki).
     - Update the `pytesseract.pytesseract.tesseract_cmd` path in `app.py` if necessary.

---

## 🚀 Usage

1. **Run the Flask Application**
   ```bash
   python app.py
   ```

2. **Open Your Browser**
   - Navigate to [http://localhost:5000](http://localhost:5000)

3. **Upload an Image**
   - Use the web interface to upload an image containing nutritional information.

4. **View Results**
   - The extracted text will be displayed on the page.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a pull request

Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> _Empowering nutrition analysis with OCR 🚀_
```


## License
This project is licensed under the **MIT** License.

---
🔗 GitHub Repo: https://github.com/sxh8fx/Nutrition-OCR