import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import '../JobBoard.css';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        setJobs([
          { id: '1', title: 'Tuyển Thợ Phụ Nail VIP', location: 'Quận 1, TP.HCM', salary: '7 - 10 triệu', jobType: 'TECHNICIAN', status: 'OPEN', description: 'Cần tuyển 2 thợ phụ biết nhặt da, sơn gel cơ bản. Môi trường sang trọng.', salonId: 'salon-123' },
          { id: '2', title: 'Tìm Mẫu Đắp Bột Đính Đá', location: 'Quận 7, TP.HCM', salary: 'Miễn phí làm nail', jobType: 'MODEL', status: 'OPEN', description: 'Cần tìm 1 bạn nữ làm mẫu đắp bột design đá sang chảnh. Cam kết lên form chuẩn đẹp.', salonId: 'salon-456' },
          { id: '3', title: 'Thợ Chính Cứng Tay', location: 'Quận 3, TP.HCM', salary: '15 - 20 triệu', jobType: 'TECHNICIAN', status: 'OPEN', description: 'Yêu cầu thợ chính cứng tay, biết đắp bột, vẽ gel, ombre. Thu nhập hấp dẫn.', salonId: 'salon-789' }
        ]);
      }
    } catch (error) {
      setJobs([
        { id: '1', title: 'Tuyển Thợ Phụ Nail VIP', location: 'Quận 1, TP.HCM', salary: '7 - 10 triệu', jobType: 'TECHNICIAN', status: 'OPEN', description: 'Cần tuyển 2 thợ phụ biết nhặt da, sơn gel cơ bản. Môi trường sang trọng.', salonId: 'salon-123' },
        { id: '2', title: 'Tìm Mẫu Đắp Bột Đính Đá', location: 'Quận 7, TP.HCM', salary: 'Miễn phí làm nail', jobType: 'MODEL', status: 'OPEN', description: 'Cần tìm 1 bạn nữ làm mẫu đắp bột design đá sang chảnh. Cam kết lên form chuẩn đẹp.', salonId: 'salon-456' },
        { id: '3', title: 'Thợ Chính Cứng Tay', location: 'Quận 3, TP.HCM', salary: '15 - 20 triệu', jobType: 'TECHNICIAN', status: 'OPEN', description: 'Yêu cầu thợ chính cứng tay, biết đắp bột, vẽ gel, ombre. Thu nhập hấp dẫn.', salonId: 'salon-789' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filterType === 'ALL') return true;
    return job.jobType === filterType;
  });

  return (
    <div className="job-board-root">
      <Navbar />
      
      <div className="job-container">
        <div className="job-header">
          <h1>Jobs & Models</h1>
          <p>Explore career opportunities at top Salons, or experience being a nail model with the trendiest designs.</p>
        </div>
        
        <div className="job-filters">
          <button 
            onClick={() => setFilterType('ALL')}
            className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
          >
            All Opportunities
          </button>
          <button 
            onClick={() => setFilterType('TECHNICIAN')}
            className={`filter-btn ${filterType === 'TECHNICIAN' ? 'active' : ''}`}
          >
            Nail Technicians
          </button>
          <button 
            onClick={() => setFilterType('MODEL')}
            className={`filter-btn ${filterType === 'MODEL' ? 'active' : ''}`}
          >
            Nail Models
          </button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: '#ec4899', fontWeight: 600 }}>
            Loading data...
          </div>
        ) : (
          <div className="job-grid">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0', background: 'rgba(255,255,255,0.5)', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#4b5563' }}>No matching jobs found.</h3>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
