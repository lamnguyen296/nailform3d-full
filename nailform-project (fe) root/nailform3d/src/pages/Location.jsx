import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SalonDetail.css';
import './Location.css';

export default function Location() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const salonId = searchParams.get('salonId') || (user?.role === 'SALON' ? user.username : null);
  const isOwner = user?.username === salonId && user?.role === 'SALON';

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [address, setAddress] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const isValidEmbedUrl = (url) => url && url.includes('google.com/maps/embed');

  useEffect(() => {
    if (!salonId) return;
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`)
      .then(r => r.json()).then(data => {
        setProfile(data);
        setAddress(data.address || '');
        setMapEmbedUrl(data.mapEmbedUrl || '');
      });
  }, [salonId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ address, mapEmbedUrl })
      });
      setProfile(p => ({...p, address, mapEmbedUrl}));
      setEditMode(false);
      alert('Location updated!');
    } catch(err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="salondetail-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>
      <div className="container">
        <Navbar />
        <div className="salon-hero-section">
          <h1 className="salon-hero-title">{profile?.salonName || salonId}</h1>
          {profile?.address && <div className="salon-address-row"><i className="fa-solid fa-location-dot"></i><span>{profile.address}</span></div>}
        </div>

        <div className="salon-tabs">
          <Link to={`/salondetail?salonId=${salonId}`} className="tab-item">Photos</Link>
          <span className="tab-separator">|</span>
          <Link to={`/nailboxproducts?salonId=${salonId}`} className="tab-item">Nail Box</Link>
          <span className="tab-separator">|</span>
          <Link to={`/technicans?salonId=${salonId}`} className="tab-item">Technicians</Link>
          <span className="tab-separator">|</span>
          <Link to={`/reviews?salonId=${salonId}`} className="tab-item">Reviews</Link>
          <span className="tab-separator">|</span>
          <Link to={`/location?salonId=${salonId}`} className="tab-item active">Location</Link>
        </div>

        <div className="location-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div className="location-header" style={{ margin: 0 }}>
              <h2 className="section-heading" style={{ margin: 0 }}>Location</h2>
              <Link to={`/reviews?salonId=${salonId}`} className="btn-see-reviews">See All Reviews</Link>
            </div>
            {isOwner && !editMode && <button onClick={() => setEditMode(true)} style={styles.editBtn}>✏️ Edit Location</button>}
          </div>

          {/* Address display */}
          <div style={styles.addressCard}>
            <i className="fa-solid fa-location-dot" style={{ color: '#818cf8', fontSize: 20 }}></i>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{profile?.salonName || salonId}</p>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>{address || 'No address set'}</p>
              {profile?.phone && <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>📞 {profile.phone}</p>}
              {profile?.openingHours && <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>🕐 {profile.openingHours}</p>}
            </div>
          </div>

          {/* Map */}
          {mapEmbedUrl ? (
            isValidEmbedUrl(mapEmbedUrl) ? (
              <iframe src={mapEmbedUrl} style={styles.map} title="Salon Location" allowFullScreen loading="lazy" />
            ) : (
              <div style={styles.invalidUrlBox}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 28, color: '#f59e0b', marginBottom: 10 }}></i>
                <p style={{ fontWeight: 700, color: '#92400e', margin: '0 0 6px' }}>Invalid Maps URL</p>
                <p style={{ color: '#78350f', fontSize: 13, margin: '0 0 16px' }}>
                  This is a regular Google Maps link, not an embed link. Please follow the guide below.
                </p>
                <a href={mapEmbedUrl} target="_blank" rel="noopener noreferrer" style={styles.openMapsBtn}>
                  <i className="fa-solid fa-map-location-dot"></i> Open in Google Maps
                </a>
              </div>
            )
          ) : (
            <div style={styles.mapPlaceholder}>
              {isOwner ? 'Add a Google Maps embed URL in Edit Location to show your map.' : 'Map not available.'}
            </div>
          )}

          {/* Edit Form for Salon Owner */}
          {isOwner && editMode && (
            <div style={styles.editForm}>
              <h3 style={{ marginTop: 0 }}>Update Location</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Full Address</label>
                <input style={styles.input} value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Street, District, City" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={styles.label}>Google Maps Embed URL</label>
                  <button onClick={() => setShowGuide(g => !g)} style={styles.guideToggle}>
                    {showGuide ? '▲ Hide Guide' : '❓ How to get this URL?'}
                  </button>
                </div>

                {showGuide && (
                  <div style={styles.guide}>
                    <p style={{ fontWeight: 700, margin: '0 0 10px', color: '#1e293b' }}>📍 Step-by-step guide:</p>
                    <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, fontSize: 13, color: '#475569' }}>
                      <li>Go to <strong>Google Maps</strong> and search for your salon address</li>
                      <li>Click <strong>Share</strong> (the share icon)</li>
                      <li>Select <strong>"Embed a map"</strong> tab</li>
                      <li>Click <strong>"Copy HTML"</strong></li>
                      <li>Paste the copied HTML here — we'll extract the URL automatically</li>
                    </ol>
                    <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>
                      The URL should start with: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>https://www.google.com/maps/embed?pb=</code>
                    </p>
                  </div>
                )}

                <textarea
                  style={{...styles.input, height: 80, resize: 'vertical', fontFamily: 'monospace', fontSize: 12}}
                  value={mapEmbedUrl}
                  onChange={e => {
                    // Auto-extract src URL from full iframe HTML if user pastes iframe code
                    const val = e.target.value;
                    const srcMatch = val.match(/src="([^"]*google\.com\/maps\/embed[^"]*)"/i);
                    setMapEmbedUrl(srcMatch ? srcMatch[1] : val);
                  }}
                  placeholder='Paste the embed URL or the full <iframe> HTML code here...'
                />

                {mapEmbedUrl && !isValidEmbedUrl(mapEmbedUrl) && (
                  <div style={styles.urlWarning}>
                    ⚠️ This doesn't look like a valid embed URL. Make sure to copy from <strong>Share → Embed a map</strong>, not the browser address bar.
                  </div>
                )}
                {mapEmbedUrl && isValidEmbedUrl(mapEmbedUrl) && (
                  <div style={styles.urlOk}>✅ Valid embed URL detected!</div>
                )}
              </div>
              <div style={{ marginBottom: 16 }}>
                {mapEmbedUrl && isValidEmbedUrl(mapEmbedUrl) && (
                  <iframe src={mapEmbedUrl} style={{ width: '100%', height: 200, border: 'none', borderRadius: 10, marginTop: 8 }} title="Preview" />
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Location'}</button>
                <button onClick={() => setEditMode(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  editBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 },
  addressCard: { display: 'flex', gap: 16, padding: '20px', background: '#f8fafc', borderRadius: 16, marginBottom: 24, alignItems: 'flex-start' },
  map: { width: '100%', height: 400, borderRadius: 16, border: 'none', marginBottom: 24 },
  mapPlaceholder: { width: '100%', height: 200, background: '#f1f5f9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  invalidUrlBox: { width: '100%', minHeight: 160, background: '#fffbeb', borderRadius: 16, border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 24, padding: 24, textAlign: 'center', boxSizing: 'border-box' },
  openMapsBtn: { padding: '10px 20px', background: '#4285f4', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 },
  editForm: { background: '#f8fafc', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' },
  label: { display: 'block', fontSize: 13, fontWeight: 700, color: '#475569' },
  guideToggle: { background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 },
  guide: { background: '#f0f4ff', borderRadius: 10, padding: '14px 16px', marginBottom: 12, border: '1px solid #c7d2fe' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  urlWarning: { marginTop: 8, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, color: '#92400e' },
  urlOk: { marginTop: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#166534', fontWeight: 600 },
  saveBtn: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 },
  cancelBtn: { flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }
};
