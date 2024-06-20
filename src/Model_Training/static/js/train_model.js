// static/js/train_model.js

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('training-form');
    const progressBar = document.getElementById('progress-bar');
    const statusDiv = document.getElementById('training-status');
    const logDiv = document.getElementById('training-log');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        startTraining();
    });

    function startTraining() {
        const formData = new FormData(form);
        const num_epochs = formData.get('num_epochs');
        const batch_size = formData.get('batch_size');

        fetch('/model_training/start_training', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ num_epochs, batch_size })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'started') {
                statusDiv.textContent = 'Training started...';
                let progressInterval = setInterval(() => {
                    fetch('/model_training/training_progress')
                        .then(response => response.json())
                        .then(data => {
                            progressBar.style.width = `${data.epoch / num_epochs * 100}%`;
                            progressBar.setAttribute('aria-valuenow', data.epoch / num_epochs * 100);
                            progressBar.textContent = `Epoch: ${data.epoch} / ${num_epochs}`;
                            statusDiv.innerHTML = `Epoch: ${data.epoch} / ${num_epochs}<br>Accuracy: ${data.accuracy}<br>Loss: ${data.loss}<br>Validation Accuracy: ${data.val_accuracy}<br>Validation Loss: ${data.val_loss}`;
                            logDiv.innerHTML += `Epoch ${data.epoch}: Accuracy: ${data.accuracy}, Loss: ${data.loss}, Validation Accuracy: ${data.val_accuracy}, Validation Loss: ${data.val_loss}<br>`;

                            if (data.status === 'completed') {
                                clearInterval(progressInterval);
                                statusDiv.innerHTML = `Training completed. Model saved as ${data.model_path}. Training history saved as ${data.history_path}.`;
                            }
                        });
                }, 1000);
            }
        });
    }
});