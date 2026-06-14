import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Basic protection
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/api/subscriptions/admin/requests`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/api/subscriptions/admin/requests/${id}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        alert("Processed successfully!");
        fetchRequests(); // refresh
      } else {
        alert("An error occurred!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <h2>Manage Subscription Upgrades</h2>
        <p>List of users who have transferred funds and are awaiting approval.</p>

        <table style={{ width: '100%', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '15px' }}>Account</th>
              <th style={{ padding: '15px' }}>Subscription Plan</th>
              <th style={{ padding: '15px' }}>Creation Time</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No pending requests.</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}><strong>{req.username}</strong></td>
                  <td style={{ padding: '15px' }}><span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{req.requestedPlan}</span></td>
                  <td style={{ padding: '15px', color: '#666' }}>{new Date(req.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '15px', textAlign: 'right', gap: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleAction(req.id, 'approve')}
                      style={{ padding: '8px 15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                    <button 
                      onClick={() => handleAction(req.id, 'reject')}
                      style={{ padding: '8px 15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
