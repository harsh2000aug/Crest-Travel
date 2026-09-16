import React from "react";
import "./SimpleLoader.css";
const SimpleLoader = () => {
  return (
    <div>
      <div className="premium-fullscreen-loader">
        <div className="premium-loader-content">
          <div className="premium-loader-orbit">
            <div className="premium-loader-ring"></div>
            <div className="premium-loader-ring premium-loader-ring-two"></div>
            <div className="premium-loader-dot"></div>
          </div>

          <div className="premium-loader-title">Checking details...</div>

          <div className="premium-loader-subtitle">Please wait a moment</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoader;
