// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const addOfficialForm = document.getElementById('add-official-form');
    const createSampleBtn = document.getElementById('create-sample-data');
    const photoInput = document.getElementById('official-photo');

    // Add Official Form
    if (addOfficialForm) {
        addOfficialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(addOfficialForm);
            const submitBtn = addOfficialForm.querySelector('button[type="submit"]');
            
            // Validate form
            const name = formData.get('name').trim();
            const position = formData.get('position').trim();
            const state = formData.get('state');
            const photo = formData.get('photo');
            
            if (!name || !position || !state || !photo || photo.size === 0) {
                showMessage('Please fill in all required fields and select a photo', 'error');
                return;
            }
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = '💾 Adding...';
            
            fetch('/api/admin/official', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Official added successfully!', 'success');
                    addOfficialForm.reset();
                    
                    // Reload page after a delay to show the new official
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    const errorMsg = data.errors ? data.errors.join(', ') : data.message;
                    showMessage(errorMsg || 'Failed to add official', 'error');
                }
            })
            .catch(error => {
                console.error('Error adding official:', error);
                showMessage('Error adding official. Please try again.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = '💾 Add Official';
            });
        });
    }

    // Create Sample Data
    if (createSampleBtn) {
        createSampleBtn.addEventListener('click', function() {
            if (!confirm('This will create sample officials data. Continue?')) {
                return;
            }
            
            createSampleBtn.disabled = true;
            createSampleBtn.textContent = '📝 Creating...';

            fetch('/api/admin/sample-data', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Sample data created successfully!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showMessage('Failed to create sample data', 'error');
                    createSampleBtn.disabled = false;
                    createSampleBtn.textContent = '📝 Create Sample Data';
                }
            })
            .catch(error => {
                console.error('Error creating sample data:', error);
                showMessage('Error creating sample data', 'error');
                createSampleBtn.disabled = false;
                createSampleBtn.textContent = '📝 Create Sample Data';
            });
        });
    }

    // Photo preview
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    showMessage('Please select a valid image file (JPG, PNG, GIF)', 'error');
                    photoInput.value = '';
                    return;
                }
                
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    showMessage('Image file must be smaller than 10MB', 'error');
                    photoInput.value = '';
                    return;
                }
                
                // Show preview (optional enhancement)
                showPhotoPreview(file);
            }
        });
    }

    // Auto-populate fields based on other inputs
    const stateSelect = document.getElementById('official-state');
    const positionInput = document.getElementById('official-position');
    const categorySelect = document.getElementById('official-category');

    if (stateSelect && positionInput && categorySelect) {
        positionInput.addEventListener('change', function() {
            const position = positionInput.value.toLowerCase();
            
            // Auto-select category based on position
            if (position.includes('secretary of state')) {
                categorySelect.value = 'secretary_of_state';
            } else if (position.includes('governor')) {
                categorySelect.value = 'governor';
            } else if (position.includes('senator')) {
                categorySelect.value = 'senator';
            } else if (position.includes('mayor')) {
                categorySelect.value = 'mayor';
            }
        });
    }
});

function showPhotoPreview(file) {
    // Remove existing preview
    const existingPreview = document.getElementById('photo-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.createElement('div');
        preview.id = 'photo-preview';
        preview.innerHTML = `
            <div style="margin-top: 10px;">
                <strong>Preview:</strong><br>
                <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 6px; margin-top: 5px;">
            </div>
        `;
        
        const photoInput = document.getElementById('official-photo');
        photoInput.parentNode.appendChild(preview);
    };
    reader.readAsDataURL(file);
}

function showMessage(message, type) {
    let statusDiv = document.getElementById('status-message');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'status-message';
        statusDiv.className = 'status-message';
        document.body.appendChild(statusDiv);
    }

    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Utility functions for form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
        return 'Please select a valid image file (JPG, PNG, GIF)';
    }
    
    if (file.size > maxSize) {
        return 'Image file must be smaller than 10MB';
    }
    
    return null;
}
