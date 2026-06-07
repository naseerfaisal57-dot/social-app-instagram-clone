import Api from './api.js';
import { showToast } from './utils.js';

export const renderLogin = () => {
    return `
        <div class="auth-container">
            <div class="auth-box">
                <div class="auth-form-container">
                    <h1 class="auth-logo">Instagram</h1>
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <input type="text" id="login-input" class="auth-input" placeholder="Phone number, username, or email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="password-input" class="auth-input" placeholder="Password" required>
                        </div>
                        <button type="submit" class="btn-primary auth-btn">Log in</button>
                    </form>
                </div>
                <div class="auth-redirect">
                    Don't have an account? <a href="#/register">Sign up</a>
                </div>
            </div>
        </div>
    `;
};

export const renderRegister = () => {
    return `
        <div class="auth-container">
            <div class="auth-box">
                <div class="auth-form-container">
                    <h1 class="auth-logo">Instagram</h1>
                    <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px; font-weight: 600;">
                        Sign up to see photos and videos from your friends.
                    </p>
                    <form id="register-form" class="auth-form">
                        <div class="form-group">
                            <input type="email" id="reg-email" class="auth-input" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="text" id="reg-name" class="auth-input" placeholder="Full Name" required>
                        </div>
                        <div class="form-group">
                            <input type="text" id="reg-username" class="auth-input" placeholder="Username" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="reg-password" class="auth-input" placeholder="Password" required minlength="6">
                        </div>
                        <button type="submit" class="btn-primary auth-btn">Sign up</button>
                    </form>
                </div>
                <div class="auth-redirect">
                    Have an account? <a href="#/login">Log in</a>
                </div>
            </div>
        </div>
    `;
};

export const setupAuthListeners = () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const login = document.getElementById('login-input').value;
            const password = document.getElementById('password-input').value;

            try {
                const res = await Api.login({ login, password });
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                window.location.hash = '#/';
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const name = document.getElementById('reg-name').value;
            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;

            try {
                const res = await Api.register({ email, name, username, password });
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                window.location.hash = '#/';
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = '#/login';
};

export const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        await Api.getMe();
        return true;
    } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
    }
};
