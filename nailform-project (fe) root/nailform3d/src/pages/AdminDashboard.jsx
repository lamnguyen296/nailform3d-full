import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Real backend subscription requests state
  const [requests, setRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Real dashboard stats
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Selected slip/invoice modal state
  const [selectedSlip, setSelectedSlip] = useState(null);


  // Request search/filter states
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');

  // Plan search/filter states
  const [planSearch, setPlanSearch] = useState('');
  const [planStatusFilter, setPlanStatusFilter] = useState('ALL');

  // Asset search/filter states
  const [assetSearch, setAssetSearch] = useState('');
  const [assetStatusFilter, setAssetStatusFilter] = useState('ALL');

  // Gallery search/filter states
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryStatusFilter, setGalleryStatusFilter] = useState('ALL');

  // User search/filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Edit user modal state
  const [editingUser, setEditingUser] = useState(null);

  // Real database users state
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberPage, setMemberPage] = useState(1);
  const MEMBERS_PER_PAGE = 10;

  // Dynamic Subscription Plans state
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ code: '', name: '', price: 0, maxUsers: 1, description: '', active: true });

  // Mock 3D Assets Configurator
  const [assets, setAssets] = useState([
    { id: 1, name: 'Almond Nail Shape', type: 'SHAPE', file: 'almond_nail.gltf', status: 'ACTIVE', usage: 1240 },
    { id: 2, name: 'Coffin Nail Shape', type: 'SHAPE', file: 'coffin_nail.gltf', status: 'ACTIVE', usage: 980 },
    { id: 3, name: 'Stiletto Nail Shape', type: 'SHAPE', file: 'stiletto_nail.gltf', status: 'ACTIVE', usage: 820 },
    { id: 4, name: 'Pink Metallic Polish', type: 'TEXTURE', file: 'pink_metallic.png', status: 'ACTIVE', usage: 2450 },
    { id: 5, name: 'Black Matte Polish', type: 'TEXTURE', file: 'black_matte.png', status: 'ACTIVE', usage: 1890 },
    { id: 6, name: '3D Sakura Blossom Charm', type: 'CHARM', file: 'sakura_blossom.gltf', status: 'ACTIVE', usage: 720 },
    { id: 7, name: 'Gold Crown Gem', type: 'CHARM', file: 'crown_gem.gltf', status: 'INACTIVE', usage: 410 },
  ]);

  // Mock Gallery Moderation
  const [galleryDesigns, setGalleryDesigns] = useState([
    { id: 1, title: 'Sakura Pink Coffin', author: 'Hương Nail Studio', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80', reports: 0, status: 'APPROVED' },
    { id: 2, title: 'Goth Black Matte', author: 'Lê Nguyễn Minh Anh', image: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?w=500&q=80', reports: 3, status: 'PENDING' },
    { id: 3, title: 'Neon Y2K Party', author: 'Trần Thanh Tâm (Pro Tech)', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&q=80', reports: 0, status: 'APPROVED' },
    { id: 4, title: 'Soft Pastel Daisy', author: 'Trương Quỳnh Hoa', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80', reports: 1, status: 'PENDING' },
  ]);

  // Basic authentication and role protection
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchRequests();
    fetchMembers();
    fetchDashboardStats();
    fetchPlans();
  }, [user, navigate]);

  // Fetch real dashboard stats
  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch real subscription requests from backend
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/admin/subscriptions/requests`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Error loading upgrade requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Fetch real users from DB
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedMembers = data.map((u, idx) => ({
          id: u.id || idx,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.username,
          role: u.role || 'USER',
          status: u.status || 'ACTIVE',
          plan: u.currentPlan || 'FREE',
          date: u.createdAt ? u.createdAt : 'N/A'
        }));
        setMembers(mappedMembers);
      }
    } catch (err) {
      console.error('Error loading members from DB:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch plans from DB
  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/admin/plans`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Create or Update Plan
  const handleSavePlan = async (e, planData, isUpdate = false) => {
    e.preventDefault();
    try {
      const url = isUpdate 
        ? `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/admin/plans/${planData.code}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}/admin/plans`;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(planData)
      });

      if (res.ok) {
        alert(`Plan ${isUpdate ? 'updated' : 'created'} successfully!`);
        setEditingPlan(null);
        setIsCreatingPlan(false);
        fetchPlans();
      } else {
        const errorData = await res.text();
        alert('Error: ' + errorData);
      }
    } catch (err) {
      console.error(err);
      alert('Cannot connect to server');
    }
  };


  // Delete Plan
  const handleDeletePlan = async (code) => {
    if (!window.confirm(`Are you sure you want to permanently delete plan ${code}? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/admin/plans/${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        alert('Plan deleted successfully!');
        fetchPlans();
      } else {
        alert('Failed to delete plan.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  // Toggle Plan Status
  const handleTogglePlan = async (code) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/admin/plans/${code}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Approve / Reject actions for real subscription requests
  const handleRequestAction = async (id, action) => {
    const actionVi = action === 'approve' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionVi} this request?`)) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/admin/subscriptions/requests/${id}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        alert(`Successfully ${actionVi} request!`);
        fetchRequests();
      } else {
        alert('Server error occurred!');
      }
    } catch (err) {
      console.error(err);
      alert('Cannot connect to backend server!');
    }
  };

  // Toggle user state (Active/Suspended)
  const toggleMemberStatus = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    const newStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setMembers(members.map(m => m.id === id ? { ...m, status: newStatus } : m));
      } else {
        alert('Error updating status');
      }
    } catch (err) {
      console.error(err);
      alert('Cannot connect to server');
    }
  };

  // Submit User Edit
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          role: editingUser.role,
          currentPlan: editingUser.plan
        })
      });
      if (res.ok) {
        alert('Member info updated successfully!');
        setEditingUser(null);
        fetchMembers();
      } else {
        alert('Update failed!');
      }
    } catch(err) {
      alert('Server connection error!');
    }
  };

  // Toggle asset state (Active/Inactive) - Mock
  const toggleAssetStatus = (id) => {
    setAssets(assets.map(asset => {
      if (asset.id === id) {
        const newStatus = asset.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...asset, status: newStatus };
      }
      return asset;
    }));
  };

  // Moderation Gallery actions (Approve/Delete) - Mock
  const handleGalleryAction = (id, newStatus) => {
    setGalleryDesigns(galleryDesigns.map(design => {
      if (design.id === id) {
        return { ...design, status: newStatus };
      }
      return design;
    }));
  };

  // Filtered members list
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          member.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || member.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const totalMemberPages = Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE) || 1;
  const paginatedMembers = filteredMembers.slice(
    (memberPage - 1) * MEMBERS_PER_PAGE,
    memberPage * MEMBERS_PER_PAGE
  );
  const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;

  // Export Data to CSV
  const exportToCSV = () => {
    // 1. Create Summary Section
    let csvContent = "Nailform 3D Admin Report\n\n";
    csvContent += "--- DASHBOARD SUMMARY ---\n";
    if (dashboardStats) {
      csvContent += `Total Revenue (VND),${dashboardStats.totalRevenue}\n`;
      csvContent += `Total Salons (B2B),${dashboardStats.totalB2BSalons}\n`;
      csvContent += `Total Customers (B2C),${dashboardStats.totalB2CCustomers}\n`;
      csvContent += `Active Designs (Mock),${dashboardStats.activeDesigns}\n\n`;
      
      csvContent += "--- PLAN DISTRIBUTION ---\n";
      for (const [plan, count] of Object.entries(dashboardStats.planDistribution || {})) {
        csvContent += `${plan},${count}\n`;
      }
      csvContent += "\n";
    }

    // 2. Create Members Section
    csvContent += "--- MEMBER DIRECTORY ---\n";
    csvContent += "ID,Name,Email,Role,Plan,Status,Join Date\n";
    members.forEach(member => {
      const joinDate = member.date && member.date !== 'N/A' ? new Date(member.date).toLocaleDateString('vi-VN') : 'Lifetime';
      const name = member.name.replace(/,/g, ''); // prevent CSV breaking
      csvContent += `${member.id},${name},${member.email},${member.role},${member.plan},${member.status},${joinDate}\n`;
    });

    // 3. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nailform3d-report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.username.toLowerCase().includes(requestSearch.toLowerCase()) || String(req.id).includes(requestSearch);
    const matchesStatus = requestStatusFilter === 'ALL' || req.status === requestStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(planSearch.toLowerCase()) || plan.code.toLowerCase().includes(planSearch.toLowerCase());
    const matchesStatus = planStatusFilter === 'ALL' || (planStatusFilter === 'ACTIVE' ? plan.active : !plan.active);
    return matchesSearch && matchesStatus;
  });

  const b2cPlans = filteredPlans.filter(p => p.maxUsers === 1);
  const b2bPlans = filteredPlans.filter(p => p.maxUsers > 1);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(assetSearch.toLowerCase());
    const matchesStatus = assetStatusFilter === 'ALL' || asset.status === assetStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredGallery = galleryDesigns.filter(design => {
    const matchesSearch = design.title.toLowerCase().includes(gallerySearch.toLowerCase()) || design.author.toLowerCase().includes(gallerySearch.toLowerCase());
    const matchesStatus = galleryStatusFilter === 'ALL' || design.status === galleryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-dashboard-container">
      <Navbar />

      <div className="admin-layout">
        {/* Modern Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <i className="fa-solid fa-screwdriver-wrench"></i>
            <h3>Nailform 3D</h3>
          </div>

          <nav className="admin-sidebar-menu">
            <button 
              className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fa-solid fa-chart-pie"></i>
              <span>Overview</span>
            </button>

            <button 
              className={`admin-menu-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <i className="fa-solid fa-signature"></i>
              <span>Subscription Approvals</span>
              {requests.filter(r => r.status === 'PENDING').length > 0 && (
                <span style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  padding: '2px 7px', 
                  borderRadius: '10px', 
                  marginLeft: 'auto' 
                }}>{requests.filter(r => r.status === 'PENDING').length}</span>
              )}
            </button>

            <button 
              className={`admin-menu-item ${activeTab === 'manage_plans' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage_plans')}
            >
              <i className="fa-solid fa-tags"></i>
              <span>Manage Plans</span>
            </button>

            <button 
              className={`admin-menu-item ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              <i className="fa-solid fa-users-gear"></i>
              <span>Manage Members</span>
            </button>

            <button 
              className={`admin-menu-item ${activeTab === 'assets' ? 'active' : ''}`}
              onClick={() => setActiveTab('assets')}
            >
              <i className="fa-solid fa-cubes"></i>
              <span>3D Assets</span>
            </button>

            <button 
              className={`admin-menu-item ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              <i className="fa-solid fa-images"></i>
              <span>Gallery Moderation</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-content">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h2>Overview Dashboard</h2>
                  <p>Monitor growth metrics and manage Nailform 3D's Beauty-Tech SaaS model.</p>
                </div>
                <button 
                  onClick={exportToCSV}
                  className="signup-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', height: 'fit-content' }}
                >
                  <i className="fa-solid fa-file-csv"></i> Export Report
                </button>
              </div>

              {/* Stats Cards */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">SaaS Revenue (ARR)</span>
                    <div className="admin-stat-icon-wrapper purple">
                      <i className="fa-solid fa-wallet"></i>
                    </div>
                  </div>
                  <div className="admin-stat-body">
                    <span className="admin-stat-number">
                      {isLoadingStats ? '...' : dashboardStats ? dashboardStats.totalRevenue.toLocaleString() + ' VND' : '0 VND'}
                    </span>
                    
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Total B2B Salons</span>
                    <div className="admin-stat-icon-wrapper blue">
                      <i className="fa-solid fa-shop"></i>
                    </div>
                  </div>
                  <div className="admin-stat-body">
                    <span className="admin-stat-number">
                      {isLoadingStats ? '...' : dashboardStats ? dashboardStats.totalB2BSalons + ' Salon' : '0 Salon'}
                    </span>
                    
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Active 3D Designs</span>
                    <div className="admin-stat-icon-wrapper emerald">
                      <i className="fa-solid fa-cubes"></i>
                    </div>
                  </div>
                  <div className="admin-stat-body">
                    <span className="admin-stat-number">
                      {isLoadingStats ? '...' : dashboardStats ? dashboardStats.activeDesigns + ' designs' : '0 designs'}
                    </span>
                    
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Total Active Users</span>
                    <div className="admin-stat-icon-wrapper amber">
                      <i className="fa-solid fa-user-check"></i>
                    </div>
                  </div>
                  <div className="admin-stat-body">
                    <span className="admin-stat-number">
                      {isLoadingStats ? '...' : dashboardStats ? dashboardStats.totalB2CCustomers + ' Users' : '0 Users'}
                    </span>
                    
                  </div>
                </div>
              </div>

              {/* Graphs & Distributions */}
              <div className="admin-grid-2col">

                <div className="admin-content-card">
                  <div className="admin-card-header">
                    <h3>Subscription Plan Distribution</h3>
                  </div>
                  <div className="admin-plan-distribution">
                    {(() => {
                      if (!dashboardStats || !dashboardStats.planDistribution) return <p style={{color: 'var(--admin-text-muted)'}}>Loading data...</p>;
                      
                      const plans = dashboardStats.planDistribution;
                      const totalPaidUsers = Object.values(plans).reduce((a, b) => a + b, 0) - (plans['FREE'] || 0);
                      const getPercent = (count) => totalPaidUsers > 0 ? Math.round((count / totalPaidUsers) * 100) : 0;

                      return (
                        <>
                          <div className="admin-plan-bar-item">
                            <div className="admin-plan-bar-info">
                              <span>B2C Pro (299k/year)</span>
                              <span>{getPercent(plans['PRO'] || 0)}% ({plans['PRO'] || 0} users)</span>
                            </div>
                            <div className="admin-plan-bar-bg">
                              <div className="admin-plan-bar-fill" style={{ width: `${getPercent(plans['PRO'] || 0)}%`, background: 'linear-gradient(90deg, #c084fc, #a855f7)' }}></div>
                            </div>
                          </div>

                          <div className="admin-plan-bar-item">
                            <div className="admin-plan-bar-info">
                              <span>B2C Premium (499k/year)</span>
                              <span>{getPercent(plans['PREMIUM'] || 0)}% ({plans['PREMIUM'] || 0} users)</span>
                            </div>
                            <div className="admin-plan-bar-bg">
                              <div className="admin-plan-bar-fill" style={{ width: `${getPercent(plans['PREMIUM'] || 0)}%`, background: 'linear-gradient(90deg, #818cf8, #4f46e5)' }}></div>
                            </div>
                          </div>

                          <div className="admin-plan-bar-item">
                            <div className="admin-plan-bar-info">
                              <span>B2B Studio (5 users - 1.79M)</span>
                              <span>{getPercent(plans['STUDIO_5'] || 0)}% ({plans['STUDIO_5'] || 0} users)</span>
                            </div>
                            <div className="admin-plan-bar-bg">
                              <div className="admin-plan-bar-fill" style={{ width: `${getPercent(plans['STUDIO_5'] || 0)}%`, background: 'linear-gradient(90deg, #60a5fa, #2563eb)' }}></div>
                            </div>
                          </div>

                          <div className="admin-plan-bar-item">
                            <div className="admin-plan-bar-info">
                              <span>B2B Studio (10 users - 2.99M)</span>
                              <span>{getPercent(plans['STUDIO_10'] || 0)}% ({plans['STUDIO_10'] || 0} users)</span>
                            </div>
                            <div className="admin-plan-bar-bg">
                              <div className="admin-plan-bar-fill" style={{ width: `${getPercent(plans['STUDIO_10'] || 0)}%`, background: 'linear-gradient(90deg, #0ea5e9, #0284c7)' }}></div>
                            </div>
                          </div>

                          <div className="admin-plan-bar-item">
                            <div className="admin-plan-bar-info">
                              <span>B2B Academy (20 users - 4.99M)</span>
                              <span>{getPercent(plans['ACADEMY_20'] || 0)}% ({plans['ACADEMY_20'] || 0} users)</span>
                            </div>
                            <div className="admin-plan-bar-bg">
                              <div className="admin-plan-bar-fill" style={{ width: `${getPercent(plans['ACADEMY_20'] || 0)}%`, background: 'linear-gradient(90deg, #fbbf24, #d97706)' }}></div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: SUBSCRIPTION APPROVALS */}
          {activeTab === 'subscriptions' && (
            <>
              <div className="admin-page-header">
                <h2>SaaS Subscription Approvals</h2>
                <p>Moderate B2C and B2B VIP plan requests via bank transfer invoices.</p>
              </div>

              <div className="admin-content-card">
                <div className="admin-card-header">
                  <h3>All Requests ({requests.length}) / Pending ({requests.filter(r => r.status === 'PENDING').length})</h3>
                  <button 
                    onClick={fetchRequests} 
                    className="admin-filter-btn"
                    style={{ border: '1px solid var(--admin-border)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', background: 'white' }}
                  >
                    <i className="fa-solid fa-arrows-rotate"></i> Refresh
                  </button>
                </div>

                
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Subscription Plan</th>
                        <th>Request Date</th>
                        <th>Transfer Proof</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingRequests ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading live data from server...</td></tr>
                      ) : filteredRequests.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                          <i className="fa-solid fa-circle-check" style={{ fontSize: '24px', color: '#10b981', display: 'block', marginBottom: '10px' }}></i>
                          No subscription requests found.
                        </td></tr>
                      ) : (
                        filteredRequests.map(req => (
                          <tr key={req.id}>
                            <td>
                              <div className="admin-avatar-info">
                                <div className="admin-avatar-placeholder">
                                  {req.username.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <strong>{req.username}</strong>
                                  <span style={{ fontSize: '11px', display: 'block', color: 'var(--admin-text-muted)' }}>ID: #{req.id}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`admin-badge ${req.requestedPlan.includes('B2B') ? 'purple' : 'blue'}`}>
                                {req.requestedPlan}
                              </span>
                            </td>
                            <td>{new Date(req.createdAt || Date.now()).toLocaleString('vi-VN')}</td>
                            <td>
                              <button 
                                onClick={() => setSelectedSlip({
                                  username: req.username,
                                  plan: req.requestedPlan,
                                  amount: req.requestedPlan === 'B2C_PREMIUM' ? '499,000 VND' : 
                                          req.requestedPlan === 'B2C_PRO' ? '299,000 VND' :
                                          req.requestedPlan === 'B2B_STUDIO_5' ? '1,790,000 VND' :
                                          req.requestedPlan === 'B2B_STUDIO_10' ? '2,990,000 VND' :
                                          req.requestedPlan === 'B2B_ACADEMY_20' ? '4,990,000 VND' : 'N/A'
                                })}
                                style={{ background: '#f1f5f9', border: '1px solid var(--admin-border)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              >
                                <i className="fa-solid fa-receipt"></i> View transfer invoice
                              </button>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {req.status === 'PENDING' ? (
                                <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                  <button 
                                    className="admin-btn-icon approve"
                                    onClick={() => handleRequestAction(req.id, 'approve')}
                                    title="Approve"
                                  >
                                    <i className="fa-solid fa-check"></i>
                                  </button>
                                  <button 
                                    className="admin-btn-icon reject"
                                    onClick={() => handleRequestAction(req.id, 'reject')}
                                    title="Reject"
                                  >
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                </div>
                              ) : (
                                <span className={`admin-badge ${req.status === 'APPROVED' ? 'emerald' : 'rose'}`}>
                                  {req.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </>
          )}

          {/* TAB: MANAGE PLANS */}
          {activeTab === 'manage_plans' && (
            <>
              <div className="admin-page-header">
                <h2>Manage Subscription Plans</h2>
                <p>Add, edit, or toggle visibility of subscription plans in the system.</p>
                <button 
                  onClick={() => setIsCreatingPlan(true)}
                  className="signup-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', height: 'fit-content', marginTop: '10px' }}
                >
                  <i className="fa-solid fa-plus"></i> Add New Plan
                </button>
              </div>

              {isCreatingPlan || editingPlan ? (
                <div className="admin-content-card" style={{ marginBottom: '20px' }}>
                  <div className="admin-card-header">
                    <h3>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                    <button 
                      onClick={() => { setEditingPlan(null); setIsCreatingPlan(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
                    >
                      <i className="fa-solid fa-xmark fa-lg"></i>
                    </button>
                  </div>
                  <form onSubmit={(e) => handleSavePlan(e, editingPlan || newPlan, !!editingPlan)} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                        Plan Code (Unique ID)
                        <input type="text" value={editingPlan ? editingPlan.code : newPlan.code} onChange={e => editingPlan ? setEditingPlan({...editingPlan, code: e.target.value}) : setNewPlan({...newPlan, code: e.target.value})} disabled={!!editingPlan} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border)' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                        Display Name
                        <input type="text" value={editingPlan ? editingPlan.name : newPlan.name} onChange={e => editingPlan ? setEditingPlan({...editingPlan, name: e.target.value}) : setNewPlan({...newPlan, name: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border)' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                        Price (VND)
                        <input type="number" value={editingPlan ? editingPlan.price : newPlan.price} onChange={e => editingPlan ? setEditingPlan({...editingPlan, price: Number(e.target.value)}) : setNewPlan({...newPlan, price: Number(e.target.value)})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border)' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                        Max Users
                        <input type="number" value={editingPlan ? editingPlan.maxUsers : newPlan.maxUsers} onChange={e => editingPlan ? setEditingPlan({...editingPlan, maxUsers: Number(e.target.value)}) : setNewPlan({...newPlan, maxUsers: Number(e.target.value)})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border)' }} />
                      </label>
                    </div>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                      Description
                      <input type="text" value={editingPlan ? editingPlan.description : newPlan.description} onChange={e => editingPlan ? setEditingPlan({...editingPlan, description: e.target.value}) : setNewPlan({...newPlan, description: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border)' }} />
                    </label>
                    <button type="submit" className="login-btn" style={{ width: 'fit-content' }}>
                      {editingPlan ? 'Update Plan' : 'Save Plan'}
                    </button>
                  </form>
                </div>
              ) : null}

              
              <div className="admin-content-card">
                {/* Search and Filters */}
                <div className="admin-controls-row">
                  <div className="admin-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                      type="text" 
                      className="admin-search-input" 
                      placeholder="Search plan by name or code..." 
                      value={planSearch}
                      onChange={(e) => setPlanSearch(e.target.value)}
                    />
                  </div>
                  <div className="admin-filter-tabs">
                    <button className={`admin-filter-btn ${planStatusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setPlanStatusFilter('ALL')}>All</button>
                    <button className={`admin-filter-btn ${planStatusFilter === 'ACTIVE' ? 'active' : ''}`} onClick={() => setPlanStatusFilter('ACTIVE')}>Active</button>
                    <button className={`admin-filter-btn ${planStatusFilter === 'HIDDEN' ? 'active' : ''}`} onClick={() => setPlanStatusFilter('HIDDEN')}>Hidden</button>
                  </div>
                </div>

                <div className="admin-table-container" style={{ marginBottom: '30px' }}>
                  <h4 style={{ padding: '15px 20px', margin: 0, borderBottom: '1px solid var(--admin-border)', background: '#f8fafc' }}>
                    <i className="fa-solid fa-user"></i> B2C Plans (Individual Users)
                  </h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Plan Code</th>
                        <th>Name</th>
                        <th>Price (VND)</th>
                        <th>Max Users</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingPlans ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading plans...</td></tr>
                      ) : b2cPlans.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No plans available.</td></tr>
                      ) : (
                        b2cPlans.map(plan => (
                          <tr key={plan.code}>
                            <td><strong>{plan.code}</strong></td>
                            <td>{plan.name}</td>
                            <td>{plan.price.toLocaleString()} VND</td>
                            <td>{plan.maxUsers} Users</td>
                            <td>
                              <span className={`admin-badge ${plan.active ? 'emerald' : 'rose'}`}>
                                {plan.active ? 'ACTIVE' : 'HIDDEN'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                <button className="admin-btn-icon edit" onClick={() => setEditingPlan(plan)} title="Edit">
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button className="admin-btn-icon block" onClick={() => handleTogglePlan(plan.code)} title="Toggle Visibility" style={{ background: plan.active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: plan.active ? '#f59e0b' : '#10b981' }}>
                                  <i className={`fa-solid ${plan.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                                <button className="admin-btn-icon" onClick={() => handleDeletePlan(plan.code)} title="Delete Plan" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="admin-table-container">
                  <h4 style={{ padding: '15px 20px', margin: 0, borderBottom: '1px solid var(--admin-border)', background: '#f8fafc' }}>
                    <i className="fa-solid fa-shop"></i> B2B Plans (Salons & Studios)
                  </h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Plan Code</th>
                        <th>Name</th>
                        <th>Price (VND)</th>
                        <th>Max Users</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingPlans ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading plans...</td></tr>
                      ) : b2bPlans.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No plans available.</td></tr>
                      ) : (
                        b2bPlans.map(plan => (
                          <tr key={plan.code}>
                            <td><strong>{plan.code}</strong></td>
                            <td>{plan.name}</td>
                            <td>{plan.price.toLocaleString()} VND</td>
                            <td>{plan.maxUsers} Users</td>
                            <td>
                              <span className={`admin-badge ${plan.active ? 'emerald' : 'rose'}`}>
                                {plan.active ? 'ACTIVE' : 'HIDDEN'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                <button className="admin-btn-icon edit" onClick={() => setEditingPlan(plan)} title="Edit">
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button className="admin-btn-icon block" onClick={() => handleTogglePlan(plan.code)} title="Toggle Visibility" style={{ background: plan.active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: plan.active ? '#f59e0b' : '#10b981' }}>
                                  <i className={`fa-solid ${plan.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                                <button className="admin-btn-icon" onClick={() => handleDeletePlan(plan.code)} title="Delete Plan" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: MEMBER DIRECTORY */}
          {activeTab === 'members' && (
            <>
              <div className="admin-page-header">
                <h2>Manage Members & Salons</h2>
                <p>Information list, B2C account tiers, and B2B nail salon/technician partners.</p>
                <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold', color: 'var(--admin-primary)' }}>
                  Total Members: {members.length} | Active: {activeMembersCount}
                </div>
              </div>

              <div className="admin-content-card">
                {/* Search and Filters */}
                <div className="admin-controls-row">
                  <div className="admin-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                      type="text" 
                      className="admin-search-input" 
                      placeholder="Search by name, email..." 
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setMemberPage(1); }}
                    />
                  </div>

                  <div className="admin-filter-tabs">
                    <button 
                      className={`admin-filter-btn ${userRoleFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => { setUserRoleFilter('ALL'); setMemberPage(1); }}
                    >All</button>
                    <button 
                      className={`admin-filter-btn ${userRoleFilter === 'USER' ? 'active' : ''}`}
                      onClick={() => { setUserRoleFilter('USER'); setMemberPage(1); }}
                    >Customers</button>
                    <button 
                      className={`admin-filter-btn ${userRoleFilter === 'SALON' ? 'active' : ''}`}
                      onClick={() => { setUserRoleFilter('SALON'); setMemberPage(1); }}
                    >Salons</button>
                    <button 
                      className={`admin-filter-btn ${userRoleFilter === 'TECHNICIAN' ? 'active' : ''}`}
                      onClick={() => { setUserRoleFilter('TECHNICIAN'); setMemberPage(1); }}
                    >Techs</button>
                  </div>
                </div>

                {/* Table */}
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Member Name</th>
                        <th>Email</th>
                        <th>Account Type</th>
                        <th>Subscription Plan</th>
                        <th>Status</th>
                        <th>Join Date</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingMembers ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--admin-text-muted)' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading member list from Database...
                          </td>
                        </tr>
                      ) : paginatedMembers.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--admin-text-muted)' }}>
                            No members found.
                          </td>
                        </tr>
                      ) : (
                        paginatedMembers.map(member => (
                          <tr key={member.id}>
                            <td>
                              <div className="admin-avatar-info">
                                <div className="admin-avatar-placeholder">
                                  {member.name.split(' ').pop().slice(0, 2).toUpperCase()}
                                </div>
                                <strong>{member.name}</strong>
                              </div>
                            </td>
                            <td>{member.email}</td>
                            <td>
                              <span className={`admin-badge ${member.role === 'SALON' ? 'purple' : member.role === 'CUSTOMER' ? 'blue' : 'amber'}`}>
                                {member.role}
                              </span>
                            </td>
                            <td>
                              <span className="admin-badge purple">{member.plan}</span>
                            </td>
                            <td>
                              <span className={`admin-badge ${member.status === 'ACTIVE' ? 'emerald' : 'rose'}`}>
                                {member.status}
                              </span>
                            </td>
                            <td>
                              {member.date && member.date !== 'N/A' 
                                ? new Date(member.date).toLocaleDateString('vi-VN') 
                                : 'Lifetime'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                <button 
                                  className="admin-btn-icon edit" 
                                  onClick={() => setEditingUser(member)}
                                  title="Edit"
                                >
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button 
                                  className="admin-btn-icon block" 
                                  onClick={() => toggleMemberStatus(member.id)}
                                  title={member.status === 'ACTIVE' ? 'Lock account' : 'Activate account'}
                                  style={{ background: member.status === 'ACTIVE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: member.status === 'ACTIVE' ? '#f59e0b' : '#10b981' }}
                                >
                                  <i className={`fa-solid ${member.status === 'ACTIVE' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {!isLoadingMembers && totalMemberPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid var(--admin-border)', background: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                      Showing {(memberPage - 1) * MEMBERS_PER_PAGE + 1} to {Math.min(memberPage * MEMBERS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length} entries
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        disabled={memberPage === 1}
                        onClick={() => setMemberPage(prev => Math.max(prev - 1, 1))}
                        style={{ padding: '6px 12px', border: '1px solid var(--admin-border)', background: memberPage === 1 ? '#f1f5f9' : 'white', borderRadius: '6px', cursor: memberPage === 1 ? 'not-allowed' : 'pointer', opacity: memberPage === 1 ? 0.5 : 1 }}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <span style={{ padding: '6px 12px', background: 'var(--admin-primary)', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                        {memberPage} / {totalMemberPages}
                      </span>
                      <button 
                        disabled={memberPage === totalMemberPages}
                        onClick={() => setMemberPage(prev => Math.min(prev + 1, totalMemberPages))}
                        style={{ padding: '6px 12px', border: '1px solid var(--admin-border)', background: memberPage === totalMemberPages ? '#f1f5f9' : 'white', borderRadius: '6px', cursor: memberPage === totalMemberPages ? 'not-allowed' : 'pointer', opacity: memberPage === totalMemberPages ? 0.5 : 1 }}
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 4: 3D ASSETS */}
          {activeTab === 'assets' && (
            <>
              <div className="admin-page-header">
                <h2>Manage 3D Configurator Assets</h2>
                <p>Manage 3D assets including nail shapes, paint colors (textures) and nail charms loaded in real-time.</p>
              </div>

              <div className="admin-content-card">
                <div className="admin-card-header">
                  <h3>System 3D Assets Library ({assets.length})</h3>
                  <button 
                    onClick={() => alert('Add new 3D model (.gltf) / Texture (.png) for configurator')} 
                    className="signup-btn"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Add New Asset
                  </button>
                </div>

                <div className="admin-assets-grid">
                  {filteredAssets.map(asset => (
                    <div className="admin-asset-card" key={asset.id}>
                      <div className="admin-asset-preview">
                        {asset.type === 'SHAPE' ? (
                          <i className="fa-solid fa-hand-dots" style={{ color: 'var(--admin-primary)' }}></i>
                        ) : asset.type === 'TEXTURE' ? (
                          <i className="fa-solid fa-palette" style={{ color: 'var(--admin-secondary)' }}></i>
                        ) : (
                          <i className="fa-solid fa-gem" style={{ color: '#10b981' }}></i>
                        )}
                      </div>
                      <div className="admin-asset-details">
                        <h4>{asset.name}</h4>
                        <p><strong>Type:</strong> {asset.type} | <strong>Source File:</strong> `{asset.file}`</p>
                        <p><strong>Design applications:</strong> {asset.usage.toLocaleString()} times</p>
                      </div>
                      <div className="admin-asset-actions">
                        <span className={`admin-badge ${asset.status === 'ACTIVE' ? 'emerald' : 'rose'}`}>
                          {asset.status}
                        </span>
                        <div className="admin-action-btn-group">
                          <button 
                            className="admin-btn-icon edit"
                            onClick={() => alert(`Update 3D file for: ${asset.name}`)}
                          >
                            <i className="fa-solid fa-arrow-up-from-bracket"></i>
                          </button>
                          <button 
                            className="admin-btn-icon block"
                            onClick={() => toggleAssetStatus(asset.id)}
                            style={{ background: asset.status === 'ACTIVE' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: asset.status === 'ACTIVE' ? '#f43f5e' : '#10b981' }}
                          >
                            <i className={`fa-solid ${asset.status === 'ACTIVE' ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 5: GALLERY MODERATION */}
          {activeTab === 'gallery' && (
            <>
              <div className="admin-page-header">
                <h2>Community Gallery Moderation</h2>
                <p>Review, approve or hide 3D nail designs shared by users to the Community Gallery, handle community standard violation reports.</p>
              </div>

              <div className="admin-content-card">
                <div className="admin-card-header">
                  <h3>List of shared posts for moderation</h3>
                </div>

                <div className="admin-gallery-grid">
                  {filteredGallery.map(design => (
                    <div className="admin-gallery-card" key={design.id}>
                      <img src={design.image} alt={design.title} className="admin-gallery-img" />
                      
                      <div className="admin-gallery-overlay">
                        <span className={`admin-badge ${design.status === 'APPROVED' ? 'emerald' : 'amber'}`}>
                          {design.status}
                        </span>
                      </div>

                      <div className="admin-gallery-body">
                        <h4>{design.title}</h4>
                        <div className="admin-gallery-author">
                          <i className="fa-solid fa-circle-user"></i>
                          <span>Designed by: <strong>{design.author}</strong></span>
                        </div>

                        {design.reports > 0 && (
                          <div className="admin-gallery-report-badge">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <span>Reported: {design.reports} times</span>
                          </div>
                        )}
                      </div>

                      <div className="admin-gallery-actions">
                        <div className="admin-action-btn-group" style={{ width: '100%', justifyContent: 'space-between' }}>
                          <button 
                            className="admin-btn-icon approve"
                            onClick={() => handleGalleryAction(design.id, 'APPROVED')}
                            style={{ flex: 1, marginRight: '4px', borderRadius: '8px' }}
                            title="Approve to Gallery"
                          >
                            <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i> Approve
                          </button>
                          <button 
                            className="admin-btn-icon reject"
                            onClick={() => handleGalleryAction(design.id, 'DELETED')}
                            style={{ flex: 1, marginLeft: '4px', borderRadius: '8px' }}
                            title="Delete/Hide post"
                          >
                            <i className="fa-solid fa-trash-can" style={{ marginRight: '6px' }}></i> Hide
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* Slip Mock Invoice Modal */}
      {selectedSlip && (
        <div className="admin-slip-modal-backdrop" onClick={() => setSelectedSlip(null)}>
          <div className="admin-slip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-slip-header">
              <h3>Transfer Proof</h3>
              <button className="admin-close-modal-btn" onClick={() => setSelectedSlip(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="admin-slip-img-container">
              <div className="admin-slip-mock-invoice">
                <div className="admin-slip-mock-header">
                  <div className="admin-slip-mock-bank">MB BANK</div>
                  <div className="admin-slip-mock-success"><i className="fa-solid fa-circle-check"></i> Transaction Successful</div>
                </div>

                <div className="admin-slip-mock-row">
                  <span>Sender:</span>
                  <strong>{selectedSlip.username}</strong>
                </div>

                <div className="admin-slip-mock-row">
                  <span>Receiver:</span>
                  <strong>NAILFORM 3D CO.</strong>
                </div>

                <div className="admin-slip-mock-row">
                  <span>Transfer Description:</span>
                  <strong>Nailform3D Upgrade {selectedSlip.plan}</strong>
                </div>

                <div className="admin-slip-mock-row">
                  <span>Transaction Code (FT):</span>
                  <strong>FT261472901740921</strong>
                </div>

                <div className="admin-slip-mock-row amount">
                  <span>Amount:</span>
                  <span>{selectedSlip.amount}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  alert('Payment recorded successfully!');
                  setSelectedSlip(null);
                }}
                className="signup-btn" 
                style={{ flex: 1, padding: '12px' }}
              >
                Confirm payment matched
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="admin-slip-modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="admin-slip-modal" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-slip-header">
              <h3>Edit Information</h3>
              <button className="admin-close-modal-btn" onClick={() => setEditingUser(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleEditUserSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>First Name</label>
                <input 
                  type="text" 
                  value={editingUser.firstName} 
                  onChange={e => setEditingUser({...editingUser, firstName: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Last Name</label>
                <input 
                  type="text" 
                  value={editingUser.lastName} 
                  onChange={e => setEditingUser({...editingUser, lastName: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="USER">Customer (USER)</option>
                  <option value="SALON">Nail Salon (SALON)</option>
                  <option value="ADMIN">Admin (ADMIN)</option>
                </select>
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Subscription Plan</label>
                <select 
                  value={editingUser.plan} 
                  onChange={e => setEditingUser({...editingUser, plan: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="FREE">FREE</option>
                  <option value="B2C_PRO">B2C_PRO</option>
                  <option value="B2C_PREMIUM">B2C_PREMIUM</option>
                  <option value="B2B_STUDIO_5">B2B_STUDIO_5</option>
                  <option value="B2B_STUDIO_10">B2B_STUDIO_10</option>
                  <option value="B2B_ACADEMY_20">B2B_ACADEMY_20</option>
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: 'var(--admin-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
