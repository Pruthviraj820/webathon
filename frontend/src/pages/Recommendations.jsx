import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationAPI, interestAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './Recommendations.css';

export default function Recommendations() {
  const { user } = useAuth();
  const [topMatches, setTopMatches] = useState([]);
  const [dailySuggestions, setDailySuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentIds, setSentIds] = useState(new Set());
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('top');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [topData, dailyData, sentData] = await Promise.all([
        recommendationAPI.getTop().catch(() => ({ data: [] })),
        recommendationAPI.getDaily().catch(() => ({ data: [] })),
        interestAPI.getSent().catch(() => ({ data: [] })),
      ]);

      setTopMatches(topData.data || topData.recommendations || []);
      setDailySuggestions(dailyData.data || dailyData.recommendations || []);
      const ids = new Set((sentData.data || []).map(i => i.receiver?._id || i.receiver));
      setSentIds(ids);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSendInterest = async (receiverId) => {
    try {
      await interestAPI.send(receiverId);
      setSentIds(prev => new Set(prev).add(receiverId));
      setMsg('Interest sent! ❤️');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Already sent');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const currentList = tab === 'top' ? topMatches : dailySuggestions;

  if (loading) return <div className="loading-screen"><div className="brand">Milan Setu</div><div className="spinner"></div></div>;

  return (
    <>
      <main className="reco-page">
        <div className="reco-inner">
          <header className="reco-header fade-in">
            <h1>Your Recommendations</h1>
            <p>Profiles curated by our matching algorithm based on your preferences, lifestyle, and compatibility score.</p>
          </header>

          {msg && <div className="dash-toast">{msg}</div>}

          <nav className="reco-tabs fade-in">
            <button className={tab === 'top' ? 'active' : ''} onClick={() => setTab('top')}>
              <span className="material-symbols-outlined">stars</span>
              Top Matches ({topMatches.length})
            </button>
            <button className={tab === 'daily' ? 'active' : ''} onClick={() => setTab('daily')}>
              <span className="material-symbols-outlined">today</span>
              Daily Picks ({dailySuggestions.length})
            </button>
          </nav>

          <section className="reco-content fade-in-delay-1">
            {currentList.length === 0 ? (
              <div className="reco-empty">
                <span className="material-symbols-outlined">search_off</span>
                <h3>No recommendations yet</h3>
                <p>Complete your profile and set your preferences to get personalized matches.</p>
                <Link to="/preferences" className="btn-primary-sm">Set Preferences</Link>
              </div>
            ) : (
              <div className="reco-grid">
                {currentList.map(item => {
                  const u = item.user || item.candidate || item;
                  const score = item.score;
                  const userId = u._id;
                  return (
                    <div className="reco-card" key={userId}>
                      <div className="reco-card-top">
                        {u.profilePic || u.profilePhoto ? (
                          <img src={u.profilePic || u.profilePhoto} alt={u.name} className="reco-card-img" />
                        ) : (
                          <div className="reco-card-placeholder">
                            <span>{u.name?.[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        {score != null && (
                          <div className="reco-score">
                            <span className="material-symbols-outlined filled">stars</span>
                            {Math.round(score)}%
                          </div>
                        )}
                        {user && !sentIds.has(userId) && (
                          <button className="reco-fav" onClick={() => handleSendInterest(userId)} title="Send Interest">
                            <span className="material-symbols-outlined">favorite</span>
                          </button>
                        )}
                        {sentIds.has(userId) && (
                          <div className="reco-sent">
                            <span className="material-symbols-outlined filled">favorite</span>
                          </div>
                        )}
                      </div>
                      <div className="reco-card-body">
                        <h3>{u.name}{u.age ? `, ${u.age}` : ''}</h3>
                        <p className="reco-meta">
                          {u.education || u.job || 'Professional'}
                          {u.city ? ` • ${u.city}` : ''}
                        </p>
                        {item.explanation && (
                          <p className="reco-explanation">{item.explanation}</p>
                        )}
                        <Link to={`/profile/${userId}`} className="btn-view-profile">View Profile</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
