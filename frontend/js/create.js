import Api from './api.js';
import { showToast } from './utils.js';

window.openCreateModal = () => {
    const modalHtml = `
        <div class="modal-overlay" id="create-modal" onclick="if(event.target === this) closeCreateModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create new post</h2>
                    <i class="fa-solid fa-xmark modal-close" onclick="closeCreateModal()" style="cursor: pointer;"></i>
                </div>
                <div class="modal-body">
                    <form id="create-post-form" onsubmit="submitPost(event)">
                        <div class="create-post-preview" id="image-preview-container">
                            <i class="fa-regular fa-image" style="font-size: 48px; color: var(--text-secondary);"></i>
                        </div>
                        <div class="file-input-wrapper">
                            <button type="button" class="btn-primary" style="width: 100%;">Select from computer</button>
                            <input type="file" id="post-image-input" accept="image/jpeg,image/png,image/gif,image/webp" onchange="previewImage(this)">
                        </div>
                        <textarea id="post-caption-input" class="create-post-caption" placeholder="Write a caption..." style="display: none; margin-top: 16px; width: 100%;"></textarea>
                        <button type="submit" id="post-submit-btn" class="btn-primary" style="display: none; width: 100%; margin-top: 8px;">Share</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.closeCreateModal = () => {
    const modal = document.getElementById('create-modal');
    if (modal) modal.remove();
};

window.previewImage = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const container = document.getElementById('image-preview-container');
            container.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            
            // Show caption and submit
            document.getElementById('post-caption-input').style.display = 'block';
            document.getElementById('post-submit-btn').style.display = 'block';
            
            // Hide file input button visually but keep input active
            const btn = document.querySelector('.file-input-wrapper .btn-primary');
            if (btn) btn.style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.submitPost = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('post-submit-btn');
    const imageInput = document.getElementById('post-image-input');
    const captionInput = document.getElementById('post-caption-input');
    
    if (!imageInput.files || !imageInput.files[0]) {
        return showToast('Please select an image', 'error');
    }
    
    btn.disabled = true;
    btn.textContent = 'Sharing...';
    
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('caption', captionInput.value);
    
    try {
        await Api.createPost(formData);
        showToast('Post shared successfully!');
        closeCreateModal();
        // Refresh feed if on home page
        if (window.location.hash === '#/') {
            window.location.reload();
        }
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Share';
    }
};
