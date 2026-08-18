import { useState, useEffect } from "react";
import "./Loader.css";

export default function Loader() {
  return (
    <>
      <div className="loader-overlay">
        <div className="loader-container">
          <div className="flight-loader">
            <div className="flight-line"></div>
            <div className="plane">✈</div>
          </div>

          <h3>Please wait...</h3>
          <p>Please wait</p>

          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </>
  );
}
