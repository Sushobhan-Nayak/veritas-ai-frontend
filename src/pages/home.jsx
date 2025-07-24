import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import "../App.css";

function Home() {
  const navigate = useNavigate();
  const [isAskModalOpen, setAskModalOpen] = useState(false);

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);
  return (
    <>
      <div className="container main-back">
        <Navbar />

        <div>
          <header>
            <h1>
              Cultivating India's Future with Agentic AI - Powered by Veritas AI
            </h1>
          </header>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="button-grid">
              <button onClick={() => navigate("/yield")}>Improve yield</button>
              <button onClick={() => navigate("/profit")}>
                Improve profitability
              </button>
              <button onClick={() => navigate("/earlyWarning")}>
                Early Warning
              </button>
              <button onClick={() => {}} style={{ backgroundColor: "grey" }}>
                Transport and Storage
              </button>
              <button onClick={() => {}} style={{ backgroundColor: "grey" }}>
                Farmer Community
              </button>
              <button onClick={() => navigate("/govtInfo")}>
                Government Information
              </button>
            </div>
          </div>
        </div>

        <button className="chat-button" onClick={handleOpenAskModal}>
          <span role="img" aria-label="ask-mic">
            🎤
          </span>
        </button>
        <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
      </div>
      
      <GoogleTranslate />
    </>
  );
}

export default Home;
