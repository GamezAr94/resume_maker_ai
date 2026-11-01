# 🚀 Resume Maker AI — Self-Hosted Career Vault & Tailored Resume Engine

**Resume Maker AI** is an open-source, self-hosted web application and automation API that turns your entire career history into hyper-tailored, ATS-optimized resumes in seconds.

Instead of manually rewriting a static resume for every job application, you store all of your work experiences, granular projects, skills, and education once inside a local **Master Profile Vault** (powered by SQLite). Whenever you paste a job description—or send one via **n8n**—the app uses a multi-stage **Google Gemini AI pipeline** to cherry-pick your most relevant achievements, rewrite your bullet points around the job's exact keywords, and render a live, customizable resume.

---

## ✨ Key Features

*   🗄️ **100% Self-Hosted & Lightweight:** Runs in a single Docker container on port `3000` using a local **SQLite** database. No external database servers required.
*   🧠 **4-Pillar STAR Project Vault:** Organize projects by *Problem Solved*, *Technical Actions*, *Impact Metrics*, and *Keywords*. Link projects directly to Work Experience or Education.
*   ⚡ **2-Stage AI Generation:** A fast **AI Scout** selects the best projects and keywords, followed by an **AI Writer** that crafts tailored bullet points with a live progress tracker.
*   🎨 **Live Interactive Editor:** Switch between **6 built-in skins**, customize colors, font sizes, spacing, and easily hide or reorder sections.
*   📄 **Multi-Format Export:** Download as an ATS-friendly **PDF**, an editable **Microsoft Word (.docx)** file, or **Markdown (.md)**.
*   🎯 **AI Career Coach:** Get Candidate Fit Scores, technical interview prep, and personalized LinkedIn outreach messages based on real-time ATS keyword analysis.
*   🤖 **Headless Automation API:** Connect **n8n**, scripts, or bots to generate resumes automatically via `/api/v1/tailor`.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js 16 (App Router, TypeScript)
*   **UI Library:** Mantine UI v8
*   **Database:** SQLite (`better-sqlite3` with WAL mode)
*   **AI Provider:** Google Gemini API (`@google/generative-ai`)
*   **Document Engines:** `@react-pdf/renderer` (PDF), `docx` (Word), `pdf2json` & `mammoth` (Parsing)

---

## 📦 Installation & Quick Start

You can run Resume Maker AI using **Docker Compose** (recommended) or directly with **Node.js**.

### 1. Clone the Repository

```bash
git clone https://github.com/GamezAr94/resume_maker_ai.git
cd resume_maker_ai
git checkout self-hosted-app
```

### 2. Configure Your Environment

Create a `.env` file in the root directory:

```bash
vim .env
```

Add your configuration:

```env
# REQUIRED: Your Google Gemini API Key (https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_google_gemini_api_key_here

# OPTIONAL: Protect the /api/v1/tailor automation endpoint
# HOMELAB_API_KEY=my_super_secret_n8n_key

# OPTIONAL: Override the default Gemini models
# GEMINI_SCOUT_MODEL=gemini-2.5-flash
# GEMINI_WRITER_MODEL=gemini-2.5-flash
```

*Note: Currently, this application supports Google Gemini API keys only. All model settings are centralized in `src/app/config/ai.config.ts`.*

### 3. Start the Application

**Option A: Run with Docker Compose (Recommended)**

```bash
docker compose up --build -d
```

*   **Access UI:** Open `http://localhost:3000`
*   **Data Storage:** Docker mounts the `./data` folder. Your database lives safely in `./data/resume_maker.db`.

**Option B: Run Locally with Node.js (Development)**

Requires Node.js 20+.

```bash
npm install
npm run dev
```

---

## 🧠 How the AI Pipeline Works

To prevent AI context overload and save API quota, the tasks are split:

1.  **Call #1 (AI Scout):** Analyzes the Job Description, extracts ATS keywords, and selects the IDs of your top experiences and projects.
2.  **Call #2 (AI Resume Writer):** Fetches the full STAR details for the winning IDs and writes tailored bullet points.
3.  **Call #3 (AI Coach - On Demand):** Decoupled from resume generation, this runs only when requested to write interview prep and LinkedIn notes.
4.  **Local Parsing:** Uploading an existing PDF/DOCX extracts text locally (0 API calls) before a single Gemini call structures it into JSON.

---

## 📖 User Guide

### 1. Creating Your Master Profile

You can populate your Master Profile in three ways:
*   **Load Profile JSON:** Upload a `.json` backup file (Note: this overwrites your database).
*   **AI Resume Uploader:** Drag and drop an existing PDF or Word document. The AI merges extracted data into your existing profile.
*   **Manual Entry:** Manually enter info, linking projects directly to specific jobs.

*Pro Tip:* Aim for 100% profile completion. Add 15–30 detailed projects from your past 5 years. The more ammunition you give the AI Scout, the better it matches niche job descriptions.

### 2. Generating a Tailored Resume

1.  Enter the Company Name, Job Position, and paste the Job Description on the dashboard.
2.  Click **Generate Tailored Resume**.
3.  A 4-step visual tracker will appear. **Do not refresh the page** while this runs.
4.  Once complete, you will be redirected to the Live Editor.

### 3. Using the Live Editor & Exporting

*   **Content Tab:** Edit any text, move sections up/down, or hide individual bullets.
*   **Skins Tab:** Choose from 6 layouts (Modern, Executive, Silicon Valley, Compact 1-Page, Classic, Minimalist). Adjust colors, margins, and spacing.
*   **Export:** Click the Download button to get a **PDF** (with embedded ATS metadata), **DOCX**, or **MD** file.

---

## 🤖 Headless Automation API (`/api/v1/tailor`)

Control Resume Maker AI via a headless REST API. Every call runs the AI pipeline, saves the resume to SQLite, and returns your desired format.

### API Parameters

*   `company_name` (string, required)
*   `job_position` (string, required)
*   `job_description` (string, required)
*   `output` (string, optional): `"json"`, `"pdf"`, or `"docx"` (Default: `"json"`)
*   `theme` (string, optional): e.g., `"modern"`, `"executive"`, `"tech_mono"`

### Example: Generate & Download PDF

```bash
curl -X POST http://localhost:3000/api/v1/tailor \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Stripe",
    "job_position": "Backend Engineer",
    "job_description": "Seeking a Backend Engineer with strong experience in Node.js, PostgreSQL, and microservices.",
    "theme": "executive",
    "output": "pdf"
  }' --output Stripe_Resume.pdf
```

---

## 🐳 Docker & Maintenance Commands

**Stop the container safely (keeps data intact):**
```bash
docker compose down
```

**Rebuild & Restart after pulling updates:**
```bash
docker compose up --build -d
```

**View Live Logs:**
```bash
docker compose logs -f
```

**Backup your database:**
```bash
cp data/resume_maker.db my_full_backup_$(date +%F).db
```

**Factory Reset (Warning: Deletes all data):**
```bash
docker compose down --rmi all
rm -rf data/
```

---

## 📄 License

This project is open-source and available under the MIT License.
