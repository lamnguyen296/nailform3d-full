import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SalonDetail.css';

export default function SalonDetail() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const salonId = searchParams.get('salonId') || (user?.role === 'SALON' ? user.username : null);

  const [profile, setProfile] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const isOwner = user?.username === salonId && user?.role === 'SALON';

  useEffect(() => {
    if (!salonId) return;
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`)
      .then(r => r.json()).then(data => {
        setProfile(data);
        if (data.photoGalleryJson) {
          try { setGallery(JSON.parse(data.photoGalleryJson)); } catch(e) { setGallery([]); }
        }
      });
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/reviews/salon/${salonId}`)
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setReviews(data); });
  }, [salonId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleUploadPhoto = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const newPhotos = await Promise.all(files.map(f => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(f);
    })));
    const updatedGallery = [...gallery, ...newPhotos];
    try {
      await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ photoGalleryJson: JSON.stringify(updatedGallery) })
      });
      setGallery(updatedGallery);
    } catch(err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleDeletePhoto = async (index) => {
    const updated = gallery.filter((_, i) => i !== index);
    await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify({ photoGalleryJson: JSON.stringify(updated) })
    });
    setGallery(updated);
  };

  if (!salonId) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
      <p>No salon selected. <Link to="/social">Browse requests</Link></p>
    </div>
  );

  return (
    <div className="salondetail-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>
      <div className="container">
        <Navbar />

        {/* ─── Hero Banner ─────────────────────────────────────────── */}
        <div style={heroStyles.banner}>
          {/* Cover photo background */}
          {profile?.coverPhotoBase64 && (
            <img src={profile.coverPhotoBase64} alt="cover" style={heroStyles.coverImg} />
          )}
          <div style={heroStyles.coverOverlay} />

          {/* Content row */}
          <div style={heroStyles.content}>
            {/* Avatar */}
            <div style={heroStyles.avatarWrap}>
              {profile?.avatarBase64
                ? <img src={profile.avatarBase64} style={heroStyles.avatar} alt="avatar" />
                : <div style={heroStyles.avatarFallback}>
                    {salonId?.charAt(0)?.toUpperCase()}
                  </div>}
            </div>

            {/* Info */}
            <div style={heroStyles.info}>
              <h1 style={heroStyles.name}>{profile?.salonName || salonId}</h1>
              {profile?.bio && <p style={heroStyles.bio}>{profile.bio}</p>}

              <div style={heroStyles.metaRow}>
                {/* Stars */}
                <div style={heroStyles.stars}>
                  {[1,2,3,4,5].map(i => (
                    <i key={i} className={`fa-solid fa-star${avgRating && i <= Math.round(parseFloat(avgRating)) ? '' : ' empty'}`}
                       style={{ color: avgRating && i <= Math.round(parseFloat(avgRating)) ? '#f59e0b' : '#e2e8f0', fontSize: 14 }} />
                  ))}
                  <span style={heroStyles.ratingText}>
                    {avgRating ? `${avgRating} (${reviews.length} reviews)` : 'No reviews yet'}
                  </span>
                </div>

                {profile?.openingHours && (
                  <span style={heroStyles.pill}><i className="fa-solid fa-clock" /> {profile.openingHours}</span>
                )}
                {profile?.priceRange && (
                  <span style={heroStyles.pill}><i className="fa-solid fa-tag" /> {profile.priceRange}</span>
                )}
                {profile?.address && (
                  <span style={heroStyles.pill}><i className="fa-solid fa-location-dot" /> {profile.address}</span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={heroStyles.cta}>
              {isOwner ? (
                <>
                  <button
                    onClick={() => navigate('/salon-edit')}
                    style={heroStyles.btnPrimary}
                  >
                    <i className="fa-solid fa-pen-to-square" /> Edit Profile
                  </button>
                  <button
                    onClick={() => navigate(`/salondetail?salonId=${salonId}`)}
                    style={heroStyles.btnSecondary}
                  >
                    <i className="fa-solid fa-eye" /> Preview
                  </button>
                </>
              ) : (
                <>
                <button
                    onClick={() => navigate('/book-appointment', {
                      state: {
                        salonId,
                        salonName: profile?.salonName || salonId,
                        salonAddress: profile?.address || '',
                        technician: null // null = salon assigns
                      }
                    })}
                    style={heroStyles.btnPrimary}
                  >
                    <i className="fa-solid fa-calendar-check" /> Book Now
                  </button>
                  <button
                    onClick={() => navigate(`/reviews?salonId=${salonId}`)}
                    style={heroStyles.btnSecondary}
                  >
                    <i className="fa-solid fa-star" /> Reviews
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="salon-tabs">
          <Link to={`/salondetail?salonId=${salonId}`} className="tab-item active">Photos</Link>
          <span className="tab-separator">|</span>
          <Link to={`/nailboxproducts?salonId=${salonId}`} className="tab-item">Nail Box</Link>
          <span className="tab-separator">|</span>
          <Link to={`/technicans?salonId=${salonId}`} className="tab-item">Technicians</Link>
          <span className="tab-separator">|</span>
          <Link to={`/reviews?salonId=${salonId}`} className="tab-item">Reviews</Link>
          <span className="tab-separator">|</span>
          <Link to={`/location?salonId=${salonId}`} className="tab-item">Location</Link>
        </div>

        {/* Gallery */}
        <div className="photos-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="section-heading">Photos</h2>
            {isOwner && (
              <label style={styles.uploadBtn}>
                {uploading ? 'Uploading...' : '+ Add Photos'}
                <input type="file" accept="image/*" multiple hidden onChange={handleUploadPhoto} />
              </label>
            )}
          </div>

          {gallery.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              {isOwner ? 'Upload photos to showcase your work!' : 'No photos yet.'}
            </div>
          ) : (
            <div style={styles.galleryGrid}>
              {gallery.map((photo, i) => (
                <div key={i} style={styles.galleryItem}>
                  <img src={photo} alt={`gallery-${i}`} style={styles.galleryImg} />
                  {isOwner && (
                    <button onClick={() => handleDeletePhoto(i)} style={styles.deletePhotoBtn}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  uploadBtn: { padding: '10px 20px', background: '#1e293b', color: 'white', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'inline-block' },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  galleryItem: { position: 'relative', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  galleryImg: { width: '100%', height: 180, objectFit: 'cover', display: 'block' },
  deletePhotoBtn: { position: 'absolute', top: 8, right: 8, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }
};

const heroStyles = {
  banner: {
    position: 'relative', margin: '0 0 32px 0', borderRadius: 24,
    overflow: 'hidden', minHeight: 220,
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
    boxShadow: '0 20px 60px rgba(49,46,129,0.25)'
  },
  coverImg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', opacity: 0.35
  },
  coverOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(30,27,75,0.7) 0%, rgba(76,29,149,0.4) 100%)'
  },
  content: {
    position: 'relative', zIndex: 2,
    display: 'flex', alignItems: 'center', gap: 28,
    padding: '36px 40px', flexWrap: 'wrap'
  },
  avatarWrap: { flexShrink: 0 },
  avatar: {
    width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
    border: '4px solid rgba(255,255,255,0.8)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
  },
  avatarFallback: {
    width: 100, height: 100, borderRadius: '50%',
    background: 'linear-gradient(135deg, #c084fc, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 38, fontWeight: 900,
    border: '4px solid rgba(255,255,255,0.8)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
  },
  info: { flex: 1, minWidth: 240 },
  name: {
    margin: '0 0 6px 0', fontSize: 32, fontWeight: 900,
    color: 'white', letterSpacing: '-0.5px',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  bio: { margin: '0 0 14px 0', color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.5 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  stars: { display: 'flex', alignItems: 'center', gap: 4 },
  ratingText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, marginLeft: 6 },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
  },
  cta: {
    display: 'flex', flexDirection: 'column', gap: 10,
    flexShrink: 0, alignItems: 'stretch', minWidth: 160
  },
  btnPrimary: {
    padding: '14px 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
    fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    background: 'linear-gradient(135deg, #c084fc, #818cf8)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(192,132,252,0.45)',
    transition: 'transform 0.15s, box-shadow 0.15s'
  },
  btnSecondary: {
    padding: '12px 28px', borderRadius: 14, border: '2px solid rgba(255,255,255,0.4)',
    cursor: 'pointer', fontWeight: 700, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'rgba(255,255,255,0.12)', color: 'white',
    backdropFilter: 'blur(10px)', transition: 'background 0.2s'
  }
};
