const citySearch = document.querySelector('.city-search');
const searchButton = document.querySelector('.search-button');
const placesContainer = document.querySelector('.places-container');
const errorDiv = document.getElementById('error');

searchButton.addEventListener('click', findPlacesNearLocation);

function findPlacesNearLocation() {
    const city = citySearch.value.trim();
    if (city) {
        fetchGeoLocation(city);
    } else {
        alert('Please enter a city name.');
    }
}

function fetchGeoLocation(city) {
    fetch(`/geocode?city=${city}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Geolocation data:', data); // Debugging output
            if (data.error || !data.results || data.results.length === 0) {
                handleError('Location not found.');
            } else {
                const location = data.results[0].geometry.location;
                fetchPlaces(location.lat, location.lng);
            }
        })
        .catch(error => handleError('Error fetching geolocation:', error));
}

function fetchPlaces(lat, lng) {
    fetch(`/places?lat=${lat}&lng=${lng}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Places data:', data); // Debugging output
            if (data.error) {
                handleError('Error fetching tourist attractions.', data.error);
            } else {
                displayPlaces(data); // Display basic information on main page
            }
        })
        .catch(error => handleError('Error fetching places:', error));
}

function displayPlaces(attractions) {
    placesContainer.innerHTML = ''; // Clear any previous content

    attractions.forEach(attraction => {
        const placeElement = document.createElement('div');
        placeElement.classList.add('place');
        placeElement.innerHTML = `
            <h2>${attraction.name}</h2>
            <p>${attraction.vicinity}</p>
            <button class="read-more-btn">Read More</button>
        `;
        placeElement.querySelector('.read-more-btn').addEventListener('click', () => {
            viewDetail(attraction.name);
        });
        placesContainer.appendChild(placeElement);
    });
}

function viewDetail(title) {
    window.location.href = `/detail.html?title=${encodeURIComponent(title)}`;
}

function handleError(message, error = '') {
    errorDiv.innerHTML = `<p>${message} ${error}</p>`;
    console.error(message, error);
}
