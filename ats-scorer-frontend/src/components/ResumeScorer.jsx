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
      <h2>ATS Resume Scorer</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label>Upload Resume: </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setResumeFile(e.target.files[0])}
          />
        </div>

        <div>
          <label>Upload Job Description: </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setJdFile(e.target.files[0])}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Scoring...' : 'Submit'}
        </button>
      </form>

      {result && (
        <div style={styles.resultBox}>
            <h3>LLM Score Result</h3>
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
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  resultBox: {
  backgroundColor: '#f6f6f6',
  padding: '15px',
  borderRadius: '8px',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  maxHeight: '400px',
  overflowY: 'auto',
  border: '1px solid #ccc',
  fontSize: '14px',
  lineHeight: '1.5',
},
  error: {
    color: 'red',
  },
};

export default ResumeScorer;
