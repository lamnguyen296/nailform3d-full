import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function CreateJobModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    jobType: 'TECHNICIAN',
    location: '',
    salary: '',
    description: '',
    requirements: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 700 }}>Post New Job</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Job Title *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Outfit' }} 
              placeholder="E.g.: Hiring Nail Technician" 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Job Type</label>
              <select 
                name="jobType" 
                value={formData.jobType} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Outfit', background: 'white' }}
              >
                <option value="TECHNICIAN">Nail Technician</option>
                <option value="MODEL">Nail Model</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Salary / Benefits</label>
              <input 
                type="text" 
                name="salary" 
                value={formData.salary} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Outfit' }} 
                placeholder="E.g.: $500 - $1000, or Free" 
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Location *</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Outfit' }} 
              placeholder="E.g.: District 1, HCMC" 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Job Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3" 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Outfit', resize: 'vertical' }} 
              placeholder="Detailed job description..." 
            ></textarea>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Requirements</label>
            <textarea 
              name="requirements" 
              value={formData.requirements} 
              onChange={handleChange} 
              rows="3" 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'Outfit', resize: 'vertical' }} 
              placeholder="E.g.: 1 year experience, gel painting..." 
            ></textarea>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ec4899', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}>
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
