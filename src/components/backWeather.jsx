import React from "react";
import WeatherInfo from "../components/weatherInfo";
import { useNavigate } from "react-router-dom";

const BackWeather = () => {
  const navigate = useNavigate();
  return (
    <>
      <div
        style={{
          position: "relative",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="back-button"
          style={{
            position: "absolute",
            left: "5px",
            top: "0.5px",
            transform: "translateY(-100%)",
            zIndex: 10,
          }}
        >
          ←
        </button>
        <WeatherInfo />
      </div>
    </>
  );
};

export default BackWeather;
