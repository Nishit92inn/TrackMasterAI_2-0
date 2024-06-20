// src/Face_Detection/static/js/face_detection.js

document.addEventListener('DOMContentLoaded', function() {
    const useOurDatasetBtn = document.getElementById('useOurDatasetBtn');
    const useOpenSourceDatasetBtn = document.getElementById('useOpenSourceDatasetBtn');
    const ourDatasetOptions = document.getElementById('ourDatasetOptions');
    const faceDetectionSection = document.getElementById('faceDetectionSection');
    const overallProgressBar = document.getElementById('overall-progress-bar');
    const overallProgressText = document.getElementById('overall-message');

    useOurDatasetBtn.addEventListener('click', function() {
        console.log('Use Our Dataset button clicked');
        ourDatasetOptions.style.display = 'block';
    });

    useOpenSourceDatasetBtn.addEventListener('click', function() {
        console.log('Use OpenSource Dataset button clicked');
        window.location.href = '/face_detection/use_opensource_dataset';
    });

    document.getElementById('extractFacesBtn').addEventListener('click', function() {
        console.log('Extract Faces button clicked');
        faceDetectionSection.style.display = 'block';
        loadCelebrityFolders();
    });

    document.getElementById('startFaceDetectionAllBtn').addEventListener('click', function() {
        console.log('Start Face Detection for All Folders button clicked');
        startFaceDetectionAll();
    });

    function loadCelebrityFolders() {
        console.log('Loading celebrity folders');
        fetch('/face_detection/get_celebrity_folders')
            .then(response => response.json())
            .then(data => {
                console.log('Celebrity folders loaded:', data);
                const celebrityFoldersList = document.getElementById('celebrityFoldersList');
                celebrityFoldersList.innerHTML = '';
                data.folders.forEach(function(name) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.dataset.celebrity = name;
                    li.innerHTML = `
                        <a href="#" class="celebrity-name">${name}</a>
                        <div class="folder-actions" style="display: none;">
                            <button class="btn btn-primary start-face-detection">Start Face Detection</button>
                            <div class="progress mt-2" style="display: none;">
                                <div class="progress-bar progress-bar-striped" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                            </div>
                            <div class="reprocess-options" style="display: none;">
                                <p>Processed images already exist. Do you wish to re-extract the faces again?</p>
                                <button class="btn btn-warning reprocess-yes">Yes</button>
                                <button class="btn btn-secondary reprocess-skip">Skip</button>
                            </div>
                        </div>`;
                    celebrityFoldersList.appendChild(li);
                });
            });
    }

    document.getElementById('celebrityFoldersList').addEventListener('click', function(event) {
        const target = event.target;

        if (target.classList.contains('celebrity-name')) {
            console.log('Celebrity folder clicked:', target.textContent);
            const folderActions = target.nextElementSibling;
            folderActions.style.display = folderActions.style.display === 'none' ? 'block' : 'none';
        }

        if (target.classList.contains('start-face-detection')) {
            const celebrityFolder = target.closest('li').dataset.celebrity;
            console.log('Start Face Detection button clicked for:', celebrityFolder);
            checkProcessed(celebrityFolder, target);
        }

        if (target.classList.contains('reprocess-yes')) {
            const celebrityFolder = target.closest('li').dataset.celebrity;
            console.log('Reprocess Yes button clicked for:', celebrityFolder);
            startFaceDetection(celebrityFolder, true);
        }

        if (target.classList.contains('reprocess-skip')) {
            console.log('Reprocess Skip button clicked');
            const reprocessOptions = target.closest('.reprocess-options');
            if (reprocessOptions) {
                reprocessOptions.style.display = 'none';
            }
        }
    });

    function checkProcessed(celebrityFolder, target) {
        console.log('Checking if processed images exist for:', celebrityFolder);
        fetch(`/face_detection/check_processed?celebrity=${celebrityFolder}`)
            .then(response => response.json())
            .then(data => {
                console.log('Processed check result for', celebrityFolder, ':', data);
                const reprocessOptions = target.closest('li').querySelector('.reprocess-options');
                if (data.processed) {
                    if (reprocessOptions) {
                        reprocessOptions.style.display = 'block';
                    }
                } else {
                    startFaceDetection(celebrityFolder);
                }
            });
    }

    function startFaceDetection(celebrityFolder, reprocess = false) {
        const progressBar = document.querySelector(`[data-celebrity="${celebrityFolder}"] .progress-bar`);
        const progressElement = progressBar ? progressBar.closest('.progress') : null;
        if (progressElement) {
            progressElement.style.display = 'block';
        }

        fetch('/face_detection/start_face_detection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ celebrity_name: celebrityFolder, reprocess: reprocess }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'started') {
                updateProgress(celebrityFolder);
            }
        });
    }

    function startFaceDetectionAll() {
        if (overallProgressBar) {
            overallProgressBar.style.display = 'block';
        }

        fetch('/face_detection/start_face_detection_all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'started') {
                updateProgress();
            }
        });
    }

    function updateProgress(celebrityFolder = null) {
        const interval = setInterval(function() {
            fetch('/face_detection/progress_data')
                .then(response => response.json())
                .then(data => {
                    const progress = data.progress;
                    console.log('Progress update:', data);
                    if (celebrityFolder) {
                        const progressBar = document.querySelector(`[data-celebrity="${celebrityFolder}"] .progress-bar`);
                        if (progressBar) {
                            progressBar.style.width = `${progress}%`;
                            progressBar.innerText = `${progress}%`;
                        }
                    } else {
                        if (overallProgressBar) {
                            overallProgressBar.style.width = `${progress}%`;
                            overallProgressBar.innerText = `${progress}%`;
                            overallProgressText.innerText = `Progress: ${progress}%`;
                        }
                    }
                    if (progress >= 100) {
                        clearInterval(interval);
                    }
                });
        }, 1000);
    }
});