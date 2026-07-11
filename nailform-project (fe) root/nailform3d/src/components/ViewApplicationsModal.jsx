import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function ViewApplicationsModal({ isOpen, onClose, jobId, jobTitle }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && jobId) {
      fetchApplications();
    }
  }, [isOpen, jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/applications/job/${jobId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      toast.error('Cannot load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/applications/${appId}/status?status=${newStatus}`, { 
        method: 'PUT',
        headers 
      });
      if (response.ok) {
        setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
        toast.success('Updated application status');
      }
    } catch (error) {
      toast.error('Error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 700 }}>Applicant List</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Job Posting: <strong style={{ color: '#ec4899' }}>{jobTitle}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#ec4899', fontWeight: 600 }}>Loading...</div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>No applicants for this job yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.map(app => (
              <div key={app.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', background: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#111827' }}>{app.applicantId}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Applied on: {app.appliedAt}</div>
                  </div>
                  <div>
                    <span className={`badge ${app.status === 'PENDING' ? 'badge-tech' : app.status === 'ACCEPTED' ? 'badge-open' : 'badge-closed'}`}>
                      {app.status === 'PENDING' ? 'Pending' : app.status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px', fontSize: '0.95rem', color: '#374151', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0 0 8px 0' }}><strong>Message:</strong> {app.message || 'No message'}</p>
                  {app.portfolioUrl && (
                    <p style={{ margin: 0 }}><strong>Portfolio Link:</strong> <a href={app.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>{app.portfolioUrl}</a></p>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {app.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dc2626', color: '#dc2626', background: 'white', cursor: 'pointer', fontWeight: 600, fontFamily: 'Outfit' }}
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', fontWeight: 600, fontFamily: 'Outfit' }}
                      >
                        Accept
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
