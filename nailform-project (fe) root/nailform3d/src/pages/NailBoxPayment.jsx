import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './NailBoxProducts.css'; // For the product card styles
import './NailBoxPayment.css';

export default function NailBoxPayment() {
  const viewedProducts = Array(5).fill({
    title: "A.806 Nail box BWN HTT S405-26011350",
    oldPrice: "$100.00",
    newPrice: "$60.00"
  });

  return (
    <div className="salondetail-page" style={{ backgroundImage: "url('/backgroundnailboxdetail.png')" }}>
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="payment-content">
          <div className="checkout-grid">
            
            {/* Col 1: Customer Information */}
            <div className="col-section">
              <h2 className="col-title">Customer Information</h2>
              <div className="form-group">
                <input type="text" className="custom-input" placeholder="Name *" />
                <input type="text" className="custom-input" placeholder="Phone *" />
                <input type="email" className="custom-input" placeholder="Email *" />
                <input type="text" className="custom-input" placeholder="Address *" />
                <div className="input-wrapper">
                  <input type="text" className="custom-input" placeholder="Province/City *" />
                  <i className="fa-solid fa-chevron-down custom-select-icon"></i>
                </div>
                <div className="input-wrapper">
                  <input type="text" className="custom-input" placeholder="District *" />
                  <i className="fa-solid fa-chevron-down custom-select-icon"></i>
                </div>
                <textarea className="custom-textarea" placeholder="Notes"></textarea>
              </div>
              
              <p className="disclaimer-text">
                Orders on the website are processed during<br />
                administrative hours. Please contact our fanpage<br />
                outside of these hours for assistance.<br />
                Orders are not cash on delivery. Customers are kindly<br />
                requested to record a video when unpacking the<br />
                package for the best support in case of any<br />
                problems.
              </p>
            </div>
            
            <div className="separator-line"></div>

            {/* Col 2: Payment Method */}
            <div className="col-section">
              <h2 className="col-title">Payment Method</h2>
              
              <div className="payment-methods">
                <div className="radio-wrapper">
                  <div className="custom-radio active"></div>
                  <span className="radio-label">Transfer the full amount of the goods<br />in advance.</span>
                </div>
                
                <div className="radio-wrapper">
                  <div className="custom-radio"></div>
                  <span className="radio-label">Payment upon delivery</span>
                </div>
              </div>
            </div>

            <div className="separator-line"></div>

            {/* Col 3: Shopping Cart Information */}
            <div className="col-section" style={{ position: 'relative' }}>
              <div className="floating-bubble"></div>

              <h2 className="col-title">Shopping Cart Information</h2>
              
              <div className="cart-info">
                <div className="cart-table-header">
                  <div>Product Name</div>
                  <div className="qty-col">Quantity</div>
                  <div>Into Money</div>
                </div>

                <div className="cart-row">
                  <div className="item-name">A.806 Nail box BWN HTT<br />S405-26011350</div>
                  <div className="qty-col">1</div>
                  <div>60,000 VND</div>
                </div>
                <div className="cart-sub-row">
                  <div>Price: 60,000 VND</div>
                </div>

                <div className="cart-row" style={{ marginTop: '10px' }}>
                  <div className="item-name">A.806 Nail box BWN HTT<br />S405-26011350</div>
                  <div className="qty-col">1</div>
                  <div>60,000 VND</div>
                </div>
                <div className="cart-sub-row">
                  <div>Price: 60,000 VND</div>
                </div>

                <div className="cart-divider"></div>

                <div className="summary-row">
                  <span>Provisional:</span>
                  <span>120,000 VND</span>
                </div>
                <div className="summary-row">
                  <span>Transport fee:</span>
                  <span>0 VND</span>
                </div>
                
                <div className="cart-divider"></div>
                
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>120,000 VND</span>
                </div>

                <div className="promo-section">
                  <span className="promo-label">Promotion code</span>
                  <div className="promo-input-group">
                    <input type="text" className="promo-input" />
                    <button className="btn-apply">Apply</button>
                  </div>
                </div>

                <div className="checkbox-wrapper">
                  <div className="custom-checkbox"></div>
                  <span className="checkbox-label">Receive invoices via email</span>
                </div>

                <Link to="/bookingdesignpayment" className="btn-buy-now-large" style={{ marginTop: '20px' }}>Buy now</Link>
              </div>
            </div>
          </div>

          <div className="product-viewed-section">
            <h3 className="product-viewed-title">Product Viewed</h3>
            
            <div className="products-carousel">
              {viewedProducts.map((product, index) => (
                <div className="product-card" key={index} style={{ width: '220px' }}>
                  <div className="product-img-wrapper" style={{ height: '180px' }}>
                    <i className="fa-solid fa-caret-left img-nav-arrow"></i>
                    <i className="fa-solid fa-caret-right img-nav-arrow"></i>
                  </div>
                  <div className="product-title">{product.title}</div>
                  <div className="product-price-row">
                    <div className="price-col"><span className="price-label">cost</span><span className="old-price">{product.oldPrice}</span></div>
                    <div className="price-col"><span className="price-label">cost</span><span className="new-price">{product.newPrice}</span></div>
                  </div>
                  <div className="product-actions">
                    <button className="btn-add-cart">All to cart <i className="fa-solid fa-chevron-right" style={{ fontSize: '8px' }}></i></button>
                    <Link to="/nailboxdetail" className="btn-buy-now">Buy Now <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }}></i></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
