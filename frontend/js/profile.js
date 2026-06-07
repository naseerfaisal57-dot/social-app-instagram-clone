import Api from './api.js';
import { escapeHTML, showToast } from './utils.js';
import { createPostCard } from './post.js';

let isGridView = true;

export const renderProfile = async (params) => {
    const { username } = params;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    try {
        const userRes = await Api.getUserProfile(username);
        const profileUser = userRes.data;
        
        const postsRes = await Api.getUserPosts(profileUser._id);
        const posts = postsRes.data;

        // Check follow status
        let followBtnHtml = '';
        if (currentUser.id === profileUser._id) {
            followBtnHtml = `<button class="btn-secondary" onclick="window.location.hash='#/profile/me/edit'">Edit Profile</button>`;
        } else {
            // Check if following (this requires an endpoint to check, or just try to follow and handle error. For now we will rely on client side state or just show follow and let backend handle)
            // Ideally we'd have an 'isFollowing' boolean from backend
            followBtnHtml = `<button class="btn-primary" id="follow-btn" onclick="toggleFollow('${profileUser._id}')">Follow</button>`;
        }

        const backendUrl = 'http://localhost:5000';
        const avatarUrl = profileUser.avatarUrl.startsWith('http') ? profileUser.avatarUrl : `${backendUrl}${profileUser.avatarUrl}`;

        let html = `
            <div class="profile-container">
                <header class="profile-header">
                    <div class="profile-avatar">
                        <img src="${avatarUrl}" alt="${profileUser.username}" onerror="this.src='assets/default-avatar.svg'">
                    </div>
                    <div class="profile-info">
                        <div class="profile-title">
                            <h2>${escapeHTML(profileUser.username)}</h2>
                            ${followBtnHtml}
                        </div>
                        <ul class="profile-stats">
                            <li><span>${posts.length}</span> posts</li>
                            <li><span id="followers-count">${profileUser.followersCount}</span> followers</li>
                            <li><span>${profileUser.followingCount}</span> following</li>
                        </ul>
                        <div class="profile-bio">
                            <h1>${escapeHTML(profileUser.name)}</h1>
                            <p>${escapeHTML(profileUser.bio)}</p>
                            ${profileUser.website ? `<a href="${escapeHTML(profileUser.website)}" target="_blank">${escapeHTML(profileUser.website)}</a>` : ''}
                        </div>
                    </div>
                </header>

                <div class="profile-tabs">
                    <div class="profile-tab ${isGridView ? 'active' : ''}" onclick="toggleView(true, '${username}')">
                        <i class="fa-solid fa-table-cells"></i> POSTS
                    </div>
                    <div class="profile-tab ${!isGridView ? 'active' : ''}" onclick="toggleView(false, '${username}')">
                        <i class="fa-solid fa-list"></i> FEED
                    </div>
                </div>

                <div id="profile-content">
                    ${renderProfileContent(posts, currentUser)}
                </div>
            </div>
        `;
        
        return html;
    } catch (error) {
        return `<div style="text-align: center; padding: 40px; color: var(--error-color);">Error loading profile: ${error.message}</div>`;
    }
};

const renderProfileContent = (posts, currentUser) => {
    if (posts.length === 0) {
        return `<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No posts yet.</div>`;
    }

    const backendUrl = 'http://localhost:5000';

    if (isGridView) {
        let gridHtml = '<div class="profile-grid">';
        posts.forEach(post => {
            const imageUrl = post.imageUrl.startsWith('http') ? post.imageUrl : `${backendUrl}${post.imageUrl}`;
            gridHtml += `
                <div class="grid-item" onclick="window.location.hash='#/post/${post._id}'">
                    <img src="${imageUrl}" alt="Post image">
                    <div class="grid-item-overlay">
                        <span><i class="fa-solid fa-heart"></i> ${post.likes.length}</span>
                        <span><i class="fa-solid fa-comment"></i> ${post.comments.length}</span>
                    </div>
                </div>
            `;
        });
        gridHtml += '</div>';
        return gridHtml;
    } else {
        let listHtml = '<div class="feed-container">';
        posts.forEach(post => {
            listHtml += createPostCard(post, currentUser);
        });
        listHtml += '</div>';
        return listHtml;
    }
};

window.toggleView = (grid, username) => {
    isGridView = grid;
    // Simple re-render by triggering router again
    // In a real app we'd just re-render the content div
    window.location.hash = `#/profile/${username}`;
};

window.toggleFollow = async (userId) => {
    const btn = document.getElementById('follow-btn');
    const countSpan = document.getElementById('followers-count');
    let count = parseInt(countSpan.textContent);

    try {
        if (btn.textContent === 'Following') {
            await Api.unfollowUser(userId);
            btn.textContent = 'Follow';
            btn.className = 'btn-primary';
            count--;
        } else {
            await Api.followUser(userId);
            btn.textContent = 'Following';
            btn.className = 'btn-secondary';
            count++;
        }
        countSpan.textContent = count;
    } catch (err) {
        showToast(err.message, 'error');
    }
};
