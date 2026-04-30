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
    if (!res || !res.success) {
        detailBody.innerHTML = '<div class="alert alert-danger">Failed to load details.</div>';
        return;
    }

    const post = res.data;
    detailTitle.innerText = post.title;

    // ── Helper ─────────────────────────────────────────────
    const row = (label, value, color = '') =>
        value ? `<tr><td style="font-weight:600; padding:7px 12px; width:45%; background:#f8f9fa; border:1px solid #dee2e6;">${label}</td>
                     <td style="padding:7px 12px; border:1px solid #dee2e6; color:${color || 'inherit'};">${value}</td></tr>` : '';

    const sectionHead = (title, color = '#cc0000') =>
        `<div style="background:${color}; color:#fff; font-weight:700; font-size:0.95rem; padding:8px 14px; margin:16px 0 0; border-radius:4px 4px 0 0; letter-spacing:0.5px;">${title}</div>`;

    // ── Important Dates Table ──────────────────────────────
    const datesRows = [
        row('Apply Start / Last Date', post.lastDate ? new Date(post.lastDate).toLocaleDateString('en-IN') : null, '#cc0000'),
        row('Admit Card Date', post.admitCardDate, '#0066cc'),
        row('Exam Date', post.examDate, '#0066cc'),
        row('Result Date', post.resultDate, '#007700'),
        row('Answer Key Date', post.answerKeyDate, '#007700'),
    ].filter(Boolean).join('');

    // ── Application Fee Table ──────────────────────────────
    let feeRows = '';
    if (post.applicationFees) {
        post.applicationFees.split('|').forEach(part => {
            const [cat, fee] = part.split(':').map(s => s.trim());
            if (cat && fee) feeRows += row(cat, fee);
        });
    }
    if (post.paymentMode) feeRows += row('Payment Mode', post.paymentMode, '#0066cc');

    // ── Vacancy Table ──────────────────────────────────────
    let vacancyRows = '';
    vacancyRows += row('Total Vacancies', post.totalVacancies ? String(post.totalVacancies) : null, '#cc0000');
    if (post.maleVacancies)   vacancyRows += row('Male Vacancies',   String(post.maleVacancies),   '#0066cc');
    if (post.femaleVacancies) vacancyRows += row('Female Vacancies', String(post.femaleVacancies), '#cc0099');

    // Post-wise vacancy detail
    let postWiseHtml = '';
    try {
        const vDetails = typeof post.vacancyDetails === 'string' ? JSON.parse(post.vacancyDetails || '[]') : (post.vacancyDetails || []);
        if (Array.isArray(vDetails) && vDetails.length > 0) {
            const pRows = vDetails.map(v =>
                `<tr>
                    <td style="padding:6px 12px; border:1px solid #dee2e6;">${v.post || v.dept || '-'}</td>
                    <td style="padding:6px 12px; border:1px solid #dee2e6; text-align:center; font-weight:700; color:#cc0000;">${v.total || '-'}</td>
                </tr>`
            ).join('');
            postWiseHtml = `
                ${sectionHead('Post-wise Vacancy Detail', '#555')}
                <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
                    <thead><tr>
                        <th style="padding:7px 12px; background:#eee; border:1px solid #dee2e6; text-align:left;">Post Name</th>
                        <th style="padding:7px 12px; background:#eee; border:1px solid #dee2e6; text-align:center;">Total Posts</th>
                    </tr></thead>
                    <tbody>${pRows}</tbody>
                </table>`;
        }
    } catch(e) {}

    // ── Eligibility & Other ────────────────────────────────
    const otherRows = [
        row('Eligibility / Education', post.eligibility),
        row('Age Limit', post.ageLimit, '#cc0000'),
        row('Exam Mode', post.examMode),
        row('Department', post.department),
    ].filter(Boolean).join('');

    // ── Important Links (Apply Buttons) ───────────────────
    let linksHtml = '';
    if (post.importantLinks && post.importantLinks.length > 0) {
        const btnColors = ['#cc0000','#0066cc','#007700','#885500','#550088'];
        const btns = post.importantLinks.map((link, i) => `
            <a href="${link.url}" target="_blank" rel="noopener"
               style="display:inline-block; margin:5px 8px; padding:10px 22px; background:${btnColors[i % btnColors.length]};
                      color:#fff; text-decoration:none; border-radius:5px; font-weight:700; font-size:0.9rem;
                      box-shadow: 0 3px 8px rgba(0,0,0,0.18);">
                ${link.label}
            </a>
        `).join('');
        linksHtml = `
            ${sectionHead('🔗 Important Links / Apply Online', '#0066cc')}
            <div style="padding:14px; background:#f0f6ff; border:1px solid #dee2e6; text-align:center; border-radius:0 0 4px 4px;">
                ${btns}
            </div>`;
    }

    // ── Final HTML ─────────────────────────────────────────
    detailBody.innerHTML = `
        <div style="font-family:'Segoe UI',sans-serif; font-size:0.88rem;">

            <!-- Notification notice -->
            <div style="background:#fff3cd; border:1px solid #ffc107; padding:8px 14px; border-radius:4px; margin-bottom:12px; font-size:0.82rem;">
                <b>📢 Note:</b> Read the full official notification before applying. All details subject to change.
            </div>

            <!-- Description -->
            ${sectionHead('📋 Short Information')}
            <div style="padding:10px 14px; background:#fff; border:1px solid #dee2e6; font-size:0.88rem; line-height:1.7; border-radius:0 0 4px 4px;">
                ${post.description}
            </div>

            <!-- Important Dates -->
            ${datesRows ? `
            ${sectionHead('📅 Important Dates')}
            <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">${datesRows}</table>` : ''}

            <!-- Application Fee -->
            ${feeRows ? `
            ${sectionHead('💰 Application Fee')}
            <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">${feeRows}</table>` : ''}

            <!-- Vacancy -->
            ${vacancyRows ? `
            ${sectionHead('📊 Total Vacancy')}
            <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">${vacancyRows}</table>` : ''}

            ${postWiseHtml}

            <!-- Eligibility & Other -->
            ${otherRows ? `
            ${sectionHead('📝 Eligibility & Other Details')}
            <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">${otherRows}</table>` : ''}

            <!-- Links -->
            ${linksHtml}

            <!-- Share -->
            <div style="margin-top:16px; text-align:center; padding:10px; background:#f8f9fa; border-radius:6px; border:1px dashed #ccc;">
                <span style="font-size:12px; font-weight:600; color:#666;">Share this job with friends →</span>
                <button onclick="window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(document.title + ' ' + window.location.href), '_blank')"
                    style="margin-left:10px; padding:4px 14px; background:#25D366; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:600;">
                    WhatsApp
                </button>
                <button onclick="navigator.clipboard.writeText(window.location.href); alert('Link copied!')"
                    style="margin-left:6px; padding:4px 14px; background:#0066cc; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:600;">
                    Copy Link
                </button>
            </div>
        </div>
    `;
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
