import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ApplicationModal({ isOpen, onClose, job, onSubmit }) {
  const [message, setMessage] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [formData, setFormData] = useState({ applicantName: '', applicantPhone: '' });

  if (!isOpen || !job) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.applicantPhone) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit({ message, portfolioUrl, jobPostingId: job.id, ...formData });
    setMessage('');
    setPortfolioUrl('');
    setFormData({ applicantName: '', applicantPhone: '' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 700 }}>Apply for</h2>
            <p style={{ margin: '4px 0 0 0', color: '#ec4899', fontSize: '1rem', fontWeight: 600 }}>{job?.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Full Name *</label>
            <input 
              type="text" 
              name="applicantName" 
              value={formData.applicantName} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Outfit' }} 
              placeholder="E.g.: John Doe" 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Phone Number *</label>
            <input 
              type="text" 
              name="applicantPhone" 
              value={formData.applicantPhone} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Outfit' }} 
              placeholder="E.g.: 0901234567" 
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">Introduction Message</label>
            <textarea
              id="message"
              className="form-input"
              rows="4"
              placeholder="Tell us about your experience..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="portfolioUrl">Portfolio / CV Link (Optional)</label>
            <input
              id="portfolioUrl"
              type="url"
              className="form-input"
              placeholder="https://..."
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  );
}
