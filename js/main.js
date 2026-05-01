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
            if (container) {
                if (ad.isEnabled) {
                    container.innerHTML = ad.code;
                } else {
                    container.innerHTML = ''; // Clear container if ad is disabled
                }
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
    openCategoryModal(title);
}
window.viewAll = viewAll;

function joinTelegram() {
    window.open('https://t.me/SarkariNaukriOfficial', '_blank');
}
window.joinTelegram = joinTelegram;

async function showPostDetail(id) {
    window.location.href = `post.html?id=${id}`;
}
window.showPostDetail = showPostDetail;
let categoryModalInstance;
document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('categoryModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        categoryModalInstance = new bootstrap.Modal(modalEl);
    }
});

async function openCategoryModal(category) {
    if(!categoryModalInstance && typeof bootstrap !== 'undefined') {
        const modalEl = document.getElementById('categoryModal');
        if (modalEl) categoryModalInstance = new bootstrap.Modal(modalEl);
    }
    
    if(!categoryModalInstance) return;

    document.getElementById('categoryModalTitle').innerText = category;
    const listEl = document.getElementById('categoryModalList');
    listEl.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2" style="font-size:12px; color:#666;">Loading ' + category + '...</p></div>';
    categoryModalInstance.show();

    // Fetch only the specific category to make it much faster
    const res = await fetchData(`/posts?category=${category}&limit=50`);
    
    if (res && res.success) {
        if (res.data.length === 0) {
            listEl.innerHTML = `<li style="padding: 15px; text-align: center; color: #666;">No posts available in ${category} right now.</li>`;
            return;
        }

        listEl.innerHTML = res.data.map(post => {
            const isNew = isDateWithin24Hours(post.createdAt) ? '<span class="new-badge">★NEW</span>' : '';
            return `
                <li>
                    <a href="javascript:void(0)" onclick="showPostDetail('${post._id}')">
                        <i class="fas fa-hand-point-right"></i> ${post.title} ${isNew}
                    </a>
                </li>
            `;
        }).join('');
    } else {
        listEl.innerHTML = `<li style="padding: 15px; text-align: center; color: var(--danger);">Failed to load posts. Please try again.</li>`;
    }
}
window.openCategoryModal = openCategoryModal;


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

    // Check if we need to open a category modal from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        setTimeout(() => openCategoryModal(category), 500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    init();
    // Auto refresh every 30 seconds to stay updated without overloading the server
    setInterval(init, 30000);
});
