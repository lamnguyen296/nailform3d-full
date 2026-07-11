import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ApplicationModal from '../components/ApplicationModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../JobBoard.css';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        setJob({ 
          id: id, 
          title: 'Tuyển Thợ Phụ Nail Chuyên Nghiệp', 
          location: 'Quận 1, TP.HCM', 
          salary: '7 - 10 triệu + Thưởng', 
          jobType: 'TECHNICIAN', 
          status: 'OPEN', 
          description: 'Salon NailX cần tuyển 2 thợ phụ biết nhặt da, sơn gel cơ bản, hỗ trợ thợ chính đắp bột. Môi trường làm việc thân thiện, chuyên nghiệp, hỗ trợ ăn trưa.\n\nĐến với chúng tôi, các bạn sẽ được đào tạo thêm các kỹ thuật mới trong quá trình làm việc.', 
          requirements: '- Biết nhặt da, sơn gel\n- Nhanh nhẹn, trung thực\n- Có tinh thần học hỏi\n- Làm việc theo ca',
          salonId: 'salon-123',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      setJob({ 
        id: id, 
        title: 'Tuyển Thợ Phụ Nail Chuyên Nghiệp', 
        location: 'Quận 1, TP.HCM', 
        salary: '7 - 10 triệu + Thưởng', 
        jobType: 'TECHNICIAN', 
        status: 'OPEN', 
        description: 'Salon NailX cần tuyển 2 thợ phụ biết nhặt da, sơn gel cơ bản, hỗ trợ thợ chính đắp bột. Môi trường làm việc thân thiện, chuyên nghiệp, hỗ trợ ăn trưa.\n\nĐến với chúng tôi, các bạn sẽ được đào tạo thêm các kỹ thuật mới trong quá trình làm việc.', 
        requirements: '- Biết nhặt da, sơn gel\n- Nhanh nhẹn, trung thực\n- Có tinh thần học hỏi\n- Làm việc theo ca',
        salonId: 'salon-123',
        createdAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (applicationData) => {
    const currentUserId = user?.username || 'mock-user'; 
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/applications/user/${currentUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });
      if (response.ok) { 
        toast.success('Applied successfully! Please wait for the Salon to contact you.');
        setIsModalOpen(false);
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error('An error occurred, please try again later.');
        }
      }
    } catch (error) {
      toast.error('Cannot connect to the server.');
      setIsModalOpen(false);
    }
  };

  if (loading) return <div className="job-board-root" style={{display:'flex', justifyContent:'center', alignItems:'center'}}><h2 style={{color: '#ec4899'}}>Loading...</h2></div>;
  if (!job) return <div className="job-board-root" style={{display:'flex', justifyContent:'center', alignItems:'center'}}><h2>Job not found</h2></div>;

  return (
    <div className="job-board-root">
      <Navbar />
      
      <div className="job-container" style={{ maxWidth: '900px' }}>
        <button onClick={() => navigate('/jobs')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Jobs
        </button>

        <div className="detail-card">
          <span className={`badge ${job.jobType === 'MODEL' ? 'badge-model' : 'badge-tech'}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
            {job.jobType === 'MODEL' ? 'Model' : 'Technician'}
          </span>
          <span className={`badge ${job.status === 'OPEN' ? 'badge-open' : 'badge-closed'}`} style={{ fontSize: '0.9rem', padding: '6px 16px', marginLeft: '8px' }}>
            {job.status === 'OPEN' ? 'Open' : 'Closed'}
          </span>
          
          <h1 className="detail-title">{job.title}</h1>
          
          <div style={{ display: 'flex', gap: '24px', margin: '24px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontWeight: 500 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {job.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be185d', fontWeight: 700 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              {job.salary || 'Negotiable'}
            </div>
          </div>

          <div className="detail-section">
            <h3>Job Description</h3>
            <p className="detail-text">{job.description}</p>
          </div>

          {job.requirements && (
            <div className="detail-section">
              <h3>Requirements</h3>
              <p className="detail-text">{job.requirements}</p>
            </div>
          )}

          <div className="apply-box">
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#111827', fontWeight: 800 }}>Interested in this position?</h4>
              <p style={{ margin: 0 }}>Send your application now to get contacted by the Salon quickly.</p>
            </div>
            <button 
              className="btn-apply"
              onClick={() => setIsModalOpen(true)}
              disabled={job.status !== 'OPEN'}
              style={{ opacity: job.status !== 'OPEN' ? 0.5 : 1, cursor: job.status !== 'OPEN' ? 'not-allowed' : 'pointer' }}
            >
              {job.status === 'OPEN' ? 'Apply Now' : 'Closed'}
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
      <ApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} job={job} onSubmit={handleApply} />
    </div>
  );
}
