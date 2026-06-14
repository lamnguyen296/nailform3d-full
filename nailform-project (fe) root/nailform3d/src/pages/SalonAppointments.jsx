import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SalonAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('UPCOMING');

  // Reschedule State
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    if (!user || (user.role !== 'SALON' && user.role !== 'ROLE_SALON')) {
      navigate('/');
      return;
    }
    fetchAppointments();
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments/salon/${user.username}`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else if (res.status === 401) {
        alert("Session expired. Please log in again.");
        navigate('/login');
      }
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'UPCOMING') {
      setFilteredAppointments(appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED' || a.status === 'PENDING'));
    } else {
      setFilteredAppointments(appointments.filter(a => a.status === activeTab));
    }
  }, [activeTab, appointments]);

  const goToDetail = async (requestId) => {
    if (!requestId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/requests/${requestId}`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        const requestData = await res.json();
        navigate('/socialdetail', { state: { post: requestData } });
      }
    } catch (err) {
      console.error("Error fetching request details", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments/${id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchAppointments();
      } else if (res.status === 401) {
        alert("Session expired. Please log in again.");
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments/${rescheduleId}/reschedule?date=${newDate}&time=${newTime}&by=SALON`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        alert("Proposal sent to customer!");
        setRescheduleId(null);
        setNewDate("");
        setNewTime("");
        fetchAppointments();
      } else if (res.status === 401 || res.status === 403) {
        alert("Session expired. Please log in again.");
        navigate('/login');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to update appointment. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments/${id}/accept`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'SCHEDULED': return '#3b82f6';
      case 'RESCHEDULED': return '#8b5cf6';
      case 'COMPLETED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Salon Dashboard</h1>
        <p style={styles.subtitle}>Manage your upcoming appointments and history</p>

        {/* Status Tabs */}
        <div style={styles.tabs}>
          {['UPCOMING', 'COMPLETED', 'CANCELLED'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn, 
                color: activeTab === tab ? '#3b82f6' : '#64748b',
                borderBottom: activeTab === tab ? '3px solid #3b82f6' : '3px solid transparent'
              }}
            >
              {tab} ({tab === 'UPCOMING' 
                ? appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED' || a.status === 'PENDING').length 
                : appointments.filter(a => a.status === tab).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          filteredAppointments.length === 0 ? (
            <div style={styles.emptyCard}>No appointments found.</div>
          ) : (
            <div style={styles.grid}>
              {filteredAppointments.map(appt => (
                <div key={appt.id} style={styles.card}>
                  <div style={{...styles.statusBadge, background: getStatusColor(appt.status)}}>
                    {appt.status === 'PENDING' ? 'NEW APPOINTMENT' : 
                     appt.status === 'RESCHEDULED' 
                      ? (appt.lastUpdatedBy === 'USER' ? 'CUSTOMER PROPOSED NEW TIME' : 'WAITING FOR CUSTOMER') 
                      : appt.status}
                  </div>
                  <div style={styles.bookedDate}>Booked on: {new Date(appt.createdAt).toLocaleString([], {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                  
                  <div style={styles.designHeader}>
                     <div style={{cursor: 'pointer'}} onClick={() => goToDetail(appt.requestId)}>
                        <img src={appt.thumbnailBase64 || '/post1.png'} alt="design" style={styles.designThumb} />
                        <div style={styles.viewBadge}>✦ View Detail</div>
                     </div>
                     <div style={styles.designInfo}>
                        <span style={styles.designId}>Design #{appt.requestId?.substring(0,6).toUpperCase()}</span>
                        <h3 style={styles.customerName}>Customer: {appt.userId}</h3>
                        <div style={styles.locationSmall}><i className="fa-solid fa-location-dot"></i> {appt.location || "Online"}</div>
                        {appt.technicianName && (
                          <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px', fontWeight: '600' }}>
                            <i className="fa-solid fa-scissors" style={{ marginRight: '4px' }}></i>
                            Technician: {appt.technicianName}
                          </div>
                        )}
                     </div>
                     <div style={styles.priceContainer}>
                        <span style={{...styles.priceText, fontSize: appt.price ? '20px' : '16px'}}>{appt.price ? `$${appt.price}` : "Price Pending"}</span>
                     </div>
                  </div>
                  
                  <div style={styles.detailRow}>
                    <i className="fa-regular fa-calendar" style={styles.icon}></i>
                    <span>{appt.appointmentDate} at {appt.appointmentTime}</span>
                  </div>
                  
                  <div style={styles.detailRow}>
                    <i className="fa-solid fa-note-sticky" style={styles.icon}></i>
                    <span style={styles.notesText}>{appt.notes || "No additional notes."}</span>
                  </div>

                  <div style={styles.actions}>
                    {(appt.status === 'PENDING' || (appt.status === 'RESCHEDULED' && appt.lastUpdatedBy === 'USER')) && (
                      <button onClick={() => handleAccept(appt.id)} style={{...styles.btn, background: '#10b981'}}>
                        Accept
                      </button>
                    )}

                    {(appt.status === 'SCHEDULED' || appt.status === 'RESCHEDULED' || appt.status === 'PENDING') && (
                      <>
                        {appt.status === 'SCHEDULED' && (
                          <button onClick={() => updateStatus(appt.id, 'COMPLETED')} style={{...styles.btn, background: '#10b981'}}>
                            Complete
                          </button>
                        )}
                        <button onClick={() => setRescheduleId(appt.id)} style={{...styles.btn, background: '#8b5cf6'}}>
                          {appt.status === 'RESCHEDULED' && appt.lastUpdatedBy === 'SALON' ? 'Change Proposal' : 'Reschedule'}
                        </button>
                        <button onClick={() => updateStatus(appt.id, 'CANCELLED')} style={{...styles.btn, background: '#ef4444'}}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>

                  {rescheduleId === appt.id && (
                    <div style={styles.rescheduleBox}>
                      <h4 style={{marginTop: 0}}>New Proposal:</h4>
                      <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={styles.miniInput} />
                      <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={styles.miniInput} />
                      <div style={{display: 'flex', gap: 5, marginTop: 10}}>
                        <button onClick={handleReschedule} style={styles.miniBtn}>Submit</button>
                        <button onClick={() => setRescheduleId(null)} style={{...styles.miniBtn, background: '#ccc'}}>Back</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' },
  title: { fontSize: '32px', color: '#1e293b', marginBottom: '8px', fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: '16px', marginBottom: '30px' },
  tabs: { display: 'flex', gap: '30px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0' },
  tabBtn: { background: 'none', border: 'none', padding: '10px 5px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' },
  card: { background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', position: 'relative', border: '1px solid #e2e8f0' },
  statusBadge: { position: 'absolute', top: '15px', right: '15px', padding: '5px 12px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 'bold', zIndex: 1 },
  bookedDate: { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' },
  designHeader: { display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', position: 'relative' },
  designThumb: { width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #f1f5f9' },
  viewBadge: { background: '#1e293b', color: 'white', fontSize: '10px', padding: '3px 8px', borderRadius: '8px', marginTop: '-15px', position: 'relative', textAlign: 'center', width: '90px', fontWeight: 'bold' },
  designInfo: { flex: 1 },
  designId: { fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' },
  customerName: { margin: '2px 0 0 0', fontSize: '18px', color: '#0f172a' },
  locationSmall: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  priceContainer: { background: '#f0fdf4', padding: '8px 12px', borderRadius: '10px', border: '1px solid #dcfce7' },
  priceText: { fontSize: '20px', color: '#15803d', fontWeight: '800' },
  detailRow: { display: 'flex', alignItems: 'flex-start', marginBottom: '12px', color: '#475569', fontSize: '15px', gap: '10px' },
  icon: { width: '20px', color: '#94a3b8', marginTop: '3px' },
  notesText: { fontStyle: 'italic', color: '#64748b' },
  actions: { display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' },
  btn: { flex: 1, padding: '10px 5px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  emptyCard: { background: 'white', padding: '50px', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '18px' },
  rescheduleBox: { marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
  miniInput: { width: '100%', marginBottom: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' },
  miniBtn: { flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};
