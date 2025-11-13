// creator.js - User 1: Birthday Surprise Creator
let memories = [];
let birthdayData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have any existing data (for page refresh)
    const savedMemories = localStorage.getItem('temp_memories');
    const savedBirthdayData = localStorage.getItem('temp_birthday_data');
    
    if (savedMemories) {
        memories = JSON.parse(savedMemories);
        updateMemoryList();
        updatePhotoCount();
    }
    
    if (savedBirthdayData) {
        birthdayData = JSON.parse(savedBirthdayData);
        // Pre-fill the form
        document.getElementById('birthdayPersonName').value = birthdayData.birthdayPerson || '';
        document.getElementById('yourName').value = birthdayData.yourName || '';
        document.getElementById('birthdayMessage').value = birthdayData.mainMessage || '';
    }
});

// Start upload process
document.getElementById('startUpload').addEventListener('click', function() {
    const birthdayName = document.getElementById('birthdayPersonName').value.trim();
    const yourName = document.getElementById('yourName').value.trim();
    const birthdayMessage = document.getElementById('birthdayMessage').value.trim();

    if (!birthdayName || !yourName || !birthdayMessage) {
        alert('Please fill in all fields first!');
        return;
    }

    birthdayData = {
        birthdayPerson: birthdayName,
        yourName: yourName,
        mainMessage: birthdayMessage,
        created: new Date().toISOString()
    };

    // Save to temporary storage
    localStorage.setItem('temp_birthday_data', JSON.stringify(birthdayData));

    document.querySelector('.setup-section').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
});

// Image preview functionality
document.getElementById('memoryImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            this.value = '';
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            this.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.style.display = 'block';
        };
        reader.onerror = function() {
            alert('Error reading the file. Please try another image.');
            preview.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

// Add photo to memories list
document.getElementById('addPhoto').addEventListener('click', function() {
    const memoryImage = document.getElementById('memoryImage').files[0];
    const description = document.getElementById('photoDescription').value.trim();

    if (!memoryImage) {
        alert('Please select a photo first!');
        return;
    }

    if (!description) {
        alert('Please write a description for this photo!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const memory = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            image: e.target.result,
            description: description,
            timestamp: new Date().toLocaleString()
        };

        memories.push(memory);
        updateMemoryList();
        updatePhotoCount();
        
        // Save to temporary storage
        localStorage.setItem('temp_memories', JSON.stringify(memories));
        
        // Reset form
        document.getElementById('memoryImage').value = '';
        document.getElementById('photoDescription').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        
        // Enable generate button if we have at least one photo
        if (memories.length > 0) {
            document.getElementById('generateLink').disabled = false;
        }
        
        // Show success message
        showTempMessage('Photo added successfully!', 'success');
    };
    
    reader.onerror = function() {
        alert('Error reading the image file. Please try again.');
    };
    
    reader.readAsDataURL(memoryImage);
});

// Update the memories list display
function updateMemoryList() {
    const memoryList = document.getElementById('memoryList');
    
    if (memories.length === 0) {
        memoryList.innerHTML = '<p class="no-memories">No photos added yet. Add your first photo above!</p>';
        return;
    }
    
    memoryList.innerHTML = memories.map((memory, index) => `
        <div class="memory-item" data-id="${memory.id}">
            <div class="memory-preview">
                <img src="${memory.image}" alt="Memory ${index + 1}">
                <div class="memory-info">
                    <p class="memory-title"><strong>Photo ${index + 1}:</strong></p>
                    <p class="memory-desc">${memory.description}</p>
                </div>
                <button class="btn-remove" onclick="removeMemory('${memory.id}')" title="Remove this photo">×</button>
            </div>
        </div>
    `).join('');
}

// Update photo count
function updatePhotoCount() {
    const count = memories.length;
    document.getElementById('photoCount').textContent = count;
    
    // Update button text based on count
    const generateBtn = document.getElementById('generateLink');
    if (count > 0) {
        generateBtn.innerHTML = `🎁 Generate Birthday Surprise Link (${count} photo${count > 1 ? 's' : ''})`;
    } else {
        generateBtn.innerHTML = '🎁 Generate Birthday Surprise Link';
    }
}

// Remove a memory
function removeMemory(id) {
    if (confirm('Are you sure you want to remove this photo?')) {
        memories = memories.filter(memory => memory.id !== id);
        updateMemoryList();
        updatePhotoCount();
        
        // Update temporary storage
        localStorage.setItem('temp_memories', JSON.stringify(memories));
        
        if (memories.length === 0) {
            document.getElementById('generateLink').disabled = true;
        }
        
        showTempMessage('Photo removed', 'info');
    }
}

// Generate shareable link
document.getElementById('generateLink').addEventListener('click', function() {
    if (memories.length === 0) {
        alert('Please add at least one photo before generating the link!');
        return;
    }

    if (!birthdayData.birthdayPerson || !birthdayData.yourName || !birthdayData.mainMessage) {
        alert('Please complete all the birthday information first!');
        document.querySelector('.setup-section').style.display = 'block';
        document.getElementById('uploadSection').style.display = 'none';
        return;
    }

    // Create unique ID for this birthday surprise
    const surpriseId = 'birthday_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Save to localStorage with the unique ID
    const surpriseData = {
        ...birthdayData,
        memories: memories,
        id: surpriseId,
        totalPhotos: memories.length
    };
    
    try {
        localStorage.setItem(surpriseId, JSON.stringify(surpriseData));
        
        // Clean up temporary data
        localStorage.removeItem('temp_memories');
        localStorage.removeItem('temp_birthday_data');
        
        // Generate shareable URL
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = baseUrl.replace('index.html', 'share.html') + 
                        '?id=' + surpriseId + 
                        '&name=' + encodeURIComponent(birthdayData.birthdayPerson);
        
        // Redirect to share page
        window.location.href = shareUrl;
        
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            alert('Too many photos! Please remove some photos and try again. The browser storage is full.');
        } else {
            alert('Error saving your surprise. Please try again with fewer photos.');
        }
        console.error('Storage error:', error);
    }
});

// Show temporary message
function showTempMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message temp-message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#06d6a0' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .no-memories {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 20px;
    }
    
    .memory-title {
        margin-bottom: 5px;
        color: #333;
    }
    
    .memory-desc {
        color: #666;
        margin: 0;
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter to add photo (when in upload form)
    if (e.ctrlKey && e.key === 'Enter') {
        if (document.getElementById('uploadSection').style.display !== 'none') {
            document.getElementById('addPhoto').click();
        }
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        document.getElementById('memoryImage').value = '';
        document.getElementById('photoDescription').value = '';
        document.getElementById('imagePreview').style.display = 'none';
    }
});

// Prevent accidental page reload
window.addEventListener('beforeunload', function(e) {
    if (memories.length > 0 && !document.getElementById('shareSection').style.display !== 'none') {
        e.preventDefault();
        e.returnValue = 'You have unsaved photos. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Export functions for global access
window.removeMemory = removeMemory;
