import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <div className="aboutus-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />
        {/* Background image fills the page – content is intentionally minimal */}
        <div className="about-placeholder"></div>
      </div>

      <Footer />
    </div>
  );
}
