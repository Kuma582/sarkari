const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://sarkari-ilnr.onrender.com/api';

const api = {
    async request(endpoint, method = 'GET', body = null, isFormData = false) {
        const token = localStorage.getItem('adminToken');
        const headers = {};
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = isFormData ? body : JSON.stringify(body);
        }

        try {
            const cacheBuster = `t=${Date.now()}`;
            const separator = endpoint.includes('?') ? '&' : '?';
            const url = `${API_URL}${endpoint}${separator}${cacheBuster}`;
            
            const response = await fetch(url, config);
            const data = await response.json();
            
            if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/login')) {
                console.warn('Session expired or unauthorized. Redirecting to login...');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = 'login.html';
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: `Connection Error: ${error.message}` };
        }
    },

    login(username, password) {
        return this.request('/auth/login', 'POST', { username, password });
    },

    getStats() {
        return this.request('/stats');
    },

    getVisitStats() {
        return this.request('/visits/stats');
    },

    getPosts(page = 1, search = '', category = '') {
        return this.request(`/posts?page=${page}&search=${search}&category=${category}`);
    },

    createPost(formData) {
        return this.request('/posts', 'POST', formData, true);
    },

    updatePost(id, formData) {
        return this.request(`/posts/${id}`, 'PUT', formData, true);
    },

    deletePost(id) {
        return this.request(`/posts/${id}`, 'DELETE');
    },

    getAds() {
        return this.request('/ads');
    },

    updateAd(location, code, isEnabled, popupDuration) {
        return this.request('/ads', 'POST', { location, code, isEnabled, popupDuration });
    }
};

// Check Auth on page load
(function() {
    const path = window.location.pathname;
    const token = localStorage.getItem('adminToken');
    const isLoginPage = path.includes('login.html') || path.endsWith('/admin/');
    
    console.log('Admin Auth Check:', { path, hasToken: !!token, isLoginPage });

    if (!isLoginPage && !token) {
        console.warn('No token found, redirecting to login...');
        window.location.href = 'login.html';
    }
    
    if (isLoginPage && token) {
        // If already logged in, don't stay on login page
        console.log('Already logged in, redirecting to dashboard...');
        window.location.href = 'dashboard.html';
    }
})();

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}
