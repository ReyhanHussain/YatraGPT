// memoirMint.js - Handles photo upload and management functionality

// Initialize drag and drop upload functionality
const initPhotoUpload = () => {
    const uploadArea = document.querySelector('.upload-area');
    const photoUpload = document.getElementById('photo-upload');

    if (!uploadArea || !photoUpload) return;

    // Click to trigger file selection
    uploadArea.addEventListener('click', () => {
        photoUpload.click();
    });

    // Drag over event - show active state
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });

    // Drag leave event - remove active state
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });

    // Drop event - handle dropped files
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            photoUpload.files = e.dataTransfer.files;
            updatePhotoPreview(e.dataTransfer.files, uploadArea);
        }
    });

    // File input change event
    photoUpload.addEventListener('change', function() {
        if (this.files.length) {
            updatePhotoPreview(this.files, uploadArea);
        }
    });
};

// Update the upload area with preview of selected files
const updatePhotoPreview = (files, uploadArea) => {
    // In a real application, you would handle file uploads here
    console.log(`${files.length} files selected for upload`);
    uploadArea.innerHTML = `
        <i class="fas fa-check-circle" style="color: #2ecc71;"></i>
        <p>${files.length} file(s) selected</p>
        <p class="small">Click to change selection</p>
    `;
};

// Main initialization function
const initMemoirMint = () => {
    initPhotoUpload();
};

export default initMemoirMint; 