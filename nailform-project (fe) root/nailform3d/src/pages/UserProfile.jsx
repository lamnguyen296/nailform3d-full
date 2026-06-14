import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(true);
  
  const formatSafeDate = (dateVal, fallback) => {
    if (!dateVal) return fallback;
    if (Array.isArray(dateVal)) {
      const [year, month, day] = dateVal;
      return new Date(year, month - 1, day).toLocaleDateString('vi-VN');
    }
    const d = new Date(dateVal);
    return isNaN(d) ? fallback : d.toLocaleDateString('vi-VN');
  };

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    currentPlan: 'FREE',
    createdAt: null,
    subscriptionEndDate: null
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phoneNumber: '',
    detailedAddress: '',
    isDefault: false
  });
  const [designs, setDesigns] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchAddresses();
    fetchDesigns();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/users/me`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Force exactly 1 year duration for UI display to clean up dirty data
        let calcEnd = data.subscriptionEndDate || null;
        if (data.currentPlan !== 'FREE') {
           if (data.createdAt && Array.isArray(data.createdAt)) {
             calcEnd = [data.createdAt[0] + 1, data.createdAt[1], data.createdAt[2]];
           } else if (data.createdAt) {
             const d = new Date(data.createdAt);
             d.setFullYear(d.getFullYear() + 1);
             calcEnd = d.toISOString();
           } else {
             calcEnd = [2027, 5, 31]; // 1 year from fallback
           }
        }

        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          username: data.username || '',
          phoneNumber: data.phoneNumber || '',
          currentPlan: data.currentPlan || 'FREE',
          createdAt: data.createdAt || null,
          subscriptionEndDate: calcEnd
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/users/me/addresses`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDesigns = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/requests/user/${user.username}`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Sort descending by date
          const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setDesigns(sorted);
        }
      }
    } catch (err) {
      console.error('Failed to fetch designs', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber
        })
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        fetchProfile();
      } else {
        alert('Update failed.');
      }
    } catch (err) {
      alert('Server connection error.');
    }
  };

  // --- ADDRESS LOGIC ---
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAddressId 
        ? `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/users/me/addresses/${editingAddressId}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/users/me/addresses`;
      
      const method = editingAddressId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(addressForm)
      });

      if (res.ok) {
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressForm({ recipientName: '', phoneNumber: '', detailedAddress: '', isDefault: false });
        fetchAddresses();
      } else {
        alert('Error saving address.');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      detailedAddress: addr.detailedAddress,
      isDefault: addr.isDefault
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/users/me/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) fetchAddresses();
    } catch (err) {}
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/users/me/addresses/${id}/default`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) fetchAddresses();
    } catch (err) {}
  };

  // Mock Data for orders tab
  const mockOrders = [
    { id: 'ORD-9823', item: 'Nailbox Premium Set', date: '26/05/2026', total: '450,000 VND', status: 'Processing' },
    { id: 'SUB-2026', item: `Plan Upgrade ${user?.plan || 'PRO'}`, date: '31/05/2026', total: '299,000 VND', status: 'Completed' }
  ];

  if (!user) return null;

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profileData.firstName ? profileData.firstName[0].toUpperCase() : user.username[0].toUpperCase()}
            </div>
            <div className="profile-name">{profileData.firstName} {profileData.lastName}</div>
            <div className="profile-role-badge">{user.role}</div>
          </div>

          <nav className="profile-menu">
            <button className={`profile-menu-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
              <i className="fa-solid fa-user"></i> Account Info
            </button>
            <button className={`profile-menu-item ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>
              <i className="fa-solid fa-map-location-dot"></i> Address Book
            </button>
            <button className={`profile-menu-item ${activeTab === 'designs' ? 'active' : ''}`} onClick={() => setActiveTab('designs')}>
              <i className="fa-solid fa-palette"></i> My Designs
            </button>
            <button className={`profile-menu-item ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => setActiveTab('subscription')}>
              <i className="fa-solid fa-crown"></i> Subscription
            </button>
            <button className={`profile-menu-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <i className="fa-solid fa-box-open"></i> Order History
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="profile-content">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#8b5cf6' }}></i>
              <p style={{ marginTop: '15px' }}>Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'account' && (
                <div>
                  <div className="profile-content-header">
                    <h2>Personal Information</h2>
                    <p>Manage your display name, email, and contact phone number.</p>
                  </div>
                  <form className="profile-form" onSubmit={handleProfileUpdate}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label>Email (Login Account)</label>
                      <input type="text" value={profileData.username} disabled />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} placeholder="Enter first name..." />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} placeholder="Enter last name..." />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label>Phone Number</label>
                      <input type="text" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} placeholder="Example: +1234567890" />
                    </div>
                    <button type="submit" className="btn-save-profile">Save Changes</button>
                  </form>
                </div>
              )}

              {activeTab === 'address' && (
                <div>
                  <div className="profile-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2>Shipping Address Book</h2>
                      <p>Manage addresses for physical Nailbox deliveries.</p>
                    </div>
                    {!showAddressForm && (
                      <button className="btn-add-address" onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm({ recipientName: '', phoneNumber: '', detailedAddress: '', isDefault: false });
                        setShowAddressForm(true);
                      }}>
                        <i className="fa-solid fa-plus"></i> Add Address
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <form className="address-form-box" onSubmit={handleAddressSubmit}>
                      <h3 style={{ marginBottom: '15px' }}>{editingAddressId ? 'Update Address' : 'Add New Address'}</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Recipient Name</label>
                          <input type="text" value={addressForm.recipientName} onChange={e => setAddressForm({...addressForm, recipientName: e.target.value})} required placeholder="E.g: John Doe" />
                        </div>
                        <div className="form-group">
                          <label>Phone Number</label>
                          <input type="text" value={addressForm.phoneNumber} onChange={e => setAddressForm({...addressForm, phoneNumber: e.target.value})} required placeholder="E.g: +123456789" />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Detailed Address (Street, City, State, Zip)</label>
                        <input type="text" value={addressForm.detailedAddress} onChange={e => setAddressForm({...addressForm, detailedAddress: e.target.value})} required placeholder="Enter full address..." />
                      </div>
                      <div className="form-checkbox" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} />
                        <label htmlFor="isDefault" style={{ cursor: 'pointer' }}>Set as default address</label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-save-address">Save Address</button>
                        <button type="button" className="btn-cancel-address" onClick={() => setShowAddressForm(false)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="address-list">
                      {addresses.length === 0 ? (
                        <div className="empty-state">You don't have any addresses yet. Add a new one!</div>
                      ) : (
                        addresses.map(addr => (
                          <div className={`address-card ${addr.default ? 'is-default' : ''}`} key={addr.id}>
                            <div className="address-card-header">
                              <h4>{addr.recipientName} {addr.default && <span className="default-badge">Default</span>}</h4>
                              <div className="address-actions">
                                <button onClick={() => handleEditAddress(addr)} className="btn-action edit"><i className="fa-solid fa-pen"></i></button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="btn-action delete"><i className="fa-solid fa-trash"></i></button>
                              </div>
                            </div>
                            <p><i className="fa-solid fa-phone"></i> {addr.phoneNumber}</p>
                            <p><i className="fa-solid fa-location-dot"></i> {addr.detailedAddress}</p>
                            
                            {!addr.default && (
                              <button className="btn-set-default" onClick={() => handleSetDefaultAddress(addr.id)}>
                                Set as Default
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'designs' && (
                <div>
                  <div className="profile-content-header">
                    <h2>My Designs</h2>
                    <p>3D nail designs you have created and requested a quote for.</p>
                  </div>
                  <div className="designs-grid">
                    {designs.length === 0 ? (
                      <div className="empty-state" style={{ gridColumn: '1 / -1' }}>You haven't created any designs yet.</div>
                    ) : (
                      designs.map(design => (
                        <Link to="/socialdetail" state={{ post: design }} key={design.id} style={{textDecoration: 'none'}}>
                          <div className="design-card">
                            <img src={design.thumbnailBase64 || '/post1.png'} alt="Design Thumbnail" className="design-img" />
                            <div className="design-info">
                              <h4>#{design.id.substring(0, 6).toUpperCase()}</h4>
                              <p><i className="fa-regular fa-clock"></i> Created at: {new Date(design.createdAt).toLocaleDateString()}</p>
                              <p><i className="fa-solid fa-circle-info"></i> Status: <strong>{design.status}</strong></p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div>
                  <div className="profile-content-header">
                    <h2>Manage Subscription</h2>
                    <p>View your active plan and its validity period.</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '30px', borderRadius: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                    <i className="fa-solid fa-crown" style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '150px', opacity: '0.05' }}></i>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a5b4fc', margin: '0 0 10px 0' }}>CURRENT PLAN</h3>
                        <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {profileData.currentPlan.replace('B2C_', '').replace('B2B_', '').replace(/_/g, ' ')}
                          {profileData.currentPlan !== 'FREE' && <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '20px' }}></i>}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '40px' }}>
                          <div>
                            <p style={{ fontSize: '12px', color: '#818cf8', margin: '0 0 5px 0' }}>REGISTERED ON</p>
                            <p style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>
                              {formatSafeDate(profileData.createdAt, '31/05/2026')}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#818cf8', margin: '0 0 5px 0' }}>EXPIRES ON</p>
                            <p style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>
                              {profileData.currentPlan === 'FREE' ? 'Lifetime' : formatSafeDate(profileData.subscriptionEndDate, 'N/A')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <button onClick={() => navigate('/pricing')} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div className="profile-content-header">
                    <h2>Recent Orders</h2>
                    <p>Track the status of your Nailbox orders or paid service plans.</p>
                  </div>
                  <div className="orders-list">
                    {mockOrders.map((order, idx) => (
                      <Link to={`/order/${order.id}`} state={{ order }} key={idx} style={{textDecoration: 'none', color: 'inherit'}}>
                        <div className="order-item">
                          <div className="order-info">
                            <h4>#{order.id} - {order.item}</h4>
                            <p><i className="fa-regular fa-calendar"></i> {order.date} | Total: <strong>{order.total}</strong></p>
                          </div>
                          <div className={`order-status ${order.status.includes('Completed') ? 'status-completed' : 'status-processing'}`}>
                            {order.status}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
