import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function RequestItem({ request, onOfferUpdate }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOffers = () => {
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/offers/request/${request.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOffers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch offers", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOffers();
  }, [request.id]);

  const handleAcceptOffer = async (offerId, salonId) => {
    if (window.confirm(`Accept offer from ${salonId}? This will close your request.`)) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/offers/${offerId}/accept`, {
          method: 'POST'
        });
        if (res.ok) {
          navigate('/schedule-appointment', { state: { acceptedOffer: offerId, salonId: salonId } });
        } else if (res.status === 401 || res.status === 403) {
          alert("Session expired. Please log in again.");
          navigate('/login');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (window.confirm("Reject this offer?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/offers/${offerId}/reject`, {
          method: 'POST'
        });
        if (res.ok) {
          fetchOffers(); // Refresh list
        } else if (res.status === 401 || res.status === 403) {
          alert("Session expired. Please log in again.");
          navigate('/login');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{position: 'relative'}}>
          <Link to="/socialdetail" state={{ post: request }}>
            <img src={request.thumbnailBase64 || '/post1.png'} alt="thumbnail" style={styles.thumbnail} />
            <div style={styles.view3dBadge}>✦ View 3D</div>
          </Link>
        </div>
        <div style={styles.cardInfo}>
          <h3 style={{margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px'}}>
            My Design #{request.id.substring(0, 6).toUpperCase()} 
            <span style={{fontSize: '13px', color: '#64748b', fontWeight: 'normal'}}>
              ({new Date(request.createdAt).toLocaleString([], {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})})
            </span>
          </h3>
          <p style={{margin: '5px 0'}}><strong>Location:</strong> {request.location}</p>
          <p style={{margin: '5px 0'}}><strong>Status:</strong> <span style={{color: request.status === 'OPEN' ? '#f59e0b' : '#10b981', fontWeight: 'bold'}}>{request.status}</span></p>
        </div>
      </div>
      
      <div style={styles.offersSection}>
        <h4 style={{margin: '0 0 15px 0', fontSize: '18px'}}>Offers Received ({offers.length})</h4>
        {loading ? <p>Loading...</p> : (
          offers.length === 0 ? <p style={{color: '#666', fontStyle: 'italic', margin: 0}}>No offers yet.</p> : (
            <div style={styles.offerList}>
              {offers.map(offer => (
                <div key={offer.id} style={styles.offerItem}>
                  <div style={styles.offerDetails}>
                    <p style={{margin: '0 0 5px 0'}}><strong>Salon:</strong> {offer.salonId}</p>
                    <p style={{margin: '0 0 5px 0'}}><strong>Message:</strong> {offer.message}</p>
                    <p style={{margin: 0, fontSize: '11px', color: '#94a3b8'}}>Sent on: {new Date(offer.createdAt).toLocaleString([], {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                  </div>
                  <div style={styles.offerAction}>
                    <div style={styles.offerPrice}>${offer.price}</div>
                    {offer.status === 'ACCEPTED' ? (
                      <div style={{color: '#10b981', fontWeight: 'bold', padding: '10px', background: '#ecfdf5', borderRadius: '8px'}}>ACCEPTED</div>
                    ) : offer.status === 'REJECTED' ? (
                      <div style={{color: '#ef4444', fontWeight: 'bold', padding: '10px', background: '#fef2f2', borderRadius: '8px'}}>REJECTED</div>
                    ) : request.status === 'CLOSED' ? (
                       <div style={{color: '#94a3b8', fontWeight: 'bold'}}>OTHER ACCEPTED</div>
                    ) : (
                      <div style={{display: 'flex', gap: '10px'}}>
                         <button style={styles.acceptBtn} onClick={() => handleAcceptOffer(offer.id, offer.salonId)}>Accept</button>
                         <button style={{...styles.acceptBtn, background: '#ef4444'}} onClick={() => handleRejectOffer(offer.id)}>Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/requests/user/${user.username}`, {
      headers: { "Authorization": `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRequests(sorted);
          setFilteredRequests(sorted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch requests", err);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (activeTab === 'ALL') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === activeTab));
    }
  }, [activeTab, requests]);

  if (!user) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={{textAlign: 'center', marginTop: 100}}>
          <h2 style={{fontSize: 28, color: '#1a1a2e', marginBottom: 10}}>Please Log In</h2>
          <Link to="/login" style={{...styles.acceptBtn, textDecoration: 'none'}}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>My Requests & Offers</h1>
        
        <div style={styles.tabs}>
          {['ALL', 'OPEN', 'CLOSED'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn, 
                color: activeTab === tab ? '#818cf8' : '#64748b',
                borderBottom: activeTab === tab ? '3px solid #818cf8' : '3px solid transparent'
              }}
            >
              {tab} ({tab === 'ALL' ? requests.length : requests.filter(r => r.status === tab).length})
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{textAlign: 'center', marginTop: 50}}>Loading...</p>
        ) : (
          filteredRequests.length === 0 ? (
            <div style={{textAlign: 'center', marginTop: 50}}>
              <p style={{color: '#64748b'}}>No requests found.</p>
            </div>
          ) : (
            <div style={styles.list}>
              {filteredRequests.map(req => <RequestItem key={req.id} request={req} />)}
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
  title: { fontSize: '32px', fontWeight: '800', color: '#1a1a2e', marginBottom: '30px' },
  tabs: { display: 'flex', gap: '30px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0' },
  tabBtn: { background: 'none', border: 'none', padding: '10px 5px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '30px' },
  card: { background: 'white', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' },
  cardHeader: { display: 'flex', padding: '24px', borderBottom: '1px solid #f1f5f9', gap: '24px' },
  thumbnail: { width: '140px', height: '140px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer' },
  view3dBadge: { position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  cardInfo: { flex: 1, color: '#334155', fontSize: '15px' },
  offersSection: { padding: '24px', background: '#f8fafc' },
  offerList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  offerItem: { background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  offerDetails: { fontSize: '15px', color: '#334155', lineHeight: '1.6' },
  offerAction: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' },
  offerPrice: { fontSize: '24px', fontWeight: '800', color: '#10b981' },
  acceptBtn: { background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};
