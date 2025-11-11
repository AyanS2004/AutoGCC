# GCC Data Extractor - Complete Guide

A comprehensive full-stack application for extracting and analyzing Global Capability Center (GCC) data. Features automated Python backend using Selenium, a modern React frontend with real-time monitoring, and an AI-powered RAG chatbot for natural language data queries.

---

## 🚀 Features

### Backend (Python)
- **Automated Data Extraction**: Uses Selenium to extract GCC data from Perplexity AI
- **Batch Processing**: Processes multiple companies simultaneously
- **Smart Retry Logic**: Exponential backoff with configurable retries
- **Excel Integration**: Reads from and writes to Excel files with hyperlink support
- **Database Tracking**: SQLite database for progress tracking
- **Comprehensive Logging**: Detailed logs for debugging and monitoring
- **Session Management**: Maintains Chrome debug session throughout process
- **AI Chatbot**: Local RAG (Retrieval-Augmented Generation) system for natural language queries

### Frontend (React/Next.js)
- **Real-time Dashboard**: Monitor extraction progress in real-time
- **Dark Mode**: Full dark mode support with theme toggle
- **Configuration Panel**: Easy-to-use settings management
- **Data Visualization**: View extracted data in formatted tables
- **Live Logs**: Real-time log streaming with filtering
- **Statistics**: Success rates, extraction counts, and progress metrics
- **Export Functionality**: Download results as Excel files
- **AI Chat Interface**: Natural language queries about your data
- **Responsive Design**: Works on all screen sizes

---

## 📋 Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 18.0 or higher
- **Chrome Browser**: Latest version
- **Ollama**: For local AI chatbot (download from https://ollama.ai/)
- **RAM**: 8GB+ recommended (16GB for larger AI models)
- **Disk Space**: ~5-10GB for models and vector database

### Operating System
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+ or equivalent)

---

## 🛠️ Installation

### Step 1: Clone or Download the Project

```bash
git clone <repository-url>
cd AutoquestV2
```

### Step 2: Backend Setup

#### 2.1 Create Python Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- pandas (data manipulation)
- selenium (browser automation)
- openpyxl (Excel file handling)
- flask (API server)
- flask-cors (cross-origin support)
- langchain, langchain-community (RAG system)
- ollama (local LLM)
- chromadb (vector database)
- sentence-transformers (local embeddings)

#### 2.3 Verify Python Installation

```bash
python -c "import pandas, selenium, openpyxl, flask; print('All dependencies installed successfully!')"
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

#### 3.2 Install Node Dependencies

```bash
npm install
```

This installs:
- React & Next.js
- Tailwind CSS
- shadcn/ui components
- Axios for API calls
- And all their dependencies

#### 3.3 Verify Frontend Installation

```bash
npm run build
```

If successful, you should see: `✓ Compiled successfully`

### Step 4: Set Up AI Chatbot (RAG System)

#### 4.1 Install Ollama

Download and install Ollama from https://ollama.ai/

**Windows:** Download the installer and run it  
**macOS/Linux:** 
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### 4.2 Install a Local LLM Model

Pull a model (this will download ~4-7GB depending on the model):

```bash
ollama pull llama2
```

**Recommended models:**
- `llama2` - Good balance of quality and speed (~4GB)
- `mistral` - Fast and efficient (~4GB)
- `llama2:13b` - Better quality but slower (~7GB)
- `codellama` - Good for technical queries (~4GB)

#### 4.3 Start Ollama Server

Make sure Ollama is running:

```bash
ollama serve
```

This starts the Ollama server on `http://localhost:11434` (runs automatically on Windows/macOS)

#### 4.4 Verify RAG Installation

```bash
python -c "from rag_engine import GCCDataRAG; print('RAG engine ready!')"
```

### Step 5: Create Required Files

#### 5.1 Create Excel Template (if not exists)

The system will auto-create `template.xlsx` if it doesn't exist. Alternatively, create it manually with:

