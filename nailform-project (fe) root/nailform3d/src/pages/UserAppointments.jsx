import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function UserAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE');

  // Reschedule state
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments/user/${user.username}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) setAppointments(await res.json());
      else if (res.status === 401) { alert('Session expired.'); navigate('/login'); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'ACTIVE') return ['PENDING', 'SCHEDULED', 'RESCHEDULED'].includes(a.status);
    return a.status === activeTab;
  });

  const count = (tab) => tab === 'ACTIVE'
    ? appointments.filter(a => ['PENDING', 'SCHEDULED', 'RESCHEDULED'].includes(a.status)).length
    : appointments.filter(a => a.status === tab).length;

  const goToDetail = async (appt) => {
    // If it has a requestId (linked design), show it in social detail
    if (appt.requestId) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/requests/${appt.requestId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) { navigate('/socialdetail', { state: { post: await res.json() } }); return; }
      } catch {}
    }
    // Otherwise show inline from designData stored in appointment
    if (appt.designData) {
      navigate('/socialdetail', {
        state: {
          post: {
            id: appt.id,
            thumbnailBase64: appt.thumbnailBase64,
            designData: appt.designData,
            userId: appt.userId,
            location: appt.location,
            createdAt: appt.createdAt
          }
        }
      });
    }
  };

  const handleAccept = async (id) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments/${id}/accept`, {
      method: 'PUT', headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) fetchAppointments();
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments/${rescheduleId}/reschedule?date=${newDate}&time=${newTime}&by=USER`,
      { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } }
    );
    if (res.ok) {
      alert('Reschedule request sent to salon!');
      setRescheduleId(null); setNewDate(''); setNewTime('');
      fetchAppointments();
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments/${id}/status?status=CANCELLED`, {
      method: 'PUT', headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) fetchAppointments();
  };

  const STATUS_CONFIG = {
    PENDING:     { label: 'WAITING FOR SALON TO CONFIRM', color: '#b45309', bg: '#fef3c7', dot: '#f59e0b' },
    SCHEDULED:   { label: 'SCHEDULED',   color: '#1d4ed8', bg: '#dbeafe', dot: '#3b82f6' },
    RESCHEDULED: { label: 'RESCHEDULED', color: '#6d28d9', bg: '#ede9fe', dot: '#8b5cf6' },
    COMPLETED:   { label: 'COMPLETED',   color: '#065f46', bg: '#d1fae5', dot: '#10b981' },
    CANCELLED:   { label: 'CANCELLED',   color: '#991b1b', bg: '#fee2e2', dot: '#ef4444' },
  };

  return (
    <div style={st.page}>
      <Navbar />
      <div style={st.container}>
        <h1 style={st.pageTitle}>My Appointments</h1>
        <p style={st.pageSub}>Track your upcoming visits and nail designs</p>

        {/* Tabs */}
        <div style={st.tabs}>
          {['ACTIVE', 'COMPLETED', 'CANCELLED'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ ...st.tabBtn, color: activeTab === tab ? '#818cf8' : '#64748b', borderBottom: activeTab === tab ? '3px solid #818cf8' : '3px solid transparent' }}>
              {tab} ({count(tab)})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 16 }}>Loading your schedule...</div>
        ) : filtered.length === 0 ? (
          <div style={st.emptyCard}>No appointments in this category.</div>
        ) : (
          <div style={st.list}>
            {filtered.map(appt => {
              const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDING;
              const salonProposedReschedule = appt.status === 'RESCHEDULED' && appt.lastUpdatedBy === 'SALON';
              const designId = appt.requestId || appt.id;
              const hasDesign = !!(appt.thumbnailBase64 || appt.designData || appt.requestId);

              return (
                <div key={appt.id} style={st.card}>

                  {/* ── Card Header ─────────────────────────────────────── */}
                  <div style={st.cardHeader}>
                    <span style={{ ...st.statusBadge, color: cfg.color, background: cfg.bg }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block', marginRight: 6 }} />
                      {appt.status === 'RESCHEDULED'
                        ? (salonProposedReschedule ? 'SALON PROPOSED NEW TIME' : 'PENDING SALON APPROVAL')
                        : cfg.label}
                    </span>
                    <span style={st.headerMeta}>
                      BOOKED ON: {new Date(appt.createdAt).toLocaleString('en-GB', {
                        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                      }).replace(',', '')}
                    </span>
                    <span style={st.idTag}>ID: #{appt.id.substring(0, 8)}</span>
                  </div>

                  {/* ── Card Body: 3 columns ─────────────────────────────── */}
                  <div style={st.cardBody}>

                    {/* Col 1: Design */}
                    <div style={st.designCol} onClick={() => hasDesign && goToDetail(appt)}>
                      <div style={st.designThumbWrap}>
                        {appt.thumbnailBase64
                          ? <img src={appt.thumbnailBase64} alt="design" style={st.designThumb} />
                          : <div style={st.thumbPlaceholder}>{hasDesign ? '🖐️' : '✨'}</div>
                        }
                      </div>
                      <div style={st.designInfo}>
                        <span style={st.metaLabel}>MY DESIGN</span>
                        <span style={st.designId}>
                          #{designId.substring(0, 6).toUpperCase()}
                        </span>
                        {hasDesign && <span style={st.viewLink}>View 3D Detail</span>}
                        {!hasDesign && <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>No design</span>}
                      </div>
                    </div>

                    {/* Col 2: Price */}
                    <div style={st.priceBox}>
                      <span style={st.priceLabel}>EST. PRICE</span>
                      <span style={{...st.priceValue, fontSize: appt.price ? 20 : 14}}>{appt.price ? `$${appt.price}` : 'Price Pending'}</span>
                    </div>

                    {/* Col 3: Salon info */}
                    <div style={st.salonCol}>
                      <div style={st.salonAvatar}>{appt.salonId?.charAt(0)?.toUpperCase()}</div>
                      <div>
                        <div style={st.salonName}>{appt.salonId}</div>
                        {appt.location && (
                          <div style={st.salonLoc}>
                            <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />
                            {appt.location}
                          </div>
                        )}
                        {appt.technicianName && (
                          <div style={{ fontSize: 12, color: '#a78bfa', marginTop: 2 }}>
                            <i className="fa-solid fa-scissors" style={{ marginRight: 4 }} />
                            {appt.technicianName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 4: Date & Time */}
                    <div style={st.dateBox}>
                      <span style={st.dateLabel}>APPOINTMENT DATE &amp; TIME</span>
                      <span style={st.dateValue}>
                        {appt.appointmentDate} at {appt.appointmentTime}
                      </span>
                    </div>
                  </div>

                  {/* ── Actions ──────────────────────────────────────────── */}
                  <div style={st.actions}>
                    {/* Salon proposed reschedule → user can Accept OR counter-propose */}
                    {salonProposedReschedule && (
                      <>
                        <button onClick={() => handleAccept(appt.id)}
                          style={{ ...st.btn, background: '#10b981' }}>
                          Accept New Time
                        </button>
                        <button
                          onClick={() => { setRescheduleId(appt.id); setNewDate(''); setNewTime(''); }}
                          style={{ ...st.btn, background: '#7c3aed' }}>
                          Propose Different Time
                        </button>
                      </>
                    )}

                    {/* User can request reschedule when SCHEDULED / PENDING / own RESCHEDULED */}
                    {!salonProposedReschedule &&
                      (appt.status === 'SCHEDULED' || appt.status === 'PENDING' ||
                        (appt.status === 'RESCHEDULED' && appt.lastUpdatedBy === 'USER')) && (
                      <button
                        onClick={() => { setRescheduleId(appt.id); setNewDate(''); setNewTime(''); }}
                        style={{ ...st.btn, background: '#7c3aed' }}>
                        {appt.status === 'SCHEDULED' ? 'Reschedule' : 'Change Time'}
                      </button>
                    )}

                    {['PENDING', 'SCHEDULED', 'RESCHEDULED'].includes(appt.status) && (
                      <button onClick={() => handleCancel(appt.id)}
                        style={{ ...st.btn, background: '#ef4444' }}>
                        Cancel
                      </button>
                    )}

                    {appt.status === 'COMPLETED' && (
                      <Link
                        to={`/reviews?salonId=${appt.salonId}&appointmentId=${appt.id}`}
                        style={{ ...st.btn, background: 'linear-gradient(135deg, #f59e0b, #f97316)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ⭐ Leave a Review
                      </Link>
                    )}
                  </div>

                  {/* ── Reschedule form ───────────────────────────────────── */}
                  {rescheduleId === appt.id && (
                    <div style={st.rescheduleBox}>
                      <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#1e293b' }}>Propose a new date &amp; time:</h4>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]} style={st.miniInput} />
                        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={st.miniInput} />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handleReschedule} style={st.miniBtn}>Send Proposal</button>
                        <button onClick={() => setRescheduleId(null)} style={{ ...st.miniBtn, background: '#e2e8f0', color: '#475569' }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

const st = {
  page: { minHeight: '100vh', background: '#f4f7f6', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: 860, margin: '0 auto', padding: '40px 20px 80px' },
  pageTitle: { fontSize: 30, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' },
  pageSub: { fontSize: 15, color: '#64748b', margin: '0 0 28px' },
  tabs: { display: 'flex', gap: 24, marginBottom: 28, borderBottom: '1px solid #e2e8f0' },
  tabBtn: { background: 'none', border: 'none', padding: '10px 4px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s' },
  list: { display: 'flex', flexDirection: 'column', gap: 22 },
  emptyCard: { background: 'white', padding: '60px 20px', borderRadius: 20, textAlign: 'center', color: '#94a3b8', fontSize: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },

  card: { background: 'white', borderRadius: 20, padding: '24px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' },

  // Card header
  cardHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, flexWrap: 'wrap' },
  statusBadge: { padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 0.6, display: 'flex', alignItems: 'center' },
  headerMeta: { fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 'auto' },
  idTag: { fontSize: 11, color: '#cbd5e1', fontWeight: 700 },

  // Card body — horizontal row
  cardBody: { display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 20, borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' },

  // Design col
  designCol: { display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', minWidth: 160 },
  designThumbWrap: { flexShrink: 0 },
  designThumb: { width: 80, height: 80, borderRadius: 14, objectFit: 'cover', border: '1px solid #e2e8f0' },
  thumbPlaceholder: { width: 80, height: 80, borderRadius: 14, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '1px solid #e2e8f0' },
  designInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  metaLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  designId: { fontSize: 16, fontWeight: 800, color: '#1e293b' },
  viewLink: { fontSize: 12, color: '#3b82f6', fontWeight: 700, textDecoration: 'underline', marginTop: 2 },

  // Price box
  priceBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 80 },
  priceLabel: { display: 'block', fontSize: 9, color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  priceValue: { fontSize: 20, fontWeight: 900, color: '#15803d' },

  // Salon col
  salonCol: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 160 },
  salonAvatar: { width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 },
  salonName: { fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 },
  salonLoc: { fontSize: 12, color: '#94a3b8', marginTop: 3, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  // Date box
  dateBox: { background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 160 },
  dateLabel: { display: 'block', fontSize: 9, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  dateValue: { fontSize: 16, fontWeight: 800, color: '#3b82f6' },

  // Actions
  actions: { display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' },
  btn: { flex: 1, minWidth: 120, padding: '12px 16px', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13 },

  // Reschedule form
  rescheduleBox: { marginTop: 18, padding: '18px 20px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' },
  miniInput: { flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, minWidth: 140 },
  miniBtn: { flex: 1, padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 },
};
