import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { safetyAPI } from '../api/api';
import Footer from '../components/Footer';
import './BlockedUsers.css';

export default function BlockedUsers() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadBlocked();
  }, []);

  const loadBlocked = async () => {
    try {
      const data = await safetyAPI.getBlocked();
      setBlocked(data.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (loading) return <div className="loading-screen"><div className="brand">Milan Setu</div><div className="spinner"></div></div>;

  return (
    <>
      <main className="blocked-page">
        <div className="blocked-inner">
          <header className="blocked-header fade-in">
            <h1>Blocked Users</h1>
            <p>Users you've blocked won't appear in your search results, recommendations, or be able to send you interests.</p>
          </header>

          {msg && <div className="dash-toast">{msg}</div>}

          <section className="blocked-content fade-in-delay-1">
            {blocked.length === 0 ? (
              <div className="blocked-empty">
                <span className="material-symbols-outlined">shield</span>
                <h3>No blocked users</h3>
                <p>You haven't blocked anyone yet. You can block users from their profile page.</p>
                <Link to="/search" className="btn-primary-sm">Search Profiles</Link>
              </div>
            ) : (
              <div className="blocked-list">
                {blocked.map(u => (
                  <div className="blocked-card" key={u._id}>
                    <div className="blocked-user">
                      <div className="blocked-avatar">
                        {u.profilePhoto || u.profilePic ? (
                          <img src={u.profilePhoto || u.profilePic} alt="" />
                        ) : (
                          <span>{u.name?.[0]?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div className="blocked-info">
                        <h4>{u.name || 'Unknown User'}</h4>
                        <p>Blocked</p>
                      </div>
                    </div>
                    <div className="blocked-actions">
                      <Link to={`/profile/${u._id}`} className="btn-view-sm">
                        <span className="material-symbols-outlined">visibility</span>
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="blocked-info-banner fade-in-delay-2">
            <span className="material-symbols-outlined">info</span>
            <p>Blocked users cannot see your profile or send you messages. They will not appear in your recommendations.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
