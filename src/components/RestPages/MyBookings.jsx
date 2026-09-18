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
import { carOrders, hotelUpcomingOrder } from "../../store/Services/AllApi";
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
    id: "cars",
    title: "Car Rentals",
    icon: <FaCar />,
  },
  {
    id: "activities",
    title: "Activities",
    icon: <FaUmbrellaBeach />,
  },
  {
    id: "buses",
    title: "Bus",
    icon: <FaBus />,
  },
  {
    id: "cruises",
    title: "Cruises",
    icon: <FaShip />,
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
  const [carBookings, setCarBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_LIMIT = 10;

  const allBookings = [...upcomingBookings, ...carBookings];

  const filteredBookings = allBookings.filter(
    (item) => item.type === activeMenu && item.status === activeTab,
  );

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      setLoading(true);

      try {
        const apiStatus =
          activeTab === "Upcoming"
            ? "UPCOMING"
            : activeTab === "Cancelled"
              ? "CANCELLED"
              : "COMPLETED";

        const res = await hotelUpcomingOrder({
          body: {
            memberid: localStorage.getItem("bookingId"),
            status: apiStatus,
            travelDate: {
              start: "2026-09-01",
              end: "2028-09-14",
            },
            limit: PAGE_LIMIT,
            offset: currentPage * PAGE_LIMIT,
          },
        });

        const orders = [...(res?.orders || [])].sort(
          (a, b) => new Date(b.createdat) - new Date(a.createdat),
        );

        const mappedBookings = orders.map((order) => ({
          id: order.orderid,
          type: "hotels",
          status:
            activeTab === "Upcoming"
              ? "Upcoming"
              : activeTab === "Cancelled"
                ? "Cancelled"
                : "Completed",
          hotelName: order.property_name,
          city: order.property_city || "",
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
          cancellable: order?.cancellable === true,
        }));

        setUpcomingBookings(mappedBookings);

        const totalCount = Number(res?.count || 0);
        const calculatedTotalPages = Math.ceil(totalCount / PAGE_LIMIT);

        setTotalPages(calculatedTotalPages);
        setHasNextPage(currentPage < calculatedTotalPages - 1);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setUpcomingBookings([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingBookings();
  }, [currentPage, activeTab]);

  const handleParticularBookingClick = (booking) => {
    sessionStorage.setItem(
      "hotelBookingCancellable",
      JSON.stringify(booking.cancellable),
    );

    sessionStorage.setItem("hotelBookingStatus", booking.status);

    navigate(`/hotel-booking-details?id=${encodeURIComponent(booking.id)}`);
  };

  useEffect(() => {
    const fetchCarInfo = async () => {
      if (activeMenu !== "cars") return;
      setLoading(true);
      try {
        const res = await carOrders({
          body: {
            memberid: localStorage.getItem("bookingId"),
            status:
              activeTab === "Upcoming"
                ? "UPCOMING"
                : activeTab === "Cancelled"
                  ? "CANCELLED"
                  : "COMPLETED",
            travelDate: {
              start: "2026-09-01",
              end: "2028-12-30",
            },
            limit: PAGE_LIMIT,
            offset: currentPage * PAGE_LIMIT,
            supplierid: 0,
          },
        });

        console.log("carOrders Response:", res);

        const orders = res?.orders || [];

        const mappedCarBookings = orders.map((order) => {
          const carData =
            order?.booking_data?.revalidate ||
            order?.booking_data?.data?.revalidate?.result ||
            {};

          const car = carData?.car || {};
          const pickup = carData?.pickup || {};
          const dropoff = carData?.dropoff || {};
          const partner = carData?.partner || {};
          const price = carData?.price || {};

          const carName =
            car?.name ||
            order?.car_name ||
            order?.property_name ||
            "Car Rental";

          const carDescription = car?.description || order?.car_name_type || "";

          const carImage = car?.heroImage || order?.image || dummy;

          const pickupLocation =
            pickup?.name || pickup?.address || order?.pickuplocation || "";

          const pickupCity = pickup?.city || "";

          const dropoffLocation =
            dropoff?.name || dropoff?.address || order?.dropofflocation || "";

          const dropoffCity = dropoff?.city || "";

          const partnerName = partner?.name || order?.partner || "";

          const partnerLogo = partner?.logo || "";

          const bookingStatus =
            order?.booking_status ||
            order?.bookingStatus ||
            order?.orderstatus ||
            carData?.booking_Status ||
            "";

          let status = "Upcoming";

          if (
            activeTab === "Cancelled" ||
            bookingStatus === "CANCELLED" ||
            bookingStatus === "CANCELED"
          ) {
            status = "Cancelled";
          } else if (
            activeTab === "Completed" ||
            bookingStatus === "COMPLETED"
          ) {
            status = "Completed";
          }

          const totalPrice =
            price?.total ??
            price?.ourprice ??
            order?.total ??
            order?.our_price ??
            0;

          return {
            id: order?.orderid,

            type: "cars",
            status,

            carName,
            carDescription,
            carImage,

            partnerName,
            partnerLogo,

            pickupLocation,
            pickupCity,
            pickupDate: pickup?.date || order?.start_date || "",

            pickupTime: pickup?.time || order?.start_time || "",

            pickupTimeText: pickup?.time_text || "",

            dropoffLocation,
            dropoffCity,
            dropoffDate: dropoff?.date || order?.end_date || "",

            dropoffTime: dropoff?.time || order?.end_time || "",

            dropoffTimeText: dropoff?.time_text || "",

            confirmationNumber:
              order?.confirmation_number ||
              order?.confirmationNumber ||
              carData?.confirmationNumber ||
              order?.orderid ||
              "",

            bookingStatus,

            amount: `${price?.currency || order?.currencysymbol || order?.currency || "$"}${Number(
              totalPrice,
            ).toFixed(2)}`,

            currency: price?.currency || order?.currency || "USD",

            passengers: car?.passengers || order?.seats || 0,

            bags: car?.bags || order?.bags || 0,

            doors: car?.doors || "",

            mileage: car?.mileage || "",

            hasAC: car?.hasAC || false,

            hasAMT: car?.hasAMT || false,

            cancellable:
              carData?.allowCancellation === true ||
              carData?.is_cancellation_allowed === true ||
              order?.cancellable === true,

            cancellationMethod: carData?.cancellation_method || "",
          };
        });

        setCarBookings(mappedCarBookings);

        const totalCount = Number(res?.count || 0);
        const calculatedTotalPages = Math.ceil(totalCount / PAGE_LIMIT);

        setTotalPages(calculatedTotalPages || 1);
        setHasNextPage(currentPage < calculatedTotalPages - 1);
      } catch (error) {
        console.error("CAR INFO ERROR:", error);
        setCarBookings([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCarInfo();
  }, [activeMenu, activeTab, currentPage]);

  const handleCarBookingClick = (booking) => {
    if (!booking?.id) return;

    sessionStorage.setItem(
      "carBookingCancellable",
      JSON.stringify(booking.cancellable),
    );

    sessionStorage.setItem("carBookingStatus", booking.status);

    navigate(`/car-booking-details?orderid=${encodeURIComponent(booking.id)}`);
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
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(0);
                    }}
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
                {filteredBookings.map((booking) =>
                  booking.type === "cars" ? (
                    <div
                      className="car-upcoming-booking-card"
                      key={booking.id}
                      onClick={() => handleCarBookingClick(booking)}
                    >
                      <div className="car-upcoming-booking-image-wrapper">
                        <img
                          className="car-upcoming-booking-image"
                          src={booking.carImage || dummy}
                          alt={booking.carName}
                        />

                        <span className="car-upcoming-booking-status">
                          {booking.status}
                        </span>
                      </div>

                      <div className="car-upcoming-booking-content">
                        <div className="car-upcoming-booking-header">
                          <div>
                            <h3 className="car-upcoming-booking-title">
                              {booking.carName}
                            </h3>

                            <p className="car-upcoming-booking-description">
                              {booking.carDescription}
                            </p>
                          </div>

                          {booking.partnerLogo && (
                            <img
                              className="car-upcoming-booking-partner-logo"
                              src={booking.partnerLogo}
                              alt={booking.partnerName}
                            />
                          )}
                        </div>

                        <div className="car-upcoming-booking-info-grid">
                          <div className="car-upcoming-booking-info-item">
                            <span className="car-upcoming-booking-label">
                              Pick Up
                            </span>

                            <strong className="car-upcoming-booking-value">
                              {booking.pickupLocation}
                            </strong>

                            <small className="car-upcoming-booking-location">
                              {booking.pickupCity}
                            </small>

                            <small className="car-upcoming-booking-date">
                              {booking.pickupTimeText ||
                                `${booking.pickupDate} ${booking.pickupTime}`}
                            </small>
                          </div>

                          <div className="car-upcoming-booking-info-item">
                            <span className="car-upcoming-booking-label">
                              Drop Off
                            </span>

                            <strong className="car-upcoming-booking-value">
                              {booking.dropoffLocation}
                            </strong>

                            <small className="car-upcoming-booking-location">
                              {booking.dropoffCity}
                            </small>

                            <small className="car-upcoming-booking-date">
                              {booking.dropoffTimeText ||
                                `${booking.dropoffDate} ${booking.dropoffTime}`}
                            </small>
                          </div>

                          <div className="car-upcoming-booking-info-item">
                            <span className="car-upcoming-booking-label">
                              Confirmation
                            </span>

                            <strong className="car-upcoming-booking-value">
                              {booking.confirmationNumber}
                            </strong>
                          </div>

                          <div className="car-upcoming-booking-info-item">
                            <span className="car-upcoming-booking-label">
                              Car Details
                            </span>

                            <div className="car-upcoming-booking-features">
                              <span>{booking.passengers} Passengers</span>

                              <span>{booking.bags} Bags</span>

                              <span>{booking.doors} Doors</span>

                              {booking.mileage && (
                                <span>{booking.mileage}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="car-upcoming-booking-footer">
                          <div className="car-upcoming-booking-feature-tags">
                            {booking.hasAC && (
                              <span className="car-upcoming-booking-feature-tag">
                                AC
                              </span>
                            )}

                            {booking.hasAMT && (
                              <span className="car-upcoming-booking-feature-tag">
                                Automatic
                              </span>
                            )}
                          </div>

                          <div className="car-upcoming-booking-price">
                            <span className="car-upcoming-booking-price-label">
                              Total
                            </span>

                            <strong className="car-upcoming-booking-price-value">
                              {booking.amount}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="voyage-booking-card"
                      key={booking.id}
                      onClick={() => handleParticularBookingClick(booking)}
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
                  ),
                )}
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
