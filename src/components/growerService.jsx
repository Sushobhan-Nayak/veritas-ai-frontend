import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/growerService.css";
import {
  SOIL_ANALYSIS_API_URL,
  GROWER_RECOMMEN_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";
import useGeolocation from "../hooks/useGeolocation";

const GrowerService = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location, error: geoError } = useGeolocation();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      if (!location && geoError) {
        console.error("Could not get location", geoError);
        setLoading(false);
        return;
      }
      if (!location) return; // Wait for location

      const { latitude, longitude } = location;
      const locationText = `My location is latitude: ${latitude} and longitude: ${longitude}.`;

      const soilPayload = {
        appName: AGENT_APP_NAME,
        userId: AGENT_USER_ID,
        sessionId: AGENT_SESSION_ID,
        newMessage: {
          role: "user",
          parts: [
            {
              text: `Provide a brief soil analysis based on my location. ${locationText}`,
            },
          ],
        },
      };

      const growerPayload = {
        appName: AGENT_APP_NAME,
        userId: AGENT_USER_ID,
        sessionId: AGENT_SESSION_ID,
        newMessage: {
          role: "user",
          parts: [
            {
              text: `Provide crop recommendations for large and small scale farmers, and general considerations. ${locationText}`,
            },
          ],
        },
      };

      try {
        const [soilResponse, growerResponse] = await Promise.all([
          axios.post(SOIL_ANALYSIS_API_URL, soilPayload, {
            headers: { "Content-Type": "application/json" },
          }),
          axios.post(GROWER_RECOMMEN_API_URL, growerPayload, {
            headers: { "Content-Type": "application/json" },
          }),
        ]);
        console.log(soilResponse, growerResponse);
        // Process Soil Analysis Response
        const soilAgentResponse = soilResponse.data.soil_alert;
        let soilContent;

        try {
          const parsedSoilData = JSON.parse(soilAgentResponse);
          const {
            location_output,
            soil_Health_card,
            key_grower_services,
            government_schemes,
          } = parsedSoilData;
          const soilHealthTable = soil_Health_card?.soil_health_card_table;
          const tableHeaders =
            soilHealthTable && soilHealthTable.length > 0
              ? Object.keys(soilHealthTable[0])
              : [];

          soilContent = (
            <div>
              {location_output && (
                <p>
                  <strong>Location:</strong> {location_output}
                </p>
              )}
              {soil_Health_card?.soil_type_detected && (
                <p>
                  <strong>Soil Type:</strong>{" "}
                  {soil_Health_card.soil_type_detected}
                </p>
              )}
              {tableHeaders.length > 0 && (
                <table className="soil-health-table">
                  <thead>
                    <tr>
                      {tableHeaders.map((header) => (
                        <th key={header}>
                          {header
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {soilHealthTable.map((row, index) => (
                      <tr key={index}>
                        {tableHeaders.map((header) => (
                          <td key={header}>{row[header]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {key_grower_services && (
                <div className="key-services-section">
                  <h4>Key Grower Services</h4>
                  {Object.values(key_grower_services).map(
                    (serviceText, index) => {
                      const parts = serviceText.split(/:(.*)/s);
                      const title = parts[0];
                      const description = parts[1] ? parts[1].trim() : "";
                      return (
                        <div className="key-service" key={index}>
                          <strong
                            style={{ color: "black", fontSize: "0.9em" }}
                          >
                            {title}
                          </strong>
                          {description && <p style={{ whiteSpace: "pre-wrap" }}>{description}</p>}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
              {government_schemes && (
                <div className="key-services-section">
                  <h4>Government Schemes</h4>
                  {government_schemes.map((serviceText, index) => {
                    const parts = serviceText.split(/:(.*)/s);
                    const title = parts[0];
                    const description = parts[1] ? parts[1].trim() : "";
                    return (
                      <div className="key-service" key={index}>
                        <strong
                          style={{
                            color: "black",
                            fontSize: "0.9em",
                          }}
                        >
                          {title}
                        </strong>
                        {description && (
                          <p style={{ whiteSpace: "pre-wrap" }}>{description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        } catch (e) {
          // Fallback for non-JSON or malformed JSON response
          soilContent = (
            <p style={{ whiteSpace: "pre-wrap" }}>
              {soilAgentResponse || "Could not retrieve soil analysis data."}
            </p>
          );
        }

        // Process Grower Recommendation Response
        const growerAgentResponse = growerResponse.data.crop_alert;
        let growerContent;
        try {
          const parsedData = JSON.parse(growerAgentResponse);

          const renderRecommendations = (data) => {
            return Object.entries(data).map(([key, value], index, array) => {
              const isLastItem = index === array.length - 1;
              return (
                <div key={key}>
                  <div className="recommendation-section">
                    <strong style={{ color: "black", fontSize: "0.9em" }}>
                      {key}
                    </strong>
                    {typeof value === "string" ? (
                      <p style={{ whiteSpace: "pre-wrap" }}>{value}</p>
                    ) : (
                      <div style={{ paddingLeft: "1rem" }}>
                        {renderRecommendations(value)}
                      </div>
                    )}
                  </div>
                  {!isLastItem && <hr className="recommendation-divider" />}
                </div>
              );
            });
          };

          growerContent = renderRecommendations(parsedData);
        } catch (e) {
          // If it's not a JSON string, use it as is.
          growerContent = (
            <p style={{ whiteSpace: "pre-wrap" }}>
              {growerAgentResponse ||
                "Could not retrieve crop recommendation data."}
            </p>
          );
        }

        const soilCard = {
          title: "Soil Analysis",
          content: soilContent,
        };

        const growerCard = {
          title: "Grower Crop Recommendation",
          content: growerContent,
        };

        setServices([soilCard, growerCard]);
      } catch (error) {
        console.error("Failed to fetch service data:", error);
        setServices([]); // Clear services on any error
      } finally {
        setLoading(false);
      }
    };

    if (location || geoError) {
      fetchServices();
    }
  }, [location, geoError]);

  return (
    <div className="glass-background">
      <h2>Grower Service</h2>
      <div className="grower-services-grid">
        {loading ? (
          [...Array(2)].map((_, index) => (
            <div className="grower-service-card" key={index}>
              <div className="card-loader"></div>
            </div>
          ))
        ) : services.length > 0 ? (
          services.map((service, index) => (
            <div className="grower-service-card" key={index}>
              <h3>{service.title}</h3>
              <div className="service-content">{service.content}</div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            Could not load grower services.
          </p>
        )}
      </div>
    </div>
  );
};

export default GrowerService;
