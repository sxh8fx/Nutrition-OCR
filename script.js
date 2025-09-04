class NutriScanApp {
    constructor() {
        this.initializeElements()
        this.bindEvents()
    }

    initializeElements() {
        this.uploadForm = document.getElementById("uploadForm")
        this.fileInput = document.getElementById("fileInput")
        this.fileInputWrapper = document.getElementById("fileInputWrapper")
        this.filePreview = document.getElementById("filePreview")
        this.scanButton = document.getElementById("scanButton")
        this.resultsSection = document.getElementById("resultsSection")
        this.resultsDiv = document.getElementById("results")
        this.ocrDiv = document.getElementById("ocrText")
    }

    bindEvents() {
        // Form submission
        this.uploadForm.addEventListener("submit", (e) => this.handleSubmit(e))

        // File input change
        this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e))

        // Drag and drop
        this.fileInputWrapper.addEventListener("dragover", (e) => this.handleDragOver(e))
        this.fileInputWrapper.addEventListener("dragleave", (e) => this.handleDragLeave(e))
        this.fileInputWrapper.addEventListener("drop", (e) => this.handleDrop(e))
    }

    handleDragOver(e) {
        e.preventDefault()
        this.fileInputWrapper.classList.add("dragover")
    }

    handleDragLeave(e) {
        e.preventDefault()
        this.fileInputWrapper.classList.remove("dragover")
    }

    handleDrop(e) {
        e.preventDefault()
        this.fileInputWrapper.classList.remove("dragover")

        const files = e.dataTransfer.files
        if (files.length > 0) {
            this.fileInput.files = files
            this.handleFileSelect({ target: { files } })
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            this.showError("Please select a valid image file.")
            return
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showError("File size must be less than 10MB.")
            return
        }

        this.showFilePreview(file)
    }

    showFilePreview(file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            this.filePreview.innerHTML = `
        <img src="${e.target.result}" alt="Preview" class="preview-image">
        <div class="file-info">
          <strong>${file.name}</strong><br>
          Size: ${this.formatFileSize(file.size)}<br>
          Type: ${file.type}
        </div>
      `
            this.filePreview.classList.add("active")
        }
        reader.readAsDataURL(file)
    }

    formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    async handleSubmit(e) {
        e.preventDefault()

        if (!this.fileInput.files.length) {
            this.showError("Please select a file to analyze.")
            return
        }

        this.setLoadingState(true)
        this.clearResults()

        const formData = new FormData()
        formData.append("file", this.fileInput.files[0])

        try {
            const response = await fetch("http://127.0.0.1:5000/check", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (data.error) {
                this.showError(data.error)
                return
            }

            this.displayResults(data)
        } catch (error) {
            console.error("Error:", error)
            this.showError("Failed to analyze the image. Please check your connection and try again.")
        } finally {
            this.setLoadingState(false)
        }
    }

    setLoadingState(loading) {
        this.scanButton.disabled = loading
        this.scanButton.classList.toggle("loading", loading)

        const buttonText = this.scanButton.querySelector(".button-text")
        buttonText.textContent = loading ? "Analyzing..." : "Analyze Package"
    }

    clearResults() {
        this.resultsDiv.innerHTML = ""
        this.ocrDiv.innerHTML = ""
        this.resultsSection.classList.remove("active")
    }

    displayResults(data) {
        let resultsHTML = ""

        if (data.label) {
            resultsHTML += `
        <div class="results-card">
          <h2>🏆 Nutri-Score Analysis</h2>
          <div class="nutriscore-container">
            <div class="nutriscore-badge">
              <div class="score-box A ${data.label === "A" ? "active" : ""}">A</div>
              <div class="score-box B ${data.label === "B" ? "active" : ""}">B</div>
              <div class="score-box C ${data.label === "C" ? "active" : ""}">C</div>
              <div class="score-box D ${data.label === "D" ? "active" : ""}">D</div>
              <div class="score-box E ${data.label === "E" ? "active" : ""}">E</div>
            </div>
            <div class="score-description">
              <div class="score-label">Nutri-Score: ${data.label}</div>
              <div class="score-meaning">${this.getNutriScoreMeaning(data.label)}</div>
            </div>
          </div>
        </div>
      `
        }

        if (data.nutrients && Object.keys(data.nutrients).length > 0) {
            const nutrients = Object.entries(data.nutrients)

            resultsHTML += `
        <div class="results-card">
          <h2>📊 Nutritional Information</h2>
          <div class="chart-container">
            <div class="pie-chart-container">
              <svg class="pie-chart" id="pieChart" viewBox="0 0 200 200">
                ${this.generatePieChart(nutrients)}
              </svg>
              <div class="pie-legend" id="pieLegend">
                ${this.generatePieLegend(nutrients)}
              </div>
            </div>
          </div>
        </div>
      `
        }

        this.resultsDiv.innerHTML = resultsHTML

        // Show results with animation
        this.resultsSection.classList.add("active")
        this.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" })

        setTimeout(() => {
            this.animateCharts()
        }, 300)
    }

    getNutriScoreMeaning(label) {
        const meanings = {
            A: "Excellent nutritional quality - High in nutrients, low in calories, saturated fat, sugar, and salt",
            B: "Good nutritional quality - Generally healthy choice with minor nutritional concerns",
            C: "Fair nutritional quality - Moderate nutritional value, consume in moderation",
            D: "Poor nutritional quality - High in calories, saturated fat, sugar, or salt",
            E: "Very poor nutritional quality - Limit consumption, very high in unhealthy nutrients",
        }
        return meanings[label] || "Nutritional quality assessment"
    }

    extractNumericValue(value) {
        const match = value.toString().match(/[\d.]+/)
        return match ? Number.parseFloat(match[0]) : 0
    }

    extractUnit(value) {
        const match = value.toString().match(/[a-zA-Z%]+/)
        return match ? match[0] : ""
    }

    generatePieChart(nutrients) {
        const total = nutrients.reduce((sum, [key, value]) => sum + this.extractNumericValue(value), 0)
        let currentAngle = 0
        let pathsHTML = ""

        nutrients.forEach(([key, value], index) => {
            const numericValue = this.extractNumericValue(value)
            const percentage = (numericValue / total) * 100

            if (percentage > 0) {
                const angle = (numericValue / total) * 360
                const path = this.createPieSlice(100, 100, 80, currentAngle, currentAngle + angle)
                const color = this.getPieColor(index)

                pathsHTML += `
          <path d="${path}" 
                fill="${color}" 
                stroke="#ffffff" 
                stroke-width="3"
                class="pie-slice"
                data-nutrient="${key}"
                data-value="${value}">
          </path>
        `

                currentAngle += angle
            }
        })

        return pathsHTML
    }

    generatePieLegend(nutrients) {
        const total = nutrients.reduce((sum, [key, value]) => sum + this.extractNumericValue(value), 0)
        let legendHTML = ""

        nutrients.forEach(([key, value], index) => {
            const numericValue = this.extractNumericValue(value)
            const percentage = ((numericValue / total) * 100).toFixed(1)
            const color = this.getPieColor(index)

            legendHTML += `
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${color}"></div>
          <span class="legend-text">${this.formatNutrientName(key)}: ${value} (${percentage}%)</span>
        </div>
      `
        })

        return legendHTML
    }

    createPieSlice(cx, cy, radius, startAngle, endAngle) {
        const start = this.polarToCartesian(cx, cy, radius, endAngle)
        const end = this.polarToCartesian(cx, cy, radius, startAngle)
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

        return ["M", cx, cy, "L", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "Z"].join(" ")
    }

    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        }
    }

    getPieColor(index) {
        const colors = [
            "#2563eb", // Blue - Primary nutrients
            "#dc2626", // Red - Fats/unhealthy
            "#16a34a", // Green - Healthy nutrients
            "#ea580c", // Orange - Energy/carbs
            "#7c3aed", // Purple - Proteins
            "#0891b2", // Cyan - Minerals
            "#65a30d", // Lime - Fiber
            "#be185d", // Pink - Sugars
        ]
        return colors[index % colors.length]
    }

    animateCharts() {
        const pieSlices = document.querySelectorAll(".pie-slice")
        pieSlices.forEach((slice, index) => {
            setTimeout(() => {
                slice.classList.add("animate")
            }, index * 150)
        })
    }

    formatNutrientName(name) {
        return name
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    showError(message) {
        this.resultsDiv.innerHTML = `
      <div class="results-card">
        <div class="error-message">
          <span>⚠️</span>
          <span>${message}</span>
        </div>
      </div>
    `
        this.resultsSection.classList.add("active")
    }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new NutriScanApp()
})

// Add smooth scrolling for better UX
document.documentElement.style.scrollBehavior = "smooth"
