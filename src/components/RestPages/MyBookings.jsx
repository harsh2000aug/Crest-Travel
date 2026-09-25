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
  FaTicketAlt,
  FaChevronLeft,
  FaChevronRight,
  FaRegSadTear,
  FaHome,
} from "react-icons/fa";
import { FaEarthAsia } from "react-icons/fa6";

import {
  activityUpcoming,
  carOrders,
  hotelUpcomingOrder,
  upcomingFlight,
  vacationUpcoming,
} from "../../store/Services/AllApi";
import { useNavigate } from "react-router-dom";
import { CiHome } from "react-icons/ci";

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
    id: "vacations",
    title: "Vacation Rental",
    icon: <FaHome />,
  },
  {
    id: "cruises",
    title: "Cruises",
    icon: <FaShip />,
  },
  {
    id: "tours",
    title: "Tours",
    icon: <FaEarthAsia />,
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
  const [activityBookings, setActivityBookings] = useState([]);
  const [pagination, setPagination] = useState({
    hotels: {
      currentPage: 0,
      totalPages: 1,
      hasNextPage: false,
    },
    flights: {
      currentPage: 0,
      totalPages: 1,
      hasNextPage: false,
    },
    cars: {
      currentPage: 0,
      totalPages: 1,
      hasNextPage: false,
    },
    activities: {
      currentPage: 0,
      totalPages: 1,
      hasNextPage: false,
    },
    vacations: {
      currentPage: 0,
      totalPages: 1,
      hasNextPage: false,
    },
    cruises: {
      currentPage: 0,
      totalPages: 1,
      hasNextPage: false,
    },
    tickets: {
      currentPage: 0,
      totalPages: 1,
      hasNextPage: false,
    },
  });
  const [flightBookings, setFlightBookings] = useState([]);
  const [vacationBookings, setVacationBookings] = useState([]);
  const currentPage = pagination[activeMenu].currentPage;
  const totalPages = pagination[activeMenu].totalPages;
  const hasNextPage = pagination[activeMenu].hasNextPage;

  const updatePagination = (section, values) => {
    setPagination((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values,
      },
    }));
  };

  const PAGE_LIMIT = 10;

  const bookingsBySection = {
    hotels: upcomingBookings,
    cars: carBookings,
    flights: flightBookings,
    activities: activityBookings,
    vacations: vacationBookings,
    cruises: [],
    tickets: [],
  };

  const filteredBookings = (bookingsBySection[activeMenu] || []).filter(
    (item) => item.status === activeTab,
  );

  //hotel bookings

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      if (activeMenu !== "hotels") return;

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
            offset: pagination.hotels.currentPage * PAGE_LIMIT,
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

        updatePagination("hotels", {
          totalPages: calculatedTotalPages,
          hasNextPage: pagination.hotels.currentPage < calculatedTotalPages - 1,
        });
      } catch (error) {
        console.error("Error fetching bookings:", error);

        setUpcomingBookings([]);

        updatePagination("hotels", {
          totalPages: 1,
          hasNextPage: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingBookings();
  }, [activeMenu, activeTab, pagination.hotels.currentPage]);

  const handleParticularBookingClick = (booking) => {
    sessionStorage.setItem(
      "hotelBookingCancellable",
      JSON.stringify(booking.cancellable),
    );

    sessionStorage.setItem("hotelBookingStatus", booking.status);

    navigate(`/hotel-booking-details?id=${encodeURIComponent(booking.id)}`);
  };

  // car bookings

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
            offset: pagination.cars.currentPage * PAGE_LIMIT,
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

        updatePagination("cars", {
          totalPages: calculatedTotalPages || 1,
          hasNextPage: pagination.cars.currentPage < calculatedTotalPages - 1,
        });
      } catch (error) {
        console.error("CAR INFO ERROR:", error);
        updatePagination("cars", {
          totalPages: 1,
          hasNextPage: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCarInfo();
  }, [activeMenu, activeTab, pagination.cars.currentPage]);

  const handleCarBookingClick = (booking) => {
    if (!booking?.id) return;

    sessionStorage.setItem(
      "carBookingCancellable",
      JSON.stringify(booking.cancellable),
    );

    sessionStorage.setItem("carBookingStatus", booking.status);

    navigate(`/car-booking-details?orderid=${encodeURIComponent(booking.id)}`);
  };

  // flight bookings
  useEffect(() => {
    const fetchFlightInfo = async () => {
      if (activeMenu !== "flights") return;

      setLoading(true);

      try {
        const apiStatus =
          activeTab === "Upcoming"
            ? "UPCOMING"
            : activeTab === "Cancelled"
              ? "CANCELLED"
              : "COMPLETED";

        const res = await upcomingFlight({
          body: {
            memberid: localStorage.getItem("bookingId"),
            status: apiStatus,
            travelDate: {
              start: "2026-09-01",
              end: "2028-12-30",
            },
            limit: PAGE_LIMIT,
            offset: pagination.flights.currentPage * PAGE_LIMIT,
          },
        });

        console.log("upcomingFlight Response:", res);

        const orders = res?.orders || [];

        const mappedFlightBookings = orders.map((order) => {
          const bookingData = order?.booking_data || {};
          const flightTickets = bookingData?.flighticket || [];

          const outboundTicket = flightTickets[0] || {};
          const returnTicket = flightTickets[1] || null;

          const outboundFlights = outboundTicket?.flights || [];
          const returnFlights = returnTicket?.flights || [];

          const outboundFirst = outboundFlights[0] || {};
          const outboundLast =
            outboundFlights[outboundFlights.length - 1] || outboundFirst;

          const returnFirst = returnFlights[0] || {};
          const returnLast =
            returnFlights[returnFlights.length - 1] || returnFirst;

          const allFlights = flightTickets.flatMap(
            (ticket) => ticket?.flights || [],
          );

          const isRoundTrip =
            String(bookingData?.trip || "").toLowerCase() === "roundtrip";

          const status =
            activeTab === "Upcoming"
              ? "Upcoming"
              : activeTab === "Cancelled"
                ? "Cancelled"
                : "Completed";

          return {
            id: order?.orderid,

            type: "flights",

            status,

            flightName: order?.airline || outboundFirst?.airline || "Flight",

            airline: outboundFirst?.airline || order?.airline || "",

            image: order?.airline_logo || order?.image || dummy,

            /* ---------------- OUTBOUND ---------------- */

            from:
              outboundFirst?.departurelocation ||
              outboundFirst?.departure ||
              "",

            fromCode: outboundFirst?.departure || "",

            to: outboundLast?.arrivallocation || outboundLast?.arrival || "",

            toCode: outboundLast?.arrival || "",

            departureAirport: outboundFirst?.departairport || "",

            arrivalAirport: outboundLast?.arrivalairport || "",

            departureDate: outboundFirst?.departureTime || "",

            arrivalDate: outboundLast?.arrivalTime || "",

            departureTime: outboundFirst?.departureTime || "",

            arrivalTime: outboundLast?.arrivalTime || "",

            flightCode: outboundFirst?.flightCode || "",

            flightNumber: outboundFirst?.flightNumber || "",

            stops: outboundFirst?.stops ?? bookingData?.stops ?? 0,

            tripTime: outboundLast?.triptime ?? outboundFirst?.triptime ?? 0,

            cabin: outboundFirst?.cabin || "",

            checkInBaggage: outboundFirst?.checkInBaggage || "",

            cabinBaggage: outboundFirst?.cabinBaggage || "",

            outboundFlights,

            /* ---------------- RETURN ---------------- */

            isRoundTrip,

            returnFrom:
              returnFirst?.departurelocation || returnFirst?.departure || "",

            returnFromCode: returnFirst?.departure || "",

            returnTo: returnLast?.arrivallocation || returnLast?.arrival || "",

            returnToCode: returnLast?.arrival || "",

            returnDepartureAirport: returnFirst?.departairport || "",

            returnArrivalAirport: returnLast?.arrivalairport || "",

            returnDepartureDate: returnFirst?.departureTime || "",

            returnArrivalDate: returnLast?.arrivalTime || "",

            returnDepartureTime: returnFirst?.departureTime || "",

            returnArrivalTime: returnLast?.arrivalTime || "",

            returnFlightCode: returnFirst?.flightCode || "",

            returnFlightNumber: returnFirst?.flightNumber || "",

            returnStops: returnFirst?.stops ?? 0,

            returnTripTime: returnLast?.triptime ?? returnFirst?.triptime ?? 0,

            returnCabin: returnFirst?.cabin || "",

            returnCheckInBaggage: returnFirst?.checkInBaggage || "",

            returnCabinBaggage: returnFirst?.cabinBaggage || "",

            returnFlights,

            /* ---------------- BOOKING ---------------- */

            bookingId:
              order?.confirmation_number ||
              order?.confirmationNumber ||
              order?.orderid ||
              "",

            amount: `$${Number(
              order?.our_price || order?.total || order?.payable || 0,
            ).toFixed(2)}`,

            currency: order?.currencysymbol || order?.currency || "$",

            orderStatus: order?.orderstatus || "",

            travellerCount: order?.traveller_count || order?.adults || 0,

            adults: order?.adults || 0,

            children: order?.children || 0,

            infants: order?.infants || 0,

            taxes: order?.taxes || 0,

            totalExtras: order?.total_extraservice || 0,

            tripType: bookingData?.trip || "",

            flights: allFlights,

            flightTickets,
          };
        });

        console.log("Mapped Flight Bookings:", mappedFlightBookings);

        setFlightBookings(mappedFlightBookings);

        const totalCount = Number(res?.count || 0);
        const calculatedTotalPages = Math.ceil(totalCount / PAGE_LIMIT);

        updatePagination("flights", {
          totalPages: calculatedTotalPages || 1,
          hasNextPage:
            pagination.flights.currentPage < calculatedTotalPages - 1,
        });
      } catch (error) {
        console.error("FLIGHT INFO ERROR:", error);

        setFlightBookings([]);

        updatePagination("flights", {
          totalPages: 1,
          hasNextPage: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFlightInfo();
  }, [activeMenu, activeTab, pagination.flights.currentPage]);

  // vacation upcoming
  useEffect(() => {
    const fetchVacationInfo = async () => {
      if (activeMenu !== "vacations") return;

      setLoading(true);

      try {
        const apiStatus =
          activeTab === "Upcoming"
            ? "UPCOMING"
            : activeTab === "Cancelled"
              ? "CANCELLED"
              : "COMPLETED";

        const res = await vacationUpcoming({
          body: {
            memberid: localStorage.getItem("bookingId"),
            status: apiStatus,
            travelDate: {
              start: "2026-09-01",
              end: "2028-12-30",
            },
            limit: PAGE_LIMIT,
            offset: pagination.vacations.currentPage * PAGE_LIMIT,
          },
        });

        console.log("vacationUpcoming Response:", res);

        const orders = [...(res?.orders || [])].sort(
          (a, b) => new Date(b.createdat) - new Date(a.createdat),
        );

        const mappedVacationBookings = orders.map((order) => ({
          id: order.orderid,
          type: "vacations",
          status:
            activeTab === "Upcoming"
              ? "Upcoming"
              : activeTab === "Cancelled"
                ? "Cancelled"
                : "Completed",
          resortName: order.property_name,
          city: order.property_city || "",
          roomType: order.room_type || "",
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
          amount: `${order.currencysymbol || "$"}${Number(order.our_price || 0).toFixed(2)}`,
          image: order?.image,
          orderStatus: order.orderstatus,
          cancellable: order?.cancellable === true,
        }));

        setVacationBookings(mappedVacationBookings);

        const totalCount = Number(res?.count || 0);
        const calculatedTotalPages = Math.ceil(totalCount / PAGE_LIMIT);

        updatePagination("vacations", {
          totalPages: calculatedTotalPages || 1,
          hasNextPage:
            pagination.vacations.currentPage < calculatedTotalPages - 1,
        });
      } catch (error) {
        console.error("Error fetching vacation bookings:", error);

        setVacationBookings([]);

        updatePagination("vacations", {
          totalPages: 1,
          hasNextPage: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVacationInfo();
  }, [activeMenu, activeTab, pagination.vacations.currentPage]);

  const handleVacationBookingClick = (booking) => {
    if (!booking?.id) return;

    sessionStorage.setItem(
      "vacationBookingCancellable",
      JSON.stringify(booking.cancellable),
    );

    sessionStorage.setItem("vacationBookingStatus", booking.status);

    navigate(`/vacation-booking-details?id=${encodeURIComponent(booking.id)}`);
  };

  // activity area

  useEffect(() => {
    const fetchActivity = async () => {
      if (activeMenu !== "activities") return;

      setLoading(true);

      try {
        const apiStatus =
          activeTab === "Upcoming"
            ? "UPCOMING"
            : activeTab === "Cancelled"
              ? "CANCELLED"
              : "COMPLETED";

        const res = await activityUpcoming({
          body: {
            memberid: localStorage.getItem("bookingId"),
            status: apiStatus,
            travelDate: {
              start: "2026-09-01",
              end: "2028-12-30",
            },
            limit: PAGE_LIMIT,
            offset: pagination.activities.currentPage * PAGE_LIMIT,
            supplierid: 0,
          },
        });

        const orders = [...(res?.orders || [])].sort(
          (a, b) => new Date(b.createdat) - new Date(a.createdat),
        );

        const mappedActivityBookings = orders.map((order) => {
          const activityData = order?.booking_data || {};

          const selectedGrade =
            activityData?.availability?.availability?.bookableItems?.find(
              (item) => item.gradeCode === activityData.gradeCode,
            );

          const status =
            activeTab === "Upcoming"
              ? "Upcoming"
              : activeTab === "Cancelled"
                ? "Cancelled"
                : "Completed";

          return {
            id: order.orderid,
            type: "activities",
            status,
            activityName: order.property_name || "Activity",
            image: order.image || dummy,
            activityCode: activityData.activityCode || "",
            gradeName: selectedGrade?.title || "",
            travelDate:
              activityData.startDate || order.start_date?.split("T")[0] || "",
            startTime: activityData.startTime || order.start_time || "",
            travellers: order.traveller_count ?? order.adults ?? 0,
            bookingId: order.confirmation_number || order.orderid,
            orderStatus: order.orderstatus || "",
            amount: `${order.currencysymbol || "$"}${Number(
              order.our_price ?? order.total ?? 0,
            ).toFixed(2)}`,
            ticketUrl: order.ticket_url || "",
          };
        });

        setActivityBookings(mappedActivityBookings);

        const totalCount = Number(res?.count || 0);
        const calculatedTotalPages = Math.ceil(totalCount / PAGE_LIMIT);

        updatePagination("activities", {
          totalPages: calculatedTotalPages || 1,
          hasNextPage:
            pagination.activities.currentPage < calculatedTotalPages - 1,
        });
      } catch (error) {
        console.error("ACTIVITY BOOKINGS ERROR:", error);

        setActivityBookings([]);

        updatePagination("activities", {
          totalPages: 1,
          hasNextPage: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activeMenu, activeTab, pagination.activities.currentPage]);

  const handleActivityClick = (booking) => {
    if (!booking?.id) return;

    navigate(
      `/activity-booking-details?orderid=${encodeURIComponent(booking.id)}`,
    );
  };
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

            <h2 className="simple-hotel-loader__title">Please wait until</h2>

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
                  onClick={() => {
                    setActiveMenu(item.id);

                    setPagination((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...prev[item.id],
                        currentPage: 0,
                      },
                    }));
                  }}
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

                      setPagination((prev) => ({
                        ...prev,
                        [activeMenu]: {
                          ...prev[activeMenu],
                          currentPage: 0,
                        },
                      }));
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
                  booking.type === "flights" ? (
                    <div
                      className="voyage-flight-booking-card"
                      key={booking.id}
                      onClick={() => handleFlightBookingClick(booking)}
                    >
                      {/* HEADER */}
                      <div className="voyage-flight-card-header">
                        <div className="voyage-flight-airline-info">
                          <div className="voyage-flight-airline-icon">
                            <img
                              src={`https://d15u1xbazig0vl.cloudfront.net/images/flight/${booking.flightCode}.png`}
                              alt={booking.flightCode || "Flight"}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling.style.display =
                                  "block";
                              }}
                            />

                            <FaPlane style={{ display: "none" }} />
                          </div>
                          <div>
                            <h3 className="voyage-flight-airline-name">
                              {booking.airline || "Flight"}
                            </h3>

                            <p className="voyage-flight-number">
                              {booking.flightCode || ""}
                              {booking.flightNumber
                                ? ` ${booking.flightNumber}`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div className="voyage-flight-header-right">
                          <span
                            className={`voyage-flight-status voyage-flight-status-${booking.status.toLowerCase()}`}
                          >
                            {booking.status}
                          </span>

                          {booking.isRoundTrip && (
                            <span className="voyage-flight-trip-badge">
                              Round Trip
                            </span>
                          )}
                        </div>
                      </div>

                      {/* OUTBOUND */}
                      <div className="voyage-flight-section">
                        <div className="voyage-flight-section-heading">
                          <div>
                            <span className="voyage-flight-section-icon">
                              <FaPlane />
                            </span>

                            <div>
                              <strong>Departure Flight</strong>
                              <small>Outbound</small>
                            </div>
                          </div>

                          <span className="voyage-flight-section-code">
                            {booking.flightCode} {booking.flightNumber}
                          </span>
                        </div>

                        <div className="voyage-flight-route">
                          <div className="voyage-flight-place">
                            <span className="voyage-flight-time">
                              {booking.departureTime
                                ? new Date(
                                    booking.departureTime,
                                  ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "--"}
                            </span>

                            <strong>{booking.fromCode || "-"}</strong>

                            <span>{booking.from || "-"}</span>

                            <small>{booking.departureAirport || ""}</small>

                            <em>
                              {booking.departureTime
                                ? new Date(
                                    booking.departureTime,
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : ""}
                            </em>
                          </div>

                          <div className="voyage-flight-route-middle">
                            <span className="voyage-flight-duration">
                              {booking.tripTime
                                ? `${Math.floor(
                                    booking.tripTime / 60,
                                  )}h ${booking.tripTime % 60}m`
                                : ""}
                            </span>

                            <div className="voyage-flight-route-line">
                              <span></span>
                              <FaPlane />
                              <span></span>
                            </div>

                            <span className="voyage-flight-stops">
                              {booking.stops === 0
                                ? "Non-stop"
                                : `${booking.stops} Stop${
                                    booking.stops > 1 ? "s" : ""
                                  }`}
                            </span>
                          </div>

                          <div className="voyage-flight-place voyage-flight-place-right">
                            <span className="voyage-flight-time">
                              {booking.arrivalTime
                                ? new Date(
                                    booking.arrivalTime,
                                  ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "--"}
                            </span>

                            <strong>{booking.toCode || "-"}</strong>

                            <span>{booking.to || "-"}</span>

                            <small>{booking.arrivalAirport || ""}</small>

                            <em>
                              {booking.arrivalTime
                                ? new Date(
                                    booking.arrivalTime,
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : ""}
                            </em>
                          </div>
                        </div>

                        <div className="voyage-flight-extra-details">
                          <div>
                            <span>Cabin</span>
                            <strong>{booking.cabin || "-"}</strong>
                          </div>

                          <div>
                            <span>Check-in baggage</span>
                            <strong>{booking.checkInBaggage || "-"}</strong>
                          </div>

                          <div>
                            <span>Cabin baggage</span>
                            <strong>{booking.cabinBaggage || "-"}</strong>
                          </div>
                        </div>
                      </div>

                      {/* RETURN */}
                      {booking.isRoundTrip &&
                        booking.returnFlights.length > 0 && (
                          <div className="voyage-flight-section voyage-flight-return-section">
                            <div className="voyage-flight-section-heading">
                              <div>
                                <span className="voyage-flight-section-icon voyage-flight-return-icon">
                                  <FaPlane />
                                </span>

                                <div>
                                  <strong>Return Flight</strong>
                                  <small>Inbound</small>
                                </div>
                              </div>

                              <span className="voyage-flight-section-code">
                                {booking.returnFlightCode}{" "}
                                {booking.returnFlightNumber}
                              </span>
                            </div>

                            <div className="voyage-flight-route">
                              <div className="voyage-flight-place">
                                <span className="voyage-flight-time">
                                  {booking.returnDepartureTime
                                    ? new Date(
                                        booking.returnDepartureTime,
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "--"}
                                </span>

                                <strong>{booking.returnFromCode || "-"}</strong>

                                <span>{booking.returnFrom || "-"}</span>

                                <small>
                                  {booking.returnDepartureAirport || ""}
                                </small>

                                <em>
                                  {booking.returnDepartureTime
                                    ? new Date(
                                        booking.returnDepartureTime,
                                      ).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : ""}
                                </em>
                              </div>

                              <div className="voyage-flight-route-middle">
                                <span className="voyage-flight-duration">
                                  {booking.returnTripTime
                                    ? `${Math.floor(
                                        booking.returnTripTime / 60,
                                      )}h ${booking.returnTripTime % 60}m`
                                    : ""}
                                </span>

                                <div className="voyage-flight-route-line">
                                  <span></span>
                                  <FaPlane />
                                  <span></span>
                                </div>

                                <span className="voyage-flight-stops">
                                  {booking.returnStops === 0
                                    ? "Non-stop"
                                    : `${booking.returnStops} Stop${
                                        booking.returnStops > 1 ? "s" : ""
                                      }`}
                                </span>
                              </div>

                              <div className="voyage-flight-place voyage-flight-place-right">
                                <span className="voyage-flight-time">
                                  {booking.returnArrivalTime
                                    ? new Date(
                                        booking.returnArrivalTime,
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "--"}
                                </span>

                                <strong>{booking.returnToCode || "-"}</strong>

                                <span>{booking.returnTo || "-"}</span>

                                <small>
                                  {booking.returnArrivalAirport || ""}
                                </small>

                                <em>
                                  {booking.returnArrivalTime
                                    ? new Date(
                                        booking.returnArrivalTime,
                                      ).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : ""}
                                </em>
                              </div>
                            </div>

                            <div className="voyage-flight-extra-details">
                              <div>
                                <span>Cabin</span>
                                <strong>{booking.returnCabin || "-"}</strong>
                              </div>

                              <div>
                                <span>Check-in baggage</span>
                                <strong>
                                  {booking.returnCheckInBaggage || "-"}
                                </strong>
                              </div>

                              <div>
                                <span>Cabin baggage</span>
                                <strong>
                                  {booking.returnCabinBaggage || "-"}
                                </strong>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* FOOTER */}
                      <div className="voyage-flight-card-footer">
                        <div className="voyage-flight-confirmation">
                          <span>Confirmation Number</span>
                          <strong>{booking.bookingId || "-"}</strong>
                        </div>

                        <div className="voyage-flight-passengers">
                          <span>Passengers</span>
                          <strong>{booking.travellerCount || 0}</strong>
                        </div>

                        <div className="voyage-flight-total">
                          <span>Total Fare</span>
                          <strong>{booking.amount}</strong>
                        </div>
                      </div>
                    </div>
                  ) : booking.type === "cars" ? (
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
                  ) : booking.type === "vacations" ? (
                    <div
                      className="voyage-booking-card"
                      key={booking.id}
                      onClick={() => handleVacationBookingClick(booking)}
                    >
                      <div className="voyage-booking-image">
                        <img
                          src={booking.image || dummy}
                          alt={booking.resortName}
                        />

                        <span className="voyage-booking-status">
                          {booking.status}
                        </span>
                      </div>

                      <div className="voyage-booking-body">
                        <h3>{booking.resortName}</h3>

                        <p>{booking.city}</p>

                        {booking.roomType && (
                          <p className="voyage-booking-roomtype">
                            {booking.roomType}
                          </p>
                        )}

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
                  ) : booking.type === "activities" ? (
                    <div
                      className="voyage-booking-card"
                      key={booking.id}
                      onClick={() => handleActivityClick(booking)}
                    >
                      <div className="voyage-booking-image">
                        <img
                          src={booking.image || dummy}
                          alt={booking.activityName}
                        />

                        <span className="voyage-booking-status">
                          {booking.status}
                        </span>
                      </div>

                      <div className="voyage-booking-body">
                        <h3>{booking.activityName}</h3>

                        {booking.gradeName && <p>{booking.gradeName}</p>}

                        <div className="voyage-booking-row">
                          <span>Travel Date and Time</span>
                          <strong>
                            {booking.travelDate
                              ? new Date(
                                  `${booking.travelDate}T00:00:00`,
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}{" "}
                            at {booking.startTime || "-"}
                          </strong>
                        </div>

                        <div className="voyage-booking-row">
                          <span>Travellers</span>
                          <strong>{booking.travellers}</strong>
                        </div>

                        <div className="voyage-booking-row">
                          <span>Booking Status</span>
                          <strong>{booking.orderStatus || "-"}</strong>
                        </div>

                        <div className="voyage-booking-footer">
                          <h2>{booking.amount}</h2>

                          {booking.ticketUrl && (
                            <a
                              href={booking.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Ticket
                            </a>
                          )}
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
            {filteredBookings.length > 0 &&
              (totalPages > 1 || currentPage > 0) && (
                <div className="voyage-pagination">
                  <button
                    type="button"
                    className="voyage-pagination-btn voyage-pagination-prev"
                    disabled={currentPage === 0 || loading}
                    onClick={() => {
                      if (currentPage > 0) {
                        updatePagination(activeMenu, {
                          currentPage: currentPage - 1,
                        });
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
                          onClick={() => {
                            updatePagination(activeMenu, {
                              currentPage: pageNumber,
                            });
                          }}
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
                        updatePagination(activeMenu, {
                          currentPage: currentPage + 1,
                        });
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
