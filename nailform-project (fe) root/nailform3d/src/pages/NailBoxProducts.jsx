import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SalonDetail.css';
import './NailBoxProducts.css';

export default function NailBoxProducts() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const salonId = searchParams.get('salonId') || (user?.role === 'SALON' ? user.username : null);
  const isOwner = user?.username === salonId && user?.role === 'SALON';

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', oldPrice: '', newPrice: '', imageBase64: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!salonId) return;
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`)
      .then(r => r.json()).then(data => {
        setProfile(data);
        if (data.nailBoxProductsJson) {
          try { setProducts(JSON.parse(data.nailBoxProductsJson)); } catch(e) { setProducts([]); }
        }
      });
  }, [salonId]);

  const saveProducts = async (updated) => {
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon-profiles/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ nailBoxProductsJson: JSON.stringify(updated) })
      });
      setProducts(updated);
    } catch(err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleSave = async () => {
    const updated = editIndex !== null
      ? products.map((p, i) => i === editIndex ? form : p)
      : [...products, form];
    await saveProducts(updated);
    setShowModal(false);
    setForm({ title: '', description: '', oldPrice: '', newPrice: '', imageBase64: '' });
    setEditIndex(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({...f, imageBase64: reader.result}));
    reader.readAsDataURL(file);
  };

  // Show placeholders if no products yet (keep original look)
  const displayProducts = products.length > 0 ? products : (isOwner ? [] : Array(10).fill({
    title: 'Crystal Charm Nail Box Coffin Shape', oldPrice: '350k', newPrice: '300k', imageBase64: ''
  }));

  return (
    <div className="salondetail-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="salon-hero-section">
          <h1 className="salon-hero-title">{profile?.salonName || salonId || 'Luxury Salon'}</h1>
          <div className="salon-rating-row">
            <span className="stars">
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star empty"></i>
              <i className="fa-solid fa-star empty"></i>
            </span>
            <span className="rating-text">4.9 (50 Reviews)</span>
            <span className="separator">|</span>
            <span className="location-text">2.5km away</span>
          </div>
          <div className="salon-address-row">
            <i className="fa-solid fa-location-dot"></i>
            <span>{profile?.address || '245 Thach Hoa, Thach That'}</span>
          </div>
          <Link to="/bookingdesignpayment" className="btn-book-now">Book Now</Link>
        </div>

        <div className="salon-tabs">
          <Link to={`/salondetail?salonId=${salonId}`} className="tab-item">Photos</Link>
          <span className="tab-separator">|</span>
          <Link to={`/nailboxproducts?salonId=${salonId}`} className="tab-item active">Nail Box</Link>
          <span className="tab-separator">|</span>
          <Link to={`/technicans?salonId=${salonId}`} className="tab-item">Technicians</Link>
          <span className="tab-separator">|</span>
          <Link to={`/reviews?salonId=${salonId}`} className="tab-item">Reviews</Link>
          <span className="tab-separator">|</span>
          <Link to={`/location?salonId=${salonId}`} className="tab-item">Location</Link>
        </div>

        <div className="nail-box-section">
          <div className="section-header">
            <h2 className="section-heading">Best Seller</h2>
            <div className="filter-dropdown">
              {isOwner ? (
                <button onClick={() => { setShowModal(true); setEditIndex(null); setForm({ title: '', description: '', oldPrice: '', newPrice: '', imageBase64: '' }); }}
                  style={{ background: 'linear-gradient(90deg, #c58dfa, #4784fa)', color: '#000', border: 'none', padding: '10px 24px', borderRadius: 20, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  + Add Product
                </button>
              ) : (
                <button className="filter-btn">Filters <i className="fa-solid fa-chevron-down"></i></button>
              )}
            </div>
          </div>

          {products.length === 0 && isOwner ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 16 }}>
              No products yet. Add your first nail box product!
            </div>
          ) : (
            <div className="products-grid">
              {displayProducts.map((product, index) => (
                <div className="product-card" key={index} style={{ position: 'relative' }}>
                  <div className="product-img-wrapper">
                    {product.imageBase64
                      ? <img src={product.imageBase64} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                      : <>
                          <i className="fa-solid fa-chevron-left img-nav-arrow"></i>
                          <i className="fa-solid fa-chevron-right img-nav-arrow"></i>
                        </>
                    }
                  </div>
                  <div className="product-title">{product.title}</div>

                  <div className="product-price-row">
                    <div className="price-col">
                      <span className="price-label">Price</span>
                      <span className="old-price">{product.oldPrice}</span>
                    </div>
                    <div className="price-col">
                      <span className="price-label">Sale</span>
                      <span className="new-price">{product.newPrice}</span>
                    </div>
                  </div>

                  {isOwner ? (
                    <div className="product-actions">
                      <button onClick={() => { setForm(product); setEditIndex(index); setShowModal(true); }}
                        className="btn-add-cart" style={{ fontWeight: 700 }}>✏️ Edit</button>
                      <button onClick={() => { if(window.confirm('Delete this product?')) saveProducts(products.filter((_, i) => i !== index)); }}
                        className="btn-buy-now" style={{ background: '#ef4444' }}>🗑️</button>
                    </div>
                  ) : (
                    <div className="product-actions">
                      <button className="btn-add-cart"><i className="fa-solid fa-cart-plus"></i></button>
                      <Link to="/nailboxdetail" className="btn-buy-now">Buy Now</Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pagination-container">
            <i className="fa-solid fa-chevron-left page-arrow"></i>
            <div className="page-dot active"></div>
            <div className="page-dot"></div>
            <div className="page-dot"></div>
            <div className="page-dot"></div>
            <i className="fa-solid fa-chevron-right page-arrow"></i>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 30, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 800 }}>{editIndex !== null ? 'Edit Product' : 'Add Product'}</h3>
            {[['Product Name', 'title', 'e.g. Crystal Charm Nail Box'], ['Description', 'description', 'Short description...'], ['Original Price', 'oldPrice', 'e.g. 350k'], ['Sale Price', 'newPrice', 'e.g. 300k']].map(([label, key, placeholder]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{label}</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  value={form[key] || ''} placeholder={placeholder}
                  onChange={e => setForm(f => ({...f, [key]: e.target.value}))} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Product Image</label>
              {form.imageBase64 && <img src={form.imageBase64} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} alt="preview"/>}
              <label style={{ padding: '10px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'inline-block' }}>
                📤 Upload Image
                <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(90deg, #c58dfa, #4784fa)', color: '#000', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 800 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 700 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
