import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import HotelLoader from "../../../reuseable-components/HotelLoader/HotelLoader";
import { Country, State } from "country-state-city";
import { countryCodes } from "../../../../countryCodes";
import {
  FaCalendarAlt,
  FaUserFriends,
  FaHotel,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  getHotelDetails,
  getHotelDetailsAndRates,
  hotelPayment,
  payNow,
  revalidate,
} from "../../../store/Services/AllApi";
import { useForm } from "react-hook-form";
import { useAtomValue } from "jotai";
import {
  AdultCountToStore,
  ChildCountToStore,
  TotalRooms,
} from "../../../atoms/userAtom";
const Hotel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hotelId = searchParams.get("hotelId") || "";
  const token =
    searchParams.get("token") || localStorage.getItem("hotelToken") || "";
  const correlationId = searchParams.get("correlationId") || "";
  const recommendationId = searchParams.get("recommendationIdFinal");
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const roomId = searchParams.get("roomId") || "";
  const roomName = searchParams.get("roomName") || "";
  const roomDescription = searchParams.get("roomDescription") || "";

  const boardBasis = searchParams.get("boardBasis") || "";

  const rateid = searchParams.get("rateid") || "";

  const ourprice = Number(searchParams.get("ourprice")) || 0;

  const publishedRate = Number(searchParams.get("publishedRate")) || 0;

  const taxes = Number(searchParams.get("taxes")) || 0;

  const fees = Number(searchParams.get("fees")) || 0;

  const ratetype = searchParams.get("ratetype") || "";

  const refundability = searchParams.get("refundability") || "";

  const refundable = searchParams.get("refundable") === "true";

  const payAtHotel = searchParams.get("payAtHotel") === "true";

  const heroImageMain = searchParams.get("heroUrl");

  // ---------------------------------------------------------
  // COMPLETE SELECTED ROOMS
  // ---------------------------------------------------------

  let rooms = [];

  try {
    const roomsParam = searchParams.get("rooms");

    if (roomsParam) {
      const parsedRooms = JSON.parse(roomsParam);

      if (Array.isArray(parsedRooms)) {
        rooms = parsedRooms;
      } else if (parsedRooms && typeof parsedRooms === "object") {
        rooms = [parsedRooms];
      }
    }
  } catch (error) {
    console.error("Invalid rooms data:", error);
    rooms = [];
  }

  // ---------------------------------------------------------
  // SELECTED ROOM
  // ---------------------------------------------------------

  const selectedRoom = rooms?.[0] || {};

  // ---------------------------------------------------------
  // PERSON DETAILS
  // ---------------------------------------------------------

  const adults = Number(searchParams.get("adults")) || 0;
  const children = Number(searchParams.get("children")) || 0;

  let childAges = [];

  try {
    childAges = JSON.parse(searchParams.get("childAges") || "[]");
  } catch (error) {
    childAges = [];
  }

  // ---------------------------------------------------------
  // SELECTED ROOM PRICE DETAILS
  // ---------------------------------------------------------

  const selectedPublishedRate =
    Number(selectedRoom?.publishedRate ?? publishedRate) || 0;

  const selectedOurPrice = Number(selectedRoom?.ourprice ?? ourprice) || 0;

  const selectedTaxes = Number(selectedRoom?.taxes ?? taxes) || 0;

  const selectedFees = Number(selectedRoom?.fees ?? fees) || 0;

  // Price excluding tax
  const selectedPriceBeforeTax = Math.max(0, selectedOurPrice - selectedTaxes);

  const savings = Math.max(0, selectedPublishedRate - selectedOurPrice);
  const [hotelLoader, setHotelLoader] = useState(false);
  const [bookingData, setBookingData] = useState({});
  const [hotelImages, setHotelImages] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [leadGuest, setLeadGuest] = useState({
    title: "Mr",
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    countryCode: "+91",
    phone: "",
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "Mr",
      firstName: "",
      lastName: "",
      age: "",
      email: "",
      countryCode: "+91",
      phone: "",
    },
  });

  const selectedCountry = watch("country");

  const encodeBase64 = (value) => {
    return btoa(String(value || ""));
  };

  const getCardType = (cardNumber) => {
    const number = String(cardNumber || "").replace(/\s/g, "");

    if (/^4/.test(number)) return "VI";
    if (/^(5[1-5]|2[2-7])/.test(number)) return "MC";
    if (/^3[47]/.test(number)) return "AX";
    if (/^6(?:011|5)/.test(number)) return "DI";

    return "";
  };

  const onSubmit = async (data) => {
    try {
      setHotelLoader(true);

      const cardNumber = String(data.cardNumber || "").replace(/\s/g, "");

      const expiryParts = String(data.expiryDate || "").split("/");

      const expiryMonth = expiryParts[0] || "";
      const expiryYear = expiryParts[1] || "";

      const paymentPayload = {
        hotelId,
        recommendationId,
        token,
        start_date: checkIn,
        end_date: checkOut,
        correlationId,

        identity: {
          number: encodeBase64(cardNumber),
          name: data.cardHolder || "",
          code: encodeBase64(data.cvv),
          type: getCardType(cardNumber),
          em: encodeBase64(expiryMonth),
          ey: encodeBase64(expiryYear),
          line1: data.address1 || "",
          postalcode: data.zipCode || "",
          email: data.email || "",
          phone: `${leadGuest.countryCode || "+91"}${data.phone || ""}`,
        },
      };

      console.log(
        "FINAL PAYMENT PAYLOAD:",
        JSON.stringify(paymentPayload, null, 2),
      );

      const paymentRes = await payNow({
        body: paymentPayload,
      });

      console.log("PAYMENT RESPONSE:", paymentRes);

      if (paymentRes?.success) {
        setHotelLoader(false);
        setShowSuccessPopup(true);

        let time = 5;
        setCountdown(time);

        const timer = setInterval(() => {
          time--;

          if (time > 0) {
            setCountdown(time);
          } else {
            clearInterval(timer);
            setShowSuccessPopup(false);
            window.location.href = paymentRes.redirectUrl;
          }
        }, 1000);
      } else {
        setHotelLoader(false);
        setShowFailurePopup(true);
      }
    } catch (error) {
      console.error("BOOKING/PAYMENT ERROR:", error);

      setHotelLoader(false);
      setShowFailurePopup(true);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    setValue("expiryDate", value);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);
  const roomCountToStore = useAtomValue(TotalRooms);

  const totalNumberofRooms =
    localStorage.getItem("roomCountToStore") || roomCountToStore;
  const adultFinalCount = useAtomValue(AdultCountToStore);
  const childFinalCount = useAtomValue(ChildCountToStore);
  const totalAdults =
    localStorage.getItem("adultCountToStore") || adultFinalCount;
  const totalChildren =
    localStorage.getItem("childCountToStore") || childFinalCount;

  return (
    <>
      {hotelLoader && <HotelLoader />}
      <HeaderInner />
      {showSuccessPopup && (
        <div className="payment-success-overlay">
          <div className="payment-success-popup">
            <div className="payment-success-check">✓</div>
            <p className="payment-success-message">Hooray! Sit back, relax,</p>
            <p className="payment-success-redirect">
              Please wait while we are redirecting you to payment url
            </p>
            <div className="payment-countdown">{countdown}</div>
            <div className="payment-loader">
              <div className="payment-loader-fill"></div>
            </div>
          </div>
        </div>
      )}
      {showFailurePopup && (
        <div className="payment-failure-overlay">
          <div className="payment-failure-popup">
            <div className="payment-failure-icon">✕</div>
            <h2>Transaction Failed</h2>
            <button onClick={() => setShowFailurePopup(false)}>
              Try Again
            </button>
          </div>
        </div>
      )}
      <section className="hotel-booking-page">
        <div className="container">
          <div className="hotel-booking-wrapper">
            <div className="hotel-booking-left">
              <h2 className="booking-page-title">Enter Traveller Details</h2>
              <div className="traveller-form-wrapper">
                <div className="traveller-card">
                  <div className="traveller-card-header">
                    <h3>Lead Guest</h3>
                  </div>
                  <form>
                    <div className="traveller-form-grid">
                      <div className="form-group small-field">
                        <label>Title</label>

                        <select
                          className="booking-input"
                          value={leadGuest.title}
                          onChange={(e) =>
                            setLeadGuest({
                              ...leadGuest,
                              title: e.target.value,
                            })
                          }
                        >
                          <option>Mr</option>
                          <option>Mrs</option>
                          <option>Ms</option>
                          <option>Miss</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          className="booking-input"
                          placeholder="First Name"
                          {...register("firstName", {
                            required: "First name is required",
                          })}
                        />

                        {errors.firstName && (
                          <p className="booking-error">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>

                        <input
                          type="text"
                          className="booking-input"
                          placeholder="Last Name"
                          {...register("lastName", {
                            required: "Last name is required",
                          })}
                        />

                        {errors.lastName && (
                          <p className="booking-error">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                      <div className="form-group small-field">
                        <label>Age</label>

                        <input
                          type="number"
                          className="booking-input"
                          placeholder="Age"
                          {...register("age", {
                            required: "Age is required",
                            min: {
                              value: 1,
                              message: "Invalid age",
                            },
                          })}
                        />

                        {errors.age && (
                          <p className="booking-error">{errors.age.message}</p>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
                <div className="traveller-card">
                  <h3 className="booking-contact-title">
                    Booking details will be sent to
                  </h3>

                  <div className="form-group full-width">
                    <label>Email Address</label>

                    <input
                      type="email"
                      className="booking-input"
                      placeholder="Email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
                      })}
                    />

                    {errors.email && (
                      <p className="booking-error">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="phone-wrapper">
                    <div className="country-code">
                      <select
                        className="booking-input"
                        value={leadGuest.countryCode}
                        onChange={(e) =>
                          setLeadGuest({
                            ...leadGuest,
                            countryCode: e.target.value,
                          })
                        }
                      >
                        {countryCodes.map((item, index) => (
                          <option key={index} value={item.code}>
                            {item.country} ({item.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="phone-number">
                      <input
                        type="tel"
                        className="booking-input"
                        placeholder="Phone Number"
                        {...register("phone", {
                          required: "Phone number is required",
                          minLength: {
                            value: 10,
                            message: "Enter a valid phone number",
                          },
                        })}
                      />

                      {errors.phone && (
                        <p className="booking-error">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="traveller-card">
                  <h3 className="booking-contact-title">Billing Address</h3>
                  <div className="form-group full-width">
                    <label>Address Line 1 *</label>

                    <input
                      type="text"
                      className="booking-input"
                      placeholder="Address Line 1"
                      {...register("address1", {
                        required: "Address is required",
                      })}
                    />

                    {errors.address1 && (
                      <p className="booking-error">{errors.address1.message}</p>
                    )}
                  </div>
                  <div className="form-group full-width">
                    <label>Address Line 2 (Optional)</label>

                    <input
                      type="text"
                      className="booking-input"
                      placeholder="Apartment, Suite, etc."
                      {...register("address2")}
                    />
                  </div>
                  <div className="billing-grid">
                    <div className="form-group">
                      <label>Country *</label>
                      <select
                        className="booking-input"
                        {...register("country", {
                          required: "Country is required",
                        })}
                      >
                        <option value="">Select Country</option>

                        {Country.getAllCountries().map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </option>
                        ))}
                      </select>

                      {errors.country && (
                        <p className="booking-error">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <select
                        className="booking-input"
                        {...register("state", {
                          required: "State is required",
                        })}
                        disabled={!selectedCountry}
                      >
                        <option value="">Select State</option>

                        {selectedCountry &&
                          State.getStatesOfCountry(selectedCountry).map(
                            (state) => (
                              <option key={state.isoCode} value={state.name}>
                                {state.name}
                              </option>
                            ),
                          )}
                      </select>

                      {errors.state && (
                        <p className="booking-error">{errors.state.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="billing-grid">
                    <div className="form-group">
                      <label>City *</label>

                      <input
                        type="text"
                        className="booking-input"
                        placeholder="City"
                        {...register("city", {
                          required: "City is required",
                        })}
                      />

                      {errors.city && (
                        <p className="booking-error">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Zip / Postal Code *</label>

                      <input
                        type="text"
                        className="booking-input"
                        placeholder="Zip Code"
                        {...register("zipCode", {
                          required: "Zip Code is required",
                        })}
                      />

                      {errors.zipCode && (
                        <p className="booking-error">
                          {errors.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="traveller-card">
                  <h3 className="booking-contact-title">Card Details</h3>
                  <div className="billing-grid">
                    <div className="form-group">
                      <label>Card Number *</label>
                      <input
                        type="text"
                        className="booking-input"
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                        {...register("cardNumber", {
                          required: "Card Number is required",
                          pattern: {
                            value: /^[0-9 ]+$/,
                            message: "Invalid Card Number",
                          },
                        })}
                      />
                      {errors.cardNumber && (
                        <p className="booking-error">
                          {errors.cardNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Name on Card *</label>

                      <input
                        type="text"
                        className="booking-input"
                        placeholder="Card Holder Name"
                        {...register("cardHolder", {
                          required: "Card Holder Name is required",
                        })}
                      />

                      {errors.cardHolder && (
                        <p className="booking-error">
                          {errors.cardHolder.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="billing-grid">
                    <div className="form-group">
                      <label>Valid To (MM/YY) *</label>
                      <input
                        type="text"
                        className="booking-input"
                        placeholder="MM/YY"
                        maxLength={5}
                        {...register("expiryDate", {
                          required: "Expiry Date is required",
                          pattern: {
                            value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                            message: "Use MM/YY format",
                          },
                        })}
                        onChange={handleExpiryChange}
                      />
                      {errors.expiryDate && (
                        <p className="booking-error">
                          {errors.expiryDate.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>CVV *</label>

                      <input
                        type="text"
                        className="booking-input"
                        placeholder="CVV"
                        maxLength={4}
                        {...register("cvv", {
                          required: "CVV is required",
                          minLength: {
                            value: 3,
                            message: "Invalid CVV",
                          },
                          maxLength: {
                            value: 4,
                            message: "Invalid CVV",
                          },
                        })}
                      />
                      {errors.cvv && (
                        <p className="booking-error">{errors.cvv.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="payment-btn"
                  onClick={handleSubmit(onSubmit)}
                >
                  Proceed To Payment
                </button>
              </div>
            </div>

            <div className="hotel-booking-right">
              <div className="booking-summary-card">
                <img
                  src={heroImageMain}
                  alt={hotelImages?.name}
                  className="booking-summary-image"
                />

                <div className="booking-summary-content">
                  <h3>{hotelImages?.name}</h3>

                  <div className="booking-date-row">
                    <div>
                      <h5>
                        <FaCalendarAlt />
                        Check In
                      </h5>

                      <span>{checkIn}</span>
                    </div>

                    <div>
                      <h5>
                        <FaCalendarAlt />
                        Check Out
                      </h5>

                      <span>{checkOut}</span>
                    </div>
                  </div>

                  <div className="booking-room-info">
                    <p>
                      <FaHotel />
                      {selectedRoom?.roomName || roomName}
                    </p>

                    <p>
                      <FaUserFriends />
                      Adults: {totalAdults}, Children: {totalChildren}
                    </p>

                    {selectedRoom?.childAges?.length > 0 && (
                      <p>Child Ages: {selectedRoom.childAges.join(", ")}</p>
                    )}

                    {(selectedRoom?.boardBasis || boardBasis) && (
                      <p>{selectedRoom?.boardBasis || boardBasis}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="booking-price-card">
                <h3>
                  <FaMoneyBillWave />
                  Price Details
                </h3>

                <div className="price-row">
                  <span>
                    {totalNumberofRooms} Room ×{" "}
                    {Math.ceil(
                      (new Date(checkOut) - new Date(checkIn)) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    Nights
                  </span>

                  <span>${selectedPriceBeforeTax.toFixed(2)}</span>
                </div>

                {selectedTaxes > 0 && (
                  <div className="price-row">
                    <span>Taxes and fees</span>
                    <span>${selectedTaxes.toFixed(2)}</span>
                  </div>
                )}

                {selectedFees > 0 && (
                  <div className="price-row">
                    <span>Fees</span>
                    <span>${selectedFees.toFixed(2)}</span>
                  </div>
                )}

                {/* {savings > 0 && (
                  <div className="price-row">
                    <span>Savings</span>
                    <span className="saving-price">
                      - ${savings.toFixed(2)}
                    </span>
                  </div>
                )} */}

                <hr />

                <div className="total-price">
                  <span>Total</span>
                  <h2>${selectedOurPrice.toFixed(2)}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Hotel;
