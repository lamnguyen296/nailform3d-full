import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isActive = (path) => pathname === path ? 'active' : '';

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <div className="custom-header">
      {/* Row 1: Nav links + icons */}
      <div className="top-row">
        <Link to="/" className="logo-small top-row-logo">
          {/* placeholder – logo shown in bottom row */}
        </Link>
        <div className="nav-links-center">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/aboutus" className={isActive('/aboutus')}>About us</Link>
          <Link to="/custom" className={isActive('/custom')}>Customize</Link>
          <Link to="/booking" className={isActive('/booking')}>Bookings</Link>
          <Link to="/gallery" className={isActive('/gallery')}>Gallery</Link>
          <Link to="/social" className={isActive('/social')}>Social</Link>
          <Link to="/jobs" className={isActive('/jobs')} style={{color: '#ec4899', fontWeight: 'bold'}}>Jobs</Link>
            {user && (user.role === 'SALON' || user.role === 'ROLE_SALON') ? (
              <>
                <Link to="/my-offers" className={isActive('/my-offers')}>My Offers</Link>
                <Link to="/salon-appointments" className={isActive('/salon-appointments')}>Appointments</Link>
                <Link to="/salon-jobs" className={isActive('/salon-jobs')}>Job Dashboard</Link>
                {user.plan && (user.plan.startsWith('STUDIO') || user.plan.startsWith('ACADEMY')) && (
                  <Link to="/salon-members" className={isActive('/salon-members')}>Manage Members</Link>
                )}
              </>
            ) : user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') ? (
              <Link to="/admin/dashboard" className={isActive('/admin/dashboard')} style={{color: '#ef4444', fontWeight: 'bold'}}>Admin Panel</Link>
            ) : user ? (
              <>
                <Link to="/my-requests" className={isActive('/my-requests')}>My Requests</Link>
                <Link to="/user-appointments" className={isActive('/user-appointments')}>Appointments</Link>
                <Link to="/my-applications" className={isActive('/my-applications')}>My Applications</Link>
              </>
            ) : null}
            <Link to="/pricing" className={isActive('/pricing')} style={{color: '#a78bfa', fontWeight: 'bold', marginLeft: '10px'}}>Pricing</Link>
        </div>
        <div className="top-nav-icons">
          <a href="#" className="icon-link"><i className="fa-solid fa-cart-shopping"></i> Cart</a>
          <a href="#" className="icon-link"><i className="fa-regular fa-user"></i> Contact Us</a>
        </div>
      </div>

      {/* Row 2: Logo + search + auth */}
      <div className="bottom-row">
        <Link to="/" className="logo-small" style={{ marginRight: 'auto', marginLeft: 0 }}>
          <img src="/logo.png" alt="Nailform 3D Logo" style={{ height: '100px' }} />
        </Link>

        <div className="search-container">
          <input type="text" className="search-input" placeholder="Search 3D nail design ..." />
          <button className="search-btn"><i className="fa-solid fa-magnifying-glass"></i></button>
        </div>

        <div className="header-actions">
          {user ? (
            <>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <span style={{
                  color: '#170d74', 
                  marginRight: '15px', 
                  fontWeight: '700', 
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(90deg, rgba(167, 112, 255, 0.1), rgba(56, 139, 255, 0.1))',
                  padding: '6px 16px',
                  borderRadius: '30px',
                  border: '1px solid rgba(167, 112, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }} className="navbar-user-badge">
                  <i className="fa-solid fa-circle-user" style={{fontSize: '20px', color: '#a770ff', marginRight: '8px'}}></i>
                  {user.username} 
                  <span style={{fontSize: '11px', background: '#170d74', color: 'white', padding: '3px 8px', borderRadius: '12px', marginLeft: '8px', fontWeight: 'bold', letterSpacing: '0.5px'}}>
                    {user.role}
                  </span>
                  {user.plan && user.plan !== 'FREE' && (
                    <span style={{
                      fontSize: '11px', 
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)', 
                      color: 'white', 
                      padding: '3px 8px', 
                      borderRadius: '12px', 
                      marginLeft: '8px', 
                      fontWeight: 'bold', 
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
                    }}>
                      <i className="fa-solid fa-crown" style={{marginRight: '4px'}}></i>
                      {user.plan.replace('B2C_', '').replace('B2B_', '').replace(/_/g, ' ')}
                    </span>
                  )}
                </span>
              </Link>
              <button onClick={handleLogout} className="signup-btn" style={{background: '#ff4757', boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)', borderRadius: '20px'}}>LOGOUT</button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={pathname === '/login' ? 'signup-btn' : 'login-btn'}
              >
                LOG IN
              </Link>
              <Link 
                to="/signup" 
                className={pathname === '/signup' || pathname !== '/login' ? 'signup-btn' : 'login-btn'}
              >
                SIGN UP
              </Link>
            </>
          )}
          <Link to="/" style={{ color: 'black', marginLeft: '10px' }}><i className="fa-solid fa-house home-icon-btn"></i></Link>
        </div>
      </div>
    </div>
  );
}
