import React from 'react';
import './AuthBackground.css';

const AuthBackground: React.FC = () => {
  return (
    <div className="bg-slideshow">
      {/* Handyman / Tools */}
      <span style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1080')" }}></span>
      {/* Cleaning */}
      <span style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578641002-39c4a478645f?q=80&w=1080')" }}></span>
      {/* Gardening / Lawn */}
      <span style={{ backgroundImage: "url('https://images.unsplash.com/photo-1416879598555-2272af178d8a?q=80&w=1080')" }}></span>
      {/* Painting / Home Reno */}
      <span style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1080')" }}></span>
      <div className="bg-overlay"></div>
    </div>
  );
};

export default AuthBackground;
