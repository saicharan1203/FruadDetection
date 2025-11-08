import React, { useState } from 'react';
import { UploadSection } from './components/UploadSection';
import { Dashboard } from './components/Dashboard';
import { PatternVisualization } from './components/PatternVisualization';
import { AnomalyDetector } from './components/AnomalyDetector';
import { ResultsTable } from './components/ResultsTable';
import './styles/dashboard.css';

function App() {
  const [fileInfo, setFileInfo] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🛡️ FinFraudX</h1>
          <p>AI-Powered Fraud Detection System | Spot hidden frauds before they happen</p>
        </div>
      </header>

      <main className="app-main">
        {!fileInfo ? (
          <>
            <UploadSection
              onUploadSuccess={(data) => {
                if (data.success !== false) {
                  setFileInfo(data);
                  setError(null);
                } else {
                  setError(data.error || 'Upload failed');
                }
              }}
              onGenerateSample={(data) => {
                if (data.success !== false) {
                  setFileInfo(data);
                  setError(null);
                } else {
                  setError(data.error || 'Failed to generate sample data');
                }
              }}
            />
            {error && (
              <div className="error-message" style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>
                ❌ {error}
              </div>
            )}
          </>
        ) : (
          <>
            <Dashboard fileInfo={fileInfo} onPredictionsComplete={setPredictions} />
            {predictions && (
              <>
                <PatternVisualization predictions={predictions} />
                <AnomalyDetector predictions={predictions} />
                <ResultsTable predictions={predictions} />
              </>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>🔒 FinFraudX © 2024 | Advanced AI Fraud Detection</p>
      </footer>
    </div>
  );
}

export default App;