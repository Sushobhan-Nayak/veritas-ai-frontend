import React, { useState, useEffect } from "react";
import axios from "axios";
import useGeolocation from "../hooks/useGeolocation";
import {
  WEATHER_API_KEY,
  WEATHER_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";

const NavbarWeatherInfo = () => {
  const getYYYYMMDD = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [selectedDate, setSelectedDate] = useState(getYYYYMMDD(0));
  const [allAgentWeather, setAllAgentWeather] = useState(null);
  const [agentWeatherInfo, setAgentWeatherInfo] = useState(
    "Select a date to see the weather summary."
  );
  const [loadingAgentWeather, setLoadingAgentWeather] = useState(false);
  const { location, error: locationError } = useGeolocation();
  const CACHE_KEY = "weatherDataCache";
  const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    const fetchAndCacheWeatherData = async () => {
      if (!location) {
        return;
      }

      // 1. Check cache
      const cachedDataJSON = localStorage.getItem(CACHE_KEY);
      if (cachedDataJSON) {
        const cachedData = JSON.parse(cachedDataJSON);
        const isCacheValid =
          new Date().getTime() - cachedData.timestamp < CACHE_EXPIRY_MS;

        if (
          isCacheValid &&
          cachedData.location?.latitude === location.latitude &&
          cachedData.location?.longitude === location.longitude
        ) {
          console.log("Using cached weather data");
          setWeather(cachedData.weather);
          setLocationName(cachedData.locationName);
          setAllAgentWeather(cachedData.allAgentWeather);
          return;
        }
      }

      // 2. If no valid cache, fetch data
      setLoadingAgentWeather(true);
      setAgentWeatherInfo("Fetching weather summary...");

      const { latitude, longitude } = location;

      const [weatherResult, geoResult, agentResult] = await Promise.allSettled([
        axios.get("https://api.openweathermap.org/data/2.5/weather", {
          params: {
            lat: latitude,
            lon: longitude,
            units: "metric",
            appid: WEATHER_API_KEY,
          },
        }),
        axios.get("https://api.openweathermap.org/geo/1.0/reverse", {
          params: {
            lat: latitude,
            lon: longitude,
            limit: 1,
            appid: WEATHER_API_KEY,
          },
        }),
        axios.post(
          WEATHER_API_URL,
          {
            appName: AGENT_APP_NAME,
            userId: AGENT_USER_ID,
            sessionId: AGENT_SESSION_ID,
            newMessage: {
              role: "user",
              parts: [
                {
                  text: `My location is latitude: ${latitude} and longitude: ${longitude}`,
                },
              ],
            },
          },
          { headers: { "Content-Type": "application/json" } }
        ),
      ]);

      let newWeather = null;
      let newLocationName = "";
      let newAllAgentWeather = null;

      // Process OpenWeatherMap data
      if (weatherResult.status === "fulfilled" && geoResult.status === "fulfilled") {
        const weatherData = weatherResult.value.data;
        newWeather = {
          temperature: `${Math.round(weatherData.main.temp)}°C`,
          condition: weatherData.weather[0].description,
          humidity: `${weatherData.main.humidity}%`,
          pressure: `${weatherData.main.pressure} hPa`,
          sea_level: `${weatherData.main.sea_level} hPa`,
          temp_max: `${Math.round(weatherData.main.temp_max)}°C`,
          temp_min: `${Math.round(weatherData.main.temp_min)}°C`,
          wind: {
            speed: `${weatherData.wind.speed} m/s`,
            deg: `${weatherData.wind.deg}°`,
            gust: weatherData.wind.gust ? `${weatherData.wind.gust} m/s` : null,
          },
        };
        setWeather(newWeather);

        const geoData = geoResult.value.data;
        if (geoData && geoData.length > 0 && geoData[0].name && geoData[0].state) {
          newLocationName = `${weatherData.name}, ${geoData[0].name}, ${geoData[0].state}`;
        } else {
          newLocationName = weatherData.name || "Unknown location";
        }
        setLocationName(newLocationName);
      } else {
        console.error("Weather/Location fetch failed:", weatherResult.reason || geoResult.reason);
      }

      // Process Agent data
      if (agentResult.status === "fulfilled") {
        const agentData = agentResult.value.data.weather_alert;
        if (agentData) {
          try {
            newAllAgentWeather = JSON.parse(agentData);
            setAllAgentWeather(newAllAgentWeather);
          } catch (e) {
            console.error("Failed to parse agent weather data", e);
            setAgentWeatherInfo("Could not parse weather summary.");
            setAllAgentWeather(null);
          }
        } else {
          setAgentWeatherInfo("Could not fetch weather summary.");
          setAllAgentWeather(null);
        }
      } else {
        console.error("Agent weather fetch failed:", agentResult.reason);
        setAgentWeatherInfo("Failed to fetch weather summary.");
        setAllAgentWeather(null);
      }

      // 3. Cache the new data
      const dataToCache = {
        timestamp: new Date().getTime(),
        location,
        weather: newWeather,
        locationName: newLocationName,
        allAgentWeather: newAllAgentWeather,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));

      setLoadingAgentWeather(false);
    };

    fetchAndCacheWeatherData();
  }, [location]);

  useEffect(() => {
    if (allAgentWeather) {
      const forecast = allAgentWeather[selectedDate];
      if (Array.isArray(forecast) && forecast.length > 0) {
        setAgentWeatherInfo(
          <ul>
            {forecast.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
      } else {
        setAgentWeatherInfo("No forecast available for this day.");
      }
    }
  }, [selectedDate, allAgentWeather]);

  const getFormattedDate = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const tomorrow = getFormattedDate(1);
  const dayAfterTomorrow = getFormattedDate(2);

  const todayDate = getYYYYMMDD(0);
  const tomorrowDate = getYYYYMMDD(1);
  const dayAfterDate = getYYYYMMDD(2);

  return (
    <div className="weather-info" style={{ width: "100%", display: 'flex'}}>
     <div className="weather-info-left" style={{ flex: 1, paddingRight: '1rem' }}>
        <strong>Location:</strong>
        <br />
        {locationError || locationName || "Fetching location..."}
        <br />
        <strong>Weather:</strong>
        <br />
        {weather
          ? (
            <>
              <strong>{weather.temperature}</strong> ({weather.temp_min} / {weather.temp_max}), {weather.condition}
              <br />
              Humidity: {weather.humidity} | Pressure: {weather.pressure}
              <br />
              Sea Level Pressure: {weather.sea_level}
              <br />
              Wind: {weather.wind.speed} from {weather.wind.deg}{weather.wind.gust && ` (gusts: ${weather.wind.gust})`}
            </>
          ) : "Loading weather..."}
      </div>
      <div className="weather-info-divider"></div>
      <div
        className="weather-info-right"
        style={{
          flex: 3,
          paddingLeft: "1rem",
          textAlign: "center",
        }}
      >
        <select
          name="date-select"
          id="date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value={todayDate}>Today</option>
          <option value={tomorrowDate}>{`Tomorrow, ${tomorrow}`}</option>
          <option
            value={dayAfterDate}
          >{`Next Day, ${dayAfterTomorrow}`}</option>
        </select>
        <div className="static-text">
          {loadingAgentWeather
            ? "Fetching weather summary..."
            : agentWeatherInfo}
        </div>
      </div>
      
    </div>
  );
};

export default NavbarWeatherInfo;
