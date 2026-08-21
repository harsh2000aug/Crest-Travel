import React from "react";
import "./VacationFinalLoader.css";
const VacationFinalLoader = () => {
  return (
    <div className="ldr2__wrap">
      <div className="ldr2__box">
        <div className="ldr2__spinner">
          <div className="ldr2__core"></div>
        </div>
        <span className="ldr2__text">Loading</span>
      </div>
    </div>
  );
};

export default VacationFinalLoader;
