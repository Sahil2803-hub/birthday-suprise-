// creator.js - COMPLETE FIXED VERSION
let memories = [];
let birthdayData = {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - initializing...');
    
    // Load any saved progress from previous session
    const savedMemories = localStorage.getItem('temp_memories');
    const savedBirthdayData = localStorage.getItem('temp_birthday_data');
    
    if (savedMemories) {
        try {
            memories = JSON.parse(savedMemories);
            console.log('Loaded memories:', memories.length);
            updateMemoryList();
            updatePhotoCount();
        } catch (e) {
            console.error('Error loading memories:', e);
        }
    }
    
    if (savedBirthdayData) {
        try {
            birthdayData = JSON.parse(savedBirthdayData);
            document.getElementById('birthdayPersonName').value = birthdayData.birthdayPerson || '';
            document.getElementById('yourName').value = birthdayData.yourName || '';
            document.getElementById('birthdayMessage').value = birthdayData.mainMessage || '';
            console.log('Loaded birthday data:', birthdayData);
        } catch (e) {
            console.error('Error loading birthday data:', e);
        }
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Start upload process
    document.getElementById('startUpload').addEventListener('click', function() {
        console.log('Start upload clicked');
        startUploadProcess();
    });

    // Image preview
    document.getElementById('memoryImage').addEventListener('change', function(e) {
        console.log('Image selected');
        handleImagePreview(e);
    });

    // Add photo to list
    document.getElementById('addPhoto').addEventListener('click', function() {
        console.log('Add photo clicked');
        addPhotoToList();
    });

    // Generate shareable link
    document.getElementById('generateLink').addEventListener('click', function() {
        console.log('Generate link clicked');
        generateShareableLink();
    });
}

function startUploadProcess() {
    const birthdayName = document.getElementById('birthdayPersonName').value.trim();
    const yourName = document.getElementById('yourName').value.trim();
    const birthdayMessage = document.getElementById('birthdayMessage').value.trim();

    console.log('Form data:', { birthdayName, yourName, birthdayMessage });

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
    console.log('Saved birthday data to localStorage');

    // Show upload section
    document.querySelector('.setup-section').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        console.log('File selected:', file.name, file.size);
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            this.value = '';
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPEG, PNG, etc.)');
            this.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('Image loaded successfully');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 10px;">`;
            preview.style.display = 'block';
        };
        
        reader.onerror = function() {
            console.error('Error reading file');
            alert('Error reading the file. Please try another image.');
            preview.style.display = 'none';
        };
        
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
}

function addPhotoToList() {
    const memoryImage = document.getElementById('memoryImage').files[0];
    const description = document.getElementById('photoDescription').value.trim();

    console.log('Adding photo:', { hasImage: !!memoryImage, description });

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
            id: 'memory_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            image: e.target.result,
            description: description,
            timestamp: new Date().toLocaleString()
        };

        memories.push(memory);
        console.log('Memory added. Total memories:', memories.length);
        
        updateMemoryList();
        updatePhotoCount();
        
        // Save to temporary storage
        localStorage.setItem('temp_memories', JSON.stringify(memories));
        console.log('Saved memories to localStorage');
        
        // Reset form
        document.getElementById('memoryImage').value = '';
        document.getElementById('photoDescription').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        
        // Enable generate button if we have photos
        if (memories.length > 0) {
            document.getElementById('generateLink').disabled = false;
            console.log('Generate button enabled');
        }
        
        showTempMessage('✅ Photo added successfully!', 'success');
    };
    
    reader.onerror = function() {
        console.error('Error reading image file');
        alert('Error reading the image file. Please try again.');
    };
    
    reader.readAsDataURL(memoryImage);
}

