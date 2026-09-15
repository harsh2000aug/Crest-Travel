import React, { useEffect, useState } from "react";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import dummy from "../../assets/images/dummy-hotel.png";
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
    id: "activities",
    title: "Activities",
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
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_LIMIT = 10;

  const filteredBookings = upcomingBookings.filter(
    (item) => item.type === activeMenu && item.status === activeTab,
  );

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      setLoading(true);

      try {
        const res = await hotelUpcomingOrder({
          body: {
            memberid: localStorage.getItem("bookingId"),
            status: "UPCOMING",
            travelDate: {
              start: "2026-09-01",
              end: "2028-09-14",
            },
            limit: PAGE_LIMIT,
            offset: currentPage,
          },
        });

        const orders = res?.orders || [];

        const mappedBookings = orders.map((order) => ({
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

        const nextPageAvailable = orders.length === PAGE_LIMIT;

        setHasNextPage(nextPageAvailable);

        if (nextPageAvailable) {
          setTotalPages((prev) => Math.max(prev, currentPage + 2));
        } else {
          setTotalPages((prev) => Math.max(prev, currentPage + 1));
        }
      } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        setUpcomingBookings([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingBookings();
  }, [currentPage]);

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
      {loading && (
        <div className="simple-hotel-loader">
          <div className="simple-hotel-loader__box">
            <div className="simple-hotel-loader__icon-wrap">
              <div className="simple-hotel-loader__icon">
                <div className="simple-hotel-loader__roof"></div>

                <div className="simple-hotel-loader__building">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="simple-hotel-loader__door"></div>
              </div>

              <div className="simple-hotel-loader__circle"></div>
            </div>

            <h2 className="simple-hotel-loader__title">Please wait untill</h2>

            <p className="simple-hotel-loader__text">we fetch your bookings</p>

            <div className="simple-hotel-loader__loading">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="simple-hotel-loader__line">
              <div className="simple-hotel-loader__line-fill"></div>
            </div>
          </div>
        </div>
      )}
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
                      <img
                        src={booking.image || dummy}
                        alt={booking.hotelName}
                      />

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
            {(totalPages > 1 || currentPage > 0) && (
              <div className="voyage-pagination">
                <button
                  type="button"
                  className="voyage-pagination-btn voyage-pagination-prev"
                  disabled={currentPage === 0 || loading}
                  onClick={() => {
                    if (currentPage > 0) {
                      setCurrentPage((prev) => prev - 1);
                    }
                  }}
                >
                  <FaChevronLeft />
                  <span>Prev</span>
                </button>

                <div className="voyage-pagination-numbers">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index;

                    return (
                      <button
                        type="button"
                        key={pageNumber}
                        disabled={loading}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`voyage-pagination-number ${
                          currentPage === pageNumber
                            ? "voyage-pagination-number-active"
                            : ""
                        }`}
                      >
                        {pageNumber + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="voyage-pagination-btn voyage-pagination-next"
                  disabled={!hasNextPage || loading}
                  onClick={() => {
                    if (hasNextPage) {
                      setCurrentPage((prev) => prev + 1);
                    }
                  }}
                >
                  <span>Next</span>
                  <FaChevronRight />
                </button>
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
