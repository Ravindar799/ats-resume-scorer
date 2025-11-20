import React, { useState } from 'react';
import axios from 'axios';

const ResumeScorer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');
    setLoading(true);

    if (!resumeFile || !jdFile) {
      setError('Please upload both resume and job description files.');
      setLoading(false);
      return;
    }

    // Validate file size (example max 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (resumeFile.size > maxFileSize || jdFile.size > maxFileSize) {
      setError('Each file must be less than 5MB.');
      setLoading(false);
      return;
    }

    // Optionally validate file types (pdf, doc, docx, txt)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!allowedTypes.includes(resumeFile.type) || !allowedTypes.includes(jdFile.type)) {
      setError('Allowed file types: PDF, DOC, DOCX, TXT');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDesc', jdFile);

    try {
      const response = await axios.post('http://localhost:8080/api/resume/score', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to score resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div style={styles.container}>
    <h2 style={styles.title}>ATS Resume Scorer</h2>

    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Resume Upload */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Upload Resume</label>

        <div style={styles.fileInputWrapper}>
          <label
            htmlFor="resume-upload"
            style={{
              ...styles.customFileLabel,
              color: resumeFile ? '#28a745' : '#555',
              flexGrow: 1,
            }}
          >
            {resumeFile ? `File chosen: ${resumeFile.name}` : 'Choose file'}
          </label>

          {resumeFile && (
            <button
              type="button"
              onClick={() => setResumeFile(null)}
              style={styles.clearButton}
              aria-label="Clear selected resume file"
            >
              &times;
            </button>
          )}

          <input
            key={resumeFile ? resumeFile.name : 'resume-upload'}
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setResumeFile(e.target.files[0])}
            style={styles.hiddenFileInput}
          />
        </div>
      </div>

      {/* Job Description Upload */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Upload Job Description</label>

        <div style={styles.fileInputWrapper}>
          <label
            htmlFor="jd-upload"
            style={{
              ...styles.customFileLabel,
              color: jdFile ? '#28a745' : '#555',
              flexGrow: 1,
            }}
          >
            {jdFile ? `File chosen: ${jdFile.name}` : 'Choose file'}
          </label>

          {jdFile && (
            <button
              type="button"
              onClick={() => setJdFile(null)}
              style={styles.clearButton}
              aria-label="Clear selected job description file"
            >
              &times;
            </button>
          )}

          <input
            key={jdFile ? jdFile.name : 'jd-upload'}
            id="jd-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setJdFile(e.target.files[0])}
            style={styles.hiddenFileInput}
          />
        </div>
      </div>

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Scoring...' : 'Submit'}
      </button>
    </form>

    {result && (
      <div style={styles.resultBox}>
        <h3 style={styles.resultTitle}>LLM Score Result</h3>
        <div>{result}</div>
      </div>
    )}

    {error && <p style={styles.error}>{error}</p>}
  </div>
);

};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '60px auto',
    padding: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '8px',
    fontWeight: '600',
    color: '#444',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    backgroundColor: '#fafafa',
    transition: 'border 0.3s',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  resultBox: {
    backgroundColor: '#f9f9f9',
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxHeight: '400px',
    overflowY: 'auto',
    fontSize: '14px',
    lineHeight: '1.6',
    marginTop: '25px',
    color: '#333',
  },
  resultTitle: {
    marginBottom: '10px',
    color: '#2c3e50',
  },
  error: {
    color: '#d32f2f',
    marginTop: '15px',
    textAlign: 'center',
  },
  hiddenFileInput: {
  display: 'none',
  },

  customFileLabel: {
    display: 'inline-block',
    padding: '10px 15px',
    borderRadius: '6px',
    backgroundColor: '#e9ecef',
    border: '1px solid #ccc',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    userSelect: 'none',
    transition: 'color 0.3s ease',
  },
  hiddenFileInput: {
  display: 'none',
  },

  customFileLabel: {
    display: 'inline-block',
    padding: '10px 15px',
    borderRadius: '6px',
    backgroundColor: '#e9ecef',
    border: '1px solid #ccc',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    userSelect: 'none',
    transition: 'color 0.3s ease',
  },

  fileInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  clearButton: {
    background: '#dc3545', // red color
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0',
    userSelect: 'none',
    transition: 'background-color 0.3s',
  },
};


export default ResumeScorer;
