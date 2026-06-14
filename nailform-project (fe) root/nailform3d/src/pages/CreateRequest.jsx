import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { designData, thumbnailBase64 } = location.state || {};

  const [loc, setLoc] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!loc) {
      toast.warn("Please enter a location");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          location: loc,
          description: description,
          thumbnailBase64: thumbnailBase64,
          designData: JSON.stringify(designData)
        })
      });

      if (response.ok) {
        toast.success("Your design has been published successfully! Salons will contact you soon.");
        setTimeout(() => navigate('/social'), 1500); // Redirect to social feed
      } else if (response.status === 401) {
        toast.error("Your session has expired. Please log in again to publish your design.");
        setTimeout(() => navigate('/login'), 1500);
      } else if (response.status === 403) {
        toast.error("You have reached the limit of 3 custom designs per month for the Pro plan.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || errorData.error || "Failed to publish design. Please try again.");
      }
    } catch (error) {
      console.error("Error publishing request:", error);
      toast.error("An error occurred. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!designData) {
    return (
      <div style={styles.container}>
        <h2>No design data found.</h2>
        <button onClick={() => navigate('/3d-configurator')} style={styles.btn}>Go back to 3D Editor</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Publish Your Design</h1>
        <p style={styles.subtitle}>Send your 3D design to salons for quoting</p>
        
        <div style={styles.content}>
          <div style={styles.imageCol}>
            {thumbnailBase64 ? (
              <img src={thumbnailBase64} alt="3D Design" style={styles.image} />
            ) : (
              <div style={styles.imagePlaceholder}>No Image Captured</div>
            )}
            <div style={styles.designSpecs}>
              <h3 style={{marginTop: 0, marginBottom: 10}}>Design Specs</h3>
              <p style={styles.specRow}>
                <span>Skin Color:</span> 
                <span style={{display: 'inline-block', width: 20, height: 20, backgroundColor: designData.skinColor, borderRadius: '50%', border: '1px solid #ccc'}}></span>
              </p>
              <p style={styles.specRow}>
                <span>Base Color:</span> 
                <span style={{display: 'inline-block', width: 20, height: 20, backgroundColor: designData.baseNailColor, borderRadius: '50%', border: '1px solid #ccc'}}></span>
              </p>
              <p style={styles.specRow}>
                <span>Charms Attached:</span> 
                <strong>{designData.placedCharms?.length || 0} items</strong>
              </p>
            </div>
          </div>
          
          <div style={styles.formCol}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Where do you want to get this done? *</label>
              <input 
                style={styles.input} 
                type="text" 
                placeholder="e.g. District 1, Ho Chi Minh City" 
                value={loc}
                onChange={e => setLoc(e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Additional Notes (Optional)</label>
              <textarea 
                style={styles.textarea} 
                placeholder="I need this done by this weekend for a party. I prefer high-quality gel..." 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            <button onClick={handlePublish} style={styles.publishBtn} disabled={loading}>
              {loading ? "Publishing..." : "Publish Request"}
            </button>
            <button onClick={() => navigate(-1)} style={styles.cancelBtn}>Cancel & Go Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f4f4f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', sans-serif"
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    padding: '40px',
    maxWidth: '900px',
    width: '100%'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    margin: '0 0 32px 0',
    color: '#64748b',
    fontSize: '16px'
  },
  content: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap'
  },
  imageCol: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formCol: {
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  image: {
    width: '100%',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    width: '100%',
    height: '300px',
    background: '#f1f5f9',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontWeight: '500'
  },
  designSpecs: {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '16px',
    fontSize: '15px',
    color: '#334155',
    border: '1px solid #e2e8f0'
  },
  specRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '8px 0',
    fontWeight: '500'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '14px'
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  textarea: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '16px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  publishBtn: {
    background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cancelBtn: {
    background: 'transparent',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  btn: {
    padding: '12px 24px',
    background: '#1e293b',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};
