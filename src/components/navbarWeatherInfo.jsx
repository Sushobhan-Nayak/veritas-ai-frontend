import React, { useState, useEffect } from "react";
import useWeatherData from "../hooks/useWeatherData";

const NavbarWeatherInfo = () => {
  const getYYYYMMDD = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const { weather, locationName, allAgentWeather, loading, locationError } =
    useWeatherData();
  const [selectedDate, setSelectedDate] = useState(getYYYYMMDD(0));
  const [agentWeatherInfo, setAgentWeatherInfo] = useState(
    "Select a date to see the weather summary."
  );

  useEffect(() => {
    if (loading) {
      setAgentWeatherInfo("Fetching weather summary...");
      return;
    }
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
    } else if (!locationError) {
      setAgentWeatherInfo("Could not fetch weather summary.");
    }
  }, [selectedDate, allAgentWeather, loading, locationError]);

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
     <div className="weather-info-left" style={{ paddingRight: '1rem' }}>
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
          )
          : (loading ? "Loading weather..." : "Weather data unavailable.")}
      </div>
      <div className="weather-info-divider"></div>
      <div
        className="weather-info-right"
        style={{
          paddingLeft: "1rem",
          textAlign: "left",
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
          {loading
            ? "Fetching weather summary..."
            : agentWeatherInfo}
        </div>
      </div>
      
    </div>
  );
};

export default NavbarWeatherInfo;
