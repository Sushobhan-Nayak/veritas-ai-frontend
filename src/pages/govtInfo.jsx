import React, { useState } from "react";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import BackWeather from "../components/backWeather";
import "../style/govtInfo.css";

const schemes = [
  {
    label: "Crop Insurance (PMFBY)",
    url: "https://pmfby.gov.in/",
    description:
      "Pradhan Mantri Fasal Bima Yojana provides insurance coverage and financial support to farmers in the event of failure of any of the notified crops as a result of natural calamities, pests & diseases.",
    faqs: [
      {
        q: "Scheme details",
        a: "The Pradhan Mantri Fasal Bima Yojana (PMFBY) is a government-sponsored crop insurance scheme that provides comprehensive insurance coverage against crop failure, helping to stabilize farmers' income. It covers all non-preventable natural risks from pre-sowing to post-harvest.",
      },
      {
        q: "How to apply for insurance",
        a: "Farmers can apply online through the PMFBY portal (pmfby.gov.in), through their nearest bank branch, or via a Common Service Center (CSC).",
      },
      {
        q: "Premium calculation process",
        a: "Farmers pay a uniform premium: 2% for all Kharif crops, 1.5% for all Rabi crops, and 5% for annual commercial and horticultural crops. The government subsidizes the remaining premium amount.",
      },
      {
        q: "Application status",
        a: "You can track your application status on the PMFBY portal using your application number.",
      },
      {
        q: "Documents needed for insurance",
        a: "Required documents include land records (RoR, land possession certificate), bank account details, and an Aadhaar card.",
      },
      {
        q: "Eligibility criteria for insurance",
        a: "All farmers, including sharecroppers and tenant farmers growing notified crops in notified areas, are eligible. Loanee farmers are covered automatically, while non-loanee farmers can opt-in.",
      },
      {
        q: "How to claim insurance",
        a: "In case of crop loss, inform your bank or insurance company within 72 hours. A surveyor will assess the damage, and the claim amount is directly credited to your bank account.",
      },
      {
        q: "Seasonality consideration",
        a: "The scheme covers both Kharif and Rabi seasons. The specific crops notified can vary by state and region.",
      },
      {
        q: "Yield consideration",
        a: "Claims are based on the shortfall in yield against the 'Threshold Yield', which is calculated from the average yield of the past seven years. A claim is paid if the actual yield is less than the threshold due to a non-preventable risk.",
      },
    ],
  },
  {
    label: "Kisan Credit Card (KCC)",
    url: "https://www.myscheme.gov.in/schemes/kcc",
    description: "A credit scheme to meet the short-term credit requirements for cultivation of crops, post-harvest expenses, and other farm-related activities at a subsidized interest rate.",
    faqs: [
      {
        q: "Scheme details",
        a: "The Kisan Credit Card (KCC) scheme provides farmers with timely and affordable credit for their cultivation and other needs. It was introduced to meet the short-term credit requirements of farmers in India.",
      },
      {
        q: "How to apply (application process)",
        a: "Farmers can apply for a KCC at any commercial bank, regional rural bank (RRB), or cooperative bank by filling out a simple application form.",
      },
      {
        q: "Documents needed for card",
        a: "Required documents include proof of identity (e.g., Aadhaar card, PAN card), address proof, and land ownership documents.",
      },
      {
        q: "Eligibility",
        a: "All farmers, including individual or joint cultivators, tenant farmers, oral lessees, and sharecroppers are eligible for the KCC scheme.",
      },
      {
        q: "Benefits",
        a: "Provides short-term credit for crop cultivation, post-harvest expenses, and consumption needs. It also covers farm asset maintenance, allied agricultural activities, and includes personal accident insurance.",
      },
      {
        q: "Card loans how much and eligibility",
        a: "The credit limit is determined by the bank based on the farmer's land holding, cropping pattern, and scale of finance for the crop.",
      },
      {
        q: "Loan quantum",
        a: "The short-term credit limit is set for the first year and is increased by 10% annually for subsequent years (up to 5 years). Farmers can avail loans up to ₹3 lakh at a subsidized interest rate.",
      },
    ],
  },
  {
    label: "Seed Bank",
    url: "https://seednet.gov.in/",
    description: "Scheme to make quality seeds of all crops available to farmers at affordable prices.",
    faqs: [
      {
        q: "Scheme details",
        a: "The 'Scheme to Create a National Network of Seed Banks' aims to ensure the availability of quality seeds for all crops at affordable prices, particularly during natural calamities, to maintain seed security.",
      },
      {
        q: "Locations availability",
        a: "Seed banks are established at national, state, and local (village) levels. Contact your local Krishi Vigyan Kendra (KVK) or State Agriculture Department for information on nearby seed banks.",
      },
      {
        q: "Seed procurement procedure",
        a: "Farmers can purchase seeds from designated outlets of the National Seeds Corporation (NSC), State Seed Corporations, and other registered seed dealers.",
      },
      {
        q: "Seed cost",
        a: "Seeds are provided at subsidized rates. The subsidy amount varies depending on the crop and the region.",
      },
      {
        q: "Seed quality checks & certifications",
        a: "All seeds distributed under the scheme are certified for quality, germination rate, and genetic purity by designated seed certification agencies to ensure high crop yield.",
      },
    ],
  },
  {
    label: "Kisan Samman Nidhi",
    url: "https://pmkisan.gov.in/",
    description: "Pradhan Mantri Kisan Samman Nidhi provides income support of ₹6,000 per year to all landholding farmer families.",
    faqs: [
      {
        q: "Scheme details",
        a: "The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a central sector scheme with 100% funding from the Government of India to supplement the financial needs of farmers.",
      },
      {
        q: "Benefits & Limit of beneficiaries",
        a: "The scheme provides an income support of ₹6,000 per year in three equal installments of ₹2,000 each to all eligible landholding farmer families.",
      },
      {
        q: "Eligibility criteria",
        a: "All landholding farmer families with cultivable land in their names are eligible to receive benefits under the scheme.",
      },
      {
        q: "Exclusions",
        a: "Institutional landholders, families with members holding constitutional posts, government employees, and professionals like doctors and lawyers are excluded from the scheme.",
      },
      {
        q: "Monitoring systems",
        a: "The scheme is monitored through a central Project Monitoring Unit (PMU) and state-level committees. Beneficiary data is maintained on the PM-KISAN portal.",
      },
    ],
  },
  {
    label: "ATMA Scheme",
    url: "https://extensionreforms.dac.gov.in/",
    description: "Agricultural Technology Management Agency (ATMA) scheme for strengthening extension services and promoting new technologies.",
    faqs: [
      {
        q: "Scheme details",
        a: "The Agricultural Technology Management Agency (ATMA) is a centrally sponsored scheme designed to strengthen agricultural extension services and promote the adoption of new technologies.",
      },
      {
        q: "Benefits",
        a: "It makes the extension system farmer-driven and accountable by creating a platform for interaction between farmers, scientists, and extension workers, promoting the adoption of best practices.",
      },
      {
        q: "Various aspects of schemes like training, exposure visits, kisan mela, farmers groups and farm schools",
        a: "ATMA organizes farmer training, exposure visits, Kisan Melas (farmer fairs), and supports Farmer Interest Groups (FIGs) and Farm Schools to disseminate knowledge and technology.",
      },
      {
        q: "Areas of technology adoption",
        a: "The scheme focuses on disseminating technology in areas such as integrated pest management, soil health, water management, crop diversification, and post-harvest technology.",
      },
    ],
  },
  {
    label: "Agri Infra fund",
    url: "https://agrinfra.dac.gov.in/",
    description: "A financing facility for creation of post-harvest management infrastructure and community farming assets.",
    faqs: [
      {
        q: "Scheme details",
        a: "The Agriculture Infrastructure Fund is a financing facility for creating post-harvest management infrastructure and community farming assets, providing medium-long term debt financing.",
      },
      {
        q: "Eligibility",
        a: "Eligible entities include farmers, Farmer Producer Organizations (FPOs), Primary Agricultural Credit Societies (PACS), and agri-entrepreneurs.",
      },
      {
        q: "Crop eligibility",
        a: "The fund is generally not crop-specific and supports infrastructure for a wide range of agricultural produce to improve post-harvest management.",
      },
      {
        q: "Monitoring details",
        a: "Projects are monitored by a central Project Monitoring Unit (PMU), state-level committees, and the financing banks.",
      },
      {
        q: "Lending institutions",
        a: "Loans are provided by commercial banks, cooperative banks, Regional Rural Banks (RRBs), and other financial institutions.",
      },
      {
        q: "Detailed Project Report to be submitted",
        a: "Applicants must submit a Detailed Project Report (DPR) covering project details, financial viability, and technical feasibility via the national portal (agrinfra.dac.gov.in).",
      },
    ],
  },
  {
    label: "E-Nam",
    url: "https://enam.gov.in/web/",
    description: "Electronic National Agriculture Market (eNAM) is a pan-India electronic trading portal for agricultural commodities.",
    faqs: [
      {
        q: "Scheme details",
        a: "The Electronic National Agriculture Market (e-NAM) is a pan-India electronic trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities.",
      },
      {
        q: "Small Farmers’ Agribusiness Consortium details",
        a: "The Small Farmers’ Agribusiness Consortium (SFAC) is the lead agency for implementing e-NAM, providing the platform and supporting its rollout in states.",
      },
      {
        q: "How to be a member",
        a: "Farmers can register on the e-NAM portal (enam.gov.in) through their nearest e-NAM enabled mandi with a bank account and an Aadhaar card.",
      },
      {
        q: "Benefits of joining the eNam",
        a: "e-NAM provides better price discovery through transparent online bidding, access to a larger national market, and ensures timely online payments for produce.",
      },
    ],
  },
  {
    label: "Soil Health Card",
    url: "https://soilhealth.dac.gov.in/home",
    description: "A scheme to provide every farmer with a soil health card which will carry crop-wise recommendations of nutrients and fertilizers required for the individual farms.",
    faqs: [
      {
        q: "Scheme details",
        a: "The Soil Health Card (SHC) scheme provides farmers with a card detailing their soil's nutrient status and recommendations for fertilizer application to improve soil health and productivity.",
      },
      {
        q: "Testing process",
        a: "Soil samples are collected from a farmer's field and tested for 12 parameters, including macro and micronutrients, and physical parameters like pH and organic carbon.",
      },
      {
        q: "Soil maps and Nutrient maps",
        a: "The data from soil testing is used to generate soil and nutrient maps, which aid in macro-level planning for soil health management across different regions.",
      },
    ],
  },
  {
    label: "National Mission on Natural Farming",
    url: "https://naturalfarming.dac.gov.in/",
    description: "A scheme to promote traditional, chemical-free farming methods to reduce costs and improve soil health.",
    faqs: [
      {
        q: "Scheme details",
        a: "The National Mission on Natural Farming (NMNF) promotes traditional indigenous practices, emphasizing on-farm biomass recycling and the exclusion of all synthetic chemical inputs.",
      },
      {
        q: "Benefits",
        a: "It helps in reducing farming costs, improving soil health and ecosystem services, and increasing farmers' income by promoting sustainable and climate-resilient agriculture.",
      },
      {
        q: "How to apply",
        a: "The scheme is implemented through state governments. Farmers can contact their district agriculture office or KVK for information on training, support, and how to participate.",
      },
    ],
  },
];

function FaqItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{faq.q}</span>
        <span>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p style={{ whiteSpace: "pre-wrap" }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
}

function SchemeDetailsModal({ isOpen, onClose, scheme }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>{scheme.label}</h2>
        <p>{scheme.description}</p>
        <hr />
        <div className="faqs-container">
          {scheme.faqs.map((faq, index) => <FaqItem key={index} faq={faq} />)}
        </div>
        <a href={scheme.url} target="_blank" rel="noopener noreferrer">
          Visit Scheme Website
        </a>
      </div>
    </div>
  );
}

function GovtInfo() {
  const [isAskModalOpen, setAskModalOpen] = useState(false);
  const [isSchemeModalOpen, setSchemeModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const handleOpenSchemeModal = (scheme) => {
    setSelectedScheme(scheme);
    setSchemeModalOpen(true);
  };

  const handleCloseSchemeModal = () => {
    setSchemeModalOpen(false);
    setSelectedScheme(null);
  };

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);
  return (
    <>
      <GoogleTranslate />
      <BackWeather />
      <header>
        <h1>
          Cultivating India's Future with Agentic AI - Powered by Veritas AI
        </h1>
      </header>

      <div className="schemes-grid">
        {schemes.map((scheme, index) => (
          <div
            key={index}
            className="card"
            onClick={() => handleOpenSchemeModal(scheme)}
          >
            <h3>{scheme.label}</h3>
            <p>{scheme.description}</p>
          </div>
        ))}
      </div>

      {selectedScheme && (
        <SchemeDetailsModal
          isOpen={isSchemeModalOpen}
          onClose={handleCloseSchemeModal}
          scheme={selectedScheme}
        />
      )}

      <button className="chat-button" onClick={handleOpenAskModal}>
        <span role="img" aria-label="ask-mic">
          🎤
        </span>
      </button>
      <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
    </>
  );
}

export default GovtInfo;
