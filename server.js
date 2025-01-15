require('dotenv').config(); // Load environment variables       
const express = require('express');
const axios = require('axios');
const app = express();      
const  port = 3000;            
        
     
 const geoLocationApiKey = 'AIzaSyAMHSff5psiIahOTIauOeEfZ931odqYFY0'
const placesApiKey = 'AIzaSyCVCeWXKFZ2_esgya8qX2yL3JNmGttm0tk'
   
app.use(express.static('public'));   
     
app.get('/geocode', async (req, res) => {
    const city = req.query.city;
    try {
        console.log(`Fetching geocode data for city: ${city}`);
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${geoLocationApiKey}`);
        console.log('Geocode response status:', response.status); // Log response status
        console.log('Geocode response data:', response.data); // Debugging output
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching geocode data:', error); // Log the error
        res.status(500).json({ error: 'Error fetching geocode data' });
    }
});


app.get('/places', async (req, res) => {
    const { lat, lng } = req.query;
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location: `${lat},${lng}`,
                radius: 1500,
                type: 'tourist_attraction',
                key: placesApiKey
            }
        });

        const landmarks = response.data.results;
        res.json(landmarks);
    } catch (error) {
        console.error('Error fetching landmarks:', error);
        res.status(500).json({ error: 'Error fetching landmarks' });
    }
});

app.get('/detail', async (req, res) => {
    const { title } = req.query;
    try {
        console.log(`Fetching detail information for: ${title}`);

        // Fetch additional information for the title, including Wikipedia info
        const wikipediaInfo = await fetchWikipediaInfo(title);

        console.log(wikipediaInfo)

        res.json(wikipediaInfo); // Return the detailed information as JSON
    } catch (error) {
        console.error('Error fetching detail information:', error);
        res.status(500).json({ error: 'Error fetching detail information' });
    }
});

// Function to fetch Wikipedia information
const fetchWikipediaInfo = async (title) => {
    try {
        const response = await axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
                action: 'query',
                format: 'json',
                prop: 'extracts|pageimages|coordinates|info|categories|sections',
                exintro: true,
                explaintext: true,
                redirects: 1,
                titles: title,
                inprop: 'url',
                pithumbsize: 500,
                origin: '*'
            }
        });

        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId === '-1') {
            throw new Error('Page not found on Wikipedia');
        }

        const pageInfo = pages[pageId];

        const detailedInfo = {
            title: pageInfo.title,
            extract: pageInfo.extract || 'No extract available',
            imageUrl: pageInfo.thumbnail ? pageInfo.thumbnail.source : 'no image',
            coordinates: pageInfo.coordinates ? {
                lat: pageInfo.coordinates[0].lat,
                lon: pageInfo.coordinates[0].lon
            } : null,
            description: pageInfo.description || 'Description not available',
            categories: pageInfo.categories ? pageInfo.categories.map(cat => cat.title).join(', ') : 'Categories not available',
            sections: pageInfo.sections ? pageInfo.sections.map(sec => sec.line).join(', ') : 'Sections not available',
            url: pageInfo.fullurl || 'URL not available'
        };

        return detailedInfo;
    } catch (error) {
        console.error(`Error fetching Wikipedia information for "${title}":`, error);
        return 'Wikipedia information not available';
    }
};

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


