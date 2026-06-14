import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SalonMembers.css';

export default function SalonMembers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    password: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const hasAccess = user.plan && (user.plan.startsWith('STUDIO') || user.plan.startsWith('ACADEMY') || user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');
    if (!hasAccess) {
      alert("Access denied. This page is only for B2B plan subscribers.");
      navigate('/');
      return;
    }
    fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon/members`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setMembers(await res.json());
      } else {
        console.error("Failed to fetch members");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon/members`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert("Member added successfully! An email with their credentials has been sent.");
        setShowAddModal(false);
        setFormData({ username: '', password: '', firstName: '', lastName: '' });
        fetchMembers();
      } else {
        const errorText = await res.text();
        let errorMsg = "Failed to add member";
        try {
          const json = JSON.parse(errorText);
          errorMsg = json.message || errorMsg;
        } catch {
          errorMsg = errorText || errorMsg;
        }
        alert(errorMsg);
      }
    } catch (e) {
      console.error(e);
      alert("Error adding member");
    }
  };

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setEditFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({...editFormData, [e.target.name]: e.target.value});
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify(editFormData)
      });
      
      if (res.ok) {
        alert("Member updated successfully!");
        setShowEditModal(false);
        fetchMembers();
      } else {
        const errorText = await res.text();
        let errorMsg = "Failed to update member";
        try {
          const json = JSON.parse(errorText);
          errorMsg = json.message || errorMsg;
        } catch {
          errorMsg = errorText || errorMsg;
        }
        alert(errorMsg);
      }
    } catch (e) {
      console.error(e);
      alert("Error updating member");
    }
  };

  const handleRemoveMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this member? Their account will be downgraded to the FREE plan.")) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/salon/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (res.ok) {
        alert("Member removed successfully.");
        fetchMembers();
      } else {
        alert("Failed to remove member.");
      }
    } catch (e) {
      console.error(e);
      alert("Error removing member.");
    }
  };

  const getMaxMembers = () => {
    if (!user || !user.plan) return 0;
    if (user.plan === 'STUDIO_5') return 5;
    if (user.plan === 'STUDIO_10') return 10;
    if (user.plan === 'ACADEMY_20') return 20;
    return 0;
  };

  const maxMembers = getMaxMembers();
  const currentMembers = members.length;
  const progressPercent = maxMembers > 0 ? (currentMembers / maxMembers) * 100 : 0;

  return (
    <div className="salon-members-page">
      <Navbar />
      
      <div className="salon-members-container">
        <div className="header-section">
          <div>
            <h1 className="page-title">Manage Members</h1>
            <p className="page-sub">Manage your technicians and students. They will have an independent design space and share Premium benefits.</p>
          </div>
          <button 
            className="btn-add-member" 
            onClick={() => setShowAddModal(true)}
            disabled={currentMembers >= maxMembers}
          >
            <i className="fa-solid fa-plus"></i> Add Member
          </button>
        </div>

        {/* Plan Usage Section */}
        <div className="usage-card">
          <div className="usage-header">
            <h3>Plan Usage ({user?.plan?.replace(/_/g, ' ')})</h3>
            <span>{currentMembers} / {maxMembers} members</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className={`progress-bar-fill ${progressPercent >= 100 ? 'full' : ''}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {currentMembers >= maxMembers && (
            <p className="usage-warning">You have reached the member limit for your plan. Please upgrade to add more members.</p>
          )}
        </div>

        {loading ? (
          <div className="loading-state">Loading members list...</div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No members yet</h3>
            <p>Add technicians or students to start designing 3D nails together.</p>
          </div>
        ) : (
          <div className="members-grid">
            {members.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  {member.firstName?.charAt(0) || member.username?.charAt(0)?.toUpperCase()}
                </div>
                <div className="member-info">
                  <h4 className="member-name">
                    {(member.firstName || member.lastName) ? `${member.firstName || ''} ${member.lastName || ''}`.trim() : member.username}
                  </h4>
                  <p className="member-username">@{member.username}</p>
                  <div className="member-badge">
                    <i className="fa-solid fa-crown"></i> Premium Shared
                  </div>
                </div>
                <div className="member-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditClick(member)}
                    title="Edit Member"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemoveMember(member.id)}
                    title="Remove Member"
                  >
                    <i className="fa-solid fa-user-minus"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add a new member</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAddMember} className="add-member-form">
              <div className="form-group">
                <label>Username (Email)</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Nguyễn"
                  />
                </div>
                <div className="form-group half">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Văn A"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="••••••••"
                />
                <small>The system will send an email with this password to the member.</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Member Details</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleUpdateMember} className="add-member-form">
              <div className="form-group">
                <label>Username (Email)</label>
                <input 
                  type="text" 
                  value={selectedMember?.username || ''} 
                  disabled 
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={editFormData.firstName} 
                    onChange={handleEditInputChange} 
                    required 
                  />
                </div>
                <div className="form-group half">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={editFormData.lastName} 
                    onChange={handleEditInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reset Password (Optional)</label>
                <input 
                  type="password" 
                  name="password" 
                  value={editFormData.password} 
                  onChange={handleEditInputChange} 
                  placeholder="Leave blank to keep current password"
                />
                <small>If you enter a new password, they will receive an email notification.</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
