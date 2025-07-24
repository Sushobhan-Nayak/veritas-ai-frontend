import { useState, useEffect } from "react";
import axios from "axios";
import useGeolocation from "./useGeolocation";
import {
  WEATHER_API_KEY,
  WEATHER_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";

const CACHE_KEY = "weatherDataCache";
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const useWeatherData = () => {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [allAgentWeather, setAllAgentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    const fetchAndCacheWeatherData = async () => {
      if (locationError) {
        setLoading(false);
        return;
      }
      if (!location) {
        return;
      }

      // 1. Check cache
      const cachedDataJSON = localStorage.getItem(CACHE_KEY);
      if (cachedDataJSON) {
        try {
          const cachedData = JSON.parse(cachedDataJSON);
          const isCacheValid =
            new Date().getTime() - cachedData.timestamp < CACHE_EXPIRY_MS;

          if (
            isCacheValid &&
            cachedData.weather &&
            cachedData.location?.latitude === location.latitude &&
            cachedData.location?.longitude === location.longitude
          ) {
            console.log("Using cached weather data");
            setWeather(cachedData.weather);
            setLocationName(cachedData.locationName);
            setAllAgentWeather(cachedData.allAgentWeather);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached weather data", e);
          localStorage.removeItem(CACHE_KEY); // Clear corrupted cache
        }
      }

      // 2. If no valid cache, fetch data
      setLoading(true);

      const { latitude, longitude } = location;

      const [weatherResult, geoResult, agentResult] = await Promise.allSettled([
        axios.get("https://api.openweathermap.org/data/2.5/weather", {
          params: { lat: latitude, lon: longitude, units: "metric", appid: WEATHER_API_KEY },
        }),
        axios.get("https://api.openweathermap.org/geo/1.0/reverse", {
          params: { lat: latitude, lon: longitude, limit: 1, appid: WEATHER_API_KEY },
        }),
        axios.post(
          WEATHER_API_URL,
          {
            appName: AGENT_APP_NAME,
            userId: AGENT_USER_ID,
            sessionId: AGENT_SESSION_ID,
            newMessage: {
              role: "user",
              parts: [{ text: `My location is latitude: ${latitude} and longitude: ${longitude}. Provide the warning alerts for weather.` }],
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
            setAllAgentWeather(null);
          }
        } else {
          setAllAgentWeather(null);
        }
      } else {
        console.error("Agent weather fetch failed:", agentResult.reason);
        setAllAgentWeather(null);
      }

      // 3. Cache the new data only if we have the main weather data
      if (newWeather) {
        const dataToCache = {
          timestamp: new Date().getTime(),
          location,
          weather: newWeather,
          locationName: newLocationName,
          allAgentWeather: newAllAgentWeather,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
      }

      setLoading(false);
    };

    fetchAndCacheWeatherData();
  }, [location, locationError]);

  return { weather, locationName, allAgentWeather, loading, locationError };
};

export default useWeatherData;