import { escapeHTML } from './utils.js';

let currentStories = [];
let currentStoryIndex = 0;
let storyTimer = null;
const STORY_DURATION = 5000;

export const renderStoriesTray = (stories) => {
    // Group stories by user
    const usersWithStories = {};
    stories.forEach(story => {
        if (!usersWithStories[story.userId._id]) {
            usersWithStories[story.userId._id] = {
                user: story.userId,
                stories: []
            };
        }
        usersWithStories[story.userId._id].stories.push(story);
    });

    // Save globally for viewer
    window._storiesData = usersWithStories;

    let html = '<div class="stories-tray">';
    
    const backendUrl = 'http://localhost:5000';

    Object.values(usersWithStories).forEach(group => {
        const avatarUrl = group.user.avatarUrl.startsWith('http') ? group.user.avatarUrl : `${backendUrl}${group.user.avatarUrl}`;
        html += `
            <div class="story-item" onclick="openStoryViewer('${group.user._id}')">
                <div class="story-avatar-container">
                    <img src="${avatarUrl}" alt="${group.user.username}" onerror="this.src='assets/default-avatar.svg'">
                </div>
                <span class="story-username">${escapeHTML(group.user.username)}</span>
            </div>
        `;
    });

    html += '</div>';
    return html;
};

window.openStoryViewer = (userId) => {
    const group = window._storiesData[userId];
    if (!group) return;

    currentStories = group.stories;
    currentStoryIndex = 0;

    const viewerHtml = `
        <div id="story-viewer" class="story-viewer">
            <div class="story-viewer-content">
                <div class="story-progress-container" id="story-progress-bars">
                    ${currentStories.map(() => `
                        <div class="story-progress-bar">
                            <div class="story-progress-fill"></div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="story-viewer-header">
                    <div class="story-viewer-user">
                        <img src="http://localhost:5000${group.user.avatarUrl}" alt="${group.user.username}" onerror="this.src='assets/default-avatar.svg'">
                        <span style="font-weight:600; text-shadow: 0 0 4px rgba(0,0,0,0.5);">${escapeHTML(group.user.username)}</span>
                    </div>
                    <button class="story-viewer-close" onclick="closeStoryViewer()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                
                <img id="story-image" class="story-viewer-image" src="">
                
                <div class="story-viewer-nav story-nav-prev" onclick="prevStory()"></div>
                <div class="story-viewer-nav story-nav-next" onclick="nextStory()"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', viewerHtml);
    showCurrentStory();
};

window.closeStoryViewer = () => {
    clearTimeout(storyTimer);
    const viewer = document.getElementById('story-viewer');
    if (viewer) {
        viewer.remove();
    }
};

window.nextStory = () => {
    if (currentStoryIndex < currentStories.length - 1) {
        currentStoryIndex++;
        showCurrentStory();
    } else {
        closeStoryViewer();
    }
};

window.prevStory = () => {
    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        showCurrentStory();
    } else {
        // Reset current story progress
        showCurrentStory();
    }
};

const showCurrentStory = () => {
    clearTimeout(storyTimer);
    const story = currentStories[currentStoryIndex];
    const img = document.getElementById('story-image');
    if (!img) return;

    const backendUrl = 'http://localhost:5000';
    img.src = story.imageUrl.startsWith('http') ? story.imageUrl : `${backendUrl}${story.imageUrl}`;

    // Update progress bars
    const progressFills = document.querySelectorAll('.story-progress-fill');
    progressFills.forEach((fill, index) => {
        fill.style.transition = 'none';
        if (index < currentStoryIndex) {
            fill.style.width = '100%';
        } else if (index > currentStoryIndex) {
            fill.style.width = '0%';
        } else {
            fill.style.width = '0%';
            // Force reflow
            void fill.offsetWidth;
            fill.style.transition = `width ${STORY_DURATION}ms linear`;
            fill.style.width = '100%';
        }
    });

    storyTimer = setTimeout(window.nextStory, STORY_DURATION);
};
