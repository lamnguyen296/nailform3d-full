import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Booking.css';

function StarRating({ count }) {
  const rounded = Math.round(count || 0);
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`fa-solid fa-star${n > rounded ? ' empty' : ''}`}></i>
      ))}
    </span>
  );
}

export default function Booking() {
  const [salons, setSalons] = useState([]);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/salon-profiles`)
      .then(r => r.json())
      .then(async (data) => {
        if (Array.isArray(data)) {
          setSalons(data);
          // Fetch reviews for each salon to compute real ratings
          const reviewData = {};
          await Promise.all(data.map(async (salon) => {
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/reviews/salon/${salon.salonId}`);
              const revs = await res.json();
              if (Array.isArray(revs) && revs.length > 0) {
                reviewData[salon.salonId] = {
                  count: revs.length,
                  avg: (revs.reduce((s, r) => s + r.rating, 0) / revs.length)
                };
              } else {
                reviewData[salon.salonId] = { count: 0, avg: 0 };
              }
            } catch { reviewData[salon.salonId] = { count: 0, avg: 0 }; }
          }));
          setReviews(reviewData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load salons:', err);
        setLoading(false);
      });
  }, []);

  const filtered = salons.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.salonName || s.salonId).toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="booking-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="booking-hero">
          <h1>Select the Perfect Salon</h1>
          <p>Choose a top rated salon that best suits your style and schedule</p>
        </div>

        <div className="booking-filters">
          <h2>Select Salon</h2>
          <div className="filter-row">
            <button className="filter-btn">Dropdown <i className="fa-solid fa-chevron-down"></i></button>
            <button className="filter-btn">Distance/ Location <i className="fa-solid fa-chevron-down"></i></button>
            <input
              type="text"
              className="filter-input"
              placeholder="Address ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 18 }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 16, display: 'block' }}></i>
            Loading salons...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <i className="fa-solid fa-store-slash" style={{ fontSize: 48, marginBottom: 16, display: 'block' }}></i>
            <p style={{ fontSize: 18, fontWeight: 600 }}>
              {search ? `No salons found for "${search}"` : 'No salons have registered their profile yet.'}
            </p>
          </div>
        ) : (
          <div className="booking-grid">
            {filtered.map((salon) => {
              const rev = reviews[salon.salonId] || { count: 0, avg: 0 };
              return (
                <div className="salon-card" key={salon.salonId}>
                  {/* Cover / Avatar area */}
                  <div style={{ position: 'relative', height: 160, background: 'linear-gradient(135deg, #a78bfa22, #818cf822)', overflow: 'hidden' }}>
                    {salon.coverPhotoBase64
                      ? <img src={salon.coverPhotoBase64} alt={salon.salonName} className="card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 30, fontWeight: 800 }}>
                            {(salon.salonName || salon.salonId)?.charAt(0)?.toUpperCase()}
                          </div>
                        </div>}
                    {salon.avatarBase64 && (
                      <img src={salon.avatarBase64} alt="avatar"
                        style={{ position: 'absolute', bottom: -20, left: 16, width: 48, height: 48, borderRadius: '50%', border: '3px solid white', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                    )}
                  </div>

                  <div className="salon-details" style={{ paddingTop: salon.avatarBase64 ? 28 : 16 }}>
                    <div className="salon-header">
                      <div className="salon-title">{salon.salonName || salon.salonId}</div>
                      <div className="salon-rating">
                        <StarRating count={rev.avg} />
                        <span>{rev.count > 0 ? `${rev.avg.toFixed(1)} (${rev.count})` : 'New'}</span>
                      </div>
                    </div>

                    <div className="salon-info-box">
                      {salon.address && (
                        <div className="info-item">
                          <i className="fa-solid fa-location-dot"></i>
                          <span>{salon.address}</span>
                        </div>
                      )}
                      {salon.openingHours && (
                        <div className="info-item">
                          <i className="fa-solid fa-clock"></i>
                          <span>{salon.openingHours}</span>
                        </div>
                      )}
                      {salon.priceRange && (
                        <div className="info-item">
                          <i className="fa-solid fa-tag"></i>
                          <span>{salon.priceRange}</span>
                        </div>
                      )}
                      {!salon.address && !salon.openingHours && (
                        <div className="info-item" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                          <i className="fa-solid fa-circle-info"></i>
                          <span>Profile being set up...</span>
                        </div>
                      )}
                    </div>

                    <div className="salon-actions">
                      <Link to={`/salondetail?salonId=${salon.salonId}`} className="btn-view">View Details</Link>
                      <Link to={`/reviews?salonId=${salon.salonId}`} className="btn-book" style={{ background: '#f59e0b' }}>Reviews</Link>
                    </div>
                  </div>
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
