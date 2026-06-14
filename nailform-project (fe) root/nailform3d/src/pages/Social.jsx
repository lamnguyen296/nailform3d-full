import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Social.css';

const MOCK_POSTS = [
  { id: 1, img: '/post1.png' },
  { id: 2, img: '/post2.png' },
  { id: 3, img: '/post3.png' },
  { id: 4, img: '/post1.png' },
  { id: 5, img: '/post2.png' },
  { id: 6, img: '/post3.png' },
  { id: 7, img: '/post1.png' },
  { id: 8, img: '/post2.png' },
];

function getRelativeTime(dateStr) {
  if (!dateStr) return 'Just now';
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now - created;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} mins ago`;
  if (diffHour < 24) return `${diffHour} hours ago`;
  return `${diffDay} days ago`;
}

export default function Social() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/requests`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch requests:", err);
        setLoading(false);
      });
  }, []);

  const displayPosts = posts.length > 0 ? posts : MOCK_POSTS;

  return (
    <div className="social-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="social-hero">
          <h1>Your Dream Nails</h1>
          <p>Get offers from top nail-technicians</p>
          <button onClick={() => navigate('/3d-configurator')} className="btn-post-design" style={{cursor: 'pointer', border: 'none', padding: '12px 24px', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white', borderRadius: '999px', fontSize: '16px', fontWeight: 'bold'}}>Post Your Nail Design</button>
        </div>

        <div className="social-grid-wrapper">
          <div className="social-grid">
            {loading && posts.length === 0 ? <p style={{textAlign: 'center', width: '100%', gridColumn: '1 / -1'}}>Loading posts...</p> : null}
            {displayPosts.map((post) => (
              <Link to="/socialdetail" state={{ post }} key={post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="nail-card">
                  <img src={post.thumbnailBase64 || post.img || '/post1.png'} alt={`Dreamy Pick ${post.id}`} className="card-img" style={{objectFit: 'cover', height: '220px'}} />
                  <div className="card-content">
                    <h3 className="card-title" style={{textTransform: 'capitalize'}}>{post.userId ? post.userId.split('@')[0] + "'s Design" : "Custom Design"}</h3>
                    <div className="card-info" style={{fontSize: '13px', lineHeight: '1.4'}}>
                      <strong>Location:</strong> {post.location || "N/A"}<br />
                      <strong>Notes:</strong> {post.description ? (post.description.length > 40 ? post.description.substring(0, 40) + "..." : post.description) : "N/A"}
                    </div>
                    <div className="card-footer">
                      <span>Waiting for offers...</span>
                      <span className="card-timer">{getRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="pagination">
            <button className="page-nav"><i className="fa-solid fa-arrow-left"></i></button>
            <div className="page-dot"></div>
            <div className="page-dot"></div>
            <div className="page-dot"></div>
            <div className="page-dot active"></div>
            <button className="page-nav"><i className="fa-solid fa-arrow-right"></i></button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