**Columns (starting from row 4):**
- Column A: Serial Number
- Column B: Company Name
- Column C-AE: Data fields (auto-populated)

#### 5.2 Create Environment File (Optional)

**Backend (.env in root):**
```env
FLASK_ENV=development
CHROME_DEBUG_PORT=9222
```

**Frontend (frontend/.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚀 Running the Application

### Quick Start Scripts

**Windows Users:**
```bash
start.bat
```

**macOS/Linux Users:**
```bash
chmod +x start.sh
./start.sh
```

### Manual Start

#### Terminal 1: Start Backend API

```bash
python backend_api.py
```

Expected output:
```
================================================================================
GCC Extractor API Server
================================================================================
Starting Flask server on http://localhost:5000
RAG Chat: Enabled
```

#### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in X.Xs
```

#### Terminal 3: Start Chrome with Debug Mode

**Windows:**
```bash
chrome.exe --remote-debugging-port=9222
```

**macOS:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

**Linux:**
```bash
google-chrome --remote-debugging-port=9222
```

Navigate to Perplexity AI and log in if required.

### Accessing the Application

1. Open your browser and navigate to: **http://localhost:3000**
2. You should see the GCC Data Extractor dashboard
3. Click the moon/sun icon to test dark mode
4. Click "Start Extraction" to begin (ensure Chrome debug mode is running)

---

## 📖 Usage Guide

### Starting an Extraction

1. **Open Chrome with debugging:**
   ```bash
   chrome --remote-debugging-port=9222
   ```
   Navigate to Perplexity AI and log in if required.

2. **Prepare your Excel file:**
   - Ensure `template.xlsx` exists or will be created automatically
   - Place company names in column B starting from row 4

3. **Start the services:**
   - Run the backend API: `python backend_api.py`
   - Run the frontend: `cd frontend && npm run dev`

4. **Access the dashboard:**
   - Open `http://localhost:3000`
   - Click "Start Extraction"
   - Monitor progress in real-time

### Monitoring Progress

The dashboard shows:
- **Overall progress**: Percentage complete
- **Current field**: Which data field is being extracted
- **Current batch**: Which batch of companies
- **Statistics**: Success/failure counts
- **Live data**: Extracted information as it's processed
- **Logs**: Real-time system logs

### Using the AI Chatbot

1. Click the **"Talk with Data"** tab in the dashboard
2. Ask questions in natural language:
   - "Which companies have GCC operations in Bangalore?"
   - "Compare Microsoft and Google's GCC operations"
   - "List all companies in the technology industry"
   - "Tell me about Microsoft's GCC operations"
   - "Which companies have operations in Bangalore?"

3. The chatbot will:
   - Search through your extracted data
   - Provide detailed answers with source citations
   - Show which companies the information comes from

### Configuring the Extraction

Click the settings icon to:
- Change input/output file paths
- Adjust batch size
- Modify retry settings
- Set timeout values

### Changing AI Model

To use a different Ollama model, edit `rag_engine.py`:

```python
_rag_instance = GCCDataRAG(local_model='mistral')
```

Then restart the backend API.

---

## 📊 System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│   Flask API      │◄───────►│  Python Script  │
│  (Port 3000)    │  HTTP   │  (Port 5000)     │  Import │  (gcc_copilot)  │
│                 │         │                  │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │                            │
                                     │                            │
                                     ▼                            ▼
                            ┌──────────────────┐         ┌─────────────────┐
                            │                  │         │                 │
                            │  Excel Files     │         │  Chrome Browser │
                            │  - solutions.xlsx│         │  (Port 9222)    │
                            │  - template.xlsx │         │                 │
                            └──────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │                  │
                            │  RAG System      │
                            │  - ChromaDB      │
                            │  - Ollama LLM    │
                            │  - Embeddings    │
                            └──────────────────┘
```

---

## 📁 Project Structure

```
AutoquestV2/
├── gcc_copilot.py              # Main Python extraction script
├── backend_api.py              # Flask API for frontend integration
├── rag_engine.py               # RAG chatbot engine
├── requirements.txt            # Python dependencies
├── template.xlsx               # Excel template (auto-created)
├── solutions.xlsx              # Input/output Excel file
├── backups/                    # Automatic backups
├── chroma_db/                  # Vector database for RAG
├── storage/
│   └── logs/                   # Log files
└── frontend/
    ├── src/
    │   ├── app/               # Next.js pages
    │   ├── components/        # React components
    │   │   ├── ui/           # shadcn/ui components
    │   │   ├── dashboard.tsx
    │   │   ├── config-panel.tsx
    │   │   ├── data-table.tsx
    │   │   ├── logs-viewer.tsx
    │   │   └── chat-interface.tsx
    │   └── lib/
    │       ├── api.ts        # API client
    │       └── utils.ts
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.js
```

---

## 🔧 Configuration

### Python Script Configuration

Edit these variables in `gcc_copilot.py`:

```python
self.batch_size = 3                 # Companies per batch
self.max_retries = 3                # Retry attempts
self.response_timeout = 120         # Seconds to wait for response
self.debug_port = 9222              # Chrome debug port
```

### Frontend Configuration

Create `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### RAG Configuration

Edit `rag_engine.py` to change the AI model:

```python
_rag_instance = GCCDataRAG(local_model='mistral')  # Change model here
```

---

## 🔍 Data Fields Extracted

The system extracts the following information for each company:

1. **Basic Information**
   - Industries
   - Revenue (in millions)
   - GBS Status (Yes/No)

2. **Global GCC Information**
   - Number of global GCC units
   - Global GCC locations (countries)
   - Global GCC headcount

3. **India-Specific Information**
   - Number of GCC units in India
   - GCC locations in India

4. **City-wise Presence**
   - Bangalore, Hyderabad, Pune
   - Chennai, Mumbai, Delhi NCR
   - Other cities

5. **Functions**
   - Finance & Accounting
   - HR, IT, Procurement
   - Operations, R&D, Technology
   - Marketing & Sales
   - Other functions

6. **Headcount**
   - Total GCC headcount in India

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000
```

### Extraction Control

**Start Extraction**
```bash
POST /start
Content-Type: application/json

{
  "input_file": "solutions.xlsx",
  "output_file": "solutions.xlsx",
  "template_file": "template.xlsx",
  "batch_size": 3,
  "max_retries": 3,
  "response_timeout": 120
}
```

**Stop Extraction**
```bash
POST /stop
```

**Get Status**
```bash
GET /status
```

**Get Data**
```bash
GET /data
```

**Get Logs**
```bash
GET /logs?limit=100
```

**Get Configuration**
```bash
GET /config
```

**Update Configuration**
```bash
POST /config
Content-Type: application/json

{
  "batch_size": 5,
  "max_retries": 4
}
```

**Download Results**
```bash
GET /download
```

**Upload File**
```bash
POST /upload
Content-Type: multipart/form-data

file: <excel_file>
type: "input" or "template"
```

**Health Check**
```bash
GET /health
```

### RAG Chat Endpoints

**Ask a Question**
```bash
POST /chat/ask
Content-Type: application/json

{
  "question": "Which companies have GCC operations in Bangalore?"
}
```

**Get Company Summary**
```bash
GET /chat/company/<company_name>
```

**Compare Companies**
```bash
POST /chat/compare
Content-Type: application/json

{
  "companies": ["Microsoft", "Google", "Amazon"]
}
```

**Refresh Data Index**
```bash
POST /chat/refresh
```

**Get Question Suggestions**
```bash
GET /chat/suggestions
```

**Check RAG Status**
```bash
GET /chat/status
```

---

## 🐛 Troubleshooting

### Chrome Connection Issues
- Ensure Chrome is running with `--remote-debugging-port=9222`
- Check that the port isn't already in use
- Try restarting Chrome

### API Connection Failed
- Verify Flask server is running on port 5000
- Check CORS settings
- Ensure no firewall is blocking the connection

### Frontend Build Errors
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Extraction Stops/Hangs
- Check Chrome browser is still responsive
- Review logs in the Logs Viewer
- Check your internet connection
- Verify Perplexity AI is accessible

### RAG Chatbot Issues

**"RAG functionality not available"**
```bash
pip install langchain langchain-community ollama chromadb sentence-transformers
```

**"Failed to connect to Ollama"**
1. Start Ollama: `ollama serve` (or restart the Ollama service)
2. Install a model: `ollama pull llama2`
3. Verify Ollama is running: `ollama list`

**Slow responses**
1. Use a smaller model: `ollama pull mistral` (faster)
2. Edit `rag_engine.py` to change the model
3. Ensure you have enough RAM (8GB+ recommended)

**Model not found**
```bash
ollama pull llama2
```

### Port Already in Use

**Backend (Port 5000):**
- Change port in `backend_api.py`: `app.run(port=5001)`
- Update `NEXT_PUBLIC_API_URL` in frontend

**Frontend (Port 3000):**
```bash
npm run dev -- -p 3001
```

### Python Dependencies Fail to Install

**Error: Microsoft Visual C++ required (Windows)**
- Install Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
- Select "C++ build tools" during installation

**Error: Permission denied**
- Use `sudo` on macOS/Linux: `sudo pip install -r requirements.txt`
- Or use a virtual environment (recommended)

---

## 💰 Cost Estimation

### Using Local Ollama (Current Setup)
- **Embeddings:** Free (local HuggingFace model)
- **LLM:** Free (runs locally)
- **Storage:** Minimal disk space for vector database

**Total cost: $0** - Everything runs locally!

**Hardware Requirements:**
- RAM: 8GB+ recommended (16GB for larger models)
- Disk: ~5-10GB for models and vector database
- CPU: Any modern processor (GPU optional but faster)

---

## 🔒 Security Notes

- The system uses Chrome debug mode - only use on trusted machines
- API keys and credentials should be stored in environment variables
- Don't expose the Flask API to the internet without proper authentication
- The RAG system runs entirely locally - no data is sent to external services

---

## 🎯 Features Overview

### Frontend Features
- 🌓 **Dark Mode** - Full dark/light theme support
- 📊 **Real-time Dashboard** - Live extraction monitoring
- 📈 **Statistics** - Success rates, counts, progress
- 💬 **AI Chat** - Natural language data queries
- 🎨 **Modern UI** - Beautiful, responsive design
- 📱 **Mobile Friendly** - Works on all screen sizes

### RAG Chatbot Features
- ✅ **Natural Language Queries** - Ask questions in plain English
- ✅ **Source Citations** - See which companies data comes from
- ✅ **Context-Aware** - Understands GCC domain terminology
- ✅ **Comparison** - Compare multiple companies
- ✅ **Export** - Download chat history
- ✅ **Refresh** - Update index when data changes

---

## 📝 License

This project is proprietary. All rights reserved.

---

## 🤝 Contributing

For bug reports or feature requests, please contact the development team.

---

## 📧 Support

For support or questions, please refer to this documentation or contact the development team.

---

## 🎉 Getting Started Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Chrome browser installed
- [ ] Ollama installed and running
- [ ] Python dependencies installed (`pip list` shows all packages)
- [ ] Frontend dependencies installed (`node_modules` folder exists)
- [ ] Ollama model installed (`ollama pull llama2`)
- [ ] Backend API starts successfully on port 5000
- [ ] Frontend starts successfully on port 3000
- [ ] Chrome opens with debug port 9222
- [ ] Dashboard loads in browser
- [ ] Dark mode toggle works
- [ ] Configuration panel opens
- [ ] RAG chatbot responds to questions

---

**Enjoy extracting and analyzing GCC data!** 🚀✨
