import React, { useState } from 'react';
import { fetchWeatherApi } from 'openmeteo';

const WeatherForecast = () => {

  const cities = ["Chicago", "New York", "Los Angeles", "Denver", "Seoul",
     "Tokyo", "Mexico City", "Moscow", "Paris"];
  const random = Math.floor(Math.random() * cities.length);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState(cities[random]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Function to fetch weather data
  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max", "wind_speed_10m_max"],
        "temperature_unit": "fahrenheit",
	    wind_speed_unit: "mph",
	    precipitation_unit: "inch"
      };
      const url = "https://api.open-meteo.com/v1/forecast";
      const response = await fetchWeatherApi(url, params);
      const responseData = response[0];
      
      // Helper function to form time ranges
      const range = (start, stop, step) =>
        Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

      // Attributes for timezone and location
      const utcOffsetSeconds = responseData.utcOffsetSeconds();
      const timezone = responseData.timezone();
      const timezoneAbbreviation = responseData.timezoneAbbreviation();
      const latitude = responseData.latitude();
      const longitude = responseData.longitude();
      
      const daily = responseData.daily();
      
      const weatherData = {
        daily: {
          time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
            t => new Date((t + utcOffsetSeconds) * 1000)
          ),
          weatherCode: daily.variables(0).valuesArray(),
          temperature2mMax: daily.variables(1).valuesArray(),
          temperature2mMin: daily.variables(2).valuesArray(),
          precipitationProbabilityMax: daily.variables(3).valuesArray(),
		windSpeed10mMax: daily.variables(4).valuesArray(),
        }
      };

      setForecast(weatherData);
      setLoading(false);
    } catch (error) {
      setError('Error fetching weather data');
      setLoading(false);
    }
  };

  // Function to get latitude and longitude for a given city
  const getCoordinates = async (city) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`);
      if (!response.ok) throw new Error('Failed to fetch coordinates');
      const data = await response.json();
      if (data.length === 0) throw new Error('City not found');
      const { lat, lon } = data[0];
      return { lat, lon };
    } catch (error) {
      throw new Error('Error fetching city coordinates');
    }
  };

  // Handle Enter key press to fetch weather for a new city
  const handleKeyPress = async (event) => {
    if (event.key === 'Enter' && city.trim() !== '') {
      try {
        const { lat, lon } = await getCoordinates(city);
        await fetchWeather(lat, lon);
      } catch (error) {
        setError(error.message);
      }
    }
  };
  return (
    <div className="container">
      <img className="logo" src={`${process.env.PUBLIC_URL}/Images/weather.png`} alt="Weather Icon" />
      <input
        className="center"
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter city"
      />

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && forecast && (
        <>
          <h2 className="center">Weekly Weather Forecast for {city}</h2>
          <ul className="item">
  {forecast.daily.time.map((time, index) => {
    const isHot = forecast.daily.temperature2mMax[index] > 80;
    const isCold = forecast.daily.temperature2mMax[index] < 50;

    return (
      <div
        className="weatherTile"
        key={index}
        style={{
          backgroundColor: isHot ? 'lightcoral' : isCold ? 'lightblue' : 'lightgreen', 
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '5px'
        }}
      >
        <li>
          <h3>{daysOfWeek[time.getDay()]}</h3>
          <p>Date: {time.toLocaleDateString()}</p>
          <p>Max Temperature: {forecast.daily.temperature2mMax[index].toFixed(2)} °F</p>
          <p>Min Temperature: {forecast.daily.temperature2mMin[index].toFixed(2)} °F</p>
          <p>Precipitation Probability: {forecast.daily.precipitationProbabilityMax[index].toFixed(0)}%</p>
          <p>Wind Speed Max: {forecast.daily.windSpeed10mMax[index].toFixed(2)} MPH</p>
        </li>
      </div>
    );
  })}
</ul>
        </>
      )}
    </div>
  );
};

export default WeatherForecast;