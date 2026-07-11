import React from 'react';
import { Link } from 'react-router-dom';

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="job-card" style={{ textDecoration: 'none' }}>
      <div className="job-card-header">
        <div>
          <h3 className="job-card-title">{job.title}</h3>
          <div className="job-card-meta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {job.location}
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <span className={`badge ${job.jobType === 'MODEL' ? 'badge-model' : 'badge-tech'}`} style={{ marginRight: '8px' }}>
          {job.jobType === 'MODEL' ? 'Model' : 'Technician'}
        </span>
        <span className={`badge ${job.status === 'OPEN' ? 'badge-open' : 'badge-closed'}`}>
          {job.status === 'OPEN' ? 'Open' : 'Closed'}
        </span>
      </div>
      
      <p className="job-card-desc">
        {job.description}
      </p>
      
      <div className="job-card-salary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        {job.salary || 'Negotiable'}
      </div>
      
      <div className="btn-primary" style={{ marginTop: 'auto' }}>
        View Details
      </div>
    </Link>
  );
}
