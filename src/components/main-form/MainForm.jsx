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
import FlightForm from "./forms/FlightForm";
import HotelForm from "./HotelForm/HotelForm";
import HeaderInner from "../../reuseable-components/HeaderInner";
import CarForm from "./CarRental/CarForm";
import ActivityForm from "./Activity/ActivityForm";
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
      label: "Transfers",
      icon: LuCar,
    },
    {
      id: 4,
      label: "Activities",
      icon: LuMap,
    },

    {
      id: 5,
      label: "Tours",
      icon: LuCompass,
    },
    {
      id: 6,
      label: "Vacations",
      icon: LuHouse,
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
        <div className="container">
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
    </>
  );
};

export default MainForm;
