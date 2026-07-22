import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PaymentTest() {
  const [amount, setAmount] = useState(10000);
  const [orderInfo, setOrderInfo] = useState('Thanh toan test VNPay');

  const handlePayment = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/api/payment/create_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: parseInt(amount), orderInfo })
      });
      const data = await response.json();
      
      if (data && data.url) {
        // Redirect to VNPay
        window.location.href = data.url;
      } else {
        alert('Failed to get payment URL');
      }
    } catch (error) {
      console.error(error);
      alert('Error initiating payment');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: '50px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Test Thanh Toán VNPay Sandbox</h2>
        <div style={{ margin: '20px auto', maxWidth: '400px', textAlign: 'left' }}>
          <div style={{ marginBottom: '15px' }}>
            <label>Số tiền (VND):</label><br />
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Nội dung thanh toán:</label><br />
            <input 
              type="text" 
              value={orderInfo} 
              onChange={(e) => setOrderInfo(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>
          <button 
            onClick={handlePayment}
            style={{ width: '100%', padding: '12px', backgroundColor: '#e53935', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Thanh Toán Ngay qua VNPay
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
