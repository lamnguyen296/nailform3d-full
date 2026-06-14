import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './NailBoxProducts.css'; // For the product card styles
import './NailBoxDetail.css';

export default function NailBoxDetail() {
  const relatedProducts = Array(6).fill({
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

        <div className="detail-page-wrapper">
          <div className="page-header">
            <h1 className="page-title">Nail box</h1>
            <button className="filter-btn">
              Latest <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          <div className="top-detail-grid">
            <div className="side-images">
              <div className="img-placeholder-side"></div>
              <div className="img-placeholder-side"></div>
              <div className="img-placeholder-side"></div>
            </div>

            <div className="center-images">
              <div className="img-placeholder-main"></div>
              <div className="img-small-row">
                <div className="img-placeholder-small"></div>
                <div className="img-placeholder-small"></div>
                <div className="img-placeholder-small"></div>
              </div>
            </div>

            <div className="cart-form">
              <div className="quantity-row">
                <span className="qty-label">Quantity:</span>
                <div className="qty-controls">
                  <button className="qty-btn"><i className="fa-solid fa-minus" style={{ fontSize: '10px' }}></i></button>
                  <input type="text" className="qty-input" defaultValue="1" readOnly />
                  <button className="qty-btn"><i className="fa-solid fa-plus" style={{ fontSize: '10px' }}></i></button>
                </div>
              </div>

              <button className="btn-add-to-cart-large">All to cart</button>
              <Link to="/nailboxpayment" className="btn-buy-now-large">Buy now</Link>

              <p className="payment-options-text">More payment options</p>

              <div className="trust-badges">
                <div className="trust-badge-item">
                  <i className="fa-solid fa-truck-fast"></i>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
                    <span>Nationwide delivery for<br />orders from 59k</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fa-solid fa-phone" style={{ fontSize: '10px' }}></i> 056.124.1520</span>
                  </div>
                </div>
                <div className="trust-badge-item">
                  <i className="fa-solid fa-rotate-left"></i>
                  <span>Return accepted<br />within</span>
                </div>
              </div>
            </div>
          </div>

          <div className="large-desc-block"></div>

          <div className="see-more-section">
            <h3 className="see-more-title">See More Product</h3>

            <div className="products-carousel-grid">
              {relatedProducts.map((product, index) => (
                <div className="product-card" key={index}>
                  <div className="product-img-wrapper">
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

            <div className="pagination-container-footer">
              <i className="fa-solid fa-chevron-left page-arrow-footer"></i>
              <div className="page-dot-footer active"></div>
              <div className="page-dot-footer"></div>
              <div className="page-dot-footer"></div>
              <i className="fa-solid fa-chevron-right page-arrow-footer"></i>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
