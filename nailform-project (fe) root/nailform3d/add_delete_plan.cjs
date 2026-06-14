const fs = require('fs');
const file = 'd:/nailform3d be-fe/nailform-project (fe) root/nailform3d/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add handleDeletePlan
const deleteLogic = `
  // Delete Plan
  const handleDeletePlan = async (code) => {
    if (!window.confirm(\`Are you sure you want to permanently delete plan \${code}? This action cannot be undone.\`)) return;
    
    try {
      const res = await fetch(\`http://localhost:8080/identity/admin/plans/\${code}\`, {
        method: 'DELETE',
        headers: {
          'Authorization': \`Bearer \${user.token}\`
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

  // Toggle Plan Status`;

content = content.replace("  // Toggle Plan Status", deleteLogic);

// 2. Add delete button to B2C plans
content = content.replace(
  /<button className="admin-btn-icon block" onClick=\{\(\) => handleTogglePlan\(plan.code\)\} title="Toggle Visibility"[^>]*>[\s\S]*?<\/button>/g,
  `$&
                                <button className="admin-btn-icon" onClick={() => handleDeletePlan(plan.code)} title="Delete Plan" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                  <i className="fa-solid fa-trash"></i>
                                </button>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully added delete plan functionality to AdminDashboard.jsx');
