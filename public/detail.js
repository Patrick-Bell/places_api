document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const title = decodeURIComponent(urlParams.get('title'));

    const fetchDetailInfo = () => {
        fetch(`/detail?title=${encodeURIComponent(title)}`)
        .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(title)
                return response.json();
            })
            .then(data => {
                console.log(data)
                console.log('Detail data:', data); // Debugging output
                displayDetail(data); // Display detailed information on detail page
            })
            .catch(error => handleError('Error fetching detail information:', error));
    };

    const displayDetail = (data) => {
        const detailContent = document.querySelector('.detail-content');
        detailContent.innerHTML = `
            <h2>${title}</h2>
            <p>${data.extract}</p>
            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${title}">` : ''}
        `;
    };

    const handleError = (message, error = '') => {
        const errorDiv = document.getElementById('error');
        errorDiv.innerHTML = `<p>${message} ${error}</p>`;
        console.error(message, error);
    };

    fetchDetailInfo();
});
