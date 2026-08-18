import React, { useState } from "react";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import hotel1 from "../../assets/images/hotel1.jpg";
import hotel2 from "../../assets/images/hotel2.jpg";
import hotel3 from "../../assets/images/hotel3.jpg";
import {
  FaHotel,
  FaPlane,
  FaUmbrellaBeach,
  FaShip,
  FaCar,
  FaBus,
  FaTicketAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaRegSadTear,
} from "react-icons/fa";

const sidebarItems = [
  {
    id: "hotels",
    title: "Hotels",
    icon: <FaHotel />,
  },
  {
    id: "flights",
    title: "Flights",
    icon: <FaPlane />,
  },
  {
    id: "activities",
    title: "Activities",
    icon: <FaUmbrellaBeach />,
  },
  {
    id: "cruises",
    title: "Cruises",
    icon: <FaShip />,
  },
  {
    id: "cars",
    title: "Car Rentals",
    icon: <FaCar />,
  },
  {
    id: "transfers",
    title: "Transfers",
    icon: <FaBus />,
  },
  {
    id: "tickets",
    title: "Events & Tickets",
    icon: <FaTicketAlt />,
  },
];

const bookingData = [
  {
    id: 1,
    type: "hotels",
    status: "Upcoming",
    hotelName: "Grand Palace Hotel",
    city: "Dubai, UAE",
    checkIn: "20 Jul 2026",
    checkOut: "23 Jul 2026",
    guests: "2 Adults",
    bookingId: "BK458921",
    amount: "$420",
    image: hotel1,
  },
  {
    id: 2,
    type: "hotels",
    status: "Cancelled",
    hotelName: "Taj Palace",
    city: "Mumbai",
    checkIn: "10 Jun 2026",
    checkOut: "12 Jun 2026",
    guests: "2 Adults",
    bookingId: "BK145263",
    amount: "$260",
    image: hotel2,
  },
  {
    id: 3,
    type: "hotels",
    status: "Completed",
    hotelName: "Marriott",
    city: "Singapore",
    checkIn: "15 Apr 2026",
    checkOut: "18 Apr 2026",
    guests: "2 Adults",
    bookingId: "BK852147",
    amount: "$620",
    image: hotel3,
  },
];

const bookingTabs = ["Upcoming", "Cancelled", "Completed"];

const MyBookings = () => {
  const [activeMenu, setActiveMenu] = useState("hotels");
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [collapse, setCollapse] = useState(false);

  const filteredBookings = bookingData.filter(
    (item) => item.type === activeMenu && item.status === activeTab,
  );
  return (
    <div>
      <HeaderInner />
      <section className="my-bookings">
        <div className="voyage-dashboard">
          <aside
            className={`voyage-sidebar ${
              collapse ? "voyage-sidebar-collapse" : ""
            }`}
          >
            <div className="voyage-sidebar-top">
              {!collapse && <h2 className="voyage-logo">My Bookings</h2>}

              <button
                className="voyage-collapse-btn"
                onClick={() => setCollapse(!collapse)}
              >
                {collapse ? <FaChevronLeft /> : <FaChevronRight />}
              </button>
            </div>

            <div className="voyage-sidebar-menu">
              {sidebarItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`voyage-sidebar-item ${
                    activeMenu === item.id ? "voyage-sidebar-item-active" : ""
                  }`}
                >
                  <span>{item.icon}</span>

                  {!collapse && <p>{item.title}</p>}
                </div>
              ))}
            </div>
          </aside>
          <div className="voyage-main">
            <div className="voyage-header">
              <div className="voyage-tabs">
                {bookingTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`voyage-tab ${
                      activeTab === tab ? "voyage-tab-active" : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length > 0 ? (
              <div className="voyage-booking-list">
                {filteredBookings.map((booking) => (
                  <div className="voyage-booking-card" key={booking.id}>
                    <div className="voyage-booking-image">
                      <img src={booking.image} alt={booking.hotelName} />

                      <span className="voyage-booking-status">
                        {booking.status}
                      </span>
                    </div>

                    <div className="voyage-booking-body">
                      <h3>{booking.hotelName}</h3>

                      <p>{booking.city}</p>

                      <div className="voyage-booking-row">
                        <span>Check In</span>
                        <strong>{booking.checkIn}</strong>
                      </div>

                      <div className="voyage-booking-row">
                        <span>Check Out</span>
                        <strong>{booking.checkOut}</strong>
                      </div>

                      <div className="voyage-booking-row">
                        <span>Guests</span>
                        <strong>{booking.guests}</strong>
                      </div>

                      <div className="voyage-booking-row">
                        <span>Booking ID</span>
                        <strong>{booking.bookingId}</strong>
                      </div>

                      <div className="voyage-booking-footer">
                        <h2>{booking.amount}</h2>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="voyage-empty-wrapper">
                <div className="voyage-empty-icon">
                  <FaRegSadTear />
                </div>

                <h2>No {activeMenu} Bookings</h2>

                <p>
                  You don't have any <strong>{activeMenu}</strong> bookings
                  under <strong>{activeTab}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MyBookings;
