import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await res.json();
      login(data.token, data.role, username, data.currentPlan);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="login-section">
          <div className="login-header">
            <h1>Welcome Back</h1>
          </div>

          <form className="login-card" onSubmit={handleLogin}>
            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            
            <div className="input-wrapper">
              <i className="fa-solid fa-user"></i>
              <input 
                type="text" 
                placeholder="Email or Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <i className="fa-solid fa-check" style={{ display: 'none' }}></i> Remember me
              </label>
              <a href="#" className="forgot-password">Forget password?</a>
            </div>

            <button type="submit" className="btn-login-submit">Log In</button>

            <div className="social-divider"><span>or continue with</span></div>

            <div className="social-buttons-row">
              <button type="button" className="btn-social-small btn-google-small">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '14px' }} /> Google
              </button>
              <button type="button" className="btn-social-small btn-facebook-small">
                <i className="fa-brands fa-facebook"></i> Facebook
              </button>
              <button type="button" className="btn-social-small btn-apple-small">
                <i className="fa-brands fa-apple"></i> Apple
              </button>
            </div>

            <div className="signup-link">
              Don&apos;t have an account? <Link to="/signup">Sign up</Link>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
