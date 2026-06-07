import Api from './api.js';
import { timeAgo, escapeHTML, showToast } from './utils.js';

export const createPostCard = (post, currentUser) => {
    const isLiked = post.likes.some(like => like.userId === currentUser.id);
    const likeIconClass = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    const likeBtnClass = isLiked ? 'btn-like liked' : 'btn-like';
    
    // Setup comments preview (latest 2)
    let commentsHTML = '';
    if (post.comments.length > 2) {
        commentsHTML += `<div class="view-comments">View all ${post.comments.length} comments</div>`;
    }
    
    const recentComments = post.comments.slice(-2);
    recentComments.forEach(comment => {
        commentsHTML += `
            <div class="comment-item">
                <a href="#/profile/${comment.userId.username}" class="username">${escapeHTML(comment.userId.username)}</a>
                ${escapeHTML(comment.text)}
            </div>
        `;
    });

    const backendUrl = 'http://localhost:5000';
    const avatarUrl = post.userId.avatarUrl.startsWith('http') ? post.userId.avatarUrl : `${backendUrl}${post.userId.avatarUrl}`;
    const imageUrl = post.imageUrl.startsWith('http') ? post.imageUrl : `${backendUrl}${post.imageUrl}`;

    return `
        <article class="post-card" data-id="${post._id}">
            <header class="post-header">
                <a href="#/profile/${post.userId.username}">
                    <img src="${avatarUrl}" alt="${post.userId.username}" class="post-avatar" onerror="this.src='assets/default-avatar.svg'">
                </a>
                <a href="#/profile/${post.userId.username}" class="post-username">${escapeHTML(post.userId.username)}</a>
            </header>
            
            <div class="post-image-container">
                <img src="${imageUrl}" alt="Post image" class="post-image" ondblclick="handleDoubleTap('${post._id}')">
                <i class="fa-solid fa-heart like-animation"></i>
            </div>
            
            <div class="post-actions">
                <button class="${likeBtnClass}" onclick="toggleLike('${post._id}')">
                    <i class="${likeIconClass}"></i>
                </button>
                <button class="btn-comment" onclick="focusComment('${post._id}')">
                    <i class="fa-regular fa-comment"></i>
                </button>
            </div>
            
            <div class="post-likes">${post.likes.length} likes</div>
            
            ${post.caption ? `
                <div class="post-caption">
                    <a href="#/profile/${post.userId.username}" class="username">${escapeHTML(post.userId.username)}</a>
                    ${escapeHTML(post.caption)}
                </div>
            ` : ''}
            
            <div class="post-comments">
                <div class="comment-list">
                    ${commentsHTML}
                </div>
            </div>
            
            <div class="post-time">${timeAgo(post.createdAt)}</div>
            
            <form class="add-comment" onsubmit="addComment(event, '${post._id}')">
                <input type="text" placeholder="Add a comment..." required>
                <button type="submit">Post</button>
            </form>
        </article>
    `;
};

// Global handlers for post interactions
window.toggleLike = async (postId) => {
    const card = document.querySelector(`.post-card[data-id="${postId}"]`);
    const btn = card.querySelector('.btn-like');
    const icon = btn.querySelector('i');
    const likesDiv = card.querySelector('.post-likes');
    let likesCount = parseInt(likesDiv.textContent);

    const isLiked = btn.classList.contains('liked');

    try {
        if (isLiked) {
            await Api.unlikePost(postId);
            btn.classList.remove('liked');
            icon.className = 'fa-regular fa-heart';
            likesCount--;
        } else {
            await Api.likePost(postId);
            btn.classList.add('liked');
            icon.className = 'fa-solid fa-heart';
            likesCount++;
        }
        likesDiv.textContent = `${likesCount} likes`;
    } catch (err) {
        showToast('Error updating like', 'error');
    }
};

window.handleDoubleTap = async (postId) => {
    const card = document.querySelector(`.post-card[data-id="${postId}"]`);
    const btn = card.querySelector('.btn-like');
    const anim = card.querySelector('.like-animation');
    
    // Show animation
    anim.classList.remove('animate');
    void anim.offsetWidth; // trigger reflow
    anim.classList.add('animate');
    
    // Only like if not already liked
    if (!btn.classList.contains('liked')) {
        await window.toggleLike(postId);
    }
};

window.focusComment = (postId) => {
    const card = document.querySelector(`.post-card[data-id="${postId}"]`);
    const input = card.querySelector('.add-comment input');
    input.focus();
};

window.addComment = async (event, postId) => {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input');
    const text = input.value.trim();
    const btn = form.querySelector('button');

    if (!text) return;

    btn.disabled = true;

    try {
        const res = await Api.addComment(postId, text);
        const comment = res.data;
        
        const card = document.querySelector(`.post-card[data-id="${postId}"]`);
        const commentList = card.querySelector('.comment-list');
        
        const newCommentHTML = `
            <div class="comment-item">
                <a href="#/profile/${comment.userId.username}" class="username">${escapeHTML(comment.userId.username)}</a>
                ${escapeHTML(comment.text)}
            </div>
        `;
        
        commentList.insertAdjacentHTML('beforeend', newCommentHTML);
        input.value = '';
    } catch (err) {
        showToast('Error adding comment', 'error');
    } finally {
        btn.disabled = false;
    }
};
