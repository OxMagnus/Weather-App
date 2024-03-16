const cityInput = document.querySelector(".city-input")
const searchButton = document.querySelector(".search-btn")
const locationButton = document.querySelector(".location-btn")
const currentWeatherDiv = document.querySelector(".current-weather")
const weatherCardsDiv = document.querySelector(".weather-cards")
const searchHistoryList = document.querySelector(".search-history")

const API_KEY = "78c571f4b8754de2ac30aa8a5752f9a9"

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0){
        return `<div class="details">
                    <h2>${cityName}(${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weatehr-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else{
        return `<li class="cards">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h2>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weatehr-icon">
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }        
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        const uniqueForecastDays = [];

        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
               return uniqueForecastDays.push(forecastDate);
            }
        });
        
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });

    }).catch(() => {
        alert("An error occured while fetching the weather forecast")
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) return;
    
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName} `)
        const {name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured while fetching the coordinates")
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        postion => {
            const {latitude, longitude} = postion.coords
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                if(!data.length) return alert(`No coordinates found for ${cityName} `)
                const {name} = data[0];
                saveSearchToLocalStorage(name);
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occured while fetching the city")
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again")
            }
        } 
    );
}

const saveSearchToLocalStorage = cityName => {
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (!searchHistory.includes(cityName)) {
        searchHistory.unshift(cityName);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        displaySearchHistory(searchHistory);
    }
};

const displaySearchHistory = searchHistory => {
    searchHistoryList.innerHTML = "<h5>Search History:<h5>";
    searchHistory.forEach(city => {
        const listItem = document.createElement("li");
        listItem.textContent = city;
        listItem.classList.add("search-history-item");
        listItem.addEventListener("click", () => {
            cityInput.value = city;
            getCityCoordinates();
        });
        searchHistoryList.appendChild(listItem);
    });
};

cityInput.addEventListener("keyup", e => {
    if (e.key === "Enter") {
        getCityCoordinates();
        saveSearchToLocalStorage(cityInput.value.trim());
    }
});
searchButton.addEventListener("click", () => {
    getCityCoordinates();
    saveSearchToLocalStorage(cityInput.value.trim());
});
locationButton.addEventListener("click", getUserCoordinates);


window.addEventListener("load", () => {
    const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    displaySearchHistory(searchHistory);
});