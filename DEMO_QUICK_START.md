# Demo Quick Start Guide

## 🚀 Before Running the Demo

You need both the **backend** and **frontend** servers running, and an **OpenAI API key** for the AI Advisor chat.

---

## Step 0: Set OpenAI API Key (Required for AI Chat)

The AI Advisor uses OpenAI for responses. If `OPENAI_API_KEY` is not set, the chat will show:

> "I'm sorry, I couldn't generate a response right now. Please try again in a moment."

**Easiest: use a `.env` file (loaded automatically):**

1. In the `backend/` folder, copy the example file and add your key:
   ```powershell
   cd backend
   copy .env.example .env
   ```
2. Open `backend/.env` and set your key (get one at https://platform.openai.com/api-keys):
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Restart the backend. The app loads `backend/.env` on startup.

**Alternative – set in the terminal before starting the backend:**
- **PowerShell:** `$env:OPENAI_API_KEY = "sk-your-key-here"`
- **Command Prompt:** `set OPENAI_API_KEY=sk-your-key-here`

---

## Step 1: Start the Backend Server

Open a terminal and run:

```powershell
cd backend
python manage.py runserver
```

The backend should start on: **http://localhost:8000**

---

## Step 2: Start the Frontend Server

Open another terminal and run:

```powershell
cd frontend
npm run dev
```

The frontend should start on: **http://localhost:5173**

---

## Step 3: Verify Test User Exists

Make sure you have a test user created:
- **Email:** demo@student.edu
- **Password:** demo123

If not, create one using Django admin or the sign-up flow.

---

## Step 4: (Optional) Seed Sample Data

For a better demo experience, ensure the database has:
- Sample courses
- Assignments with deadlines
- Calendar events
- Some GPA history

---

## ✅ Ready for Demo

Once both servers are running, you can:

### Option A: Manual Demo
Follow the narration script in `LIVE_DEMO_SCRIPT.md`

### Option B: Automated Browser Demo
Run the Cursor browser automation (I can execute this for you)

### Option C: Record the Demo
Use screen recording software (OBS, Loom, etc.) while following the script

---

## 📝 Demo Checklist

- [ ] `OPENAI_API_KEY` set in the environment where the backend runs
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Test user account exists
- [ ] Sample data populated
- [ ] Browser ready (Chrome recommended)
- [ ] Screen resolution set (1920x1080 or 1280x720)
- [ ] Close unnecessary apps/tabs

---

## 🔧 Troubleshooting: "I couldn't generate a response right now"

This message is shown when the **orchestration** layer cannot produce an AI reply. Common causes:

1. **Missing API key** – `OPENAI_API_KEY` not set when the backend started. Set it and restart the backend.
2. **API errors** – Invalid key, rate limit (429), or OpenAI timeout. Check the **backend terminal** for the exact error (e.g. `LLMServiceError`, `OPENAI_API_KEY is not set`).
3. **All agents failed** – Router selected agents but every LLM call failed. Again, check backend logs for `agent X failed` or `orchestration LLM error`.

---

## 🎬 Demo Files Created

1. **LIVE_DEMO_SCRIPT.md** - Complete narration and action script
2. **AUTOMATED_DEMO_EXECUTOR.md** - Technical browser automation sequence
3. **DEMO_QUICK_START.md** - This file (setup instructions)

---

## 🔥 Ready to Go?

Once you confirm both servers are running, I can:
1. Execute the automated browser demo
2. Take screenshots at each step
3. Generate a video walkthrough
4. Create a presentation-ready demo

**Just let me know when the servers are up!** 🚀



