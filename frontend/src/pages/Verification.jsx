import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { verificationAPI } from '../api/api';
import Footer from '../components/Footer';
import './Verification.css';

export default function Verification() {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await verificationAPI.getStatus();
      setStatus(data.data || data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setMsg('Please select a document'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      const data = await verificationAPI.upload(fd);
      setMsg(data.message || 'Document uploaded successfully!');
      setFile(null);
      await loadStatus();
      await refreshUser();
    } catch (err) {
      setMsg(err.message || 'Upload failed');
    }
    setUploading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const statusConfig = {
    unverified: { icon: 'shield', color: 'var(--outline)', label: 'Not Verified', desc: 'Upload your ID document to start the verification process.' },
    pending: { icon: 'hourglass_top', color: 'var(--secondary)', label: 'Pending Review', desc: 'Your document has been submitted and is awaiting admin review.' },
    verified: { icon: 'verified_user', color: '#2e7d32', label: 'Verified', desc: 'Your identity has been verified. A badge is shown on your profile.' },
    rejected: { icon: 'gpp_bad', color: 'var(--error)', label: 'Rejected', desc: 'Your document was rejected. Please upload a clearer document and try again.' },
  };

  const currentStatus = status?.status || user?.verification?.status || 'unverified';
  const cfg = statusConfig[currentStatus] || statusConfig.unverified;

  if (loading) return <div className="loading-screen"><div className="brand">Milan Setu</div><div className="spinner"></div></div>;

  return (
    <>
      <main className="verification-page">
        <div className="verify-inner">
          <header className="verify-header fade-in">
            <h1>Profile Verification</h1>
            <p>Verify your identity to build trust and get a verified badge on your profile.</p>
          </header>

          {msg && <div className="dash-toast">{msg}</div>}

          {/* ── Status Card ──────────────────────── */}
          <div className="verify-status-card fade-in">
            <div className="verify-status-icon" style={{ background: cfg.color }}>
              <span className="material-symbols-outlined filled">{cfg.icon}</span>
            </div>
            <div className="verify-status-info">
              <h2>{cfg.label}</h2>
              <p>{cfg.desc}</p>
            </div>
          </div>

          {/* ── Upload Section ───────────────────── */}
          {(currentStatus === 'unverified' || currentStatus === 'rejected') && (
            <div className="verify-upload-card fade-in-delay-1">
              <h3>Upload ID Document</h3>
              <p className="verify-upload-desc">
                Accepted formats: JPEG, PNG, or PDF (max 5MB).
                Upload a clear photo of your government-issued ID.
              </p>
              <form onSubmit={handleUpload} className="verify-upload-form">
                <label className="verify-file-input">
                  <span className="material-symbols-outlined">cloud_upload</span>
                  <span>{file ? file.name : 'Choose a file'}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    hidden
                  />
                </label>
                <button type="submit" className="btn-submit" disabled={uploading || !file}>
                  {uploading ? 'Uploading...' : 'Submit for Review'}
                  {!uploading && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </form>
            </div>
          )}

          {/* ── Document Preview ─────────────────── */}
          {status?.documentUrl && (
            <div className="verify-doc-preview fade-in-delay-2">
              <h3>Submitted Document</h3>
              <div className="verify-doc-thumb">
                <span className="material-symbols-outlined">description</span>
                <span>Document on file</span>
              </div>
            </div>
          )}

          {/* ── Info Steps ───────────────────────── */}
          <div className="verify-steps fade-in-delay-2">
            <h3>How Verification Works</h3>
            <div className="verify-steps-grid">
              <div className="verify-step">
                <div className="step-num">1</div>
                <h4>Upload Document</h4>
                <p>Submit a clear photo of your government-issued ID (Aadhaar, PAN, Passport, etc.)</p>
              </div>
              <div className="verify-step">
                <div className="step-num">2</div>
                <h4>Admin Review</h4>
                <p>Our team will review your document within 24-48 hours.</p>
              </div>
              <div className="verify-step">
                <div className="step-num">3</div>
                <h4>Get Verified</h4>
                <p>Once approved, a verification badge appears on your profile.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
