// Base API URL
const API_URL = 'http://localhost:5000/api';

class Api {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        // If body is FormData, remove Content-Type to let browser set it with boundary
        if (options.body instanceof FormData) {
            delete defaultHeaders['Content-Type'];
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    static login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static getMe() {
        return this.request('/auth/me');
    }

    // Posts endpoints
    static getFeed() {
        return this.request('/posts/feed');
    }

    static getUserPosts(userId) {
        return this.request(`/posts/user/${userId}`);
    }

    static createPost(formData) {
        return this.request('/posts', {
            method: 'POST',
            body: formData
        });
    }

    static likePost(postId) {
        return this.request(`/likes/${postId}`, { method: 'POST' });
    }

    static unlikePost(postId) {
        return this.request(`/likes/${postId}`, { method: 'DELETE' });
    }

    static addComment(postId, text) {
        return this.request(`/comments/${postId}`, {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    }

    // Users endpoints
    static getUserProfile(username) {
        return this.request(`/users/${username}`);
    }

    static followUser(userId) {
        return this.request(`/users/${userId}/follow`, { method: 'POST' });
    }

    static unfollowUser(userId) {
        return this.request(`/users/${userId}/follow`, { method: 'DELETE' });
    }

    // Stories endpoints
    static getStoriesFeed() {
        return this.request('/stories/feed');
    }
}

export default Api;
