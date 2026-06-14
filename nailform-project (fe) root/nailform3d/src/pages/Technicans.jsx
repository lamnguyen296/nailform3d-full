import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SalonDetail.css';
import './Technicans.css';

export default function Technicans() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const salonId = searchParams.get('salonId') || (user?.role === 'SALON' ? user.username : null);
  const isOwner = user?.username === salonId && user?.role === 'SALON';
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [techs, setTechs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: '', experience: '', specialty: '', skills: '', avatarBase64: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!salonId) return;
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`)
      .then(r => r.json()).then(data => {
        setProfile(data);
        if (data.techniciansJson) {
          try { setTechs(JSON.parse(data.techniciansJson)); } catch(e) { setTechs([]); }
        }
      });
  }, [salonId]);

  const saveTechs = async (updated) => {
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ techniciansJson: JSON.stringify(updated) })
      });
      setTechs(updated);
    } catch(err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleSave = async () => {
    const updated = editIndex !== null
      ? techs.map((t, i) => i === editIndex ? form : t)
      : [...techs, form];
    await saveTechs(updated);
    setShowModal(false);
    setForm({ name: '', experience: '', specialty: '', skills: '', avatarBase64: '' });
    setEditIndex(null);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({...f, avatarBase64: reader.result}));
    reader.readAsDataURL(file);
  };

  return (
    <div className="salondetail-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="salon-hero-section">
          <h1 className="salon-hero-title">{profile?.salonName || salonId || 'Luxury Salon'}</h1>
          <div className="salon-rating-row">
            <span className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star empty"></i>
              <i className="fa-solid fa-star empty"></i>
            </span>
            <span className="rating-text">4.9 (50 Reviews)</span>
            <span className="separator">|</span>
            <span className="location-text">2.5km away</span>
          </div>
          <div className="salon-address-row">
            <i className="fa-solid fa-location-dot"></i>
            <span>{profile?.address || '245 Thach Hoa, Thach That'}</span>
          </div>
          <Link to={`/book-appointment`}
            onClick={e => {
              e.preventDefault();
              navigate('/book-appointment', {
                state: { salonId, salonName: profile?.salonName || salonId, salonAddress: profile?.address || '', technician: null }
              });
            }}
            className="btn-book-now">Book Now</Link>
        </div>

        <div className="salon-tabs">
          <Link to={`/salondetail?salonId=${salonId}`} className="tab-item">Photos</Link>
          <span className="tab-separator">|</span>
          <Link to={`/nailboxproducts?salonId=${salonId}`} className="tab-item">Nail Box</Link>
          <span className="tab-separator">|</span>
          <Link to={`/technicans?salonId=${salonId}`} className="tab-item active">Technicians</Link>
          <span className="tab-separator">|</span>
          <Link to={`/reviews?salonId=${salonId}`} className="tab-item">Reviews</Link>
          <span className="tab-separator">|</span>
          <Link to={`/location?salonId=${salonId}`} className="tab-item">Location</Link>
        </div>

        <div className="technicians-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-heading">Master Technicians</h2>
            {isOwner && (
              <button onClick={() => { setShowModal(true); setEditIndex(null); setForm({ name: '', experience: '', specialty: '', skills: '', avatarBase64: '' }); }}
                style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #c58dfa, #4784fa)', color: '#000', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                + Add Technician
              </button>
            )}
          </div>

          <div className="technicians-bg-wrap">
            <i className="fa-solid fa-chevron-left nav-arrow left"></i>
            <i className="fa-solid fa-chevron-right nav-arrow right"></i>

            <div className="tech-grid">
              {techs.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#888' }}>
                  {isOwner ? 'Add your team members using the button above.' : 'No technicians listed yet.'}
                </div>
              ) : (
                techs.map((tech, index) => (
                  <div className="tech-card" key={index}>
                    <div className="tech-avatar-wrapper">
                      {tech.avatarBase64
                        ? <img src={tech.avatarBase64} className="tech-avatar" style={{ objectFit: 'cover' }} alt={tech.name} />
                        : <div className="tech-avatar" style={{ background: 'linear-gradient(135deg, #c58dfa, #4784fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48, fontWeight: 800 }}>
                            {tech.name?.charAt(0)?.toUpperCase()}
                          </div>
                      }
                      <div className="tech-badge">Best Staff</div>
                    </div>

                    <div className="info-pill">
                      <div className="tech-name">{tech.name}</div>
                      <div className="tech-rating">
                        <span className="stars-mini">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star empty"></i>
                          <i className="fa-solid fa-star empty"></i>
                        </span>
                        4.9 (34 Reviews)
                      </div>
                      <div className="tech-exp">{tech.experience}</div>
                    </div>

                    <div className="skills-card">
                      <div className="skill-item">
                        <i className="fa-solid fa-star"></i> {tech.specialty || 'Luxury Manicure'}
                      </div>
                      <div className="skill-desc">{tech.skills || 'Provides a high-end luxury manicure service'}</div>
                      <div className="stats-row">
                        <div className="stat-item"><i className="fa-solid fa-heart heart-icon"></i> <span className="stat-value">5.3k</span></div>
                        <div className="stat-item"><i className="fa-solid fa-circle-check check-icon"></i> <span className="stat-value">5.3k</span></div>
                      </div>
                    </div>

                    {isOwner ? (
                      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                        <button onClick={() => { setForm(tech); setEditIndex(index); setShowModal(true); }}
                          style={{ flex: 1, padding: '10px', background: '#b58ffd', color: '#111', border: 'none', borderRadius: 20, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => { if(window.confirm('Remove this technician?')) saveTechs(techs.filter((_, i) => i !== index)); }}
                          style={{ padding: '10px 14px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 20, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-booking"
                        onClick={() => navigate('/book-appointment', {
                          state: {
                            salonId,
                            salonName: profile?.salonName || salonId,
                            salonAddress: profile?.address || '',
                            technician: { name: tech.name, specialty: tech.specialty, avatarBase64: tech.avatarBase64, experience: tech.experience }
                          }
                        })}
                      >Book Me</button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pagination-container">
              <i className="fa-solid fa-chevron-left page-arrow"></i>
              <div className="page-dot active"></div>
              <div className="page-dot"></div>
              <div className="page-dot"></div>
              <div className="page-dot"></div>
              <i className="fa-solid fa-chevron-right page-arrow"></i>
            </div>

            <button className="btn-view-all">View All Teams</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 30, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 800 }}>{editIndex !== null ? 'Edit Technician' : 'Add Technician'}</h3>
            {[['Full Name', 'name', 'e.g. Emily Nguyen'], ['Experience', 'experience', 'e.g. 8+ Years'], ['Specialty', 'specialty', 'e.g. Luxury Manicure'], ['Skills / Description', 'skills', 'e.g. Nail art, gel extensions...']].map(([label, key, placeholder]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{label}</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  value={form[key] || ''} placeholder={placeholder}
                  onChange={e => setForm(f => ({...f, [key]: e.target.value}))} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Avatar Photo</label>
              {form.avatarBase64 && <img src={form.avatarBase64} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, display: 'block' }} alt="preview"/>}
              <label style={{ padding: '10px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'inline-block' }}>
                📤 Upload Avatar
                <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(90deg, #c58dfa, #4784fa)', color: '#000', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 800 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 700 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
