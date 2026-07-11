import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../JobBoard.css';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.username || 'mock-user';

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/applications/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>Pending</span>;
      case 'REVIEWING':
        return <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Reviewing</span>;
      case 'ACCEPTED':
        return <span className="badge badge-open">Accepted</span>;
      case 'REJECTED':
        return <span className="badge badge-closed">Rejected</span>;
      default:
        return <span className="badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>{status}</span>;
    }
  };

  return (
    <div className="job-board-root">
      <Navbar />
      
      <div className="job-container" style={{ maxWidth: '900px' }}>
        <div className="job-header">
          <h1 style={{ fontSize: '3rem', marginBottom: '8px' }}>My Applications</h1>
          <p>Track the status of your job and model applications.</p>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#ec4899', fontWeight: 600 }}>Loading...</div>
        ) : applications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
            {applications.map((app) => (
              <div key={app.id} style={{ background: 'white', borderRadius: '20px', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f3f4f6' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>{app.jobTitle || app.jobPosting?.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#ec4899', fontWeight: 600, fontSize: '0.95rem' }}>Salon</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Applied on {app.createdAt || app.appliedAt}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  {getStatusBadge(app.status)}
                  <Link 
                    to={`/jobs/${app.jobPostingId || app.jobPosting?.id}`}
                    style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}
                  >
                    View Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="detail-card" style={{ textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" style={{ margin: '0 auto 16px' }}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>You haven't applied to any jobs</h3>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Explore exciting career and modeling opportunities.</p>
            <Link to="/jobs" className="btn-apply" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Find Jobs
            </Link>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
