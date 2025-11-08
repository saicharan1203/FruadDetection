# FinFraudX - AI-Powered Fraud Detection System

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- pip (Python package manager)
- npm (Node package manager)

### Installation

1. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Starting the Application

#### Option 1: Using the Startup Scripts (Recommended)

**Windows:**
Double-click on `start_all.bat` or run in PowerShell:
```powershell
.\start_all.ps1
```

#### Option 2: Manual Start

1. Start the backend server:
```bash
cd backend
python app.py
```

2. In a new terminal, start the frontend server:
```bash
cd frontend
npm start
```

### Accessing the Application

- Backend API: http://localhost:5000
- Frontend UI: http://localhost:3000

### Ports Configuration

- **Backend**: Port 5000
- **Frontend**: Port 3000

The application is configured to always run on these ports. The frontend automatically proxies API requests to the backend through the proxy configuration in package.json.

### Features

1. **Sample Data Generation**: Generate test transaction data with fraud patterns
2. **Model Training**: Train fraud detection models on your data
3. **Fraud Prediction**: Detect fraudulent transactions in new data
4. **Visualization**: Interactive dashboard with fraud statistics and risk analysis
5. **Confidence Scoring**: Each prediction includes a confidence score
6. **Category Analysis**: Fraud rates by merchant category

### Troubleshooting

If you encounter port conflicts:
1. Make sure no other applications are using ports 3000 or 5000
2. If needed, you can change the ports in:
   - Backend: Modify `app.run(port=5000)` in `backend/app.py`
   - Frontend: Modify `PORT` in `frontend/.env` and update the `proxy` in `frontend/package.json`