import React, { useState } from "react";
import BackWeather from "../components/backWeather";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import Loader from "../components/loader";

function EarlyWarning() {
  const [loading, setLoading] = useState(false);
  const [isAskModalOpen, setAskModalOpen] = useState(false);

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);

  return (
    <>
      <GoogleTranslate />
      <div className="container main-back">
        <BackWeather />
        <header>
          <h1>
            Cultivating India's Future with Agentic AI - Powered by Veritas AI
          </h1>
        </header>
        <button className="chat-button" onClick={handleOpenAskModal}>
          <span role="img" aria-label="ask-mic">
            🎤
          </span>
        </button>
        <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
      </div>
    </>
  );
}

export default EarlyWarning;
