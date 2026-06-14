import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        {/* Hero Section */}
        <div className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Revolutionizing<br />
              <span className="title-dark">the Art of Nail Design</span>
            </h1>
            <p className="hero-subtitle">
              Experience the future of 3D nail art with cutting-<br />edge technology and stunning creations.
            </p>
            <div className="hero-buttons">
              <Link to="/naildesign3d" className="signup-btn">Design Now</Link>
              <Link to="/booking" className="btn-book">Book Appointment</Link>
            </div>
          </div>
        </div>

        <div className="hero-image-container">
          <div className="hero-image-placeholder"></div>
        </div>

        {/* Feature Cards */}
        <div className="features">
          <Link to="/custom" className="feature-card">
            <div className="card-bg-1"></div>
            <div className="card-overlay"></div>
            <div className="card-content card-1-content">
              <h3 className="feature-title">Customize Your Own</h3>
              <p className="feature-desc">Innovative designs to create perfect,<br />customized nail enhancements.</p>
            </div>
          </Link>

          <Link to="/naildesign3d" className="feature-card">
            <div className="card-bg-2"></div>
            <div className="card-overlay"></div>
            <div className="card-content card-2-content">
              <h3 className="feature-title">Virtual Nail Design</h3>
              <p className="feature-desc">Create and preview your dream nails in 3D before application.</p>
            </div>
          </Link>

          <Link to="/gallery" className="feature-card">
            <div className="card-bg-3"></div>
            <div className="card-overlay"></div>
            <div className="card-content card-3-content">
              <h3 className="feature-title">Luxury NailArt</h3>
              <p className="feature-desc">Stunning and unique nail art crafted with precision</p>
            </div>
          </Link>
        </div>

        {/* CTA */}
        <div className="cta-section">
          <div className="gradient-line"></div>
          <h2 className="cta-title">Step Into the Future of Nail Beauty</h2>
          <p className="cta-subtitle">Book Your Appointment Today!</p>
          <Link to="/booking" className="btn-cta">Book now</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
