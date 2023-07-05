// Get the weather details and display them on the Weather Details page
document.addEventListener('DOMContentLoaded', () => {
  getWeatherDetails('Colombo', 'LK'); // Display weather details for Colombo by default
});

// Map weather descriptions to corresponding icons
const weatherIcons = {
  Clear: 'sunny.png',
  Clouds: 'scatteredclouds.png',
  Drizzle: 'drizzle.png',
  Rain: 'showerRain.png',
  Thunderstorm: 'thunderstorm.png',
  Snow: 'snow.png',
  Mist: 'mist.png',
  Fog: 'fog.png',
  Haze: 'Haze.png',
  Smoke: 'smoke.png',
  Dust: 'dust.png',
  Sand: 'sand.png',
  Ash: 'dust.png',
  Squall: 'squalls.png',
  Tornado: 'tornado.png',
};

// Add a variable to track the forecast visibility
let forecastVisible = false;

async function getWeatherDetails(city, countryCode) {
  const weatherDetailsElement = document.getElementById('weatherDetails');

  try {
    // Make the API request to OpenWeatherMap
    const apiKey = 'f5178c482d6b31e2e8fa6af8bb150c79';
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${apiKey}`);
    const weatherData = await weatherResponse.json();

    // Extract the relevant weather details
    const date = new Date(weatherData.dt * 1000).toDateString(); // Convert timestamp to date string
    const temperatureCelsius = Math.round(weatherData.main.temp - 273.15);
    const time = new Date(weatherData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const main = weatherData.weather[0].main;
    const description = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;

    // Get the corresponding weather icon based on the description
    let icon = weatherIcons[main] || 'sunny.png';

    // Check if it is night and change the icon for "Clear" condition
    const currentHour = new Date().getHours();
    if (main === 'Clear' && (currentHour >= 18 || currentHour < 6)) {
      icon = 'moon.png';
    }

    // Create HTML content to display the weather details with the weather icon
    const weatherHTML = `
      <div class="weather-info">
        <div class="temperature">
          <h1>${temperatureCelsius}°C</h1>
        </div>
        <div class="city">
          <h1>${city}, ${countryCode}</h1>
          <p> ${date}</p>
        </div>
        <div class="weather-icon">
          <img src="${icon}" alt="${description}" style="width: 100px; height: 100px;">
          <p>${description}</p>
        </div>
        <div class="weather-description">
          <p>Humidity: ${humidity}%</p>
        </div>
        <button id="viewForecastButton">Show Forecast</button>
      </div>
      <div class="forecast-container" id="forecast-container"></div>
    `;

    // Display the weather details on the page
    weatherDetailsElement.innerHTML = weatherHTML;

    // Event listener for the "Show Forecast" button
	document.getElementById('viewForecastButton').addEventListener('click', () => {
	  toggleForecast();
	  if (!forecastVisible) {
		getWeatherForecastFor3Days(city, countryCode); // Fetch and display forecast for 3 days initially
	  }
	  forecastVisible = !forecastVisible; // Toggle the forecast visibility
	});

  } catch (error) {
    console.log('Error:', error);
    weatherDetailsElement.innerHTML = '<p>Failed to fetch weather details.</p>';
  }
}

// Event listener for the "Search" button
document.getElementById('searchButton').addEventListener('click', () => {
  const latitudeInput = document.getElementById('latitudeInput');
  const longitudeInput = document.getElementById('longitudeInput');
  const latitude = latitudeInput.value.trim();
  const longitude = longitudeInput.value.trim();

  if (latitude !== '' && longitude !== '') {
    reverseGeocode(latitude, longitude);
  } else {
    console.log('Latitude and longitude values are required.');
  }
});

async function reverseGeocode(latitude, longitude) {
  try {
    const apiKey = 'f5178c482d6b31e2e8fa6af8bb150c79';
    const reverseGeocodeResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`);
    const reverseGeocodeData = await reverseGeocodeResponse.json();

    if (reverseGeocodeData.length > 0) {
      const city = reverseGeocodeData[0].name;
      const countryCode = reverseGeocodeData[0].country;
      getWeatherDetails(city, countryCode);
    } else {
      console.log('Reverse geocoding failed. Could not retrieve location information.');
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

async function getWeatherForecastFor3Days(city, countryCode) {
  getWeatherForecast(city, countryCode, 3);
}

async function getWeatherForecastForWeek(city, countryCode) {
  getWeatherForecast(city, countryCode, 7);
}

async function getWeatherForecast(city, countryCode, days) {
  const forecastContainer = document.querySelector('.forecast-container');

  try { 
    // Make the API request to OpenWeatherMap for the forecast
    const apiKey = 'f5178c482d6b31e2e8fa6af8bb150c79';
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city},${countryCode}&cnt=${days * 8}&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();

    // Extract the relevant forecast details for each day
    const forecastItems = forecastData.list
      .filter((item, index) => index % 8 === 0) // Filter to get one forecast per day (every 8th item)
      .map(item => ({
        date: item.dt_txt.split(' ')[0],
        temperature: Math.round(item.main.temp - 273.15),
        main: item.weather[0].main,
        description: item.weather[0].description,
        humidity: item.main.humidity,
      }));

    // Create HTML content to display the forecast
    const forecastHTML = forecastItems
      .map(item => `
        <div class="forecast-box">
          <div class="forecast-info">
            <h3>${item.date}</h3>
          </div>
          <div class="forecast-info">
            <h2>${item.temperature}°C</h2>
          </div>
          <div class="forecast-info">
            <img src="${weatherIcons[item.main]}" alt="${item.description}" style="width: 40px; height: 40px;">
          </div>
          <div class="forecast-info">
            <p>${item.description}</p>
          </div>
          <div class="forecast-info">
            <p>Humidity: ${item.humidity}%</p>
          </div>
        </div>
      `)
      .join('');

    // Display the forecast inside the forecast container
    forecastContainer.innerHTML = forecastHTML;

    // Add "View More" button if the forecast is limited to 3 days
    if (days === 3) {
      const viewMoreButton = document.createElement('button');
      viewMoreButton.id = 'viewMoreButton';
      viewMoreButton.textContent = 'View More';
      forecastContainer.appendChild(viewMoreButton);

      // Event listener for the "View More" button
      viewMoreButton.addEventListener('click', () => {
	    getWeatherForecastForWeek(city, countryCode); // Fetch and display forecast for 7 days when "View More" is clicked
	  });
    } else {
      // Add "Close" button if the forecast is for the entire week
      const closeButton = document.createElement('button');
      closeButton.id = 'closeButton';
      closeButton.textContent = 'Close';
      forecastContainer.appendChild(closeButton);

		// Event listener for the "Close" button
		closeButton.addEventListener('click', () => {
		  forecastContainer.innerHTML = ''; // Clear the forecast container
		  toggleForecast(); // Hide the forecast container
		  getWeatherForecastFor3Days(city, countryCode); // Fetch and display forecast for 3 days
		});
    }
	 

  } catch (error) {
    console.log('Error:', error);
    forecastContainer.innerHTML = '<p>Failed to fetch weather forecast.</p>';
  }
}

function toggleForecast() {
  const forecastContainer = document.querySelector('.forecast-container');
  const viewForecastButton = document.getElementById('viewForecastButton');

  if (forecastContainer.style.display === 'none') {
    forecastContainer.style.display = 'block';
    viewForecastButton.textContent = 'Hide Forecast';
  } else {
    forecastContainer.style.display = 'none';
    viewForecastButton.textContent = 'Show Forecast';
  }
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  getWeatherDetails('Colombo', 'LK'); // Display weather details for Colombo by default
});
