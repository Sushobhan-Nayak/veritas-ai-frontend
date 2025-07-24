import React, { useState, useEffect } from 'react';
import NavbarWeatherInfo from '../components/navbarWeatherInfo';

const Navbar = () => {
  return (
      <>
      <div style={{ display: 'flex' }}>
        <NavbarWeatherInfo />
      </div>
      </>
  );
};

export default Navbar;
