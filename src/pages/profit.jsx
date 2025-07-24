import React, { useState } from "react";
import BackWeather from "../components/backWeather";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import Loader from "../components/loader";

const Profit = () => {
  const [loading, setLoading] = useState(false);
  const [isAskModalOpen, setAskModalOpen] = useState(false);

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);

  return (
    <>
      <GoogleTranslate />
      <div className="container main-back">
        {loading && <Loader />}
        <BackWeather />
        <h1 className="header">
          Improve Profitability
        </h1>
        <div className="glass-background">
          <h2>Profitability Tools</h2>
          <p>Content related to improving profitability will be here.</p>
        </div>
        <button className="chat-button" onClick={handleOpenAskModal}>
          <span role="img" aria-label="ask-mic">🎤</span>
        </button>
      </div>
      <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
    </>
  );
};

export default Profit;