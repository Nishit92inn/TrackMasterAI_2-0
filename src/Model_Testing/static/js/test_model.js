document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('uploadImageForm');
    const resultDiv = document.getElementById('predictionResult');
    const modelSelect = document.getElementById('modelSelect');
    const modelDetails = document.getElementById('modelDetails');

    // Fetch available models and populate the select dropdown
    fetch('/model_testing/get_models')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });

            // If there are models, display the model details section
            if (data.models.length > 0) {
                modelDetails.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Error fetching models');
        });

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        formData.append('model', modelSelect.value);

        fetch('/model_testing/upload_image', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    resultDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                } else {
                    resultDiv.innerHTML = `<div class="alert alert-success">Predicted Label: ${data.label}</div>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resultDiv.innerHTML = `<div class="alert alert-danger">An error occurred while processing the image.</div>`;
            });
    });
});