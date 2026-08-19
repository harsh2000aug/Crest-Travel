import React from "react";
import { FaLocationDot, FaUmbrellaBeach } from "react-icons/fa6";
import "./VacationLoader.css";

const VacationLoader = () => {
  return (
    <div className="vacationRentalLoader" role="status" aria-live="polite">
      <div className="vacationRentalLoader__list">
        <div className="vacationRentalLoader__heading">
          <div className="vacationRentalLoader__line vacationRentalLoader__line--heading" />
          <div className="vacationRentalLoader__line vacationRentalLoader__line--location" />
        </div>

        <div className="vacationRentalLoader__card">
          <div className="vacationRentalLoader__image" />

          <div className="vacationRentalLoader__content">
            <div className="vacationRentalLoader__line vacationRentalLoader__line--title" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--details" />
            <div className="vacationRentalLoader__divider" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--price" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--fees" />
          </div>
        </div>

        <div className="vacationRentalLoader__card">
          <div className="vacationRentalLoader__image" />

          <div className="vacationRentalLoader__content">
            <div className="vacationRentalLoader__line vacationRentalLoader__line--title" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--details" />
            <div className="vacationRentalLoader__divider" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--price" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--fees" />
          </div>
        </div>

        <div className="vacationRentalLoader__card">
          <div className="vacationRentalLoader__image" />

          <div className="vacationRentalLoader__content">
            <div className="vacationRentalLoader__line vacationRentalLoader__line--title" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--details" />
            <div className="vacationRentalLoader__divider" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--price" />
            <div className="vacationRentalLoader__line vacationRentalLoader__line--fees" />
          </div>
        </div>
      </div>

      <div className="vacationRentalLoader__map">
        <span className="vacationRentalLoader__road vacationRentalLoader__road--one" />
        <span className="vacationRentalLoader__road vacationRentalLoader__road--two" />
        <span className="vacationRentalLoader__road vacationRentalLoader__road--three" />

        <span className="vacationRentalLoader__pin vacationRentalLoader__pin--one">
          <FaLocationDot />
        </span>

        <span className="vacationRentalLoader__pin vacationRentalLoader__pin--two">
          <FaLocationDot />
        </span>

        <span className="vacationRentalLoader__pin vacationRentalLoader__pin--three">
          <FaLocationDot />
        </span>

        <div className="vacationRentalLoader__message">
          <span className="vacationRentalLoader__vacationIcon">
            <FaUmbrellaBeach />
          </span>

          <div>
            <strong>Finding your perfect stay</strong>
            <span>Searching available vacation rentals...</span>
          </div>

          <span className="vacationRentalLoader__dots">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>

      <span className="vacationRentalLoader__screenReader">
        Loading vacation rentals
      </span>
    </div>
  );
};

export default VacationLoader;
