document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('scraping-form');
    const progressBar = document.getElementById('progress-bar');
    const homeButton = document.getElementById('home-button');
    const rebuildButton = document.getElementById('rebuild-button');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        startScraping();
    });

    rebuildButton.addEventListener('click', function () {
        rebuildMetadata();
    });

    function startScraping() {
        fetch('/image_scraper/start_scraping', {
            method: 'POST',
            body: new FormData(form)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'started') {
                let progressInterval = setInterval(() => {
                    fetch('/image_scraper/progress_data')
                        .then(response => response.json())
                        .then(data => {
                            progressBar.style.width = data.progress + '%';
                            progressBar.setAttribute('aria-valuenow', data.progress);
                            progressBar.textContent = data.progress + '%';
                            if (data.progress >= 100) {
                                clearInterval(progressInterval);
                                homeButton.disabled = false;
                            }
                        });
                }, 1000);
            }
        });
    }

    function rebuildMetadata() {
        fetch('/image_scraper/rebuild_metadata', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        });
    }
});
