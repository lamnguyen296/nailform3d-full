import React, { useState, useEffect, Suspense } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NailViewer3D from '../components/NailViewer3D';
import './SalonDetail.css';
import './Reviews.css';

export default function Reviews() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const salonId = searchParams.get('salonId') || (user?.role === 'SALON' ? user.username : null);
  const appointmentIdParam = searchParams.get('appointmentId');

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, designSimilarity: 5, comment: '', afterPhotoBase64: '' });
  const [submitting, setSubmitting] = useState(false);
  const [lightboxReview, setLightboxReview] = useState(null); // review object to expand

  useEffect(() => {
    if (!salonId) return;
    // Fetch profile
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`)
      .then(r => r.json()).then(setProfile);
    // Fetch reviews
    fetchReviews();
  }, [salonId]);

  useEffect(() => {
    if (!appointmentIdParam || !user) return;
    // Check if user can review this appointment
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/reviews/can-review/${appointmentIdParam}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    }).then(r => r.json()).then(data => {
      setCanReview(data.canReview);
      setAlreadyReviewed(data.alreadyReviewed);
    }).catch(() => {});
  }, [appointmentIdParam, user]);

  const fetchReviews = () => {
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/reviews/salon/${salonId}`)
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setReviews(data); });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const avgSimilarity = reviews.filter(r => r.designSimilarity).length > 0
    ? (reviews.filter(r => r.designSimilarity).reduce((s, r) => s + r.designSimilarity, 0) / reviews.filter(r => r.designSimilarity).length).toFixed(1)
    : null;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({...f, afterPhotoBase64: reader.result}));
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async () => {
    if (!form.comment.trim()) { alert('Please write a comment.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ ...form, appointmentId: appointmentIdParam, salonId })
      });
      if (res.ok) {
        alert('Review submitted! Thank you for your feedback.');
        setShowForm(false);
        setCanReview(false);
        setAlreadyReviewed(true);
        fetchReviews();
      } else if (res.status === 401) {
        alert('Session expired.'); navigate('/login');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to submit review.');
      }
    } catch(e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const StarRating = ({ value, onChange, max = 5 }) => (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onChange && onChange(i)}
          style={{ fontSize: 28, cursor: onChange ? 'pointer' : 'default', color: i <= value ? '#f59e0b' : '#e2e8f0' }}>★</span>
      ))}
    </div>
  );

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
          <Link to={`/reviews?salonId=${salonId}`} className="tab-item active">Reviews</Link>
          <span className="tab-separator">|</span>
          <Link to={`/location?salonId=${salonId}`} className="tab-item">Location</Link>
        </div>

        <div className="reviews-section">
          {/* Write Review CTA */}
          {appointmentIdParam && user?.role === 'USER' && (
            <div style={styles.reviewCTA}>
              {alreadyReviewed
                ? <div style={styles.reviewedBadge}>✅ You have already reviewed this appointment</div>
                : canReview
                  ? <button onClick={() => setShowForm(true)} style={styles.writeReviewBtn}>⭐ Write Your Review</button>
                  : <div style={styles.notEligible}>Complete your appointment first to leave a review.</div>}
            </div>
          )}

          {/* Review Form */}
          {showForm && (
            <div style={styles.reviewForm}>
              <h3 style={{ marginTop: 0 }}>Your Review</h3>
              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>Overall Rating</label>
                <StarRating value={form.rating} onChange={v => setForm(f => ({...f, rating: v}))} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>Design Similarity (How close to your 3D design?)</label>
                <StarRating value={form.designSimilarity} onChange={v => setForm(f => ({...f, designSimilarity: v}))} />
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>5 = Perfect match, 1 = Very different</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>Your Comment</label>
                <textarea style={{...styles.input, height: 100, resize: 'vertical'}}
                  value={form.comment} onChange={e => setForm(f => ({...f, comment: e.target.value}))}
                  placeholder="Share your experience with this salon..." />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={styles.label}>Upload Photo of Result (Optional)</label>
                {form.afterPhotoBase64 && <img src={form.afterPhotoBase64} style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 8, display: 'block' }} alt="after"/>}
                <label style={styles.uploadLabel}>📸 Upload After Photo<input type="file" accept="image/*" hidden onChange={handlePhotoUpload} /></label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSubmitReview} style={styles.submitBtn} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="reviews-container">
            <div className="reviews-left">
              <div className="rating-breakdown">
                <div className="overall-rating-box">
                  <span className="overall-score">{avgRating || '—'}</span>
                  <span className="overall-score-out-of">out of 5.0</span>
                  {avgSimilarity && <span style={{ fontSize: 12, color: '#818cf8', marginTop: 4, display: 'block' }}>🎨 Design Match: {avgSimilarity}/5</span>}
                </div>
                <div className="bars-container">
                  {ratingCounts.map(({ star, count, pct }) => (
                    <div className="bar-row" key={star}>
                      <span className={`star-label${star === 5 ? ' active' : ''}`}>{star} Star</span>
                      <div className={`progress-bar${star === 5 ? ' active-bar' : ''}`}>
                        <div className={`progress-fill${star === 5 ? ' solid-fill' : ''}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 20 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Review List */}
            <div className="reviews-right">
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>No reviews yet. Be the first to review!</div>
              ) : (
                <div className="review-list">
                  {reviews.map((rev, index) => (
                    <div className="review-item" key={index}>
                      <div className="review-avatar" style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                        {rev.userId?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="review-content">
                        <div className="review-header">
                          <span className="reviewer-name">{rev.userId}</span>
                          <div className="review-stars">
                            {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= rev.rating ? '#f59e0b' : '#e2e8f0', fontSize: 14 }}>★</span>)}
                          </div>
                          <span className="review-time">{new Date(rev.createdAt).toLocaleString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {rev.designSimilarity && (
                          <p style={{ margin: '4px 0', fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
                            🎨 Design Similarity: {'★'.repeat(rev.designSimilarity)}{'☆'.repeat(5 - rev.designSimilarity)}
                          </p>
                        )}
                        <p className="review-text">{rev.comment}</p>

                        {/* Side-by-side comparison: 3D Design vs Actual Result */}
                        {(rev.designThumbnailBase64 || rev.afterPhotoBase64 || rev.designDataJson) && (
                          <div
                            style={{ ...compStyles.compareWrapper, cursor: 'pointer' }}
                            onClick={() => setLightboxReview(rev)}
                            title="Click to expand comparison"
                          >
                            <p style={compStyles.compareTitle}>📐 Design vs. Result Comparison <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>🔍 Click to expand</span></p>
                            <div style={compStyles.compareRow}>
                              <div style={compStyles.compareBox}>
                                <div style={compStyles.compareLabel}>🎨 3D Design</div>
                                {rev.designThumbnailBase64
                                  ? <img src={rev.designThumbnailBase64} alt="3D Design" style={compStyles.compareImg} />
                                  : <div style={compStyles.comparePlaceholder}>No design image</div>}
                              </div>
                              <div style={compStyles.compareArrow}>→</div>
                              <div style={compStyles.compareBox}>
                                <div style={compStyles.compareLabel}>📸 Actual Result</div>
                                {rev.afterPhotoBase64
                                  ? <img src={rev.afterPhotoBase64} alt="Actual Result" style={compStyles.compareImg} />
                                  : <div style={compStyles.comparePlaceholder}>No photo uploaded</div>}
                              </div>
                            </div>
                            {rev.designSimilarity && (
                              <div style={compStyles.similarityBar}>
                                <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Match Score:</span>
                                <div style={compStyles.barTrack}>
                                  <div style={{...compStyles.barFill, width: `${rev.designSimilarity * 20}%`, background: rev.designSimilarity >= 4 ? '#10b981' : rev.designSimilarity >= 3 ? '#f59e0b' : '#ef4444'}}></div>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 800, color: rev.designSimilarity >= 4 ? '#10b981' : rev.designSimilarity >= 3 ? '#f59e0b' : '#ef4444' }}>{rev.designSimilarity * 20}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== LIGHTBOX: Design vs Result full-screen comparison ===== */}
      {lightboxReview && (
        <div
          style={lbStyles.overlay}
          onClick={() => setLightboxReview(null)}
        >
          <div style={lbStyles.modal} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={lbStyles.header}>
              <div>
                <h2 style={lbStyles.title}>📐 Design vs. Result Comparison</h2>
                <p style={lbStyles.subtitle}>
                  By <strong>{lightboxReview.userId}</strong> ·{' '}
                  {new Date(lightboxReview.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button style={lbStyles.closeBtn} onClick={() => setLightboxReview(null)}>✕</button>
            </div>

            {/* Two-column panel */}
            <div style={lbStyles.panels}>
              {/* Left: 3D Design viewer */}
              <div style={lbStyles.panel}>
                <div style={lbStyles.panelLabel}>🎨 Original 3D Design</div>
                {lightboxReview.designDataJson ? (
                  <Suspense fallback={<div style={lbStyles.loading}>Loading 3D scene…</div>}>
                    <NailViewer3D
                      designDataJson={lightboxReview.designDataJson}
                      style={{ width: '100%', height: '100%', borderRadius: 16 }}
                    />
                  </Suspense>
                ) : lightboxReview.designThumbnailBase64 ? (
                  <img
                    src={lightboxReview.designThumbnailBase64}
                    alt="Design"
                    style={lbStyles.fullImg}
                  />
                ) : (
                  <div style={lbStyles.empty}>No 3D design data available</div>
                )}
              </div>

              {/* Divider with arrow */}
              <div style={lbStyles.divider}>
                <div style={lbStyles.arrow}>→</div>
                {lightboxReview.designSimilarity && (
                  <div style={lbStyles.scoreBox}>
                    <span style={lbStyles.scoreNum}>{lightboxReview.designSimilarity * 20}%</span>
                    <span style={lbStyles.scoreLabel}>Match</span>
                    <div style={lbStyles.scoreBar}>
                      <div style={{
                        ...lbStyles.scoreBarFill,
                        height: `${lightboxReview.designSimilarity * 20}%`,
                        background: lightboxReview.designSimilarity >= 4 ? '#10b981'
                          : lightboxReview.designSimilarity >= 3 ? '#f59e0b' : '#ef4444'
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Right: After photo */}
              <div style={lbStyles.panel}>
                <div style={lbStyles.panelLabel}>📸 Actual Result</div>
                {lightboxReview.afterPhotoBase64 ? (
                  <img
                    src={lightboxReview.afterPhotoBase64}
                    alt="Result"
                    style={lbStyles.fullImg}
                  />
                ) : (
                  <div style={lbStyles.empty}>No result photo uploaded</div>
                )}
              </div>
            </div>

            {/* Footer: rating + comment */}
            <div style={lbStyles.footerBar}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: i <= lightboxReview.rating ? '#f59e0b' : '#e2e8f0', fontSize: 20 }}>★</span>
                ))}
              </div>
              <p style={{ margin: 0, color: '#475569', fontSize: 14, flex: 1 }}>
                "{lightboxReview.comment}"
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

const styles = {
  reviewCTA: { background: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'center', border: '1px solid #e2e8f0' },
  writeReviewBtn: { padding: '12px 30px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 16 },
  reviewedBadge: { padding: '12px 20px', background: '#f0fdf4', color: '#16a34a', borderRadius: 10, fontWeight: 700, display: 'inline-block' },
  notEligible: { color: '#94a3b8', fontStyle: 'italic' },
  reviewForm: { background: 'white', borderRadius: 20, padding: 30, marginBottom: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  label: { display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' },
  uploadLabel: { padding: '10px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'inline-block' },
  submitBtn: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 },
  cancelBtn: { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }
};

const compStyles = {
  compareWrapper: { marginTop: 16, padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } },
  compareTitle: { fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center' },
  compareRow: { display: 'flex', alignItems: 'center', gap: 12 },
  compareBox: { flex: 1, textAlign: 'center' },
  compareLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' },
  compareImg: { width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' },
  comparePlaceholder: { height: 100, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 11, border: '1px dashed #cbd5e1' },
  compareArrow: { fontSize: 20, color: '#94a3b8', fontWeight: 'bold' },
  similarityBar: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid #f1f5f9' },
  barTrack: { flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', transition: 'width 0.5s ease-out' }
};

const lbStyles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
  },
  modal: {
    background: 'white', borderRadius: 24, width: '100%', maxWidth: 1100, maxHeight: '90vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '24px 30px 20px', borderBottom: '1px solid #f1f5f9'
  },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#94a3b8' },
  closeBtn: {
    background: '#f1f5f9', border: 'none', borderRadius: '50%',
    width: 36, height: 36, fontSize: 16, cursor: 'pointer', color: '#475569',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  panels: { display: 'flex', flex: 1, overflow: 'hidden', padding: '0 20px', gap: 0, minHeight: 0 },
  panel: {
    flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 10px',
    overflow: 'hidden', minHeight: 0
  },
  panelLabel: {
    fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: 12, textAlign: 'center'
  },
  fullImg: { flex: 1, width: '100%', objectFit: 'contain', borderRadius: 16, border: '1px solid #e2e8f0', minHeight: 0 },
  loading: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 },
  empty: {
    flex: 1, background: '#f8fafc', borderRadius: 16, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#94a3b8', fontSize: 14, border: '1px dashed #e2e8f0', minHeight: 200
  },
  divider: {
    width: 80, flexShrink: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16, padding: '20px 0'
  },
  arrow: { fontSize: 28, color: '#cbd5e1', fontWeight: 'bold' },
  scoreBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    background: '#f8fafc', borderRadius: 12, padding: '12px 10px', border: '1px solid #e2e8f0'
  },
  scoreNum: { fontSize: 18, fontWeight: 800, color: '#1e293b' },
  scoreLabel: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' },
  scoreBar: { width: 6, height: 60, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse' },
  scoreBarFill: { width: '100%', transition: 'height 0.6s ease-out', borderRadius: 3 },
  footerBar: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '16px 30px', borderTop: '1px solid #f1f5f9', background: '#fafafa'
  }
};
