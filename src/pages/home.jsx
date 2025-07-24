import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import GoogleTranslate from '../components/googleTranslate';
import Ask from './ask';

function Home() {
  const navigate = useNavigate();
  const [isAskModalOpen, setAskModalOpen] = useState(false);

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);
  return (
    <>
     <GoogleTranslate />
      <Navbar />

      <header>
        <h1>Cultivating India's Future with Agentic AI - Powered by Veritas AI</h1>
      </header>

      <div className="button-grid">
        <button onClick={() => navigate('/yield')}>Improve yield</button>
        <button onClick={() => navigate('/profit')}>Improve profitability</button>
        <button onClick={() => navigate('/warning')}>Early Warning</button>
        <button onClick={() => navigate('/transport')}>Transport and Storage</button>
        <button onClick={() => navigate('/community')}>Farmer Community</button>
        <button onClick={() => navigate('/govtInfo')}>Government Information</button>
      </div>

      <button className="chat-button" onClick={handleOpenAskModal}>
        <span role="img" aria-label="ask-mic">🎤</span>
      </button>
      <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
    </>
  );
}

export default Home;