function generateShareableLink() {
    console.log('=== STARTING LINK GENERATION ===');
    
    if (memories.length === 0) {
        alert('Please add at least one photo before generating the link!');
        return;
    }

    if (!birthdayData.birthdayPerson || !birthdayData.yourName || !birthdayData.mainMessage) {
        alert('Please complete all the birthday information first!');
        // Go back to setup
        document.querySelector('.setup-section').style.display = 'block';
        document.getElementById('uploadSection').style.display = 'none';
        return;
    }

    // Create unique ID for this birthday surprise
    const surpriseId = 'birthday_' + Date.now();
    console.log('Generated surprise ID:', surpriseId);
    
    const surpriseData = {
        ...birthdayData,
        memories: memories,
        id: surpriseId,
        totalPhotos: memories.length,
        generatedAt: new Date().toISOString()
    };
    
    console.log('Surprise data prepared:', surpriseData);
    
    try {
        // Save to localStorage with the unique ID
        localStorage.setItem(surpriseId, JSON.stringify(surpriseData));
        console.log('✅ Data saved to localStorage with key:', surpriseId);
        
        // Verify it was saved
        const verifyData = localStorage.getItem(surpriseId);
        if (verifyData) {
            console.log('✅ Data verification successful');
        } else {
            console.error('❌ Data verification failed');
            alert('Error saving data. Please try again.');
            return;
        }
        
        // Generate the shareable link
        const shareableLink = generateViewerLink(surpriseId);
        console.log('✅ Generated shareable link:', shareableLink);
        
        // Show the share section
        showShareSection(shareableLink, surpriseData);
        
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
        if (error.name === 'QuotaExceededError') {
            alert('Too much data! Please remove some photos and try again.');
        } else {
            alert('Error saving your surprise. Please try again.');
        }
    }
}

function generateViewerLink(surpriseId) {
    // Get current page URL
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    let baseUrl;
    
    // Check if we're on GitHub Pages
    if (currentUrl.includes('github.io')) {
        // On GitHub Pages - use the current domain
        baseUrl = currentUrl.split('/').slice(0, 3).join('/'); // Gets https://username.github.io
        const repoName = currentUrl.split('/')[3]; // Gets repository name
        if (repoName) {
            baseUrl += '/' + repoName;
        }
        console.log('GitHub Pages base URL:', baseUrl);
    } else {
        // Local development
        baseUrl = currentUrl.split('/').slice(0, -1).join('/');
        console.log('Local base URL:', baseUrl);
    }
    
    // Construct the viewer URL
    const viewerUrl = baseUrl + '/viewer.html?id=' + surpriseId;
    console.log('Final viewer URL:', viewerUrl);
    
    return viewerUrl;
}

function showShareSection(link, surpriseData) {
    console.log('Showing share section with link:', link);
    
    // Hide other sections, show share section
    document.querySelector('.setup-section').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('shareSection').style.display = 'block';
    
    // Set the shareable link
    const shareInput = document.getElementById('shareableLink');
    if (shareInput) {
        shareInput.value = link;
        console.log('Share input set:', link);
    }
    
    // Set preview link
    const previewLink = document.getElementById('previewLink');
    if (previewLink) {
        previewLink.href = link;
        console.log('Preview link set');
    }
    
    // Generate QR code
    generateQRCode(link);
    
    // Setup copy button
    setupCopyButton(link);
    
    // Setup WhatsApp share
    setupWhatsAppShare(link);
    
    console.log('✅ Share section fully loaded');
}

function generateQRCode(link) {
    const qrContainer = document.getElementById('qrCode');
    if (!qrContainer) {
        console.log('QR container not found, creating one...');
        return;
    }
    
    console.log('Generating QR code for:', link);
    
    // Using a free QR code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
    
    qrContainer.innerHTML = `
        <img src="${qrUrl}" alt="QR Code" 
             style="border: 2px solid #e1e5e9; padding: 15px; background: white; border-radius: 15px; max-width: 200px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <p style="font-size: 14px; margin-top: 15px; color: #666; font-weight: 500;">Scan with phone camera 📱</p>
    `;
    
    console.log('✅ QR code generated');
}

function setupCopyButton(link) {
    const copyBtn = document.getElementById('copyLink');
    if (!copyBtn) {
        console.log('Copy button not found');
        return;
    }
    
    copyBtn.onclick = function() {
        console.log('Copy button clicked');
        
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(function() {
                console.log('✅ Link copied to clipboard (modern API)');
                showCopySuccess(this);
            }.bind(this)).catch(function(err) {
                console.error('Modern clipboard failed:', err);
                fallbackCopy(link, this);
            });
        } else {
            // Fallback for older browsers
            fallbackCopy(link, this);
        }
    };
    
    console.log('✅ Copy button setup complete');
}

