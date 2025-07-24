import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/growerService.css";
import {
  GROWER_RECOMMEN_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";
import useGeolocation from "../hooks/useGeolocation";

const ExpandableItem = ({ title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!description) {
    return <p style={{ whiteSpace: "pre-wrap" }}>{title}</p>;
  }

  return (
    <div className="expandable-item">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          padding: "0.25rem 0",
          margin: 0,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          textAlign: "left",
          fontSize: "1em",
        }}
      >
        <strong>{title}</strong>
        <span
          style={{
            fontSize: "1em",
            marginLeft: "0.5rem",
            color: "black",
            fontWeight: "bold",
          }}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            marginTop: "0.5rem",
            paddingLeft: "1rem",
          }}
        >
          {typeof description === "string" ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{description}</p>
          ) : (
            description
          )}
        </div>
      )}
    </div>
  );
};

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

      const payload = {
        appName: AGENT_APP_NAME,
        userId: AGENT_USER_ID,
        sessionId: AGENT_SESSION_ID,
        newMessage: {
          role: "user",
          parts: [
            {
              text: `Provide a brief soil analysis, crop recommendations for large and small scale farmers, general considerations, grower services and fertilizer recommendations based on my location. ${locationText}`,
            },
          ],
        },
      };

      const renderRecommendations = (data, level = 0, parser) => {
        return Object.entries(data).map(([key, value], index, array) => {
          const isLastItem = index === array.length - 1;
          const isNumericKey = /^\d+$/.test(key);
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <div key={key}>
              <div className="recommendation-section">
                {!isNumericKey && (
                  <strong
                    style={{
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {formattedKey}
                  </strong>
                )}
                {typeof value === "string" ? (
                  (() => {
                    const { title, description } = parser(value);
                    return (
                      <ExpandableItem title={title} description={description} />
                    );
                  })()
                ) : (
                  <div style={{ paddingLeft: isNumericKey ? "0" : "1rem" }}>
                    {renderRecommendations(value, level + 1, parser)}
                  </div>
                )}
              </div>
              {!isLastItem && !isNumericKey && (
                <hr className="recommendation-divider" />
              )}
            </div>
          );
        });
      };

      const cropParser = (text) => {
        const parts = text.split(/:(.*)/s);
        return {
          title: parts[0],
          description: parts.length > 1 ? parts[1].trim() : "",
        };
      };

      try {
        const response = await axios.post(GROWER_RECOMMEN_API_URL, payload, {
          headers: { "Content-Type": "application/json" },
        });
        // Process Soil Analysis Response
        const soilAgentResponse = response.data.soil_alert;
        let soilContent;

        try {
          const parsedSoilData =
            typeof soilAgentResponse === "string"
              ? JSON.parse(soilAgentResponse)
              : soilAgentResponse;
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
                          <strong style={{ color: "black" }}>{title}</strong>
                          {description && (
                            <p style={{ whiteSpace: "pre-wrap" }}>
                              {description}
                            </p>
                          )}
                        </div>
                      );
                    }
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
                        <strong style={{ color: "black" }}>{title}</strong>
                        {description && (
                          <p style={{ whiteSpace: "pre-wrap" }}>
                            {description}
                          </p>
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
              {String(soilAgentResponse) ||
                "Could not retrieve soil analysis data."}
            </p>
          );
        }

        // Process Grower Recommendation Response
        const growerAgentResponse = response.data.crop_alert;

        let growerContent;
        try {
          const parsedData =
            typeof growerAgentResponse === "string"
              ? JSON.parse(growerAgentResponse)
              : growerAgentResponse;
          growerContent = renderRecommendations(parsedData, 0, cropParser);
        } catch (e) {
          // If it's not a JSON string, use it as is.
          growerContent = (
            <p style={{ whiteSpace: "pre-wrap" }}>
              {String(growerAgentResponse) ||
                "Could not retrieve crop recommendation data."}
            </p>
          );
        }

        // Process Fertilizer Recommendation Response
        const fertilizerAgentResponse = response.data.fertilizer_alert;
        
        let fertilizerContent;
        try {
          const parsedData =
            typeof fertilizerAgentResponse === "string"
              ? JSON.parse(fertilizerAgentResponse)
              : fertilizerAgentResponse;

          const formatKey = (key) =>
            key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

          const renderObjectDetails = (obj) => {
            return Object.entries(obj).map(([key, value]) => (
              <p key={key} style={{ margin: "0.25rem 0" }}>
                <strong>{formatKey(key)}:</strong> {String(value)}
              </p>
            ));
          };

          fertilizerContent = Object.entries(parsedData).map(
            ([sectionKey, sectionValue]) => (
              <div key={sectionKey} style={{ marginBottom: "1rem" }}>
                <h4>{formatKey(sectionKey)}</h4>
                {(() => {
                  if (
                    sectionKey === "fertilizer_recommendations" &&
                    sectionValue.primary_fertilizers
                  ) {
                    return sectionValue.primary_fertilizers.map(
                      (item, index) => (
                        <ExpandableItem
                          key={index}
                          title={`${item.fertilizer_name} (${item.application_rate_per_acre})`}
                          description={renderObjectDetails({
                            application_timing: item.application_timing,
                            application_method: item.application_method,
                            estimated_cost_per_acre:
                              item.estimated_cost_per_acre,
                            benefits_for_recommended_crops:
                              item.benefits_for_recommended_crops,
                          })}
                        />
                      )
                    );
                  }
                  if (sectionKey === "local_suppliers") {
                    return Object.entries(sectionValue).map(
                      ([type, items]) => (
                        <div key={type}>
                          <h5>{formatKey(type)}</h5>
                          {items.map((item, index) => {
                            const {
                              outlet_type,
                              dealer_type,
                              platform,
                              ...details
                            } = item;
                            const title = outlet_type || dealer_type || platform;
                            return (
                              <ExpandableItem
                                key={index}
                                title={title}
                                description={renderObjectDetails(details)}
                              />
                            );
                          })}
                        </div>
                      )
                    );
                  }
                  if (sectionKey === "monitoring_recommendations") {
                    return renderObjectDetails(sectionValue);
                  }
                  return null;
                })()}
              </div>
            )
          );
        } catch (e) {
          // If it's not a JSON string, use it as is.
          fertilizerContent = (
            <p style={{ whiteSpace: "pre-wrap" }}>
              {String(fertilizerAgentResponse) ||
                "Could not retrieve fertilizer recommendation data."}
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

        const fertilizerCard = {
          title: "Fertilizer Recommendation",
          content: fertilizerContent,
        };

        setServices([soilCard, growerCard, fertilizerCard]);
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
      <div
        className="grower-services-grid"
        style={{ width: "90%", margin: "0 auto" }}
      >
        {loading ? (
          [...Array(3)].map((_, index) => (
            <div className="grower-service-card" key={index}>
              <div className="card-loader"></div>
            </div>
          ))
        ) : services.length > 0 ? (
          services.map((service, index) => (
            <div
              className={`grower-service-card ${
                service.title === "Fertilizer Recommendation"
                  ? "fertilizer-card"
                  : ""
              }`}
              key={index}
            >              <h3
                className={
                  service.title === "Fertilizer Recommendation"
                    ? "fertilizer-title"
                    : ""
                }
              >
                {service.title}
              </h3>
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
