import React from "react";
import "./CarLoader.css";
const CarLoader = () => {
  return (
    <div>
      <div className="car-loading-screen">
        <div className="car-loading-content">
          <div className="car-loading-road">
            <div className="car-loading-car">
              <div className="car-loading-car-shadow"></div>

              <div className="car-loading-body">
                <div className="car-loading-window car-loading-window-front"></div>
                <div className="car-loading-window car-loading-window-back"></div>

                <div className="car-loading-headlight car-loading-headlight-front"></div>
                <div className="car-loading-headlight car-loading-headlight-back"></div>

                <div className="car-loading-wheel car-loading-wheel-front">
                  <span></span>
                </div>

                <div className="car-loading-wheel car-loading-wheel-back">
                  <span></span>
                </div>
              </div>
            </div>

            <div className="car-loading-road-line car-loading-road-line-one"></div>
            <div className="car-loading-road-line car-loading-road-line-two"></div>
            <div className="car-loading-road-line car-loading-road-line-three"></div>
          </div>

          <div className="car-loading-title">Hold On</div>

          <div className="car-loading-subtitle">We are fetching details</div>
        </div>
      </div>
    </div>
  );
};

export default CarLoader;
