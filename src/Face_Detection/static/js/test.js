document.addEventListener('DOMContentLoaded', function() {
    const useOurDatasetBtn = document.getElementById('useOurDatasetBtn');

    // Log to console to verify JS is loaded
    console.log('Test.js loaded');
    
    if (useOurDatasetBtn) {
        useOurDatasetBtn.addEventListener('click', function() {
            // Log to console and display a message on the website
            console.log('Use Our Dataset button clicked');
            const messageDiv = document.getElementById('messageDiv');
            if (messageDiv) {
                messageDiv.innerText = 'Use Our Dataset button clicked!';
            }
        });
    } else {
        console.log('Use Our Dataset button not found');
    }
});