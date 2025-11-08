import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import '../styles/dashboard.css';

export const ResultsTable = ({ predictions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const results = predictions.results || [];
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentResults = results.slice(startIdx, endIdx);

  const downloadResults = () => {
    const csv = convertToCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fraud_predictions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    const keys = Object.keys(data[0]);
    const header = keys.join(',');
    const rows = data.map(obj =>
      keys.map(key => {
        const val = obj[key];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val;
      }).join(',')
    );
    return [header, ...rows].join('\n');
  };

  return (
    <div className="results-table-section">
      <div className="table-header">
        <h2>📋 Detailed Predictions</h2>
        <button onClick={downloadResults} className="btn btn-secondary btn-sm">
          <FiDownload /> Download CSV
        </button>
      </div>

      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Risk Probability</th>
              <th>Risk Level</th>
              <th>Fraud?</th>
              <th>Anomaly?</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.map((tx, idx) => (
              <tr key={idx} className={tx.is_fraud_predicted ? 'fraud-row' : ''}>
                <td>{tx.customer_id || 'N/A'}</td>
                <td>${(tx.amount || 0)?.toFixed(2)}</td>
                <td>{tx.merchant_category || 'N/A'}</td>
                <td>
                  <div className="probability-bar">
                    <div
                      className="probability-fill"
                      style={{
                        width: `${(tx.ensemble_fraud_probability || 0) * 100}%`,
                        backgroundColor:
                          (tx.ensemble_fraud_probability || 0) > 0.7 ? '#ff4757' :
                          (tx.ensemble_fraud_probability || 0) > 0.5 ? '#ffa502' :
                          '#2ed573'
                      }}
                    />
                    <span>{(((tx.ensemble_fraud_probability || 0) * 100).toFixed(1))}%</span>
                  </div>
                </td>
                <td>
                  <span className={`risk-badge risk-${(tx.risk_level || 'low').toLowerCase()}`}>
                    {tx.risk_level || 'Low'}
                  </span>
                </td>
                <td>{tx.is_fraud_predicted ? '🚨 Yes' : '✅ No'}</td>
                <td>{tx.is_anomaly ? '⚠️ Yes' : '✅ No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>
        <span>{currentPage} / {totalPages || 1}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
};