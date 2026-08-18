import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import { useNavigate } from "react-router-dom";
import "./CarRental.css";
import CarLoader from "../../../reuseable-components/CarLoader/CarLoader";
import {
  carAddOrder,
  carPayment,
  carRevalidate,
} from "../../../store/Services/AllApi";

const countries = [
  ["AF", "Afghanistan"],
  ["AL", "Albania"],
  ["DZ", "Algeria"],
  ["AD", "Andorra"],
  ["AO", "Angola"],
  ["AG", "Antigua and Barbuda"],
  ["AR", "Argentina"],
  ["AM", "Armenia"],
  ["AU", "Australia"],
  ["AT", "Austria"],
  ["AZ", "Azerbaijan"],
  ["BS", "Bahamas"],
  ["BH", "Bahrain"],
  ["BD", "Bangladesh"],
  ["BB", "Barbados"],
  ["BY", "Belarus"],
  ["BE", "Belgium"],
  ["BZ", "Belize"],
  ["BJ", "Benin"],
  ["BT", "Bhutan"],
  ["BO", "Bolivia"],
  ["BA", "Bosnia and Herzegovina"],
  ["BW", "Botswana"],
  ["BR", "Brazil"],
  ["BN", "Brunei"],
  ["BG", "Bulgaria"],
  ["BF", "Burkina Faso"],
  ["BI", "Burundi"],
  ["CV", "Cabo Verde"],
  ["KH", "Cambodia"],
  ["CM", "Cameroon"],
  ["CA", "Canada"],
  ["CF", "Central African Republic"],
  ["TD", "Chad"],
  ["CL", "Chile"],
  ["CN", "China"],
  ["CO", "Colombia"],
  ["KM", "Comoros"],
  ["CG", "Congo"],
  ["CD", "Congo, Democratic Republic of the"],
  ["CR", "Costa Rica"],
  ["CI", "Côte d'Ivoire"],
  ["HR", "Croatia"],
  ["CU", "Cuba"],
  ["CY", "Cyprus"],
  ["CZ", "Czech Republic"],
  ["DK", "Denmark"],
  ["DJ", "Djibouti"],
  ["DM", "Dominica"],
  ["DO", "Dominican Republic"],
  ["EC", "Ecuador"],
  ["EG", "Egypt"],
  ["SV", "El Salvador"],
  ["GQ", "Equatorial Guinea"],
  ["ER", "Eritrea"],
  ["EE", "Estonia"],
  ["SZ", "Eswatini"],
  ["ET", "Ethiopia"],
  ["FJ", "Fiji"],
  ["FI", "Finland"],
  ["FR", "France"],
  ["GA", "Gabon"],
  ["GM", "Gambia"],
  ["GE", "Georgia"],
  ["DE", "Germany"],
  ["GH", "Ghana"],
  ["GR", "Greece"],
  ["GD", "Grenada"],
  ["GT", "Guatemala"],
  ["GN", "Guinea"],
  ["GW", "Guinea-Bissau"],
  ["GY", "Guyana"],
  ["HT", "Haiti"],
  ["HN", "Honduras"],
  ["HU", "Hungary"],
  ["IS", "Iceland"],
  ["IN", "India"],
  ["ID", "Indonesia"],
  ["IR", "Iran"],
  ["IQ", "Iraq"],
  ["IE", "Ireland"],
  ["IL", "Israel"],
  ["IT", "Italy"],
  ["JM", "Jamaica"],
  ["JP", "Japan"],
  ["JO", "Jordan"],
  ["KZ", "Kazakhstan"],
  ["KE", "Kenya"],
  ["KI", "Kiribati"],
  ["KP", "North Korea"],
  ["KR", "South Korea"],
  ["KW", "Kuwait"],
  ["KG", "Kyrgyzstan"],
  ["LA", "Laos"],
  ["LV", "Latvia"],
  ["LB", "Lebanon"],
  ["LS", "Lesotho"],
  ["LR", "Liberia"],
  ["LY", "Libya"],
  ["LI", "Liechtenstein"],
  ["LT", "Lithuania"],
  ["LU", "Luxembourg"],
  ["MG", "Madagascar"],
  ["MW", "Malawi"],
  ["MY", "Malaysia"],
  ["MV", "Maldives"],
  ["ML", "Mali"],
  ["MT", "Malta"],
  ["MH", "Marshall Islands"],
  ["MR", "Mauritania"],
  ["MU", "Mauritius"],
  ["MX", "Mexico"],
  ["FM", "Micronesia"],
  ["MD", "Moldova"],
  ["MC", "Monaco"],
  ["MN", "Mongolia"],
  ["ME", "Montenegro"],
  ["MA", "Morocco"],
  ["MZ", "Mozambique"],
  ["MM", "Myanmar"],
  ["NA", "Namibia"],
  ["NR", "Nauru"],
  ["NP", "Nepal"],
  ["NL", "Netherlands"],
  ["NZ", "New Zealand"],
  ["NI", "Nicaragua"],
  ["NE", "Niger"],
  ["NG", "Nigeria"],
  ["MK", "North Macedonia"],
  ["NO", "Norway"],
  ["OM", "Oman"],
  ["PK", "Pakistan"],
  ["PW", "Palau"],
  ["PA", "Panama"],
  ["PG", "Papua New Guinea"],
  ["PY", "Paraguay"],
  ["PE", "Peru"],
  ["PH", "Philippines"],
  ["PL", "Poland"],
  ["PT", "Portugal"],
  ["QA", "Qatar"],
  ["RO", "Romania"],
  ["RU", "Russia"],
  ["RW", "Rwanda"],
  ["KN", "Saint Kitts and Nevis"],
  ["LC", "Saint Lucia"],
  ["VC", "Saint Vincent and the Grenadines"],
  ["WS", "Samoa"],
  ["SM", "San Marino"],
  ["ST", "Sao Tome and Principe"],
  ["SA", "Saudi Arabia"],
  ["SN", "Senegal"],
  ["RS", "Serbia"],
  ["SC", "Seychelles"],
  ["SL", "Sierra Leone"],
  ["SG", "Singapore"],
  ["SK", "Slovakia"],
  ["SI", "Slovenia"],
  ["SB", "Solomon Islands"],
  ["SO", "Somalia"],
  ["ZA", "South Africa"],
  ["SS", "South Sudan"],
  ["ES", "Spain"],
  ["LK", "Sri Lanka"],
  ["SD", "Sudan"],
  ["SR", "Suriname"],
  ["SE", "Sweden"],
  ["CH", "Switzerland"],
  ["SY", "Syria"],
  ["TW", "Taiwan"],
  ["TJ", "Tajikistan"],
  ["TZ", "Tanzania"],
  ["TH", "Thailand"],
  ["TL", "Timor-Leste"],
  ["TG", "Togo"],
  ["TO", "Tonga"],
  ["TT", "Trinidad and Tobago"],
  ["TN", "Tunisia"],
  ["TR", "Turkey"],
  ["TM", "Turkmenistan"],
  ["TV", "Tuvalu"],
  ["UG", "Uganda"],
  ["UA", "Ukraine"],
  ["AE", "United Arab Emirates"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["UY", "Uruguay"],
  ["UZ", "Uzbekistan"],
  ["VU", "Vanuatu"],
  ["VA", "Vatican City"],
  ["VE", "Venezuela"],
  ["VN", "Vietnam"],
  ["YE", "Yemen"],
  ["ZM", "Zambia"],
  ["ZW", "Zimbabwe"],
];

const CarBook = () => {
  const [bookingData, setBookingData] = useState(null);
  const [bookingDataBase64, setBookingDataBase64] = useState("");
  const [loading, setLoading] = useState(false);
  const [validateResponse, setValidateResponse] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  useEffect(() => {
    const storedBookingData = sessionStorage.getItem("carBookingData");

    if (!storedBookingData) {
      navigate("/car-results");
      return;
    }

    try {
      const parsedBookingData = JSON.parse(storedBookingData);

      setBookingData(parsedBookingData);
      handleRevalidation(parsedBookingData.car.fareCode);
    } catch (error) {
      console.error("Car booking data error:", error);

      sessionStorage.removeItem("carBookingData");

      navigate("/car-results");
    }
  }, [navigate]);

  const car = bookingData?.car || {};
  const search = bookingData?.search || {};
  const currency = bookingData?.currency || "USD";

  const price = Number(car?.price || 0);
  const days = Number(car?.days || 1);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] = time.split(":");

    const parsedTime = new Date();

    parsedTime.setHours(Number(hours), Number(minutes), 0, 0);

    return parsedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFuelType = (fuelType) => {
    if (!fuelType) {
      return "-";
    }

    return fuelType
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleCompleteBooking = (data) => {
    const [expiryMonth, expiryYear] = (data.expiryDate || "").split("/");

    const passengerDetails = {
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
    };

    const billingDetails = {
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
    };

    const cardDetails = {
      cardNumber: data.cardNumber,
      cardName: data.cardName,
      expiryMonth,
      expiryYear,
      cvv: data.cvv,
    };
  };

  const handleRevalidation = async (farecode) => {
    setLoading(true);
    try {
      const res = await carRevalidate({
        body: {
          fareCode: farecode,
        },
      });
      const responseString = JSON.stringify(res);
      const base64Response = btoa(unescape(encodeURIComponent(responseString)));
      setBookingDataBase64(base64Response);
      setValidateResponse(res?.data?.revalidate?.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCarPayment = async (orderId, data, paymentRemaining) => {
    try {
      const [expiryMonth, expiryYear] = (data?.expiryDate || "").split("/");

      const encodeBase64 = (value) => {
        return btoa(String(value ?? ""));
      };

      const paymentPayload = {
        input: {
          orderid: orderId,
          success: `https://it.alphatravelclub.link/car/${orderId}/paymentSuccessful`,
          fail: `https://it.alphatravelclub.link/car/${orderId}/bookingFailed`,
          mode: "CARD",
          paymentRemaining: Number(paymentRemaining || 0),
          identity: {
            number: encodeBase64(
              String(data?.cardNumber || "").replace(/\s/g, ""),
            ),
            name: data?.cardName || "",
            code: encodeBase64(data?.cvv || ""),
            type: "MC",
            em: encodeBase64(expiryMonth || ""),
            ey: encodeBase64(expiryYear || ""),
            line1: data?.address || "",
            postalcode: data?.postalCode || "",
            email: data?.email || "",
            phone: data?.phone || "",
          },
          retryNumber: 0,
          isRetryPayment: false,
          coin_type: "LTCT",
        },
      };

      const paymentResponse = await carPayment({
        body: paymentPayload,
      });

      return paymentResponse;
    } catch (error) {
      console.log("PAYMENT ERROR", error);
      throw error;
    }
  };

  const handleCarData = async (data) => {
    try {
      const search = bookingData?.search || {};
      const car = bookingData?.car || {};
      const response = validateResponse || {};

      const payload = {
        input: {
          test: true,
          pickup: search?.pickupLocationCode,
          dropoff: search?.dropoffLocationCode,
          pickuplocation:
            search?.pickupLocation ||
            search?.pickupName ||
            car?.pickup?.name ||
            "",
          dropofflocation:
            search?.dropoffLocation ||
            search?.dropoffName ||
            car?.dropoff?.name ||
            "",
          logo: car?.partner?.logo,
          moduleid: 8472,
          supplierid: 4045,
          refundability: car?.refundability ?? response?.refundability ?? false,
          cancellable: car?.cancellable ?? response?.cancellable ?? false,
          start_date: search?.pickupDate,
          end_date: search?.dropoffDate,
          prepaid: car?.prepaid ?? response?.prepaid ?? false,
          vehiclecode: car?.vehiclecode || car?.vehicleCode || car?.code || "",
          name: car?.name || car?.vehicleName || "",
          our_price: Number(
            car?.our_price ??
              car?.ourPrice ??
              response?.our_price ??
              response?.ourPrice ??
              0,
          ),
          taxes: Number(car?.taxes ?? response?.taxes ?? 0),
          payable: Number(
            car?.payable ??
              response?.payable ??
              car?.our_price ??
              car?.ourPrice ??
              0,
          ),
          public_price: Number(
            car?.public_price ??
              car?.publicPrice ??
              response?.public_price ??
              0,
          ),
          saving: Number(car?.saving ?? response?.saving ?? 0),
          rate: Number(car?.rate ?? response?.rate ?? 0),
          taxadjust: car?.taxadjust ?? response?.taxadjust ?? false,
          billing_address1: data?.address || "",
          billing_address2: data?.address2 || "",
          billing_city: data?.city || "",
          billing_state: data?.state || "",
          billing_country: data?.country || "",
          billing_postalcode: data?.postalCode || "",
          billing_phone: data?.phone || "",
          billing_email: data?.email || "",
          billing_name:
            `${data?.firstName || ""} ${data?.lastName || ""}`.trim(),
          billing_title: data?.title || "",
          car_type: car?.car_type || car?.carType || car?.type || "",
          traveller: Number(
            car?.traveller ?? car?.passenger ?? response?.traveller ?? 1,
          ),
          cancellation_policy:
            car?.cancellation_policy ||
            car?.cancellationPolicy ||
            response?.cancellation_policy ||
            "",
          ac: car?.ac ?? car?.hasAC ?? false,
          bags: Number(car?.bags ?? 0),
          seats: Number(car?.seats ?? car?.passengers ?? 0),
          manual_transmission:
            car?.manual_transmission ?? car?.manualTransmission ?? false,
          mileage: car?.mileage ?? false,
          doors: Number(car?.doors ?? 0),
          partner: car?.partner?.code || "",
          guests: {
            title: data?.title || "",
            driver_title: data?.title || "",
            firstname: data?.firstName || "",
            lastname: data?.lastName || "",
            phone: data?.phone || "",
            email: data?.email || "",
            driver_firstname: data?.firstName || "",
            driver_lastname: data?.lastName || "",
          },
          image:
            car?.image ||
            car?.heroImage ||
            "https://d15u1xbazig0vl.cloudfront.net/images/car/no_car.jpg",
          orderdate: new Date().toISOString(),
          booking_data: bookingDataBase64,
        },
      };

      setLoading(true);

      const res = await carAddOrder({
        body: payload,
      });

      console.log("CAR ORDER RESPONSE", res);

      const orderId = res?.data?.addorder?.result?.itemid;

      if (!orderId) {
        throw new Error("Order ID was not received from carAddOrder API");
      }

      console.log("ORDER ID", orderId);

      const paymentRemaining = Number(
        response?.paymentRemaining ??
          response?.payable ??
          car?.payable ??
          car?.price ??
          price ??
          0,
      );

      console.log("PAYMENT REMAINING", paymentRemaining);

      const paymentResponse = await handleCarPayment(
        orderId,
        data,
        paymentRemaining,
      );

      console.log("FINAL PAYMENT RESPONSE", paymentResponse);
    } catch (error) {
      console.log("BOOKING ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  if (!bookingData) {
    return (
      <div className="car-booking-page">
        <HeaderInner />

        <main className="car-booking-loading-wrapper">
          <div className="car-booking-loading-card">
            <div className="car-booking-loading-spinner"></div>

            <p>Loading booking details...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <>
      {loading && <CarLoader />}
      <div className="car-booking-page">
        <HeaderInner />

        <main className="car-booking-main-container container">
          <div className="car-booking-page-heading">
            <div>
              <h1>Complete Your Car Booking</h1>

              <p>
                Review your booking details and enter your information to
                complete your reservation.
              </p>
            </div>

            <div className="car-booking-secure-badge">
              <span>🔒</span>
              Secure Booking
            </div>
          </div>

          <form
            className="car-booking-layout"
            onSubmit={handleSubmit(handleCarData)}
            noValidate
          >
            <div className="car-booking-left-column">
              <section className="car-booking-section-card">
                <div className="car-booking-section-header">
                  <div className="car-booking-section-number">1</div>

                  <div>
                    <h2>Booking Details</h2>

                    <p>Your selected rental car and journey details</p>
                  </div>
                </div>

                <div className="car-booking-vehicle-wrapper">
                  <div className="car-booking-vehicle-image-wrapper">
                    {car?.heroImage ? (
                      <img
                        src={car.heroImage}
                        alt={car?.name || "Rental Car"}
                        className="car-booking-vehicle-image"
                      />
                    ) : (
                      <div className="car-booking-no-image">🚗</div>
                    )}
                  </div>

                  <div className="car-booking-vehicle-content">
                    <div className="car-booking-vehicle-title-row">
                      <div>
                        <h3>{car?.name || "Rental Car"}</h3>

                        <p>
                          {car?.description ||
                            car?.typeName ||
                            car?.type ||
                            "Rental Vehicle"}
                        </p>
                      </div>

                      {car?.partner?.name && (
                        <div className="car-booking-agency-name">
                          <img src={car.partner.logo} alt="" />
                        </div>
                      )}
                    </div>

                    <div className="car-booking-vehicle-specs">
                      <span>👤 {car?.passengers || 0} Passengers</span>

                      <span>🧳 {car?.bags || 0} Bags</span>

                      <span>🚪 {car?.doors || 0} Doors</span>

                      <span>
                        ❄️{" "}
                        {car?.hasAC
                          ? "Air Conditioning"
                          : "No Air Conditioning"}
                      </span>

                      <span>⚙️ {car?.transmission || "Manual"}</span>

                      <span>⛽ {formatFuelType(car?.fuelType)}</span>
                    </div>
                  </div>
                </div>

                <div className="car-booking-route-grid">
                  <div className="car-booking-route-card">
                    <div className="car-booking-route-icon car-booking-pickup-icon">
                      ✓
                    </div>

                    <div>
                      <span>Pick-up</span>

                      <strong>
                        {search?.pickupLocation || car?.pickup?.location || "-"}
                      </strong>

                      <small>
                        {formatDate(search?.pickupDate)} ·{" "}
                        {formatTime(search?.pickupTime)}
                      </small>

                      {car?.pickup?.locationInformation && (
                        <em>{car.pickup.locationInformation}</em>
                      )}
                    </div>
                  </div>

                  <div className="car-booking-route-card">
                    <div className="car-booking-route-icon car-booking-dropoff-icon">
                      ✓
                    </div>

                    <div>
                      <span>Drop-off</span>

                      <strong>
                        {search?.dropoffLocation ||
                          car?.dropoff?.location ||
                          "-"}
                      </strong>

                      <small>
                        {formatDate(search?.dropoffDate)} ·{" "}
                        {formatTime(search?.dropoffTime)}
                      </small>

                      {car?.dropoff?.locationInformation && (
                        <em>{car.dropoff.locationInformation}</em>
                      )}
                    </div>
                  </div>
                </div>

                <div className="car-booking-benefits-wrapper">
                  <div className="car-booking-benefits-title">
                    Included in your rental
                  </div>

                  <div className="car-booking-benefits-list">
                    <span>✓ Pay Later</span>

                    {car?.mileage ? (
                      <span>✓ Unlimited Mileage</span>
                    ) : (
                      <span>✓ Limited Mileage</span>
                    )}

                    {car?.freeCancellation && <span>✓ Free Cancellation</span>}

                    {Array.isArray(car?.inclusions) &&
                      car.inclusions.map((inclusion, index) => (
                        <span key={`${inclusion}-${index}`}>✓ {inclusion}</span>
                      ))}
                  </div>
                </div>
              </section>

              <section className="car-booking-section-card">
                <div className="car-booking-section-header">
                  <div className="car-booking-section-number">2</div>

                  <div>
                    <h2>Passenger Details</h2>

                    <p>Enter the main driver's information</p>
                  </div>
                </div>

                <div className="car-booking-form-grid">
                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-title">Title</label>

                    <select
                      id="car-booking-title"
                      defaultValue="Mr"
                      {...register("title", {
                        required: "Please select a title",
                      })}
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                    </select>

                    {errors.title && (
                      <span className="car-booking-form-error">
                        {errors.title.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-first-name">First Name</label>

                    <input
                      id="car-booking-first-name"
                      type="text"
                      placeholder="Enter first name"
                      className={
                        errors.firstName ? "car-booking-input-error" : ""
                      }
                      {...register("firstName", {
                        required: "First name is required",
                        minLength: {
                          value: 2,
                          message: "First name must be at least 2 characters",
                        },
                        pattern: {
                          value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                          message: "Please enter a valid first name",
                        },
                      })}
                    />

                    {errors.firstName && (
                      <span className="car-booking-form-error">
                        {errors.firstName.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-last-name">Last Name</label>

                    <input
                      id="car-booking-last-name"
                      type="text"
                      placeholder="Enter last name"
                      className={
                        errors.lastName ? "car-booking-input-error" : ""
                      }
                      {...register("lastName", {
                        required: "Last name is required",
                        minLength: {
                          value: 2,
                          message: "Last name must be at least 2 characters",
                        },
                        pattern: {
                          value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                          message: "Please enter a valid last name",
                        },
                      })}
                    />

                    {errors.lastName && (
                      <span className="car-booking-form-error">
                        {errors.lastName.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-email">Email Address</label>

                    <input
                      id="car-booking-email"
                      type="email"
                      placeholder="Enter email address"
                      className={errors.email ? "car-booking-input-error" : ""}
                      {...register("email", {
                        required: "Email address is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                    />

                    {errors.email && (
                      <span className="car-booking-form-error">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-phone">Phone Number</label>

                    <input
                      id="car-booking-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      inputMode="numeric"
                      className={errors.phone ? "car-booking-input-error" : ""}
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+\-\s()]{7,20}$/,
                          message: "Please enter a valid phone number",
                        },
                      })}
                    />

                    {errors.phone && (
                      <span className="car-booking-form-error">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="car-booking-section-card">
                <div className="car-booking-section-header">
                  <div className="car-booking-section-number">3</div>

                  <div>
                    <h2>Billing Details</h2>

                    <p>Enter your billing address</p>
                  </div>
                </div>

                <div className="car-booking-form-grid">
                  <div className="car-booking-form-field car-booking-form-field-wide">
                    <label htmlFor="car-booking-address">Address</label>

                    <input
                      id="car-booking-address"
                      type="text"
                      placeholder="Enter billing address"
                      className={
                        errors.address ? "car-booking-input-error" : ""
                      }
                      {...register("address", {
                        required: "Billing address is required",
                        minLength: {
                          value: 5,
                          message: "Please enter a valid billing address",
                        },
                      })}
                    />

                    {errors.address && (
                      <span className="car-booking-form-error">
                        {errors.address.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-city">City</label>

                    <input
                      id="car-booking-city"
                      type="text"
                      placeholder="Enter city"
                      className={errors.city ? "car-booking-input-error" : ""}
                      {...register("city", {
                        required: "City is required",
                        minLength: {
                          value: 2,
                          message: "Please enter a valid city",
                        },
                        pattern: {
                          value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                          message: "Please enter a valid city",
                        },
                      })}
                    />

                    {errors.city && (
                      <span className="car-booking-form-error">
                        {errors.city.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-state">State</label>

                    <input
                      id="car-booking-state"
                      type="text"
                      placeholder="Enter state"
                      className={errors.state ? "car-booking-input-error" : ""}
                      {...register("state", {
                        required: "State is required",
                        minLength: {
                          value: 2,
                          message: "Please enter a valid state",
                        },
                      })}
                    />

                    {errors.state && (
                      <span className="car-booking-form-error">
                        {errors.state.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-country">Country</label>

                    <select
                      id="car-booking-country"
                      defaultValue=""
                      className={
                        errors.country ? "car-booking-input-error" : ""
                      }
                      {...register("country", {
                        required: "Please select your country",
                      })}
                    >
                      <option value="" disabled>
                        Select country
                      </option>

                      {countries.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>

                    {errors.country && (
                      <span className="car-booking-form-error">
                        {errors.country.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-postal-code">Postal Code</label>

                    <input
                      id="car-booking-postal-code"
                      type="text"
                      placeholder="Enter postal code"
                      className={
                        errors.postalCode ? "car-booking-input-error" : ""
                      }
                      {...register("postalCode", {
                        required: "Postal code is required",
                        pattern: {
                          value: /^[A-Za-z0-9\s-]{3,10}$/,
                          message: "Please enter a valid postal code",
                        },
                      })}
                    />

                    {errors.postalCode && (
                      <span className="car-booking-form-error">
                        {errors.postalCode.message}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="car-booking-section-card">
                <div className="car-booking-section-header">
                  <div className="car-booking-section-number">4</div>

                  <div>
                    <h2>Card Details</h2>

                    <p>Enter your payment card information</p>
                  </div>
                </div>

                <div className="car-booking-card-security">
                  <span>🔒</span>
                  Your payment information is securely encrypted.
                </div>

                <div className="car-booking-form-grid">
                  <div className="car-booking-form-field car-booking-form-field-wide">
                    <label htmlFor="car-booking-card-number">Card Number</label>

                    <input
                      id="car-booking-card-number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      maxLength="19"
                      className={
                        errors.cardNumber ? "car-booking-input-error" : ""
                      }
                      {...register("cardNumber", {
                        required: "Card number is required",
                        validate: (value) => {
                          const cardNumber = value.replace(/\s/g, "");

                          if (!/^\d+$/.test(cardNumber)) {
                            return "Card number must contain only numbers";
                          }

                          if (
                            cardNumber.length < 13 ||
                            cardNumber.length > 19
                          ) {
                            return "Please enter a valid card number";
                          }

                          return true;
                        },
                        onChange: (event) => {
                          let value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);

                          value = value.replace(/(.{4})/g, "$1 ").trim();

                          setValue("cardNumber", value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        },
                      })}
                    />

                    {errors.cardNumber && (
                      <span className="car-booking-form-error">
                        {errors.cardNumber.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field car-booking-form-field-wide">
                    <label htmlFor="car-booking-card-name">Name on Card</label>

                    <input
                      id="car-booking-card-name"
                      type="text"
                      placeholder="Enter name as shown on card"
                      className={
                        errors.cardName ? "car-booking-input-error" : ""
                      }
                      {...register("cardName", {
                        required: "Name on card is required",
                        minLength: {
                          value: 2,
                          message: "Please enter the name on your card",
                        },
                        pattern: {
                          value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                          message: "Please enter a valid cardholder name",
                        },
                      })}
                    />

                    {errors.cardName && (
                      <span className="car-booking-form-error">
                        {errors.cardName.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-expiry-date">Expiry Date</label>

                    <input
                      id="car-booking-expiry-date"
                      type="text"
                      placeholder="MM/YY"
                      inputMode="numeric"
                      maxLength="5"
                      className={
                        errors.expiryDate ? "car-booking-input-error" : ""
                      }
                      {...register("expiryDate", {
                        required: "Expiry date is required",
                        validate: (value) => {
                          if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
                            return "Enter expiry date in MM/YY format";
                          }

                          const [month, year] = value.split("/");

                          const currentDate = new Date();

                          const currentYear = currentDate.getFullYear() % 100;

                          const currentMonth = currentDate.getMonth() + 1;

                          const expiryYear = Number(year);

                          const expiryMonth = Number(month);

                          if (
                            expiryYear < currentYear ||
                            (expiryYear === currentYear &&
                              expiryMonth < currentMonth)
                          ) {
                            return "Card has expired";
                          }

                          return true;
                        },
                        onChange: (event) => {
                          let value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);

                          if (value.length > 2) {
                            value = `${value.slice(0, 2)}/${value.slice(2)}`;
                          }

                          setValue("expiryDate", value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        },
                      })}
                    />

                    {errors.expiryDate && (
                      <span className="car-booking-form-error">
                        {errors.expiryDate.message}
                      </span>
                    )}
                  </div>

                  <div className="car-booking-form-field">
                    <label htmlFor="car-booking-cvv">CVV</label>

                    <input
                      id="car-booking-cvv"
                      type="password"
                      placeholder="CVV"
                      inputMode="numeric"
                      maxLength="4"
                      className={errors.cvv ? "car-booking-input-error" : ""}
                      {...register("cvv", {
                        required: "CVV is required",
                        pattern: {
                          value: /^\d{3,4}$/,
                          message: "CVV must be 3 or 4 digits",
                        },
                      })}
                    />

                    {errors.cvv && (
                      <span className="car-booking-form-error">
                        {errors.cvv.message}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <aside className="car-booking-right-column">
              <div className="car-booking-price-card">
                <div className="car-booking-price-header">
                  <h2>Booking Summary</h2>
                </div>

                <div className="car-booking-summary-vehicle">
                  {car?.heroImage ? (
                    <img src={car.heroImage} alt={car?.name || "Rental Car"} />
                  ) : (
                    <div className="car-booking-summary-no-image">🚗</div>
                  )}

                  <div>
                    <strong>{car?.name || "Rental Car"}</strong>

                    <span>{car?.partner?.name || "Rental Agency"}</span>
                  </div>
                </div>

                <div className="car-booking-summary-divider"></div>

                <div className="car-booking-summary-row">
                  <span>Pick-up</span>

                  <strong>{formatDate(search?.pickupDate)}</strong>
                </div>

                <div className="car-booking-summary-row">
                  <span>Drop-off</span>

                  <strong>{formatDate(search?.dropoffDate)}</strong>
                </div>

                <div className="car-booking-summary-row">
                  <span>Rental Duration</span>

                  <strong>
                    {days} Day
                    {days !== 1 ? "s" : ""}
                  </strong>
                </div>

                <div className="car-booking-summary-row">
                  <span>Pick-up Time</span>

                  <strong>{formatTime(search?.pickupTime)}</strong>
                </div>

                <div className="car-booking-summary-row">
                  <span>Drop-off Time</span>

                  <strong>{formatTime(search?.dropoffTime)}</strong>
                </div>

                <div className="car-booking-summary-divider"></div>

                <div className="car-booking-price-breakdown">
                  <div>
                    <span>Car Rental</span>

                    <strong>
                      {currency} {price.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Taxes & Fees</span>

                    <strong>Included</strong>
                  </div>
                </div>

                <div className="car-booking-summary-divider"></div>

                <div className="car-booking-total-row">
                  <span>Total Price</span>

                  <strong>
                    {currency} {price.toFixed(2)}
                  </strong>
                </div>

                <button type="submit" className="car-booking-submit-button">
                  Complete Booking
                </button>

                <div className="car-booking-payment-note">
                  🔒 Secure payment · Your details are protected
                </div>
              </div>
            </aside>
          </form>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CarBook;
