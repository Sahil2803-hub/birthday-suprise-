// creator.js - FIXED FOR GITHUB PAGES
let memories = [];
let birthdayData = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - initializing...');
    
    // Load any saved progress
    const savedMemories = localStorage.getItem('temp_memories');
    const savedBirthdayData = localStorage.getItem('temp_birthday_data');
    
    if (savedMemories) {
        memories = JSON.parse(savedMemories);
        updateMemoryList();
        updatePhotoCount();
    }
    
    if (savedBirthdayData) {
        birthdayData = JSON.parse(savedBirthdayData);
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

    localStorage.setItem('temp_birthday_data', JSON.stringify(birthdayData));

    document.querySelector('.setup-section').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
});

// Image preview
document.getElementById('memoryImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 10px;">`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

// Add photo to list
document.getElementById('addPhoto').addEventListener('click', function() {
    const memoryImage = document.getElementById('memoryImage').files[0];
    const description = document.getElementById('photoDescription').value.trim();

    if (!memoryImage || !description) {
        alert('Please select a photo and write a description!');
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
        
        localStorage.setItem('temp_memories', JSON.stringify(memories));
        
        // Reset form
        document.getElementById('memoryImage').value = '';
        document.getElementById('photoDescription').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        
        if (memories.length > 0) {
            document.getElementById('generateLink').disabled = false;
        }
        
        alert('✅ Photo added successfully!');
    };
    reader.readAsDataURL(memoryImage);
});

// ✅ FIXED: Generate shareable link for GitHub Pages
document.getElementById('generateLink').addEventListener('click', function() {
    console.log('=== GENERATING LINK ===');
    
    if (memories.length === 0) {
        alert('Please add at least one photo!');
        return;
    }

    const surpriseId = 'birthday_' + Date.now();
    console.log('Surprise ID:', surpriseId);
    
    const surpriseData = {
        ...birthdayData,
        memories: memories,
        id: surpriseId
    };
    
    // Save to localStorage
    localStorage.setItem(surpriseId, JSON.stringify(surpriseData));
    console.log('Data saved to localStorage');
    
    // ✅ FIXED: Generate proper GitHub Pages URL
    let shareableLink;
    
    // Check if we're on GitHub Pages
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('github.io')) {
        // On GitHub Pages - use fixed URL structure
        const baseUrl = 'https://Sahil2803-hub.github.io/birthday-suprise';
        shareableLink = baseUrl + '/viewer.html?id=' + surpriseId;
        console.log('GitHub Pages link:', shareableLink);
    } else {
        // Local development
        const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        shareableLink = baseUrl + '/viewer.html?id=' + surpriseId;
        console.log('Local link:', shareableLink);
    }
    
    // Show share section
    showShareSection(shareableLink, surpriseData);
});

function showShareSection(link, surpriseData) {
    console.log('Showing share section with link:', link);
    
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('shareSection').style.display = 'block';
    
    // Set the shareable link
    document.getElementById('shareableLink').value = link;
    
    // Set preview link
    document.getElementById('previewLink').href = link;
    
    // Generate QR code
    generateQRCode(link);
    
    // Setup copy button
    setupCopyButton(link);
    
    // Setup WhatsApp share
    setupWhatsAppShare(link);
}

function generateQRCode(link) {
    const qrContainer = document.getElementById('qrCode');
    if (!qrContainer) return;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
    
    qrContainer.innerHTML = `
        <img src="${qrUrl}" alt="QR Code" 
             style="border: 2px solid #e1e5e9; padding: 15px; background: white; border-radius: 15px; max-width: 200px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <p style="font-size: 14px; margin-top: 15px; color: #666; font-weight: 500;">Scan with phone camera 📱</p>
    `;
}

function setupCopyButton(link) {
    const copyBtn = document.getElementById('copyLink');
    if (!copyBtn) return;
    
    copyBtn.onclick = function() {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(function() {
                showCopySuccess(this);
            }.bind(this)).catch(function(err) {
                fallbackCopy(link, this);
            });
        } else {
            fallbackCopy(link, this);
        }
    };
}

function fallbackCopy(link, button) {
    const tempInput = document.createElement('input');
    tempInput.value = link;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(tempInput);
        if (successful) {
            showCopySuccess(button);
        } else {
            alert('Failed to copy link. Please copy it manually.');
        }
    } catch (err) {
        document.body.removeChild(tempInput);
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
    if (!whatsappBtn) return;
    
    whatsappBtn.onclick = function() {
        const message = `🎂 Happy Birthday! I made a special birthday surprise for you! 🎁\n\nClick here: ${link}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
}

function updateMemoryList() {
    const memoryList = document.getElementById('memoryList');
    if (!memoryList) return;
    
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
        <div class="memory-item" style="margin-bottom: 15px;">
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
}

function updatePhotoCount() {
    const countElement = document.getElementById('photoCount');
    if (countElement) {
        countElement.textContent = memories.length;
    }
}

function removeMemory(id) {
    if (confirm('Are you sure you want to remove this photo?')) {
        memories = memories.filter(memory => memory.id !== id);
        updateMemoryList();
        updatePhotoCount();
        localStorage.setItem('temp_memories', JSON.stringify(memories));
        
        if (memories.length === 0) {
            document.getElementById('generateLink').disabled = true;
        }
    }
}

window.removeMemory = removeMemory;
