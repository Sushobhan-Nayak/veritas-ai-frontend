import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import BackWeather from "../components/backWeather";
import Loader from "../components/loader";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import MapComponent from "../components/map";
import GrowerService from "../components/growerService";
import useGeolocation from "../hooks/useGeolocation";
import {
  YIELD_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";

const Yield = () => {
  const [plant, setPlant] = useState("Potato");
  const [images, setImages] = useState([]);
  const [base64Images, setBase64Images] = useState([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [allRemedies, setAllRemedies] = useState(null);
  const [remedy, setRemedy] = useState("");
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAskModalOpen, setAskModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { location, error: geoError } = useGeolocation();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length !== 3) {
      alert("Please upload exactly 3 images.");
      return;
    }

    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((base64s) => {
      setImages(files);
      setBase64Images(base64s);
      setUploadDisabled(true);
    });
  };

  const handleDiagnose = async () => {
    setLoading(true);
    const payload = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [
          {
            text: "Identify the disease for the crop - " + plant,
            // plantName: plant,
            images: base64Images,
          },
        ],
      },
    };

    try {
      const response = await axios.post(YIELD_API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const summary = response.data.summary || "No summary found";
      setDiagnosis(summary);
    } catch (error) {
      console.error("Diagnosis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnoseResponse = async (userResponse) => {
    setLoading(true);
    setShowMap(userResponse === "Pesticide" || userResponse === "Fertilizer");

    if (userResponse === "Pesticide") {
      setSearchKeyword("Farming pesticide shops");
    } else if (userResponse === "Fertilizer") {
      setSearchKeyword("Farming fertilizer shops");
    }

    const remedyKey =
      userResponse === "HomeRemedy" ? "Home Remedy" : userResponse;

    // If we already have the remedies, just show the selected one.
    if (allRemedies) {
      const remedyContent = allRemedies[remedyKey];
      const remedyText = remedyContent
        ? `${remedyKey}: ${remedyContent}`
        : `No information found for ${remedyKey}.`;
      setRemedy(remedyText);
      setLoading(false);
      return;
    }

    // If we don't have remedies, fetch them.
    const payload = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [
          {
            text: userResponse + '. For disease diagnosis.',
          },
        ],
      },
    };

    try {
      const response = await axios.post(YIELD_API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const summary = response.data.summary;
      let remedyText;

      if (!summary) {
        remedyText = "No summary found";
      } else {
        try {
          const parsedData = JSON.parse(summary);
          if (
            Array.isArray(parsedData) &&
            parsedData.length > 0 &&
            parsedData[0].diagnosis
          ) {
            const remedies = parsedData[0].diagnosis;
            setAllRemedies(remedies); // Cache all remedies

            const remedyContent = remedies[remedyKey];
            if (remedyContent) {
              remedyText = `${remedyKey}: ${remedyContent}`;
            } else {
              remedyText = `No information found for ${remedyKey}.`;
            }
          } else {
            remedyText = summary; // Valid JSON, but not the expected format
          }
        } catch (e) {
          remedyText = summary; // Not a JSON string, treat as plain text
        }
      }
      setRemedy(remedyText);
    } catch (error) {
      console.error("Diagnosis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);

  return (
    <>
    
      <GoogleTranslate />
      <div className="container main-back">
        {loading && <Loader />}
        <BackWeather />

        <header>
          <h1>
            Cultivating India's Future with Agentic AI - Powered by Veritas AI
          </h1>
        </header>

        <h2 style={{ color: "white", textAlign: "center" }}>IMPROVE YIELD</h2>

        <div className="glass-background">
          <h2>Disease Identification</h2>

          <div className="selector">
            <label>Choose a plant: </label>
            <select value={plant} onChange={(e) => setPlant(e.target.value)}>
              <option>Potato</option>
              <option>Tomato</option>
              <option>Corn</option>
            </select>
          </div>

          <div className="image-upload">
            <input
              type="file"
              accept="image/png, image/jpeg"
              multiple
              disabled={uploadDisabled}
              onChange={handleImageUpload}
            />
            {uploadDisabled && (
              <button
                onClick={() => {
                  setImages([]);
                  setBase64Images([]);
                  setUploadDisabled(false);
                  setDiagnosis("");
                  setRemedy("");
                  setShowMap(false);
                  setAllRemedies(null);
                }}
              >
                Reload the Images
              </button>
            )}
          </div>

          {images.length === 3 && (
            <div className="image-preview">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt={`Image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {uploadDisabled && (
            <button className="diagnose-button" onClick={handleDiagnose}>
              Diagnose
            </button>
          )}

          {diagnosis && (
            <div className="diagnosis-box">
              <h4>{diagnosis}</h4>
              {diagnosis.toLowerCase().includes("would you like") && (
                <div>
                  <button
                    onClick={() => {
                      handleDiagnoseResponse("HomeRemedy");
                    }}
                    className="select-button"
                  >
                    Home Remedy
                  </button>
                  <button
                    onClick={() => {
                      handleDiagnoseResponse("Pesticide");
                    }}
                    className="select-button"
                  >
                    Pesticide
                  </button>
                  <button
                    onClick={() => {
                      handleDiagnoseResponse("Fertilizer");
                    }}
                    className="select-button"
                  >
                    Fertilizer
                  </button>
                </div>
              )}
              {remedy && <h4>{remedy}</h4>}
              {showMap &&
                (location ? (
                  <MapComponent
                    location={location}
                    searchKeyword={searchKeyword}
                  />
                ) : (
                  <p>{geoError || "Fetching location for map..."}</p>
                ))}
            </div>
          )}
        </div>
        <GrowerService />
        <button className="chat-button" onClick={handleOpenAskModal}>
          <span role="img" aria-label="ask-mic">
            🎤
          </span>
        </button>
      </div>
      <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
    </>
  );
};

export default Yield;
