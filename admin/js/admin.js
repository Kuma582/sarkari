const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://sarkari-ilnr.onrender.com/api'; // Replace with your actual Render URL later

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
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();
            
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                window.location.href = 'login.html';
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Server connection failed' };
        }
    },

    login(username, password) {
        return this.request('/auth/login', 'POST', { username, password });
    },

    getStats() {
        return this.request('/stats');
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

    updateAd(location, code, isEnabled) {
        return this.request('/ads', 'POST', { location, code, isEnabled });
    }
};

// Check Auth on page load
if (!window.location.pathname.includes('login.html')) {
    if (!localStorage.getItem('adminToken')) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}
