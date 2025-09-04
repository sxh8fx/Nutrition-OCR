FROM python:3.11-slim

# Install Tesseract OCR
RUN apt-get update && apt-get install -y tesseract-ocr

# Set work directory
WORKDIR /app

# Copy project files
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]