import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Custom.css';

export default function Custom() {
  return (
    <div className="custom-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="customize-section">
          <h1 className="page-title">Select the Perfect Salon</h1>

          <div className="glass-panel">
            <Link to="/naildesign3d" className="btn-design-now">Design now</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