function fallbackCopy(link, button) {
    const tempInput = document.createElement('input');
    tempInput.value = link;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        if (successful) {
            console.log('✅ Link copied to clipboard (fallback)');
            showCopySuccess(button);
        } else {
            console.error('❌ Fallback copy failed');
            alert('Failed to copy link. Please copy it manually.');
        }
    } catch (err) {
        document.body.removeChild(tempInput);
        console.error('❌ Fallback copy error:', err);
        alert('Failed to copy link. Please copy it manually: ' + link);
    }
}

function showCopySuccess(button) {
    const originalText = button.textContent;
    button.textContent = '✅ Copied!';
    button.style.background = '#06d6a0';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

function setupWhatsAppShare(link) {
    const whatsappBtn = document.getElementById('whatsappShare');
    if (!whatsappBtn) {
        console.log('WhatsApp button not found');
        return;
    }
    
    whatsappBtn.onclick = function() {
        console.log('WhatsApp share clicked');
        const message = `🎂 Happy Birthday! I made a special birthday surprise for you! 🎁\n\nClick here: ${link}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    console.log('✅ WhatsApp button setup complete');
}

function updateMemoryList() {
    const memoryList = document.getElementById('memoryList');
    if (!memoryList) {
        console.log('Memory list container not found');
        return;
    }
    
    if (memories.length === 0) {
        memoryList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666; font-style: italic;">
                <p>No photos added yet.</p>
                <p>Add your first photo above! 📸</p>
            </div>
        `;
        return;
    }
    
    memoryList.innerHTML = memories.map((memory, index) => `
        <div class="memory-item" data-id="${memory.id}" style="margin-bottom: 15px;">
            <div class="memory-preview" style="display: flex; align-items: center; background: #f8f9fa; padding: 15px; border-radius: 10px; border-left: 4px solid #667eea;">
                <img src="${memory.image}" alt="Memory ${index + 1}" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                <div class="memory-info" style="flex: 1;">
                    <p style="margin: 0; font-weight: bold; color: #333;">Photo ${index + 1}</p>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${memory.description}</p>
                </div>
                <button class="btn-remove" onclick="removeMemory('${memory.id}')" 
                        style="background: #ff6b6b; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 16px;"
                        title="Remove this photo">
                    ×
                </button>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Memory list updated with', memories.length, 'photos');
}

function updatePhotoCount() {
    const countElement = document.getElementById('photoCount');
    if (countElement) {
        countElement.textContent = memories.length;
        console.log('Photo count updated:', memories.length);
    }
}

function removeMemory(id) {
    console.log('Removing memory:', id);
    
    if (confirm('Are you sure you want to remove this photo?')) {
        memories = memories.filter(memory => memory.id !== id);
        console.log('Memory removed. Remaining:', memories.length);
        
        updateMemoryList();
        updatePhotoCount();
        
        // Update temporary storage
        localStorage.setItem('temp_memories', JSON.stringify(memories));
        
        // Disable generate button if no photos left
        if (memories.length === 0) {
            document.getElementById('generateLink').disabled = true;
            console.log('Generate button disabled - no photos');
        }
        
        showTempMessage('Photo removed', 'info');
    }
}

function showTempMessage(message, type = 'info') {
    console.log('Show message:', message, type);
    
    // Create message element
    const messageDiv = document.createElement('div');
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
        z-index: 10000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Make removeMemory globally available
window.removeMemory = removeMemory;

// Add debug function to check localStorage
window.debugStorage = function() {
    console.log('=== LOCALSTORAGE DEBUG ===');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('birthday_') || key.startsWith('temp_')) {
            console.log('Key:', key);
            try {
                const data = JSON.parse(localStorage.getItem(key));
                console.log('Data:', data);
            } catch (e) {
                console.log('Value:', localStorage.getItem(key));
            }
        }
    });
    console.log('=== END DEBUG ===');
};

console.log('✅ creator.js loaded successfully');
