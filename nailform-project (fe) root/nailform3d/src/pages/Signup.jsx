import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Signup.css';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Split full name
    const parts = fullName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: email, 
          password: password,
          firstName: firstName,
          lastName: lastName,
          role: role
        })
      });

      if (!res.ok) {
        let errMessage = 'Failed to create account';
        try {
          const errData = await res.json();
          if (errData.message) {
            errMessage = errData.message;
          } else if (typeof errData === 'string') {
            errMessage = errData;
          }
        } catch (e) {
          // Ignore JSON parse error, use default message
        }
        throw new Error(errMessage);
      }
      
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="signup-section">
          <div className="signup-header">
            <h1>Join 3D Nail</h1>
            <p>Unlock a world of stunning nail art</p>
          </div>

          <form className="signup-card" onSubmit={handleSignup}>
            {error && (
              <div className="error-message">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="success-message">
                <i className="fa-solid fa-circle-check"></i>
                <span>{success}</span>
              </div>
            )}
            
            <div className="input-wrapper">
              <i className="fa-solid fa-user"></i>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
            <div className="input-wrapper">
              <i className="fa-solid fa-envelope"></i>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock"></i>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            {/* Premium Role Selector */}
            <div className="role-selector-container">
              <label className="role-selector-label">I want to register as:</label>
              <div className="role-tabs">
                <button 
                  type="button" 
                  className={`role-tab ${role === 'USER' ? 'active' : ''}`}
                  onClick={() => setRole('USER')}
                >
                  <i className="fa-solid fa-user"></i>
                  <span>Customer</span>
                </button>
                <button 
                  type="button" 
                  className={`role-tab ${role === 'SALON' ? 'active' : ''}`}
                  onClick={() => setRole('SALON')}
                >
                  <i className="fa-solid fa-shop"></i>
                  <span>Nail Salon</span>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-signup-submit">Sign-Up</button>

            <div className="login-link">
              Already have an account? <Link to="/login">Log In</Link>
            </div>

            <div className="social-divider"><span>or continue with</span></div>

            <div className="social-buttons">
              <button type="button" className="btn-social btn-google">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '16px', marginRight: '8px' }} /> Continue with Google
              </button>
              <button type="button" className="btn-social btn-facebook">
                <i className="fa-brands fa-facebook"></i> Continue with Facebook
              </button>
              <button type="button" className="btn-social btn-apple">
                <i className="fa-brands fa-apple"></i> Continue with Apple
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
