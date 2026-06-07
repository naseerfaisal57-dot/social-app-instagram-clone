import { renderLogin, renderRegister, setupAuthListeners, checkAuth, logout } from './auth.js';
import { renderFeed } from './feed.js';
import { renderProfile } from './profile.js';

// Define routes
const routes = {
    '#/login': { render: renderLogin, setup: setupAuthListeners, public: true },
    '#/register': { render: renderRegister, setup: setupAuthListeners, public: true },
    '#/': { render: renderFeed, setup: () => {}, public: false },
    '#/profile/:username': { render: renderProfile, setup: () => {}, public: false },
    // Add other routes here later...
};

const renderNav = () => {
    const nav = document.getElementById('main-nav');
    nav.classList.remove('hidden');
    nav.className = 'sidebar'; // Will be responsive in CSS
    
    // Bottom Nav for Mobile
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'bottom-nav';
    
    const navItems = `
        <a href="#/" class="nav-item">
            <i class="fa-solid fa-house"></i>
            <span class="nav-text">Home</span>
        </a>
        <a href="#" class="nav-item" id="nav-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span class="nav-text">Search</span>
        </a>
        <a href="#" class="nav-item" id="nav-create">
            <i class="fa-regular fa-square-plus"></i>
            <span class="nav-text">Create</span>
        </a>
        <a href="#" class="nav-item" id="nav-profile">
            <i class="fa-regular fa-user"></i>
            <span class="nav-text">Profile</span>
        </a>
        <div class="nav-item" id="nav-logout">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span class="nav-text">Log out</span>
        </div>
    `;
    
    nav.innerHTML = `
        <h1 class="auth-logo" style="margin: 20px 12px; font-size: 24px;">Instagram</h1>
        ${navItems}
    `;
    bottomNav.innerHTML = navItems;

    // Remove old bottom nav if exists
    const oldBottomNav = document.querySelector('.bottom-nav');
    if (oldBottomNav) {
        oldBottomNav.remove();
    }
    
    document.querySelector('.app-container').appendChild(bottomNav);

    // Setup Nav Listeners
    const setupListeners = (container) => {
        const logoutBtn = container.querySelector('#nav-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        const createBtn = container.querySelector('#nav-create');
        if (createBtn) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openCreateModal();
            });
        }
        
        const profileBtn = container.querySelector('#nav-profile');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    window.location.hash = `#/profile/${user.username}`;
                }
            });
        }
    };

    setupListeners(nav);
    setupListeners(bottomNav);
};

const hideNav = () => {
    document.getElementById('main-nav').classList.add('hidden');
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.remove();
    }
};

const router = async () => {
    const path = window.location.hash || '#/';
    const mainContent = document.getElementById('main-content');
    
    // Find matching route
    let routeMatch = null;
    let params = {};

    for (const [routePath, routeConfig] of Object.entries(routes)) {
        // Simple exact match for now
        if (path === routePath) {
            routeMatch = routeConfig;
            break;
        }
        
        // Handle dynamic routes like #/profile/:username
        if (routePath.includes(':')) {
            const pathParts = path.split('/');
            const routeParts = routePath.split('/');
            
            if (pathParts.length === routeParts.length && pathParts[1] === routeParts[1]) {
                params[routeParts[2].substring(1)] = pathParts[2];
                routeMatch = routeConfig;
                break;
            }
        }
    }

    // Default route
    if (!routeMatch) {
        routeMatch = routes['#/'];
        window.location.hash = '#/';
    }

    // Auth check
    const isAuthenticated = await checkAuth();

    if (!routeMatch.public && !isAuthenticated) {
        window.location.hash = '#/login';
        return;
    }

    if (routeMatch.public && isAuthenticated) {
        window.location.hash = '#/';
        return;
    }

    // Render Navigation
    if (!routeMatch.public) {
        renderNav();
    } else {
        hideNav();
    }

    // Render View
    mainContent.innerHTML = await routeMatch.render(params);
    routeMatch.setup(params);
};

// Listen for hash changes
window.addEventListener('hashchange', router);

// Listen for page load
window.addEventListener('load', router);
