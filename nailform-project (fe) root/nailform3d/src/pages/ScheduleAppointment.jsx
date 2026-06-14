import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ScheduleAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { acceptedOffer, salonId } = location.state || {};
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!acceptedOffer) {
      alert("No offer selected. Redirecting...");
      navigate("/my-requests");
    }
  }, [acceptedOffer, navigate]);

  const handleConfirm = async () => {
    if (!date || !time) {
      alert("Please select both a date and a time.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token && { "Authorization": `Bearer ${user.token}` })
        },
        body: JSON.stringify({
          offerId: acceptedOffer,
          salonId: salonId,
          appointmentDate: date,
          appointmentTime: time,
          notes: notes
        })
      });

      if (res.ok) {
        alert("Appointment successfully scheduled! The Salon will prepare for your arrival.");
        navigate("/my-requests");
      } else if (res.status === 401 || res.status === 403) {
        alert("Session expired. Please log in again.");
        navigate('/login');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to schedule appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error scheduling appointment.");
    } finally {
      setLoading(false);
    }
  };

  if (!acceptedOffer) return null;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Confirm Your Appointment</h1>
          <p style={styles.subtitle}>You have accepted the offer from <strong>{salonId}</strong>. Choose a date and time to meet the salon and get your nails done!</p>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Date</label>
            <input type="date" style={styles.input} value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Time</label>
            <input type="time" style={styles.input} value={time} onChange={e => setTime(e.target.value)} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Notes (Optional)</label>
            <textarea 
              style={{...styles.input, height: '80px', resize: 'none'}} 
              placeholder="E.g., I'm allergic to acetone, please be careful."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button style={styles.btn} onClick={handleConfirm} disabled={loading}>
            {loading ? "Confirming..." : "Confirm Appointment"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f4f4f8', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '600px', margin: '60px auto', padding: '0 20px' },
  card: { background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' },
  title: { fontSize: '28px', color: '#1a1a2e', marginBottom: '10px', fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: '15px', marginBottom: '30px', lineHeight: '1.5' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(129,140,248,0.4)' }
};
