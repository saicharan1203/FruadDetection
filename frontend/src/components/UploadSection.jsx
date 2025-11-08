import React, { useState } from 'react';
import axios from 'axios';
import { FiUploadCloud, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import '../styles/dashboard.css';

export const UploadSection = ({ onUploadSuccess, onGenerateSample }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const validateAndUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/validate-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.success) {
        setFileInfo(response.data);
        setMessage({
          type: 'success',
          text: `✅ File validated! ${response.data.rows} rows, ${response.data.columns?.length || 0} columns`
        });
        onUploadSuccess(response.data);
      } else {
        setMessage({ type: 'error', text: `❌ ${response.data.error}` });
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Upload failed';
      if (error.response) {
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorMessage = error.message;
      }
      setMessage({
        type: 'error',
        text: `❌ Upload failed: ${errorMessage}`
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSample = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await axios.get('/api/sample-data');
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: '✅ Sample data generated successfully!'
        });
        // Add sample data to the response for the UI
        const sampleData = {
          ...response.data,
          sample: response.data.sample || []
        };
        onGenerateSample(sampleData);
      } else {
        setMessage({ type: 'error', text: `❌ ${response.data.error || 'Failed to generate sample data'}` });
      }
    } catch (error) {
      console.error('Sample generation error:', error);
      setMessage({ type: 'error', text: `❌ Failed to generate sample data: ${error.response?.data?.error || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-section">
      <div className="upload-card">
        <FiUploadCloud className="upload-icon" />
        <h2>📤 Upload Transaction Data</h2>
        <p style={{ marginBottom: '20px', color: 'var(--gray)' }}>
          Select a CSV file containing transaction data for fraud detection analysis
        </p>
        
        <div style={{ 
          position: 'relative', 
          margin: '20px 0',
          padding: '10px',
          border: '2px dashed rgba(106, 17, 203, 0.3)',
          borderRadius: '10px',
          backgroundColor: 'rgba(106, 17, 203, 0.05)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '20px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '0.8em',
            fontWeight: 'bold'
          }}>
            STEP 1
          </div>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={loading}
              className="file-input"
              id="file-input"
            />
            <label htmlFor="file-input" className="file-label file-label-highlight">
              {file ? `📄 ${file.name}` : '📁 Choose CSV File'}
            </label>
          </div>
        </div>

        <div style={{ 
          position: 'relative', 
          margin: '30px 0 20px 0',
          padding: '10px',
          border: '2px dashed rgba(37, 117, 252, 0.3)',
          borderRadius: '10px',
          backgroundColor: 'rgba(37, 117, 252, 0.05)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '20px',
            backgroundColor: 'var(--secondary)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '0.8em',
            fontWeight: 'bold'
          }}>
            STEP 2
          </div>
          <div className="button-group">
            <button
              onClick={validateAndUpload}
              disabled={loading || !file}
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? '⏳ Validating...' : '✅ Validate & Upload'}
            </button>
            <button
              onClick={generateSample}
              disabled={loading}
              className={`btn btn-secondary ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? '⏳ Generating...' : '🎲 Generate Sample Data'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            {message.text}
          </div>
        )}

        {fileInfo && (
          <div className="file-info">
            <h3>📊 File Information</h3>
            <p><strong>Rows:</strong> {fileInfo.rows}</p>
            <p><strong>Columns:</strong> {fileInfo.columns?.join(', ') || 'N/A'}</p>
            {fileInfo.sample && fileInfo.sample.length > 0 && (
              <details>
                <summary>View Sample Data</summary>
                <pre>{JSON.stringify(fileInfo.sample, null, 2)}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};