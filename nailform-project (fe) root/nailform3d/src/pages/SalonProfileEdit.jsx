import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SalonProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const salonId = user?.username;

  const [profile, setProfile] = useState({
    salonName: '', bio: '', phone: '', email: '',
    openingHours: '', priceRange: '', address: '', mapEmbedUrl: '',
    coverPhotoBase64: '', avatarBase64: ''
  });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    if (!user || user.role !== 'SALON') { navigate('/login'); return; }
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`)
      .then(r => r.json())
      .then(data => {
        if (data) setProfile(prev => ({...prev, ...data}));
      });
  }, [salonId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        navigate(`/salondetail?salonId=${salonId}`);
      } else if (res.status === 401) {
        alert('Session expired. Please log in again.'); navigate('/login');
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile(prev => ({...prev, [field]: reader.result}));
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Profile</button>
          <h1 style={styles.title}>Edit Salon Profile</h1>
          <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>

        <div style={styles.layout}>
          {/* Sidebar Nav */}
          <div style={styles.sidebar}>
            {['basic', 'photos', 'location'].map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                style={{...styles.sideBtn, background: activeSection === s ? '#818cf8' : 'white',
                  color: activeSection === s ? 'white' : '#475569'}}>
                {{basic: '📋 Basic Info', photos: '📸 Photos', location: '📍 Location'}[s]}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={styles.content}>
            {activeSection === 'basic' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Basic Information</h2>
                {[
                  { label: 'Salon Name', key: 'salonName', placeholder: 'e.g. Luxury Nail Salon' },
                  { label: 'Phone', key: 'phone', placeholder: '+84 xxx xxx xxx' },
                  { label: 'Email', key: 'email', placeholder: 'salon@email.com' },
                  { label: 'Opening Hours', key: 'openingHours', placeholder: '9:00 AM - 9:00 PM' },
                  { label: 'Price Range', key: 'priceRange', placeholder: '$20 - $150' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} style={styles.formGroup}>
                    <label style={styles.label}>{label}</label>
                    <input style={styles.input} value={profile[key] || ''} placeholder={placeholder}
                      onChange={e => setProfile(p => ({...p, [key]: e.target.value}))} />
                  </div>
                ))}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Bio / Introduction</label>
                  <textarea style={{...styles.input, height: 120, resize: 'vertical'}}
                    value={profile.bio || ''} placeholder="Tell customers about your salon..."
                    onChange={e => setProfile(p => ({...p, bio: e.target.value}))} />
                </div>
              </div>
            )}

            {activeSection === 'photos' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Photos</h2>
                <div style={styles.photoRow}>
                  <div style={styles.photoBox}>
                    <label style={styles.label}>Cover Photo</label>
                    {profile.coverPhotoBase64
                      ? <img src={profile.coverPhotoBase64} style={styles.previewImg} alt="cover"/>
                      : <div style={styles.photoPlaceholder}>No cover photo</div>}
                    <label style={styles.uploadBtn}>
                      📤 Upload Cover <input type="file" accept="image/*" hidden onChange={e => handlePhotoUpload('coverPhotoBase64', e)} />
                    </label>
                  </div>
                  <div style={styles.photoBox}>
                    <label style={styles.label}>Avatar / Logo</label>
                    {profile.avatarBase64
                      ? <img src={profile.avatarBase64} style={styles.previewAvatar} alt="avatar"/>
                      : <div style={{...styles.photoPlaceholder, height: 100, width: 100, borderRadius: '50%'}}>No avatar</div>}
                    <label style={styles.uploadBtn}>
                      📤 Upload Avatar <input type="file" accept="image/*" hidden onChange={e => handlePhotoUpload('avatarBase64', e)} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'location' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Location</h2>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Address</label>
                  <input style={styles.input} value={profile.address || ''}
                    placeholder="e.g. 123 Nguyen Trai, District 1, Ho Chi Minh City"
                    onChange={e => setProfile(p => ({...p, address: e.target.value}))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Google Maps Embed URL</label>
                  <input style={styles.input} value={profile.mapEmbedUrl || ''}
                    placeholder="Paste Google Maps embed src URL here..."
                    onChange={e => setProfile(p => ({...p, mapEmbedUrl: e.target.value}))} />
                  <p style={styles.hint}>Go to Google Maps → Share → Embed a map → Copy the src URL from the iframe code.</p>
                </div>
                {profile.mapEmbedUrl && (
                  <iframe src={profile.mapEmbedUrl} style={styles.mapPreview} title="Map Preview" allowFullScreen loading="lazy" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f4f7f6', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: 10 },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 },
  backBtn: { padding: '10px 18px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#475569' },
  saveBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 },
  layout: { display: 'flex', gap: 25 },
  sidebar: { width: 200, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  sideBtn: { padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, textAlign: 'left', transition: 'all 0.2s' },
  content: { flex: 1 },
  section: { background: 'white', borderRadius: 20, padding: 30, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#1e293b', marginTop: 0, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 },
  input: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box', outline: 'none', fontFamily: "'Inter', sans-serif" },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
  photoRow: { display: 'flex', gap: 30, flexWrap: 'wrap' },
  photoBox: { display: 'flex', flexDirection: 'column', gap: 12 },
  photoPlaceholder: { width: 200, height: 130, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 },
  previewImg: { width: 200, height: 130, objectFit: 'cover', borderRadius: 12 },
  previewAvatar: { width: 100, height: 100, objectFit: 'cover', borderRadius: '50%' },
  uploadBtn: { padding: '10px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#475569', textAlign: 'center', display: 'inline-block' },
  mapPreview: { width: '100%', height: 300, borderRadius: 12, border: 'none', marginTop: 16 }
};
