import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="footer-left">
        <Link to="/" className="footer-logo">
          <img src="/logo.png" alt="Nailform 3D Logo" />
        </Link>
        <div className="footer-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="footer-right">
        <h4 className="footer-heading">CONTACT INFO</h4>
        <ul className="contact-list">
          <li><i className="fa-regular fa-envelope"></i> xdcdc@gmail.com</li>
          <li><i className="fa-solid fa-phone"></i> 0056789909</li>
          <li><i className="fa-solid fa-location-dot"></i> So 1/x, Hai Ba Trung, Ha Noi</li>
        </ul>

        <div className="newsletter">
          <input type="email" placeholder="Email Address" />
          <button type="submit">SUBSCRIBE</button>
        </div>

        <div className="social-icons">
          <a href="#"><i className="fa-brands fa-square-facebook"></i></a>
          <a href="#"><i className="fa-brands fa-twitter"></i></a>
          <a href="#"><i className="fa-brands fa-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-linkedin"></i></a>
        </div>
      </div>
    </footer>
  );
}
