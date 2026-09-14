import React, { useEffect, useState } from "react";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import hotel1 from "../../assets/images/hotel1.webp";
import hotel2 from "../../assets/images/hotel2.webp";
import hotel3 from "../../assets/images/hotel3.webp";
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
  FaRegSadTear,
} from "react-icons/fa";
import {
  hotelBookingInfo,
  hotelUpcomingOrder,
} from "../../store/Services/AllApi";
import { useNavigate } from "react-router-dom";

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

const bookingTabs = ["Upcoming", "Cancelled", "Completed"];

const MyBookings = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("hotels");
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [collapse, setCollapse] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  const filteredBookings = upcomingBookings.filter(
    (item) => item.type === activeMenu && item.status === activeTab,
  );

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        const res = await hotelUpcomingOrder({
          body: {
            memberid: localStorage.getItem("bookingId"),
            status: "UPCOMING",
            travelDate: {
              start: "2026-09-01",
              end: "2028-09-14",
            },
          },
        });

        const mappedBookings = (res?.orders || []).map((order) => ({
          id: order.orderid,
          type: "hotels",
          status: "Upcoming",
          hotelName: order.property_name,
          city: "",
          checkIn: new Date(order.start_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          checkOut: new Date(order.end_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          guests: order?.adults,
          bookingId: order.confirmation_number,
          amount: `$${Number(order.our_price || 0).toFixed(2)}`,
          image: order?.image,
          orderStatus: order.orderstatus,
        }));

        setUpcomingBookings(mappedBookings);
      } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        setUpcomingBookings([]);
      }
    };

    fetchUpcomingBookings();
  }, []);

  const handleParticularBookingClick = (id) => {
    navigate(`/hotel-booking-details?id=${encodeURIComponent(id)}`);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  });
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
                  <div
                    className="voyage-booking-card"
                    key={booking.id}
                    onClick={() => handleParticularBookingClick(booking.id)}
                  >
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
