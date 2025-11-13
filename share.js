// Get data from URL parameters or localStorage
const urlParams = new URLSearchParams(window.location.search);
const surpriseId = urlParams.get('id');
const birthdayName = urlParams.get('name') || 'your friend';

document.addEventListener('DOMContentLoaded', function() {
    // Set birthday person's name
    document.getElementById('birthdayPersonName').textContent = birthdayName;
    
    // Generate the shareable link
    let shareableLink;
    
    if (surpriseId) {
        // If we have a surprise ID from URL
        shareableLink = window.location.origin + 
                       window.location.pathname.replace('share.html', 'viewer.html') + 
                       '?id=' + surpriseId;
    } else {
        // Try to get the latest surprise from localStorage
        const keys = Object.keys(localStorage);
        const birthdayKeys = keys.filter(key => key.startsWith('birthday_'));
        
        if (birthdayKeys.length > 0) {
            // Get the most recent one
            const latestKey = birthdayKeys.sort().pop();
            const surpriseData = JSON.parse(localStorage.getItem(latestKey));
            
            shareableLink = window.location.origin + 
                           window.location.pathname.replace('share.html', 'viewer.html') + 
                           '?id=' + latestKey;
            
            document.getElementById('birthdayPersonName').textContent = surpriseData.birthdayPerson;
        } else {
            // No surprise found, redirect to creator
            alert('No birthday surprise found. Please create one first!');
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Set the link
    const linkInput = document.getElementById('shareableLink');
    linkInput.value = shareableLink;
    
    // Set preview link
    document.getElementById('previewLink').href = shareableLink;
    
    // Copy link functionality
    document.getElementById('copyLink').addEventListener('click', function() {
        linkInput.select();
        document.execCommand('copy');
        
        // Show confirmation
        const originalText = this.textContent;
        this.textContent = '✅ Copied!';
        this.style.background = '#06d6a0';
        
        setTimeout(() => {
            this.textContent = originalText;
            this.style.background = '';
        }, 2000);
    });
    
    // WhatsApp share
    document.getElementById('whatsappShare').addEventListener('click', function() {
        const message = `🎂 Happy Birthday! I made a special birthday surprise for you! 🎁\n\n${shareableLink}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });
    
    // Email share
    document.getElementById('emailShare').addEventListener('click', function() {
        const subject = '🎁 Your Birthday Surprise is Ready!';
        const body = `Dear ${birthdayName},\n\nI created a special birthday surprise for you! 🎂\n\nClick here to see it: ${shareableLink}\n\nCan't wait for you to see it! 🎉\n\nLove,\n[Your Name]`;
        
        const emailText = `Subject: ${subject}\n\n${body}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(emailText).then(function() {
            const button = document.getElementById('emailShare');
            const originalText = button.textContent;
            button.textContent = '✅ Email Text Copied!';
            button.style.background = '#06d6a0';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
        });
    });
});

// Add some fun animations
document.addEventListener('DOMContentLoaded', function() {
    const popper = document.querySelector('.party-popper');
    
    // Add floating animation
    setInterval(() => {
        popper.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            popper.style.transform = 'translateY(0px)';
        }, 500);
    }, 1000);
});