const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://sarkari-ilnr.onrender.com/api'; // Replace with your actual Render URL later

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false };
    }
}

// Function to render jobs in the main table
async function renderLatestJobs(page = 1, category = '') {
    const res = await fetchData(`/posts?category=Latest Jobs&page=${page}`);
    if (res && res.success) {
        const tbody = document.getElementById('jobTableBody');
        if (!tbody) return;

        if (res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No jobs found</td></tr>';
            return;
        }

        tbody.innerHTML = res.data.map(post => `
            <tr>
                <td><a href="#">${post.title}${post.status === 'New' ? '<span class="new-label ms-1">NEW</span>' : ''}</a></td>
                <td><span class="badge-blue">${post.category}</span></td>
                <td>-</td>
                <td style="color:var(--red);font-weight:700;">${post.lastDate ? new Date(post.lastDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `).join('');

        renderPagination(res.pages, res.currentPage, 'jobPagination', renderLatestJobs);
    }
}

// Function to render lists (Results, Admit Cards, etc.)
async function renderCategoryList(category, elementId) {
    const res = await fetchData(`/posts?category=${category}&limit=8`);
    if (res && res.success) {
        const container = document.querySelector(`#${elementId} .job-list`) || document.querySelector(`#${elementId} .sidebar-links`);
        if (!container) return;

        if (res.data.length === 0) {
            container.innerHTML = '<li>No data found</li>';
            return;
        }

        container.innerHTML = res.data.map(post => `
            <li>
                <div class="bullet"></div>
                <div>
                    <a href="#">${post.title}</a>
                    <div class="job-meta">${post.description.substring(0, 50)}...</div>
                </div>
                ${post.status === 'New' ? '<span class="new-label">NEW</span>' : ''}
            </li>
        `).join('');
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
            <a href="#">${post.title}${post.status === 'New' ? '<span class="new-badge">★NEW</span>' : ''}</a>
        `).join('');
    }
}

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
    renderLatestJobs();
    renderCategoryList('Results', 'results');
    renderCategoryList('Admit Cards', 'admitCards');
    renderCategoryList('Answer Keys', 'answerKeys');
    renderCategoryList('Syllabus', 'syllabus');
    renderCategoryList('Admission', 'admissions');
    renderTicker();
    renderAds();
});

// Helper for search
async function doSearch() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;
    
    const res = await fetchData(`/posts?search=${query}`);
    if (res && res.success) {
        // You could open a search results modal or redirect
        console.log('Search Results:', res.data);
    }
}
