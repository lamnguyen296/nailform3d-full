import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function SalonOfferItem({ offer }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/requests/${offer.requestId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setRequest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch request", err);
        setLoading(false);
      });
  }, [offer.requestId]);

  return (
    <div style={styles.card}>
      {loading ? <p style={{padding: 20, margin: 0}}>Loading request details...</p> : request ? (
        <div style={styles.cardHeader}>
          <div style={{position: 'relative'}}>
            <Link to="/socialdetail" state={{ post: request }}>
              <img src={request.thumbnailBase64 || '/post1.png'} alt="thumbnail" style={styles.thumbnail} />
              <div style={styles.view3dBadge}>✦ View 3D</div>
            </Link>
          </div>
        <div style={styles.cardInfo}>
            <h3 style={{margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px'}}>
              {request.userId ? request.userId.split('@')[0] : "Customer"}'s Design 
              <span style={{fontSize: '13px', color: '#64748b', fontWeight: 'normal'}}>
                ({new Date(request.createdAt).toLocaleString([], {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})})
              </span>
            </h3>
            <p style={{margin: '5px 0'}}><strong>Customer:</strong> {request.userId}</p>
            <p style={{margin: '5px 0'}}><strong>Status:</strong> <span style={{color: request.status === 'OPEN' ? '#f59e0b' : '#10b981', fontWeight: 'bold'}}>{request.status}</span></p>
          </div>
        </div>
      ) : (
        <p style={{padding: 20, margin: 0}}>Request not found or has been deleted.</p>
      )}
      <div style={{padding: 20, background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <p style={{margin: 0, fontSize: 14, color: '#64748b', fontWeight: '600'}}>Your Offer</p>
          <div style={{fontSize: 28, fontWeight: '800', color: '#10b981', margin: '5px 0'}}>${offer.price}</div>
          <p style={{margin: 0, fontSize: 14}}><strong>Message:</strong> {offer.message}</p>
          <p style={{margin: '5px 0 0 0', fontSize: 12, color: '#94a3b8'}}>Sent on: {new Date(offer.createdAt).toLocaleString([], {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
        </div>
        <div style={{
          background: offer.status === 'ACCEPTED' ? '#10b981' : (offer.status === 'REJECTED' ? '#ef4444' : '#cbd5e1'), 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: 8, 
          fontWeight: 'bold', 
          fontSize: 14
        }}>
          {offer.status}
        </div>
      </div>
    </div>
  );
}

export default function MyOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/offers/salon/${user.username}`, {
      headers: { "Authorization": `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOffers(data);
          setFilteredOffers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch offers", err);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (activeTab === 'ALL') {
      setFilteredOffers(offers);
    } else {
      setFilteredOffers(offers.filter(o => o.status === activeTab));
    }
  }, [activeTab, offers]);

  if (!user) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={{textAlign: 'center', marginTop: 100}}>
          <h2 style={{fontSize: 28, color: '#1a1a2e', marginBottom: 10}}>Please Log In</h2>
          <p style={{color: '#64748b', marginBottom: 20}}>You must be logged in as a Salon to view this page.</p>
          <Link to="/login" style={{...styles.acceptBtn, textDecoration: 'none', display: 'inline-block'}}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>My Sent Offers</h1>
        <p style={styles.subtitle}>Track the status of your proposals to customers.</p>

        <div style={styles.tabs}>
          {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn, 
                color: activeTab === tab ? '#818cf8' : '#64748b',
                borderBottom: activeTab === tab ? '3px solid #818cf8' : '3px solid transparent'
              }}
            >
              {tab} ({tab === 'ALL' ? offers.length : offers.filter(o => o.status === tab).length})
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{textAlign: 'center', marginTop: 50, color: '#64748b', fontWeight: '500'}}>Loading...</p>
        ) : (
          filteredOffers.length === 0 ? (
            <div style={{textAlign: 'center', marginTop: 50}}>
              <p style={{color: '#64748b', fontSize: 18, marginBottom: 20}}>No offers found.</p>
            </div>
          ) : (
            <div style={styles.list}>
              {filteredOffers.map(offer => <SalonOfferItem key={offer.id} offer={offer} />)}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f4f4f8', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '850px', margin: '0 auto', padding: '40px 20px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#1a1a2e', marginBottom: '10px' },
  subtitle: { color: '#64748b', marginBottom: '30px', fontSize: '16px' },
  tabs: { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' },
  tabBtn: { background: 'none', border: 'none', padding: '10px 5px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  list: { display: 'flex', flexDirection: 'column', gap: '30px' },
  card: { background: 'white', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' },
  cardHeader: { display: 'flex', padding: '24px', borderBottom: '1px solid #f1f5f9', gap: '24px' },
  thumbnail: { width: '140px', height: '140px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer' },
  view3dBadge: { position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none' },
  cardInfo: { flex: 1, color: '#334155', fontSize: '15px' },
  acceptBtn: { background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }
};
