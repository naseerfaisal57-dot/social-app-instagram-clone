import Api from './api.js';
import { createPostCard } from './post.js';
import { renderStoriesTray } from './stories.js';

export const renderFeed = async () => {
    let html = '<div class="feed-container">';
    
    try {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        // Load stories
        const storiesRes = await Api.getStoriesFeed();
        if (storiesRes.data.length > 0) {
            html += renderStoriesTray(storiesRes.data);
        }

        // Load posts
        const postsRes = await Api.getFeed();
        const posts = postsRes.data;

        if (posts.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <h2>Welcome to Instagram!</h2>
                    <p>Follow users to see their posts here.</p>
                </div>
            `;
        } else {
            posts.forEach(post => {
                html += createPostCard(post, currentUser);
            });
        }
        
    } catch (error) {
        html += `<div style="text-align: center; color: var(--error-color); padding: 20px;">Error loading feed</div>`;
    }

    html += '</div>';
    return html;
};
