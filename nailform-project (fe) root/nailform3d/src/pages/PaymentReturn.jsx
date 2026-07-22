import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './PaymentReturn.css';

export default function PaymentReturn() {
  const location = useLocation();
  const { login, user } = useAuth();
  const [result, setResult] = useState(null);
  const [txnRef, setTxnRef] = useState('');
  const [activatedPlan, setActivatedPlan] = useState('');
  const calledRef = useRef(false); // prevent double-call in React StrictMode

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setTxnRef(queryParams.get('vnp_TxnRef') || '');

    // Guard against React StrictMode double-invocation
    if (calledRef.current) return;
    calledRef.current = true;

    const verifyPayment = async () => {
      try {
        // 1. Call backend to verify and process the payment
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/api/payment/vnpay_return${location.search}`);
        const data = await response.json();
        setResult(data);

        // 2. If successful, fetch fresh user info and update localStorage
        if (data.status === 'SUCCESS' && user) {
          const newPlan = data.url; // backend puts plan code in 'url' field
          setActivatedPlan(newPlan || '');

          try {
            // Fetch updated profile to confirm the plan was actually saved in DB
            const meRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/users/me`, {
              headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              const freshPlan = meData.currentPlan || newPlan || 'FREE';
              setActivatedPlan(freshPlan);
              // Update localStorage so Navbar/Profile reflect new plan immediately
              login(user.token, user.role, user.username, freshPlan);
              console.log('Plan updated in localStorage to:', freshPlan);
            }
          } catch (profileErr) {
            // Fallback: still update with the plan from response
            if (newPlan) login(user.token, user.role, user.username, newPlan);
          }
        }
      } catch (error) {
        console.error('Error verifying payment', error);
        setResult({ status: 'ERROR', message: 'Không thể kết nối đến máy chủ để xác thực thanh toán.' });
      }
    };

    if (location.search) {
      verifyPayment();
    }
  }, [location.search]);

  return (
    <div className="payment-return-page">
      <Navbar />
      <div className="return-container">
        <div className="return-card">
          {!result ? (
            <>
              <div className="icon-wrapper loading">
                <i className="fa-solid fa-circle-notch spinner"></i>
              </div>
              <h2 className="return-title">Đang xác thực...</h2>
              <p className="return-message">Hệ thống đang kiểm tra giao dịch của bạn với hệ thống VNPay. Vui lòng không đóng trình duyệt lúc này.</p>
            </>
          ) : result.status === 'SUCCESS' ? (
            <>
              <div className="icon-wrapper success">
                <i className="fa-solid fa-check"></i>
              </div>
              <h2 className="return-title">Thanh Toán Thành Công!</h2>
              <p className="return-message">Tuyệt vời! Gói <strong>{activatedPlan || 'subscription'}</strong> đã được kích hoạt ngay lập tức cho tài khoản của bạn. Cảm ơn bạn đã tin tưởng sử dụng NAILFORM 3D.</p>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span className="detail-label">Mã giao dịch:</span>
                  <span className="detail-value">{txnRef || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái:</span>
                  <span className="detail-value" style={{ color: '#10b981' }}>Đã thanh toán</span>
                </div>
              </div>

              <Link to="/" className="btn-home">
                <i className="fa-solid fa-house" style={{ marginRight: '8px' }}></i> Quay lại Trang Chủ
              </Link>
            </>
          ) : (
            <>
              <div className="icon-wrapper failed">
                <i className="fa-solid fa-xmark"></i>
              </div>
              <h2 className="return-title">Thanh Toán Thất Bại</h2>
              <p className="return-message">{result.message || 'Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý.'}</p>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span className="detail-label">Mã tham chiếu:</span>
                  <span className="detail-value">{txnRef || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái:</span>
                  <span className="detail-value" style={{ color: '#ef4444' }}>Chưa thanh toán</span>
                </div>
              </div>

              <Link to="/pricing" className="btn-retry">
                <i className="fa-solid fa-rotate-right" style={{ marginRight: '8px' }}></i> Thử lại
              </Link>
              <div style={{ marginTop: '15px' }}>
                <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  Trở về trang chủ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
