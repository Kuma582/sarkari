const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://sarkari-ilnr.onrender.com/api';

async function fetchData(endpoint) {
    try {
        const cacheBuster = `t=${Date.now()}`;
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `${API_URL}${endpoint}${separator}${cacheBuster}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false };
    }
}

// Helper to render pagination
function renderPagination(totalPages, currentPage, containerId, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '';
    
    // Prev button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="${currentPage > 1 ? `window.${callback.name}(${currentPage - 1})` : ''}">« Prev</a>
    </li>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="window.${callback.name}(${i})">${i}</a>
        </li>`;
    }

    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="${currentPage < totalPages ? `window.${callback.name}(${currentPage + 1})` : ''}">Next »</a>
    </li>`;

    container.innerHTML = html;
}

// Make functions global so they can be called from onclick
window.renderLatestJobs = renderLatestJobs;

// Function to render jobs in the main table
async function renderLatestJobs(page = 1) {
    const res = await fetchData(`/posts?category=Latest Jobs&page=${page}&limit=10`);
    const tbody = document.getElementById('jobTableBody');
    if (!tbody) return;

    if (res && res.success) {
        if (res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No jobs found</td></tr>';
            return;
        }

        tbody.innerHTML = res.data.map(post => `
            <tr onclick="showPostDetail('${post._id}')" style="cursor:pointer;">
                <td><a href="javascript:void(0)">${post.title}${post.status === 'New' ? '<span class="new-label ms-1">NEW</span>' : ''}</a></td>
                <td><span class="badge-blue">${post.category}</span></td>
                <td>-</td>
                <td style="color:var(--red);font-weight:700;">${post.lastDate ? new Date(post.lastDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `).join('');

        renderPagination(res.pages, res.currentPage, 'jobPagination', renderLatestJobs);
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load data. Please check your connection.</td></tr>';
    }
}

// Function to render lists (Results, Admit Cards, etc.)
async function renderCategoryList(category, elementId) {
    const res = await fetchData(`/posts?category=${category}&limit=8`);
    const container = document.querySelector(`#${elementId} .job-list`) || document.querySelector(`#${elementId} .sidebar-links`);
    if (!container) return;

    if (res && res.success) {
        if (res.data.length === 0) {
            container.innerHTML = '<li>No data found</li>';
            return;
        }

        container.innerHTML = res.data.map(post => `
            <li onclick="showPostDetail('${post._id}')" style="cursor:pointer;">
                <div class="bullet"></div>
                <div>
                    <a href="javascript:void(0)">${post.title}</a>
                    <div class="job-meta">${post.description.substring(0, 50)}...</div>
                </div>
                ${post.status === 'New' ? '<span class="new-label">NEW</span>' : ''}
            </li>
        `).join('');
    } else {
        container.innerHTML = '<li>Error loading data</li>';
    }
}

// Function to render ads
async function renderAds() {
    const res = await fetchData('/ads');
    if (res && res.success) {
        res.data.forEach(ad => {
            const container = document.getElementById(`ad-${ad.location}`);
            if (container && ad.isEnabled) {
                container.innerHTML = ad.code;
            }
        });
    }
}

// Ticker rendering
async function renderTicker() {
    const res = await fetchData('/posts?limit=10');
    if (res && res.success) {
        const ticker = document.getElementById('tickerContent');
        if (!ticker) return;

        ticker.innerHTML = res.data.map(post => `
            <a href="javascript:void(0)" onclick="showPostDetail('${post._id}')">${post.title}${post.status === 'New' ? '<span class="new-badge">★NEW</span>' : ''}</a>
        `).join('');
        
        // Restart animation if needed
        ticker.style.animation = 'none';
        ticker.offsetHeight; /* trigger reflow */
        ticker.style.animation = null;
    }
}

// Search functionality
async function doSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    const res = await fetchData(`/posts?search=${query}`);
    const tbody = document.getElementById('jobTableBody');
    if (!tbody) return;

    if (res && res.success) {
        const bar = document.getElementById('searchResultsBar');
        if (bar) {
            bar.style.display = 'block';
            document.getElementById('searchResultText').innerHTML =
                `🔍 Search results for "<b>${query}</b>": <b>${res.data.length}</b> result(s) found.`;
        }

        if (res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No results found</td></tr>';
            return;
        }

        tbody.innerHTML = res.data.map(post => `
            <tr onclick="showPostDetail('${post._id}')" style="cursor:pointer;">
                <td><a href="javascript:void(0)">${post.title}${post.status === 'New' ? '<span class="new-label ms-1">NEW</span>' : ''}</a></td>
                <td><span class="badge-blue">${post.category}</span></td>
                <td>-</td>
                <td style="color:var(--red);font-weight:700;">${post.lastDate ? new Date(post.lastDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `).join('');
        
        document.getElementById('jobPagination').innerHTML = ''; // Clear pagination for search
    }
}

window.doSearch = doSearch;

function clearSearch() {
    document.getElementById('searchInput').value = '';
    const bar = document.getElementById('searchResultsBar');
    if (bar) bar.style.display = 'none';
    renderLatestJobs();
}
window.clearSearch = clearSearch;

// State filter
async function filterByState(state) {
    document.getElementById('searchInput').value = state;
    await doSearch();
    const latestJobs = document.getElementById('latestJobs');
    if (latestJobs) window.scrollTo({ top: latestJobs.offsetTop - 100, behavior: 'smooth' });
}
window.filterByState = filterByState;

// Keyword filter
async function filterByKeyword(kw) {
    document.getElementById('searchInput').value = kw;
    await doSearch();
    const latestJobs = document.getElementById('latestJobs');
    if (latestJobs) window.scrollTo({ top: latestJobs.offsetTop - 100, behavior: 'smooth' });
}
window.filterByKeyword = filterByKeyword;

function viewAll(title) {
    alert(`Showing all posts for ${title}...`);
    // Ideally this would redirect to a category page
}
window.viewAll = viewAll;

function joinTelegram() {
    window.open('https://t.me/SarkariNaukriOfficial', '_blank');
}
window.joinTelegram = joinTelegram;

async function showPostDetail(id) {
    if (typeof openDetailModal === 'function') openDetailModal();
    const detailBody = document.getElementById('detailBody');
    const detailTitle = document.getElementById('detailTitle');
    
    detailBody.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Loading details...</p>
        </div>
    `;

    const res = await fetchData(`/posts/${id}`);
    if (res && res.success) {
        const post = res.data;
        detailTitle.innerText = post.title;
        
        let vacancyHtml = '';
        try {
            const vDetails = typeof post.vacancyDetails === 'string' ? JSON.parse(post.vacancyDetails || '[]') : post.vacancyDetails;
            if (vDetails && vDetails.length > 0) {
                vacancyHtml = `
                    <div class="detail-card-head mt-4">Vacancy Details</div>
                    <table class="vacancy-table">
                        <thead>
                            <tr>
                                <th>Department / Post</th>
                                <th>Male</th>
                                <th>Female</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vDetails.map(v => `
                                <tr>
                                    <td>${v.dept || v.post || '-'}</td>
                                    <td>${v.male || '0'}</td>
                                    <td>${v.female || '0'}</td>
                                    <td>${v.total || (parseInt(v.male || 0) + parseInt(v.female || 0)) || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (e) { console.error("JSON Parse error", e); }

        let linksHtml = '';
        if (post.importantLinks && post.importantLinks.length > 0) {
            linksHtml = `
                <div class="detail-card-head mt-4">Important Links</div>
                <div class="text-center">
                    ${post.importantLinks.map(link => `
                        <a href="${link.url}" target="_blank" class="link-btn">${link.label}</a>
                    `).join('')}
                </div>
            `;
        }

        detailBody.innerHTML = `
            <div class="detail-card-head">Short Information</div>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 20px;">${post.description}</p>
            
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Total Vacancies</div>
                    <div class="detail-value">${post.totalVacancies || 'Not Specified'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Last Date to Apply</div>
                    <div class="detail-value" style="color:var(--red)">${post.lastDate ? new Date(post.lastDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Application Fees</div>
                    <div class="detail-value">${post.applicationFees || 'Check Notification'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Age Limit</div>
                    <div class="detail-value">${post.ageLimit || 'Check Notification'}</div>
                </div>
                <div class="detail-item" style="grid-column: span 2;">
                    <div class="detail-label">Eligibility / Qualification</div>
                    <div class="detail-value">${post.eligibility || 'Check Notification'}</div>
                </div>
            </div>

            ${vacancyHtml}
            ${linksHtml}
            
            <div class="mt-4 text-center p-3" style="background:#fff7e0; border-radius:8px; border:1px dashed var(--gold);">
                <div style="font-size:12px; color:#666; font-weight:600;">Share this job with friends</div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(window.location.href), '_blank')">WhatsApp</button>
                    <button class="btn btn-sm btn-outline-info" onclick="navigator.clipboard.writeText(window.location.href); alert('Link copied!')">Copy Link</button>
                </div>
            </div>
        `;
    } else {
        detailBody.innerHTML = '<div class="alert alert-danger">Failed to load details.</div>';
    }
}
window.showPostDetail = showPostDetail;

// Initialize all
const init = () => {
    renderLatestJobs();
    renderCategoryList('Results', 'results');
    renderCategoryList('Admit Cards', 'admitCards');
    renderCategoryList('Answer Keys', 'answerKeys');
    renderCategoryList('Syllabus', 'syllabus');
    renderCategoryList('Admission', 'admissions');
    renderTicker();
    renderAds();
};

document.addEventListener('DOMContentLoaded', () => {
    init();
    // Auto refresh every 15 seconds to show latest updates
    setInterval(init, 15000);
});
