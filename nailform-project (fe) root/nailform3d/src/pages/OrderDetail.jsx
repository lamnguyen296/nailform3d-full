import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './OrderDetail.css';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // If we came from UserProfile, we have the order in state. Otherwise mock it based on ID.
  const order = location.state?.order || {
    id: id,
    item: id.startsWith('SUB') ? 'Service Plan Upgrade' : 'Nailbox Premium Set',
    date: '26/05/2026',
    total: '450,000 VND',
    status: id.startsWith('SUB') ? 'Completed' : 'Processing'
  };

  const isCompleted = order.status.includes('Completed');

  return (
    <div className="order-detail-page">
      <Navbar />

      <div className="order-detail-container">
        <div className="breadcrumb">
          <Link to="/profile"><i className="fa-solid fa-arrow-left"></i> Back to Profile</Link>
          <span>/</span> Order Detail
        </div>

        <div className="order-detail-card">
          <div className="order-header">
            <div>
              <h1>Order #{order.id}</h1>
              <p>Placed on {order.date}</p>
            </div>
            <div className={`order-status-badge ${isCompleted ? 'completed' : 'processing'}`}>
              {order.status}
            </div>
          </div>

          <div className="order-section">
            <h3>Product Details</h3>
            <div className="order-item-row">
              <div>
                <div className="item-name">{order.item}</div>
                <div className="item-qty">Quantity: 1</div>
              </div>
              <div className="item-price">{order.total}</div>
            </div>
            
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{order.total}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>0 VND</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{order.total}</span>
              </div>
            </div>
          </div>

          {!order.id.startsWith('SUB') && (
            <div className="order-section">
              <h3>Shipping Information</h3>
              <div className="shipping-info">
                <p><i className="fa-solid fa-user"></i> Nguyen Van Khach</p>
                <p><i className="fa-solid fa-phone"></i> 0987.654.321</p>
                <p><i className="fa-solid fa-location-dot"></i> 123 Cau Giay Street, Dich Vong Ward, Cau Giay District, Hanoi</p>
              </div>
            </div>
          )}
          
          {order.id.startsWith('SUB') && (
            <div className="order-section">
              <h3>Plan Activation Info</h3>
              <div className="shipping-info">
                <p><i className="fa-solid fa-check-circle"></i> The service plan has been successfully activated on your account.</p>
                <p><i className="fa-solid fa-clock"></i> Validity: 1 year from the date of purchase.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
