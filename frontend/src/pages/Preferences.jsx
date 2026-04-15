import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/api';
import Footer from '../components/Footer';
import './Preferences.css';

export default function Preferences() {
  const { user, refreshUser } = useAuth();
  const [prefs, setPrefs] = useState({
    ageRange: { min: 18, max: 60 },
    location: { city: '', state: '', country: '' },
    education: '',
    job: '',
    religion: '',
    caste: '',
    lifestyle: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [lifestyleInput, setLifestyleInput] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await userAPI.getPreferences();
      const p = data.preferences || {};
      setPrefs({
        ageRange: p.ageRange || { min: 18, max: 60 },
        location: p.location || { city: '', state: '', country: '' },
        education: p.education || '',
        job: p.job || '',
        religion: p.religion || '',
        caste: p.caste || '',
        lifestyle: p.lifestyle || [],
      });
    } catch { /* use defaults */ }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updatePreferences(prefs);
      await refreshUser();
      setMsg('Preferences saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Failed to save');
      setTimeout(() => setMsg(''), 3000);
    }
    setSaving(false);
  };

  const addLifestyle = () => {
    if (!lifestyleInput.trim()) return;
    setPrefs(prev => ({
      ...prev,
      lifestyle: [...prev.lifestyle, lifestyleInput.trim().toLowerCase()],
    }));
    setLifestyleInput('');
  };

  const removeLifestyle = (idx) => {
    setPrefs(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.filter((_, i) => i !== idx),
    }));
  };

  if (loading) return <div className="loading-screen"><div className="brand">Milan Setu</div><div className="spinner"></div></div>;

  return (
    <>
      <main className="preferences-page">
        <div className="pref-inner">
          <header className="pref-header fade-in">
            <h1>Partner Preferences</h1>
            <p>Define what you're looking for in an ideal partner. These preferences power our matching algorithm.</p>
          </header>

          {msg && <div className="dash-toast">{msg}</div>}

          <form onSubmit={handleSave} className="pref-form fade-in-delay-1">
            {/* ── Age Range ──────────────────────── */}
            <div className="pref-section">
              <h3><span className="material-symbols-outlined">calendar_month</span> Age Range</h3>
              <div className="pref-row">
                <div className="form-field">
                  <label>Minimum Age</label>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefs.ageRange.min}
                    onChange={e => setPrefs({ ...prefs, ageRange: { ...prefs.ageRange, min: parseInt(e.target.value) || 18 } })}
                  />
                </div>
                <div className="form-field">
                  <label>Maximum Age</label>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={prefs.ageRange.max}
                    onChange={e => setPrefs({ ...prefs, ageRange: { ...prefs.ageRange, max: parseInt(e.target.value) || 60 } })}
                  />
                </div>
              </div>
            </div>

            {/* ── Location ───────────────────────── */}
            <div className="pref-section">
              <h3><span className="material-symbols-outlined">location_on</span> Preferred Location</h3>
              <div className="pref-row pref-row-3">
                <div className="form-field">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={prefs.location.city}
                    onChange={e => setPrefs({ ...prefs, location: { ...prefs.location, city: e.target.value } })}
                  />
                </div>
                <div className="form-field">
                  <label>State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={prefs.location.state}
                    onChange={e => setPrefs({ ...prefs, location: { ...prefs.location, state: e.target.value } })}
                  />
                </div>
                <div className="form-field">
                  <label>Country</label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={prefs.location.country}
                    onChange={e => setPrefs({ ...prefs, location: { ...prefs.location, country: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* ── Background ─────────────────────── */}
            <div className="pref-section">
              <h3><span className="material-symbols-outlined">school</span> Background</h3>
              <div className="pref-row">
                <div className="form-field">
                  <label>Education</label>
                  <input
                    type="text"
                    placeholder="e.g. Masters, Engineering"
                    value={prefs.education}
                    onChange={e => setPrefs({ ...prefs, education: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Profession</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={prefs.job}
                    onChange={e => setPrefs({ ...prefs, job: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* ── Faith ───────────────────────────── */}
            <div className="pref-section">
              <h3><span className="material-symbols-outlined">temple_hindu</span> Faith & Community</h3>
              <div className="pref-row">
                <div className="form-field">
                  <label>Religion</label>
                  <input
                    type="text"
                    placeholder="e.g. Hindu"
                    value={prefs.religion}
                    onChange={e => setPrefs({ ...prefs, religion: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Caste</label>
                  <input
                    type="text"
                    placeholder="e.g. Brahmin"
                    value={prefs.caste}
                    onChange={e => setPrefs({ ...prefs, caste: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* ── Lifestyle ──────────────────────── */}
            <div className="pref-section">
              <h3><span className="material-symbols-outlined">interests</span> Lifestyle Preferences</h3>
              <div className="pref-lifestyle-input">
                <input
                  type="text"
                  placeholder="Add a preference (e.g. vegetarian, fitness)"
                  value={lifestyleInput}
                  onChange={e => setLifestyleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLifestyle(); } }}
                />
                <button type="button" className="btn-add-lifestyle" onClick={addLifestyle}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              {prefs.lifestyle.length > 0 && (
                <div className="pref-chips">
                  {prefs.lifestyle.map((tag, i) => (
                    <span key={i} className="pref-chip">
                      {tag}
                      <button type="button" onClick={() => removeLifestyle(i)}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pref-actions">
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
                {!saving && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
