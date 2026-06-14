import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Gallery.css';

export default function Gallery() {
  return (
    <div className="gallery-page">
      <Navbar />

      {/* Main Content */}
      <div className="main-content">
        <h1 className="page-title">Your Design Here</h1>

        <div className="gallery-grid">
          {/* Row 1 */}
          <div className="g-item g1 nail-img-1"></div>
          <div className="g-item g2 nail-img-2"></div>
          <div className="g-item g3 nail-img-3"></div>

          {/* Row 2 */}
          <div className="g-item g4 nail-img-4"></div>
          <div className="g5">
            <div className="sub-img nail-img-5a"></div>
            <div style={{ display: 'flex', height: '100%', gap: '4px' }}>
              <div className="sub-img nail-img-5b" style={{ flex: 1 }}></div>
              <div className="sub-img nail-img-5c" style={{ flex: 1 }}></div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="g-item g6 nail-img-6"></div>
          <div className="g-item g7 nail-img-7"></div>
          <div className="g-item g8 nail-img-8"></div>
        </div>

        <div className="carousel-nav">
          <button className="nav-arrow"><i className="fa-solid fa-arrow-left"></i></button>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot active"></div>
          <button className="nav-arrow"><i className="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
