import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './Payment.css';

const PLAN_DETAILS = {
  'PRO': { price: '299,000 VND', name: 'PRO Plan', desc: 'Professional personal experience' },
  'PREMIUM': { price: '499,000 VND', name: 'PREMIUM Plan', desc: 'Unlimited 3D designs' },
  'STUDIO_5': { price: '1,999,000 VND', name: 'Studio Plan (5 Users)', desc: 'Solution for small studios' },
  'STUDIO_10': { price: '2,999,000 VND', name: 'Studio Plan (10 Users)', desc: 'Performance and team management' },
  'ACADEMY_20': { price: '4,999,000 VND', name: 'Academy Plan (20 Users)', desc: 'Ultimate teaching solution' }
};

export default function Payment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan || 'PRO';
  const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS['PRO'];

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitPaymentRequest = async () => {
    if (!user) {
      alert("You need to login to continue!");
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/api/subscriptions/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          requestedPlan: plan,
          paymentReference: "QR_TRANSFER"
        })
      });

      if (!res.ok) throw new Error("Error submitting request!");
      setSuccess(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="payment-success-container">
          <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
          <h1>Request Submitted Successfully!</h1>
          <p>Thank you for choosing NAILFORM 3D. Admin is verifying the transaction and will activate the <strong>{planInfo.name}</strong> plan for you shortly.</p>
          <button className="btn-return" onClick={() => navigate('/')}>Return to Homepage</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-left">
            <h2>Order Summary</h2>
            <div className="order-item">
              <div>
                <h3>{planInfo.name}</h3>
                <p>{planInfo.desc}</p>
              </div>
              <div className="order-price">{planInfo.price}</div>
            </div>
            <div className="order-total">
              <span>Total Payment</span>
              <span>{planInfo.price}</span>
            </div>
            <div className="security-badges">
              <span><i className="fa-solid fa-lock"></i> Secure Payment</span>
              <span><i className="fa-solid fa-headset"></i> 24/7 Support</span>
            </div>
          </div>

          <div className="payment-right">
            <h2>QR Bank Transfer</h2>
            <p className="qr-instruction">Open your banking app and scan the QR code below.</p>
            
            <div className="qr-wrapper">
              {/* Giả lập QR code */}
              <div className="qr-placeholder">
                <i className="fa-solid fa-qrcode"></i>
                <span>Nailform 3D QR Code</span>
              </div>
            </div>

            <div className="bank-info">
              <div className="info-row">
                <span>Bank:</span>
                <strong>Techcombank</strong>
              </div>
              <div className="info-row">
                <span>Account Number:</span>
                <strong>1903 0000 0000</strong>
              </div>
              <div className="info-row">
                <span>Account Name:</span>
                <strong>NAILFORM 3D</strong>
              </div>
              <div className="info-row highlight-row">
                <span>Memo:</span>
                <strong>{user?.username} BUY {plan}</strong>
              </div>
            </div>

            <button 
              className={`btn-confirm-payment ${loading ? 'loading' : ''}`} 
              onClick={submitPaymentRequest}
              disabled={loading}>
              {loading ? 'Processing...' : 'I have transferred'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
