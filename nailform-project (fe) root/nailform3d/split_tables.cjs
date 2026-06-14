const fs = require('fs');
const file = 'd:/nailform3d be-fe/nailform-project (fe) root/nailform3d/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add b2cPlans and b2bPlans
content = content.replace(
  "  const filteredAssets = assets.filter(asset => {",
  "  const b2cPlans = filteredPlans.filter(p => p.maxUsers === 1);\n  const b2bPlans = filteredPlans.filter(p => p.maxUsers > 1);\n\n  const filteredAssets = assets.filter(asset => {"
);

// 2. Replace the single table with two tables
const newTables = `
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
                              <span className={\`admin-badge \${plan.active ? 'emerald' : 'rose'}\`}>
                                {plan.active ? 'ACTIVE' : 'HIDDEN'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                <button className="admin-btn-icon edit" onClick={() => setEditingPlan(plan)} title="Edit">
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button className="admin-btn-icon block" onClick={() => handleTogglePlan(plan.code)} title="Toggle Visibility" style={{ background: plan.active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: plan.active ? '#f59e0b' : '#10b981' }}>
                                  <i className={\`fa-solid \${plan.active ? 'fa-eye-slash' : 'fa-eye'}\`}></i>
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
                              <span className={\`admin-badge \${plan.active ? 'emerald' : 'rose'}\`}>
                                {plan.active ? 'ACTIVE' : 'HIDDEN'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                <button className="admin-btn-icon edit" onClick={() => setEditingPlan(plan)} title="Edit">
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button className="admin-btn-icon block" onClick={() => handleTogglePlan(plan.code)} title="Toggle Visibility" style={{ background: plan.active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: plan.active ? '#f59e0b' : '#10b981' }}>
                                  <i className={\`fa-solid \${plan.active ? 'fa-eye-slash' : 'fa-eye'}\`}></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
`;
content = content.replace(
  /<div className="admin-table-container">[\s\S]*?<\/div>\s*<\/div>\s*<\/>\s*\)}/m,
  newTables + '\n              </div>\n            </>\n          )}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated AdminDashboard.jsx with 2 tables');
