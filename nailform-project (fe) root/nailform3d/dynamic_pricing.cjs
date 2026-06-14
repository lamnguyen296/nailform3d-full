const fs = require('fs');
const file = 'd:/nailform3d be-fe/nailform-project (fe) root/nailform3d/src/pages/Pricing.jsx';

const content = `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './Pricing.css';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = (plan) => {
    if (!user) {
      alert("You need to login to upgrade your plan!");
      navigate('/login');
      return;
    }
    // Redirect to specific payment page
    navigate('/payment', { state: { plan } });
  };

  const isCustomer = user?.role === 'USER';
  const isSalon = user?.role === 'SALON';
  const showB2C = !user || isCustomer || user?.role === 'ADMIN';
  const showB2B = !user || isSalon || user?.role === 'ADMIN';

  const [plans, setPlans] = useState([]);

  React.useEffect(() => {
    fetch('http://localhost:8080/identity/plans')
      .then(res => res.json())
      .then(data => setPlans(data.filter(p => p.active)))
      .catch(console.error);
  }, []);

  const renderUpgradeButton = (planCode, label) => {
    if (user && user.plan === planCode) {
      return (
        <button className="btn-upgrade" disabled style={{ background: '#e5e7eb', color: '#6b7280', border: 'none', cursor: 'not-allowed', boxShadow: 'none' }}>
          <i className="fa-solid fa-check-circle" style={{ marginRight: '6px', color: '#10b981' }}></i> Current Plan
        </button>
      );
    }
    return (
      <button className="btn-upgrade" onClick={() => handleUpgrade(planCode)}>
        {label}
      </button>
    );
  };

  // Helper to provide nice defaults for default plans
  const getPlanDetails = (plan) => {
    switch (plan.code) {
      case 'PRO':
        return {
          className: 'pro',
          features: [
            '3 designs storage per month',
            'Unlock advanced colors',
            'Basic Premium accessories',
            'Hand skin color customization',
            '360-degree video export'
          ]
        };
      case 'PREMIUM':
        return {
          className: 'premium',
          badge: 'BEST VALUE',
          features: [
            'Unlimited design storage',
            'Unlock all colors and materials',
            'Full set of Premium accessories',
            'Unlimited Cloud storage',
            'High quality 4K video export',
            '24/7 Priority Support'
          ]
        };
      case 'STUDIO_5':
        return {
          className: 'studio',
          features: [
            'Includes all Premium features',
            'Support up to 5 staff accounts',
            'Shared workspace',
            'Internal Studio design sharing',
            'Manager Dashboard'
          ]
        };
      case 'STUDIO_10':
        return {
          className: 'studio-10',
          features: [
            'All Studio 5 features',
            'Support up to 10 staff accounts',
            'Staff performance evaluation tools',
            'Priority Support'
          ]
        };
      case 'ACADEMY_20':
        return {
          className: 'academy',
          features: [
            'All Studio tier features',
            'Support up to 20 student accounts',
            'Curriculum and design assignment management',
            'Direct API integration for website',
            'Dedicated 1:1 Technical Support'
          ]
        };
      default:
        // For new dynamic plans added via Admin Dashboard
        return {
          className: plan.maxUsers === 1 ? 'pro' : 'studio',
          features: plan.description ? plan.description.split(',').map(s => s.trim()) : ['Standard features included', 'Premium support']
        };
    }
  };

  const b2cPlans = plans.filter(p => p.maxUsers === 1 && p.code !== 'FREE');
  const b2bPlans = plans.filter(p => p.maxUsers > 1);

  return (
    <div className="pricing-page">
      <Navbar />
      
      <div className="pricing-header">
        <h1>Unlock Creative Power</h1>
        <p>From beginners to professional studios. Choose the right plan to experience the ultimate 3D nail design technology.</p>
      </div>

      <div className="pricing-cards-container">
        {/* B2C PLANS */}
        {showB2C && b2cPlans.map(plan => {
          const details = getPlanDetails(plan);
          return (
            <div key={plan.code} className={\`pricing-card \${details.className}\`}>
              {details.badge && <div className="badge-popular">{details.badge}</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <span className="price-amount">{plan.price.toLocaleString()}</span>
                <span className="price-currency">VND</span>
                <span className="price-duration">/year</span>
              </div>
              <ul className="plan-features">
                {details.features.map((feature, idx) => (
                  <li key={idx}><i className="fa-solid fa-check"></i> {feature}</li>
                ))}
              </ul>
              {renderUpgradeButton(plan.code, \`Get \${plan.name}\`)}
            </div>
          );
        })}

        {/* B2B PLANS */}
        {showB2B && b2bPlans.map(plan => {
          const details = getPlanDetails(plan);
          return (
            <div key={plan.code} className={\`pricing-card \${details.className}\`}>
              {details.badge && <div className="badge-popular">{details.badge}</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <span className="price-amount">{plan.price.toLocaleString()}</span>
                <span className="price-currency">VND</span>
                <span className="price-duration">/year</span>
              </div>
              <ul className="plan-features">
                {details.features.map((feature, idx) => (
                  <li key={idx}><i className="fa-solid fa-check"></i> {feature}</li>
                ))}
              </ul>
              {renderUpgradeButton(plan.code, \`Contact for \${plan.name}\`)}
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully rewrote Pricing.jsx to map dynamically');
