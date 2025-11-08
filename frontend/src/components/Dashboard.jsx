import React, { useState } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FiActivity, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import 'react-circular-progressbar/dist/styles.css';
import '../styles/dashboard.css';

export const Dashboard = ({ fileInfo, onPredictionsComplete }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trainingStats, setTrainingStats] = useState(null);
  const [trainLoading, setTrainLoading] = useState(false);

  const trainModel = async () => {
    if (!fileInfo?.filepath) return;

    setTrainLoading(true);
    try {
      const response = await axios.post('/api/train', {
        filepath: fileInfo.filepath,
        fraud_column: 'is_fraud'
      });

      if (response.data.success) {
        setTrainingStats(response.data.stats);
        alert('✅ Model trained successfully!');
      }
    } catch (error) {
      alert(`❌ Training failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setTrainLoading(false);
    }
  };

  const runPrediction = async () => {
    if (!fileInfo?.filepath) return;

    setLoading(true);
    try {
      // Create a blob from the file path and create a file-like object
      const response = await axios.post('/api/predict', {
        filepath: fileInfo.filepath
      });

      if (response.data.success) {
        setPredictions(response.data);
        onPredictionsComplete(response.data);
      }
    } catch (error) {
      alert(`❌ Prediction failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🎯 FinFraudX Dashboard</h1>
        <p>AI-Powered Fraud Detection System</p>
      </div>

      {!trainingStats && (
        <div className="action-card">
          <h2>🚀 Model Training</h2>
          <p>Train the fraud detection model on your data</p>
          <button
            onClick={trainModel}
            disabled={trainLoading || !fileInfo}
            className={`btn btn-primary btn-large ${trainLoading ? 'btn-loading' : ''}`}
          >
            {trainLoading ? '⏳ Training...' : '🤖 Train Model'}
          </button>
        </div>
      )}

      {trainingStats && (
        <div className="metrics-grid">
          <MetricCard
            icon={<FiActivity />}
            label="Samples Trained"
            value={trainingStats.samples_trained}
            subtext={`Fraud Rate: ${(trainingStats.fraud_ratio * 100).toFixed(2)}%`}
          />
          <MetricCard
            icon={<FiTrendingUp />}
            label="Random Forest Score"
            value={`${(trainingStats.rf_score * 100).toFixed(2)}%`}
          />
          <MetricCard
            icon={<FiTrendingUp />}
            label="XGBoost Score"
            value={`${(trainingStats.xgb_score * 100).toFixed(2)}%`}
          />
        </div>
      )}

      {trainingStats && !predictions && (
        <div className="action-card">
          <h2>🔮 Run Predictions</h2>
          <p>Detect fraudulent transactions on new data</p>
          <button
            onClick={runPrediction}
            disabled={loading}
            className={`btn btn-primary btn-large ${loading ? 'btn-loading' : ''}`}
          >
            {loading ? '⏳ Processing...' : '🔍 Detect Fraud'}
          </button>
        </div>
      )}

      {predictions && <PredictionResults predictions={predictions} />}
    </div>
  );
};

const MetricCard = ({ icon, label, value, subtext }) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <h3>{label}</h3>
    <p className="metric-value">{value}</p>
    {subtext && <p className="metric-subtext">{subtext}</p>}
  </div>
);

const PredictionResults = ({ predictions }) => {
  const stats = predictions.statistics;

  return (
    <div className="results-container">
      <h2>📊 Prediction Results</h2>

      <div className="metrics-grid">
        <div className="metric-card metric-card-large">
          <FiAlertTriangle className="metric-icon warning" />
          <h3>Fraudulent Transactions</h3>
          <p className="metric-value">{stats.fraudulent_detected}</p>
          <p className="metric-subtext">{stats.fraud_percentage}% of total</p>
        </div>

        <div className="metric-card metric-card-large">
          <FiActivity className="metric-icon info" />
          <h3>Anomalies Detected</h3>
          <p className="metric-value">{stats.anomalies_detected}</p>
          <p className="metric-subtext">Unusual patterns</p>
        </div>

        <div className="metric-card metric-card-large">
          <div style={{ width: 100, height: 100, margin: '0 auto' }}>
            <CircularProgressbar
              value={Math.min(stats.avg_fraud_probability * 100, 100)}
              text={`${(stats.avg_fraud_probability * 100).toFixed(1)}%`}
              styles={buildStyles({
                rotation: 0,
                strokeLinecap: 'round',
                textSize: '12px',
                pathTransitionDuration: 0.5,
                pathColor: stats.avg_fraud_probability > 0.5 ? '#ff4757' : '#2ed573',
                textColor: '#333',
                trailColor: '#e0e0e0',
                backgroundColor: '#3da5c4',
              })}
            />
          </div>
          <h3>Avg. Risk Score</h3>
        </div>
        
        {stats.avg_confidence && (
          <div className="metric-card metric-card-large">
            <div style={{ width: 100, height: 100, margin: '0 auto' }}>
              <CircularProgressbar
                value={stats.avg_confidence}
                text={`${stats.avg_confidence.toFixed(1)}%`}
                styles={buildStyles({
                  rotation: 0,
                  strokeLinecap: 'round',
                  textSize: '12px',
                  pathTransitionDuration: 0.5,
                  pathColor: stats.avg_confidence > 70 ? '#2ed573' : '#ffa502',
                  textColor: '#333',
                  trailColor: '#e0e0e0',
                })}
              />
            </div>
            <h3>Avg. Confidence</h3>
          </div>
        )}
      </div>

      <div className="risk-distribution">
        <h3>📈 Risk Distribution</h3>
        <div className="risk-bars">
          {Object.entries(stats.by_risk_level || {}).map(([level, count]) => (
            <div key={level} className="risk-bar">
              <label>{level}</label>
              <div className="bar-container">
                <div
                  className={`bar bar-${level.toLowerCase()}`}
                  style={{
                    width: `${(count / stats.total_transactions) * 100}%`
                  }}
                />
              </div>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="category-stats">
        <h3>📂 Top Merchant Categories</h3>
        <ul>
          {Object.entries(stats.by_category || {}).map(([category, count]) => (
            <li key={category}>
              <span>{category}</span>
              <strong>{count} transactions</strong>
            </li>
          ))}
        </ul>
      </div>
      
      {stats.category_fraud_rates && Object.keys(stats.category_fraud_rates).length > 0 && (
        <div className="category-stats">
          <h3>⚠️ Fraud Rates by Category</h3>
          <ul>
            {Object.entries(stats.category_fraud_rates || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, rate]) => (
                <li key={category}>
                  <span>{category}</span>
                  <strong>{rate.toFixed(2)}%</strong>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};