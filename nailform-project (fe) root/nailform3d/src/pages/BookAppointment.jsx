import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


// ── Time slots ───────────────────────────────────────────────────────────────
const TIME_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM'];

export default function BookAppointment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data from previous page
  const { salonId, salonName, salonAddress, technician } = state || {};

  // Steps: 0 = pick design, 1 = pick date/time + note
  const [step, setStep] = useState(0);

  // User's saved designs
  const [myDesigns, setMyDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState(null); // null = bring own / no design
  const [skipDesign, setSkipDesign] = useState(false);

  // Booking form
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!salonId) { navigate('/booking'); return; }
    // Load user's published designs
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/requests/user/${user.username}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMyDesigns(data); })
      .catch(() => {})
      .finally(() => setLoadingDesigns(false));
  }, [user, salonId]);

  const parsedDesign = useMemo(() => {
    if (!selectedDesign?.designData) return null;
    try { return JSON.parse(selectedDesign.designData); } catch { return null; }
  }, [selectedDesign]);

  const handleConfirm = async () => {
    if (!date) { alert('Please select a date.'); return; }
    if (!time) { alert('Please select a time slot.'); return; }
    setSubmitting(true);
    try {
      const body = {
        salonId,
        technicianName: technician?.name || null,
        designRequestId: selectedDesign?.id || null,
        thumbnailBase64: selectedDesign?.thumbnailBase64 || null,
        designData: selectedDesign?.designData || null,
        appointmentDate: date,
        appointmentTime: time,
        notes,
        location: salonAddress,
        price: 0
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/appointments/direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed');
      const appt = await res.json();
      navigate('/bookingdesignpayment', {
        state: { appointment: appt, salonName, technician, selectedDesign, date, time, notes }
      });
    } catch (e) {
      alert('Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (!salonId) return null;

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <button onClick={() => navigate(-1)} style={s.backBtn}>← Back</button>
          <div>
            <h1 style={s.title}>Book Appointment</h1>
            <p style={s.subtitle}>
              <i className="fa-solid fa-store" style={{ marginRight: 6 }} />{salonName}
              {technician && <span style={s.techPill}><i className="fa-solid fa-scissors" style={{ marginRight: 5 }} />With: {technician.name}</span>}
              {!technician && <span style={{ ...s.techPill, background: 'rgba(248,196,113,0.15)', color: '#f8c471', border: '1px solid rgba(248,196,113,0.3)' }}>Technician assigned by salon</span>}
            </p>
          </div>
          {/* Step indicator */}
          <div style={s.steps}>
            {['Select Design', 'Date & Time'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ ...s.stepDot, background: step >= i ? '#7c3aed' : '#e5e7eb', color: step >= i ? 'white' : '#6b7280' }}>{i + 1}</div>
                <span style={{ color: step >= i ? '#7c3aed' : '#6b7280', fontSize: 13, fontWeight: 600 }}>{label}</span>
                {i < 1 && <div style={{ width: 30, height: 2, background: step > i ? '#7c3aed' : '#e5e7eb', marginLeft: 4 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 0: Choose design ───────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 style={s.sectionTitle}>Which design do you want to bring?</h2>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              Pick one of your saved 3D designs or let the salon suggest a style for you.
            </p>

            {/* Option: skip / no design */}
            <div
              style={{ ...s.designCard, ...(skipDesign ? s.designCardActive : {}) }}
              onClick={() => { setSelectedDesign(null); setSkipDesign(true); }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>Let salon suggest a design</div>
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>No reference — salon creates a look for you</div>
            </div>

            {loadingDesigns ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading your designs...</div>
            ) : myDesigns.length === 0 ? (
              <div style={s.emptyBox}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎨</div>
                <p style={{ color: '#6b7280', margin: 0 }}>You have no saved 3D designs yet.</p>
                <button onClick={() => navigate('/3d-configurator')} style={s.createDesignBtn}>Create a design now →</button>
              </div>
            ) : (
              <div style={s.designGrid}>
                {myDesigns.map(d => {
                  const active = selectedDesign?.id === d.id && !skipDesign;
                  return (
                    <div key={d.id} style={{ ...s.designCard, ...s.designCardImg, ...(active ? s.designCardActive : {}) }}
                      onClick={() => { setSelectedDesign(d); setSkipDesign(false); }}>

                      {/* Preview: thumbnail > color swatches > placeholder */}
                      {d.thumbnailBase64 ? (
                        <img src={d.thumbnailBase64} alt="design"
                          style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 10, display: 'block' }} />
                      ) : (() => {
                        let parsed = null;
                        try { parsed = JSON.parse(d.designData || '{}'); } catch {}
                        return parsed ? (
                          <div style={{ width: '100%', height: 140, borderRadius: 10, marginBottom: 10, background: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: parsed.skinColor || '#FDDBB4', border: '3px solid white', margin: '0 auto 4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                                <div style={{ color: '#6b7280', fontSize: 9 }}>Skin</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: parsed.baseNailColor || '#cc3366', border: '3px solid white', margin: '0 auto 4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                                <div style={{ color: '#6b7280', fontSize: 9 }}>Nail</div>
                              </div>
                            </div>
                            {parsed.placedCharms?.length > 0 && (
                              <div style={{ color: '#7c3aed', fontSize: 11, fontWeight: 600 }}>✦ {parsed.placedCharms.length} charm(s)</div>
                            )}
                          </div>
                        ) : (
                          <div style={{ width: '100%', height: 140, background: '#f3f4f6', borderRadius: 10, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 28 }}>🖐️</div>
                        );
                      })()}
                      
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>
                        Design #{d.id.substring(0, 6).toUpperCase()}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
                        {d.location && <span><i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />{d.location} · </span>}
                        {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {active && <div style={s.selectedBadge}>✓ Selected</div>}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{ ...s.nextBtn, opacity: (selectedDesign || skipDesign) ? 1 : 0.4 }}
                disabled={!selectedDesign && !skipDesign}
                onClick={() => setStep(1)}
              >
                Next: Choose Date & Time →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Date, time, notes ────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <button onClick={() => setStep(0)} style={{ ...s.backBtn, marginBottom: 24 }}>← Back to design</button>

            {/* Summary card */}
            <div style={s.summaryCard}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {selectedDesign?.thumbnailBase64 && (
                  <img src={selectedDesign.thumbnailBase64} alt="design" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} />
                )}
                {!selectedDesign && <div style={{ width: 80, height: 80, background: '#f3f4f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '1px dashed #d1d5db' }}>✨</div>}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Booking Summary</div>
                  <div style={{ color: '#111827', fontWeight: 800, fontSize: 16 }}>{salonName}</div>
                  {technician ? (
                    <div style={{ color: '#7c3aed', fontSize: 13, marginTop: 4, fontWeight: 600 }}>👤 {technician.name} · {technician.specialty}</div>
                  ) : (
                    <div style={{ color: '#d97706', fontSize: 13, marginTop: 4, fontWeight: 600 }}>👤 Technician assigned by salon</div>
                  )}
                  <div style={{ color: '#4b5563', fontSize: 13, marginTop: 2 }}>
                    🎨 {selectedDesign ? `Design #${selectedDesign.id.substring(0, 6).toUpperCase()}` : 'No specific design (salon suggests)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Date picker */}
            <div style={s.formSection}>
              <label style={s.label}><i className="fa-regular fa-calendar" style={{ marginRight: 8 }} />Appointment Date</label>
              <input type="date" min={today} value={date} onChange={e => { setDate(e.target.value); setTime(''); }}
                style={s.dateInput} />
            </div>

            {/* Time slots */}
            {date && (
              <div style={s.formSection}>
                <label style={s.label}><i className="fa-regular fa-clock" style={{ marginRight: 8 }} />Select Time Slot</label>
                <div style={s.timeGrid}>
                  {TIME_SLOTS.map(t => (
                    <button key={t} onClick={() => setTime(t)}
                      style={{ ...s.timeSlot, ...(time === t ? s.timeSlotActive : {}) }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div style={s.formSection}>
              <label style={s.label}><i className="fa-solid fa-note-sticky" style={{ marginRight: 8 }} />Additional Notes <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="E.g. I want almond shape, longer on ring finger, please be gentle with my cuticles 🌸"
                style={s.textarea} />
            </div>

            {/* Confirm */}
            <button style={{ ...s.nextBtn, width: '100%', marginTop: 8, fontSize: 16, padding: '16px 24px', opacity: submitting ? 0.6 : 1 }}
              disabled={submitting || !date || !time}
              onClick={handleConfirm}>
              {submitting ? 'Booking...' : '✓ Confirm Appointment'}
            </button>
            <p style={{ color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              You can still reschedule after booking from your appointments page.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: 900, margin: '0 auto', padding: '0 24px 60px' },
  header: { padding: '24px 0 32px', borderBottom: '1px solid #e5e7eb', marginBottom: 36, display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' },
  backBtn: { padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: 10, color: '#4b5563', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
  title: { margin: '0 0 6px', color: '#111827', fontSize: 26, fontWeight: 900 },
  subtitle: { margin: 0, color: '#6b7280', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  techPill: { padding: '3px 12px', background: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: 20, color: '#7c3aed', fontSize: 12, fontWeight: 600 },
  steps: { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 },
  stepDot: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 },
  sectionTitle: { color: '#111827', fontSize: 20, fontWeight: 800, margin: '0 0 8px' },
  designGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 20 },
  designCard: { padding: 20, borderRadius: 16, border: '2px solid transparent', background: 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  designCardImg: { textAlign: 'left', padding: 14 },
  designCardActive: { borderColor: '#8b5cf6', background: '#fdfcff', boxShadow: '0 8px 25px rgba(139,92,246,0.15)' },
  selectedBadge: { position: 'absolute', top: 10, right: 10, background: '#8b5cf6', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 },
  emptyBox: { textAlign: 'center', padding: '40px 20px', background: 'white', border: '1px dashed #d1d5db', borderRadius: 16, marginTop: 20 },
  createDesignBtn: { marginTop: 16, padding: '10px 24px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14 },
  nextBtn: { padding: '14px 32px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: 15, boxShadow: '0 6px 20px rgba(236,72,153,0.25)' },
  summaryCard: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, marginBottom: 28, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  formSection: { marginBottom: 28 },
  label: { display: 'block', color: '#374151', fontWeight: 700, fontSize: 15, marginBottom: 12 },
  dateInput: { padding: '12px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: 12, color: '#111827', fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box' },
  timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 },
  timeSlot: { padding: '10px 8px', background: 'white', border: '1px solid #d1d5db', borderRadius: 10, color: '#4b5563', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.15s' },
  timeSlotActive: { background: '#f3e8ff', borderColor: '#8b5cf6', color: '#7c3aed' },
  textarea: { width: '100%', padding: '12px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: 12, color: '#111827', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" },
};
