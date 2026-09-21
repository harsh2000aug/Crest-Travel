import React, { useState } from "react";
import "./mainform.css";
import {
  LuHotel,
  LuPlane,
  LuMap,
  LuHouse,
  LuShip,
  LuCar,
  LuCompass,
  LuTicket,
} from "react-icons/lu";
import { FaCar } from "react-icons/fa";
import { MdKayaking } from "react-icons/md";

import FlightForm from "./forms/FlightForm";
import HotelForm from "./HotelForm/HotelForm";
import HeaderInner from "../../reuseable-components/HeaderInner";
import CarForm from "./CarRental/CarForm";
import ActivityForm from "./Activity/ActivityForm";
import VacationForm from "./Vacations/VacationForm";
const MainForm = () => {
  const categories = [
    {
      id: 1,
      label: "Flights",
      icon: LuPlane,
    },
    {
      id: 2,
      label: "Hotels",
      icon: LuHotel,
    },
    {
      id: 3,
      label: "Car Rental",
      icon: FaCar,
    },
    {
      id: 4,
      label: "Activities",
      icon: MdKayaking,
    },
    {
      id: 5,
      label: "Vacations",
      icon: LuHouse,
    },

    {
      id: 6,
      label: "Tours",
      icon: LuCompass,
    },

    {
      id: 7,
      label: "Cruises",
      icon: LuShip,
    },
    {
      id: 8,
      label: "Events",
      icon: LuTicket,
    },
  ];
  const renderForm = () => {
    switch (activeTab) {
      case 1:
        return <FlightForm />;

      case 2:
        return <HotelForm />;

      case 3:
        return <CarForm />;

      case 4:
        return <ActivityForm />;
      case 5:
        return <VacationForm />;

      default:
        return (
          <div className="coming-soon">
            <h3>Coming Soon</h3>
            <p>This service will be available soon.</p>
          </div>
        );
    }
  };
  const [activeTab, setActiveTab] = useState(categories[0].id);

  return (
    <>
      <div className="main-booking">
        <HeaderInner />
        <div className="travel-section-modify">
          <div className="container">
            <div className="travel-content">
              <h1>
                Unlock <span>Extraordinary</span> Journeys
              </h1>
              <p>
                Exclusive Travel Benefits. Curated Experiences. For a Better You
              </p>
            </div>
            <section className="travel-section">
              <div className="tabs-wrapper">
                {categories.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      className={`tab-item ${
                        activeTab === item.id ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <div className="icon-box">
                        <Icon size={24} />
                      </div>

                      <span>{item.label}</span>

                      {activeTab === item.id && (
                        <div className="active-indicator"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="tab-content">{renderForm()}</div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainForm;
