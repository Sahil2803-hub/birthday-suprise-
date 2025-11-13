let currentPhotoIndex = 0;
let surpriseData = null;

// Get surprise ID from URL
const urlParams = new URLSearchParams(window.location.search);
const surpriseId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', function() {
    if (!surpriseId) {
        showError();
        return;
    }

    loadSurprise();
});

function loadSurprise() {
    const data = localStorage.getItem(surpriseId);
    
    if (!data) {
        showError();
        return;
    }

    surpriseData = JSON.parse(data);
    displaySurprise();
}

function displaySurprise() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    
    // Set basic info
    document.getElementById('viewerBirthdayName').textContent = surpriseData.birthdayPerson;
    document.getElementById('senderName').textContent = surpriseData.yourName;
    document.getElementById('birthdayWish').textContent = surpriseData.mainMessage;
    
    // Display first photo
    displayCurrentPhoto();
    
    // Setup navigation
    document.getElementById('prevBtn').addEventListener('click', showPreviousPhoto);
    document.getElementById('nextBtn').addEventListener('click', showNextPhoto);
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            showPreviousPhoto();
        } else if (e.key === 'ArrowRight') {
            showNextPhoto();
        }
    });
}

function displayCurrentPhoto() {
    const container = document.getElementById('memoriesContainer');
    const memory = surpriseData.memories[currentPhotoIndex];
    
    container.innerHTML = `
        <div class="memory-display">
            <div class="memory-image-container">
                <img src="${memory.image}" alt="Memory photo" class="memory-image">
            </div>
            <div class="memory-description">
                <p>${memory.description}</p>
            </div>
        </div>
    `;
    
    updateNavigation();
}

function showNextPhoto() {
    if (currentPhotoIndex < surpriseData.memories.length - 1) {
        currentPhotoIndex++;
        displayCurrentPhoto();
    }
}

function showPreviousPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        displayCurrentPhoto();
    }
}

function updateNavigation() {
    document.getElementById('photoCounter').textContent = 
        `Photo ${currentPhotoIndex + 1} of ${surpriseData.memories.length}`;
    
    document.getElementById('prevBtn').disabled = currentPhotoIndex === 0;
    document.getElementById('nextBtn').disabled = currentPhotoIndex === surpriseData.memories.length - 1;
}

function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
}
