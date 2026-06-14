const fs = require('fs');

const file = 'd:/nailform3d be-fe/nailform-project (fe) root/nailform3d/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
const statesToAdd = `
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
`;
content = content.replace(
  "  // User search/filter states",
  statesToAdd + "\n  // User search/filter states"
);

// 2. Add filter logic right before `return (`
const filterLogic = `
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
`;
content = content.replace(
  "  return (",
  filterLogic + "\n  return ("
);

// 3. Update Requests Tab
const requestsHeaderSearch = `
                {/* Search and Filters */}
                <div className="admin-controls-row">
                  <div className="admin-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                      type="text" 
                      className="admin-search-input" 
                      placeholder="Search by username or ID..." 
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                    />
                  </div>

                  <div className="admin-filter-tabs">
                    <button className={\`admin-filter-btn \${requestStatusFilter === 'ALL' ? 'active' : ''}\`} onClick={() => setRequestStatusFilter('ALL')}>All</button>
                    <button className={\`admin-filter-btn \${requestStatusFilter === 'PENDING' ? 'active' : ''}\`} onClick={() => setRequestStatusFilter('PENDING')}>Pending</button>
                    <button className={\`admin-filter-btn \${requestStatusFilter === 'APPROVED' ? 'active' : ''}\`} onClick={() => setRequestStatusFilter('APPROVED')}>Approved</button>
                    <button className={\`admin-filter-btn \${requestStatusFilter === 'REJECTED' ? 'active' : ''}\`} onClick={() => setRequestStatusFilter('REJECTED')}>Rejected</button>
                    <button 
                      onClick={fetchRequests} 
                      className="admin-filter-btn"
                      style={{ border: '1px solid var(--admin-border)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', background: 'white' }}
                    >
                      <i className="fa-solid fa-arrows-rotate"></i> Refresh
                    </button>
                  </div>
                </div>
`;
content = content.replace(
  /                  <div className="admin-card-header">[\s\S]*?<\/div>/,
  requestsHeaderSearch
);
content = content.replace(
  "requests.map(req => (",
  "filteredRequests.map(req => ("
);
content = content.replace(
  "requests.length === 0",
  "filteredRequests.length === 0"
);

// 4. Update Plans Tab
const plansHeaderSearch = `
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
                    <button className={\`admin-filter-btn \${planStatusFilter === 'ALL' ? 'active' : ''}\`} onClick={() => setPlanStatusFilter('ALL')}>All</button>
                    <button className={\`admin-filter-btn \${planStatusFilter === 'ACTIVE' ? 'active' : ''}\`} onClick={() => setPlanStatusFilter('ACTIVE')}>Active</button>
                    <button className={\`admin-filter-btn \${planStatusFilter === 'HIDDEN' ? 'active' : ''}\`} onClick={() => setPlanStatusFilter('HIDDEN')}>Hidden</button>
                  </div>
                </div>
`;
content = content.replace(
  '<div className="admin-content-card">\n                <div className="admin-table-container">',
  plansHeaderSearch + '\n                <div className="admin-table-container">'
);
content = content.replace(
  "plans.map(plan => (",
  "filteredPlans.map(plan => ("
);
content = content.replace(
  "plans.length === 0",
  "filteredPlans.length === 0"
);

// 5. Update Assets Tab
const assetsHeaderSearch = `
              <div className="admin-content-card">
                {/* Search and Filters */}
                <div className="admin-controls-row">
                  <div className="admin-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                      type="text" 
                      className="admin-search-input" 
                      placeholder="Search asset by name..." 
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                    />
                  </div>
                  <div className="admin-filter-tabs">
                    <button className={\`admin-filter-btn \${assetStatusFilter === 'ALL' ? 'active' : ''}\`} onClick={() => setAssetStatusFilter('ALL')}>All</button>
                    <button className={\`admin-filter-btn \${assetStatusFilter === 'ACTIVE' ? 'active' : ''}\`} onClick={() => setAssetStatusFilter('ACTIVE')}>Active</button>
                    <button className={\`admin-filter-btn \${assetStatusFilter === 'INACTIVE' ? 'active' : ''}\`} onClick={() => setAssetStatusFilter('INACTIVE')}>Inactive</button>
                  </div>
                </div>
`;
content = content.replace(
  /<div className="admin-content-card">\s*<div className="admin-table-container">\s*<table className="admin-table">\s*<thead>\s*<tr>\s*<th>Asset Name<\/th>/,
  assetsHeaderSearch + '\n                <div className="admin-table-container">\n                  <table className="admin-table">\n                    <thead>\n                      <tr>\n                        <th>Asset Name</th>'
);
content = content.replace(
  "assets.map(asset => (",
  "filteredAssets.map(asset => ("
);

// 6. Update Gallery Tab
const galleryHeaderSearch = `
              <div className="admin-content-card">
                {/* Search and Filters */}
                <div className="admin-controls-row">
                  <div className="admin-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                      type="text" 
                      className="admin-search-input" 
                      placeholder="Search gallery by title or author..." 
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                    />
                  </div>
                  <div className="admin-filter-tabs">
                    <button className={\`admin-filter-btn \${galleryStatusFilter === 'ALL' ? 'active' : ''}\`} onClick={() => setGalleryStatusFilter('ALL')}>All</button>
                    <button className={\`admin-filter-btn \${galleryStatusFilter === 'APPROVED' ? 'active' : ''}\`} onClick={() => setGalleryStatusFilter('APPROVED')}>Approved</button>
                    <button className={\`admin-filter-btn \${galleryStatusFilter === 'PENDING' ? 'active' : ''}\`} onClick={() => setGalleryStatusFilter('PENDING')}>Pending</button>
                    <button className={\`admin-filter-btn \${galleryStatusFilter === 'REJECTED' ? 'active' : ''}\`} onClick={() => setGalleryStatusFilter('REJECTED')}>Rejected</button>
                  </div>
                </div>
`;
content = content.replace(
  /<div className="admin-content-card">\s*<div className="admin-table-container">\s*<table className="admin-table">\s*<thead>\s*<tr>\s*<th>Design<\/th>/,
  galleryHeaderSearch + '\n                <div className="admin-table-container">\n                  <table className="admin-table">\n                    <thead>\n                      <tr>\n                        <th>Design</th>'
);
content = content.replace(
  "galleryDesigns.map(design => (",
  "filteredGallery.map(design => ("
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated AdminDashboard.jsx');
