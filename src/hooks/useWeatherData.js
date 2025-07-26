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
          { headers: { "Content-Type": "application/json","Authorization": `Bearer ya29.c.c0ASRK0GbTMIS0vq7VO-q0gmpF76UgCpnQfJM-INTKXK4UEUUXRmacntYTeVAbMUNvlqWPsm7K5Hl4j-KVdHilD6SnXnFwa9iJFvsvR81DK07JYMof2tyedXRtHxtaL6PAES-bxVGDCLphf0CWqm3cgoZnfQCDrI2_zclx9tASMAdlq2_VJBTJO8i5peDKdS7jW7mxma63FXfKeYxUii0bbLgejSHjAzj96PiXD1NEUV_nxivFqcJd5UYasg5J0nLEcbaDC3Imbd8AGCCSzqCd1dCq31ILfE4IwqlzJI0e0aTBfn38-vgaOSFyCPWLisBM5B9FlZeZ9yIy0lovDIrJgGsWfN_7g9QwrEJDtOaXnxMNaUYG7xybYsIDP_ePZaKp50JcALP8CHHDXhnMxqcL412AO_z2mxV2mQJcu7g4hZ52WWXRJR-62gbnFRhwmI746vjjxtU1cm1ivWlJt0n11_rhRddBJakUacn06F1Zi1zwwFpsz5_kh6Ovs9x-o7c2QnMtxcbX2zgV7VnRgYaQjeZJoFpzovveicQx88WdIp_i9V9IUhIdyF1xdp6vFzdxdb-c4XtVn6WqdJ510Og8QdMyIqV5WZv-UzZamO0MFJjykS52QMI4Xf5bdVdv7smFcyzZnRB__BM93o3Ymtapwyj5FJbdeo1ZJRMQZbjuOMrWWQsFYyb1ciJuu4_Jqu3drwFwY_y0Z-SIIj3UIV1W9zWuYk717XyxlMYzncaX4veIItcw5Bhc7lst9Xp433ocrna87aFYjXhjwc1qddbcYp1oR3teOvwVjvn2mz9BSRWg33jYWol-g4-nMlOq2kcdyVxMdRWgjyg4i7o1wurtI7pkXvgB7qj3ekv-nuMv_nhtYpUWQzU2I0di4lBWRF6O4egVhVOxr6tFtWIc1SJjmikenSQYZSVM7os1dvmB2128xbW-cu_eq3jnMSe09jfv80lh7id0oZxuv2yjJleMf1p9QRh7b8hzVke2-oIRQy2991eSexYqsvM`, } }
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