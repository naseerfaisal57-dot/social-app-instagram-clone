const API = (() => {
    const base = '/api';
    const token = () => localStorage.getItem('token');
    const headers = (json = true) => {
        const h = {};
        if (json) h['Content-Type'] = 'application/json';
        if (token()) h['Authorization'] = `Bearer ${token()}`;
        return h;
    }
    return {
        signup: (data) => fetch(base + '/auth/signup', { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
        login: (data) => fetch(base + '/auth/login', { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
        me: () => fetch(base + '/users/me', { headers: headers() }).then(r => r.json()),
        feed: () => fetch(base + '/posts/feed', { headers: headers() }).then(r => r.json()),
        stories: () => fetch(base + '/stories', { headers: headers() }).then(r => r.json()),
        follow: (username) => fetch(base + `/users/${username}/follow`, { method: 'POST', headers: headers() }).then(r => r.json()),
        createPost: (formData) => fetch(base + '/posts', { method: 'POST', body: formData, headers: { 'Authorization': `Bearer ${token()}` } }).then(r => r.json()),
        like: (id) => fetch(base + `/posts/${id}/like`, { method: 'POST', headers: headers() }).then(r => r.json()),
        comment: (id, text) => fetch(base + `/posts/${id}/comments`, { method: 'POST', headers: headers(), body: JSON.stringify({ text }) }).then(r => r.json())
    }
})();