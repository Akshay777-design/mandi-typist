# Mandi Typist (മാണ്ടി ടൈപ്പിസ്റ്റ്) 🥬⚖️

> Mobile-first web app designed to master vegetable names in Manglish (Malayalam written in English letters) along with decimal billing quantities for wholesale vegetable shops, mandi counters, and grocery billing clerks.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blue.svg)](index.html)

---

## 🌟 Key Features

- **Billing-Style Practice**: Real-world line format: `<Manglish name> <quantity>` (e.g. `Thakkali 12.5`, `Ulli 50.25`, `Inji 3.750`, `Cheeramulak 0.5`).
- **Malayalam Script Reminder**: Displays the authentic Malayalam script (e.g. തക്കാളി, ഉള്ളി) under each line for visual context and reading practice.
- **Live Keystroke Validation**: Character-by-character color feedback (green = correct, red = mistake) with an active cursor guide.
- **Realistic Decimal Scales**: Simulates vegetable scale weights from whole numbers to 1–3 decimal places (`0.25` to `99.999` kg).
- **6 Practice Modes**:
  1. **Single Line**: Focused 1-item line billing drills.
  2. **Bill Mode**: Realistic thermal receipt layout of 5 to 15 lines with running total weight.
  3. **Timed Challenge**: High-speed endurance sprints (5, 10, or 15 minutes) with live countdown and post-challenge scorecard.
  4. **Numbers Only**: Decimal quantity drills with an optional on-screen touch numeric keypad.
  5. **Names Only**: Pure vegetable spelling drills.
  6. **Weak Spots**: Auto-detects and drills your most-mistyped vegetables and tricky characters (such as decimal `.`, commas, and digits).
- **63-Vegetable Kerala Catalog & Custom Editor**: Preloaded with 63 seed vegetables (Thakkali, Ulli, Urulakizhangu, Cheriya Ulli, Veluthulli, Mulak, U.Mulak, Venda, Carrot, Beetroot, Muringa, Payar, etc.). Add, edit, or delete items to match your shop's custom billing shorthand!
- **Rich Analytics & Badges**:
  - Live WPM, accuracy %, items/min, and mistake count.
  - Interactive SVG progress chart tracking speed and accuracy trends.
  - Daily practice streak (`🔥`) and daily goal ring.
  - 10 unlockable milestone badges with confetti celebrations.
- **Audio Feedback**: Synthesized Web Audio key clicks, error alerts, and cash register completion bells.
- **PWA & Offline Capable**: Works 100% offline with zero login required. All settings, records, and custom vegetable spellings save safely in `localStorage` with JSON export/import backup.

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/mandi-typist.git

# 2. Enter project directory
cd mandi-typist

# 3. Install dependencies
npm install

# 4. Start the local development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 🛠️ Build for Production

```bash
# Build the production bundle into /dist
npm run build

# Preview the production build locally
npm run preview
```

---

## 📱 Installing as a Mobile App (PWA)

1. Open the website on your phone's browser (Safari on iOS or Chrome on Android).
2. **On Android / Chrome**: Tap the in-app **"Install App"** button in the top bar.
3. **On iOS / Safari**: Tap the **Share** button in the bottom toolbar, scroll down, and select **"Add to Home Screen"**.
4. The app will launch in standalone full-screen mode and function completely offline without internet!

---

## 📦 How to Publish to GitHub (Step-by-Step)

If you haven't published this project to your GitHub account yet, follow these 4 quick steps:

### Step 1: Create a New Repository on GitHub
1. Log in to [GitHub](https://github.com).
2. Click the **`+`** icon in the top right corner and choose **New repository**.
3. Name your repository `mandi-typist`.
4. Choose **Public** (or Private) and leave *"Initialize this repository with a README"* **unchecked** (we already have everything prepared).
5. Click **Create repository**.

### Step 2: Push Your Code
In your terminal, run the following commands (replace `<your-username>` with your GitHub username):

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Mandi Typist v1.0"

# Rename branch to main
git branch -M main

# Link your GitHub remote repository
git remote add origin https://github.com/<your-username>/mandi-typist.git

# Push the code
git push -u origin main
```

### Step 3: Enable Free Live Hosting on GitHub Pages
This repository includes a preconfigured GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. In your GitHub repository, click on **Settings** > **Pages** (under the "Code and automation" section in the left sidebar).
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Whenever you push to `main`, GitHub will automatically build and publish your app!
4. Your live app will be accessible at:
   `https://<your-username>.github.io/mandi-typist/`

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
