import React, { useState } from "react";
import { useForm } from "react-hook-form";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import "./Activity.css";
import { useSearchParams } from "react-router-dom";
import {
  activityOrder,
  activityOrderPlace,
} from "../../../store/Services/AllApi";
import CarLoader from "../../../reuseable-components/CarLoader/CarLoader";

const ActivityBook = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const storedBookingData = JSON.parse(
    sessionStorage.getItem("activityBookingData") || "{}",
  );

  const travelers = Array.isArray(storedBookingData.guests)
    ? storedBookingData.guests
    : [];

  const getTravelerLabel = (type) => {
    if (type === "ADULT") return "Adult";
    if (type === "CHILD") return "Child";
    if (type === "INFANT") return "Infant";
    return "Traveler";
  };

  const getTravelerNumber = (type, index) => {
    return travelers
      .slice(0, index + 1)
      .filter((traveler) => traveler.type === type).length;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      travelers: travelers.map((traveler) => ({
        primary: traveler.primary || false,
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        ageBand: traveler.type || "",
        gender: "",
        birthDate: "",
      })),
      billingName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });

  const normalizeCardNumber = (value) => String(value || "").replace(/\D/g, "");

  const handleCardNumberInput = (event) => {
    const input = event.target;
    const numbers = normalizeCardNumber(input.value).slice(0, 16);

    input.value = numbers.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleExpiryInput = (event) => {
    const input = event.target;

    const numbers = String(input.value || "")
      .replace(/\D/g, "")
      .slice(0, 4);

    input.value =
      numbers.length > 2
        ? `${numbers.slice(0, 2)} / ${numbers.slice(2)}`
        : numbers;
  };

  const getAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return null;

    const birth = new Date(`${birthDate}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(birth.getTime()) || birth > today) {
      return null;
    }

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age -= 1;
    }

    return age;
  };

  const validateBirthDate = (value, travelerType) => {
    if (!value) {
      return "Birth date is required";
    }

    const age = getAgeFromBirthDate(value);

    if (age === null) {
      return "Please enter a valid birth date";
    }

    if (travelerType === "ADULT" && age < 18) {
      return "Adult must be 18 years or older";
    }

    if (travelerType === "CHILD" && (age < 2 || age > 17)) {
      return "Child age must be between 2 and 17 years";
    }

    if (travelerType === "INFANT" && age >= 2) {
      return "Infant must be under 2 years old";
    }

    return true;
  };

  const handlePayment = async (formData) => {
    setLoading(true);
    try {
      const latestBookingData = JSON.parse(
        sessionStorage.getItem("activityBookingData") || "{}",
      );

      const primaryTraveler =
        formData.travelers?.find((traveler) => traveler.primary) ||
        formData.travelers?.[0] ||
        {};

      const guests = (formData.travelers || []).map((traveler, index) => ({
        primary:
          traveler.primary === true ||
          latestBookingData.guests?.[index]?.primary === true,
        title: traveler.title || "",
        firstName: traveler.firstName || "",
        lastName: traveler.lastName || "",
        email: traveler.email || "",
        phone: traveler.phone || "",
        covered: false,
        birthDate: traveler.birthDate || "",
        gender: traveler.gender || "",
        type:
          traveler.ageBand ||
          latestBookingData.guests?.[index]?.type ||
          "ADULT",
      }));

      const requestBody = {
        test: true,
        startDate: latestBookingData.startDate || "",
        endDate: latestBookingData.endDate || "",
        paymentMode: "CARD",
        activityCode: latestBookingData.activityCode || "",
        rate: 1,
        name: latestBookingData.name || "",
        image: latestBookingData.image || "",
        category: latestBookingData.category || "",
        description: latestBookingData.description || "",
        adults: Number(latestBookingData.adults) || 0,
        children: Number(latestBookingData.children) || 0,
        city: formData.city || "",
        state: formData.state || "",
        country: formData.country || "",
        ourPrice: latestBookingData.ourPrice || "",
        payable: latestBookingData.payable || "",
        publicPrice: latestBookingData.publicPrice || "",
        billingAddress1: formData.address1 || "",
        billingAddress2: formData.address2 || "",
        billingCity: formData.city || "",
        billingState: formData.state || "",
        billingCountry: formData.country || "",
        billingPostalCode: formData.postalCode || "",
        billingPhone: primaryTraveler.phone || "",
        billingEmail: primaryTraveler.email || "",
        billingName:
          formData.billingName ||
          `${primaryTraveler.firstName || ""} ${
            primaryTraveler.lastName || ""
          }`.trim(),
        billingTitle: primaryTraveler.title || "",
        cancellationPolicy: latestBookingData.cancellationPolicy || "",
        startTime: latestBookingData.startTime || "",
        shortTittle: latestBookingData.shortTittle || "",
        guests,
        orderDate: new Date().toISOString().split("T")[0],
        duration: latestBookingData.duration || "",
        star_rating: String(latestBookingData.star_rating || ""),
      };

      console.log("activityOrder REQUEST:", requestBody);

      const res = await activityOrder({
        body: requestBody,
      });

      console.log("activityOrder RESPONSE:", res);

      const itemId = res?.data?.addorder?.result?.itemid;

      if (!itemId) {
        console.log("Activity order itemId not found:", res);
        return;
      }

      console.log("Activity Order Item ID:", itemId);

      const paymentResponse = await handleAnkit(
        itemId,
        formData,
        latestBookingData,
      );

      console.log("Final Payment Response:", paymentResponse);
    } catch (error) {
      console.log("activityOrder ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const encodeValue = (value) => {
    return value ? btoa(String(value)) : "";
  };

  const handleAnkit = async (orderId, formData, latestBookingData) => {
    try {
      const primaryTraveler =
        formData.travelers?.find((traveler) => traveler.primary) ||
        formData.travelers?.[0] ||
        {};

      const cardNumber = String(formData.cardNumber || "").replace(/\s/g, "");

      const expiry = String(formData.expiry || "").replace(/\D/g, "");

      const expiryMonth = expiry.slice(0, 2);
      const expiryYear = expiry.slice(2, 4);

      const paymentRemaining =
        Number(latestBookingData.payable) ||
        Number(latestBookingData.publicPrice) ||
        0;

      const response = await activityOrderPlace({
        body: {
          orderid: orderId,
          success: "https://ent.alphatravelclub.link/payRedirect",
          fail: "https://ent.alphatravelclub.link/payRedirect",
          mode: "CARD",
          paymentRemaining,
          identity: {
            number: cardNumber ? btoa(cardNumber) : "",
            name:
              formData.cardName ||
              `${primaryTraveler.firstName || ""} ${
                primaryTraveler.lastName || ""
              }`.trim(),
            code: formData.cvv ? btoa(String(formData.cvv)) : "",
            type: "MC",
            em: expiryMonth ? btoa(expiryMonth) : "",
            ey: expiryYear ? btoa(expiryYear) : "",
            line1: formData.address1 || "",
            line2: formData.address2 || "",
            country: formData.country || "",
            postalcode: formData.postalCode || "",
            email: primaryTraveler.email || "",
            phone: primaryTraveler.phone || "",
            city: formData.city || "",
            state: formData.state || "",
          },
        },
      });

      console.log("activityOrderPlace RESPONSE:", response);

      const paymentUrl = response?.data?.paynow?.result?.url;

      if (
        response?.data?.paynow?.success &&
        response?.data?.paynow?.result?.succeed &&
        paymentUrl
      ) {
        window.location.href = paymentUrl;
        return;
      }

      console.log("Payment URL not found:", response);
    } catch (error) {
      console.log("activityOrderPlace ERROR:", error);
    }
  };
  return (
    <>
      {loading && <CarLoader />}
      <div className="activity-book-page">
        <HeaderInner />

        <main className="activity-book-main">
          <div className="activity-book-container">
            <div className="activity-book-heading">
              <div>
                <span className="activity-book-eyebrow">Secure Checkout</span>

                <h1>Complete Your Booking</h1>

                <p>
                  Review your activity details, enter your billing information
                  and complete your payment.
                </p>
              </div>

              <div className="activity-book-secure-badge">
                <span>🔒</span>

                <div>
                  <strong>Secure Payment</strong>
                  <small>Your payment information is protected</small>
                </div>
              </div>
            </div>

            <form
              className="activity-book-layout"
              onSubmit={handleSubmit(handlePayment)}
              noValidate
            >
              <div className="activity-book-left">
                <section className="activity-book-card activity-book-activity-card">
                  <div className="activity-book-activity-content">
                    <div className="activity-book-activity-image-wrapper">
                      {storedBookingData.image ? (
                        <img
                          src={storedBookingData.image}
                          alt={storedBookingData.name || "Activity"}
                          className="activity-book-activity-image"
                        />
                      ) : (
                        <div className="activity-book-activity-image-placeholder">
                          Activity
                        </div>
                      )}
                    </div>

                    <div className="activity-book-activity-details">
                      <span className="activity-book-activity-label">
                        Activity
                      </span>

                      <h2>{storedBookingData.name || "Activity"}</h2>

                      {storedBookingData.startDate && (
                        <div className="activity-book-activity-meta">
                          <span>📅</span>
                          <span>{storedBookingData.startDate}</span>
                        </div>
                      )}

                      {storedBookingData.startTime && (
                        <div className="activity-book-activity-meta">
                          <span>🕐</span>
                          <span>{storedBookingData.startTime}</span>
                        </div>
                      )}

                      <div className="activity-book-activity-meta">
                        <span>👥</span>
                        <span>
                          {travelers.length}{" "}
                          {travelers.length === 1
                            ? "Participant"
                            : "Participants"}
                        </span>
                      </div>

                      {storedBookingData.duration && (
                        <div className="activity-book-activity-meta">
                          <span>⏱</span>
                          <span>{storedBookingData.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="activity-book-card">
                  <div className="activity-book-section-header">
                    <div className="activity-book-section-number">02</div>

                    <div>
                      <h2>Booking Details</h2>
                      <p>Enter the details of all travelers</p>
                    </div>
                  </div>

                  {travelers.length === 0 ? (
                    <div className="activity-book-empty-state">
                      No travelers found. Please go back and select your
                      travelers.
                    </div>
                  ) : (
                    travelers.map((traveler, index) => {
                      const travelerNumber = getTravelerNumber(
                        traveler.type,
                        index,
                      );

                      const travelerLabel = getTravelerLabel(traveler.type);

                      const isPrimary = traveler.primary === true;

                      return (
                        <div
                          key={`${traveler.type}-${index}`}
                          className="activity-book-traveler-box"
                        >
                          <div className="activity-book-traveler-heading">
                            <div>
                              <h3>
                                {travelerLabel} {travelerNumber}
                              </h3>

                              <span>{travelerLabel}</span>
                            </div>

                            {isPrimary && (
                              <span className="activity-book-primary-tag">
                                Primary Guest
                              </span>
                            )}
                          </div>

                          <div className="activity-book-form-grid">
                            <input
                              type="hidden"
                              value={isPrimary}
                              {...register(`travelers.${index}.primary`)}
                            />

                            <div className="activity-book-field activity-book-field-small">
                              <label>
                                Title <span>*</span>
                              </label>

                              <select
                                {...register(`travelers.${index}.title`, {
                                  required: "Title is required",
                                })}
                              >
                                <option value="">Select title</option>
                                <option value="Mr">Mr</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Ms">Ms</option>
                              </select>

                              {errors.travelers?.[index]?.title && (
                                <span className="activity-book-error">
                                  {errors.travelers[index].title.message}
                                </span>
                              )}
                            </div>

                            <div className="activity-book-field">
                              <label>
                                First Name <span>*</span>
                              </label>

                              <input
                                type="text"
                                {...register(`travelers.${index}.firstName`, {
                                  required: "First name is required",
                                  maxLength: {
                                    value: 50,
                                    message: "Maximum 50 characters allowed",
                                  },
                                  pattern: {
                                    value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                                    message: "Please enter a valid first name",
                                  },
                                })}
                              />

                              {errors.travelers?.[index]?.firstName && (
                                <span className="activity-book-error">
                                  {errors.travelers[index].firstName.message}
                                </span>
                              )}
                            </div>

                            <div className="activity-book-field">
                              <label>
                                Last Name <span>*</span>
                              </label>

                              <input
                                type="text"
                                {...register(`travelers.${index}.lastName`, {
                                  required: "Last name is required",
                                  maxLength: {
                                    value: 50,
                                    message: "Maximum 50 characters allowed",
                                  },
                                  pattern: {
                                    value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                                    message: "Please enter a valid last name",
                                  },
                                })}
                              />

                              {errors.travelers?.[index]?.lastName && (
                                <span className="activity-book-error">
                                  {errors.travelers[index].lastName.message}
                                </span>
                              )}
                            </div>

                            <div className="activity-book-field">
                              <label>
                                Gender <span>*</span>
                              </label>

                              <select
                                {...register(`travelers.${index}.gender`, {
                                  required: "Gender is required",
                                })}
                              >
                                <option value="">Select gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                              </select>

                              {errors.travelers?.[index]?.gender && (
                                <span className="activity-book-error">
                                  {errors.travelers[index].gender.message}
                                </span>
                              )}
                            </div>

                            <div className="activity-book-field">
                              <label>
                                Date of Birth <span>*</span>
                              </label>

                              <input
                                type="date"
                                max={new Date().toISOString().split("T")[0]}
                                {...register(`travelers.${index}.birthDate`, {
                                  required: "Birth date is required",
                                  validate: (value) =>
                                    validateBirthDate(value, traveler.type),
                                })}
                              />

                              {errors.travelers?.[index]?.birthDate && (
                                <span className="activity-book-error">
                                  {errors.travelers[index].birthDate.message}
                                </span>
                              )}
                            </div>

                            {isPrimary && (
                              <>
                                <div className="activity-book-field">
                                  <label>
                                    Email Address <span>*</span>
                                  </label>

                                  <input
                                    type="email"
                                    {...register(`travelers.${index}.email`, {
                                      required: "Email is required",
                                      pattern: {
                                        value:
                                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message:
                                          "Please enter a valid email address",
                                      },
                                    })}
                                  />

                                  {errors.travelers?.[index]?.email && (
                                    <span className="activity-book-error">
                                      {errors.travelers[index].email.message}
                                    </span>
                                  )}
                                </div>

                                <div className="activity-book-field">
                                  <label>
                                    Phone Number <span>*</span>
                                  </label>

                                  <input
                                    type="tel"
                                    {...register(`travelers.${index}.phone`, {
                                      required: "Phone number is required",
                                      pattern: {
                                        value: /^\+?[0-9\s()-]{8,20}$/,
                                        message:
                                          "Please enter a valid phone number",
                                      },
                                    })}
                                  />

                                  {errors.travelers?.[index]?.phone && (
                                    <span className="activity-book-error">
                                      {errors.travelers[index].phone.message}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}

                            <input
                              type="hidden"
                              value={traveler.type}
                              {...register(`travelers.${index}.ageBand`)}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>

                <section className="activity-book-card">
                  <div className="activity-book-section-header">
                    <div className="activity-book-section-number">03</div>

                    <div>
                      <h2>Billing Address</h2>
                      <p>Enter the billing information for your payment</p>
                    </div>
                  </div>

                  <div className="activity-book-form-grid">
                    <div className="activity-book-field activity-book-field-full">
                      <label>
                        Billing Name <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("billingName", {
                          required: "Billing name is required",
                          minLength: {
                            value: 2,
                            message:
                              "Billing name must be at least 2 characters",
                          },
                        })}
                        placeholder="Enter billing name"
                      />

                      {errors.billingName && (
                        <span className="activity-book-error">
                          {errors.billingName.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field activity-book-field-full">
                      <label>
                        Address Line 1 <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("address1", {
                          required: "Address is required",
                          minLength: {
                            value: 3,
                            message: "Please enter a valid address",
                          },
                        })}
                        placeholder="Enter address"
                      />

                      {errors.address1 && (
                        <span className="activity-book-error">
                          {errors.address1.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field activity-book-field-full">
                      <label>Address Line 2</label>

                      <input
                        type="text"
                        {...register("address2")}
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>

                    <div className="activity-book-field">
                      <label>
                        City <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("city", {
                          required: "City is required",
                        })}
                        placeholder="Enter city"
                      />

                      {errors.city && (
                        <span className="activity-book-error">
                          {errors.city.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>
                        State <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("state", {
                          required: "State is required",
                        })}
                        placeholder="Enter state"
                      />

                      {errors.state && (
                        <span className="activity-book-error">
                          {errors.state.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>
                        Country <span>*</span>
                      </label>

                      <select
                        {...register("country", {
                          required: "Country is required",
                        })}
                      >
                        <option value="">Select country</option>
                        <option value="AF">Afghanistan</option>
                        <option value="AL">Albania</option>
                        <option value="DZ">Algeria</option>
                        <option value="AD">Andorra</option>
                        <option value="AO">Angola</option>
                        <option value="AR">Argentina</option>
                        <option value="AU">Australia</option>
                        <option value="AT">Austria</option>
                        <option value="BD">Bangladesh</option>
                        <option value="BE">Belgium</option>
                        <option value="BR">Brazil</option>
                        <option value="CA">Canada</option>
                        <option value="CN">China</option>
                        <option value="DK">Denmark</option>
                        <option value="EG">Egypt</option>
                        <option value="FI">Finland</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option>
                        <option value="GR">Greece</option>
                        <option value="HK">Hong Kong</option>
                        <option value="IN">India</option>
                        <option value="ID">Indonesia</option>
                        <option value="IE">Ireland</option>
                        <option value="IT">Italy</option>
                        <option value="JP">Japan</option>
                        <option value="MY">Malaysia</option>
                        <option value="MV">Maldives</option>
                        <option value="MX">Mexico</option>
                        <option value="NP">Nepal</option>
                        <option value="NL">Netherlands</option>
                        <option value="NZ">New Zealand</option>
                        <option value="NO">Norway</option>
                        <option value="PK">Pakistan</option>
                        <option value="PH">Philippines</option>
                        <option value="PT">Portugal</option>
                        <option value="QA">Qatar</option>
                        <option value="RU">Russia</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="SG">Singapore</option>
                        <option value="ZA">South Africa</option>
                        <option value="ES">Spain</option>
                        <option value="LK">Sri Lanka</option>
                        <option value="SE">Sweden</option>
                        <option value="CH">Switzerland</option>
                        <option value="TH">Thailand</option>
                        <option value="TR">Turkey</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="VN">Vietnam</option>
                      </select>

                      {errors.country && (
                        <span className="activity-book-error">
                          {errors.country.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>
                        Postal Code <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("postalCode", {
                          required: "Postal code is required",
                          pattern: {
                            value: /^[A-Za-z0-9\s-]{3,10}$/,
                            message: "Please enter a valid postal code",
                          },
                        })}
                        placeholder="Enter postal code"
                      />

                      {errors.postalCode && (
                        <span className="activity-book-error">
                          {errors.postalCode.message}
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <section className="activity-book-card">
                  <div className="activity-book-section-header">
                    <div className="activity-book-section-number">04</div>

                    <div>
                      <h2>Card Details</h2>
                      <p>Enter your card details to complete payment</p>
                    </div>
                  </div>

                  <div className="activity-book-payment-method">
                    <div className="activity-book-payment-title">
                      <div className="activity-book-card-icon">▣</div>

                      <div>
                        <strong>Credit / Debit Card</strong>
                        <span>Secure card payment</span>
                      </div>
                    </div>

                    <div className="activity-book-card-brands">
                      <span>VISA</span>
                      <span>MC</span>
                      <span>AMEX</span>
                    </div>
                  </div>

                  <div className="activity-book-form-grid">
                    <div className="activity-book-field activity-book-field-full">
                      <label>
                        Cardholder Name <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("cardName", {
                          required: "Cardholder name is required",
                          minLength: {
                            value: 2,
                            message: "Please enter a valid cardholder name",
                          },
                          pattern: {
                            value: /^[A-Za-zÀ-ÿ\s'-]+$/,
                            message: "Please enter a valid cardholder name",
                          },
                        })}
                        placeholder="Name as shown on card"
                        autoComplete="cc-name"
                      />

                      {errors.cardName && (
                        <span className="activity-book-error">
                          {errors.cardName.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field activity-book-field-full">
                      <label>
                        Card Number <span>*</span>
                      </label>

                      <div className="activity-book-card-input">
                        <input
                          type="text"
                          {...register("cardNumber", {
                            required: "Card number is required",
                            validate: (value) => {
                              const number = normalizeCardNumber(value);

                              if (number.length < 13) {
                                return "Please enter a valid card number";
                              }

                              return true;
                            },
                            onChange: handleCardNumberInput,
                          })}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          autoComplete="cc-number"
                        />

                        <span>▣</span>
                      </div>

                      {errors.cardNumber && (
                        <span className="activity-book-error">
                          {errors.cardNumber.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>
                        Expiry Date <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("expiry", {
                          required: "Expiry date is required",
                          validate: (value) => {
                            const numbers = String(value).replace(/\D/g, "");

                            if (numbers.length !== 4) {
                              return "Enter expiry as MM / YY";
                            }

                            const month = Number(numbers.slice(0, 2));
                            const year = Number(numbers.slice(2));

                            if (month < 1 || month > 12) {
                              return "Enter a valid expiry month";
                            }

                            const currentDate = new Date();
                            const currentYear = currentDate.getFullYear() % 100;
                            const currentMonth = currentDate.getMonth() + 1;

                            if (
                              year < currentYear ||
                              (year === currentYear && month < currentMonth)
                            ) {
                              return "Card has expired";
                            }

                            return true;
                          },
                          onChange: handleExpiryInput,
                        })}
                        placeholder="MM / YY"
                        maxLength="7"
                        autoComplete="cc-exp"
                      />

                      {errors.expiry && (
                        <span className="activity-book-error">
                          {errors.expiry.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>
                        CVV <span>*</span>
                      </label>

                      <input
                        type="password"
                        {...register("cvv", {
                          required: "CVV is required",
                          pattern: {
                            value: /^\d{3,4}$/,
                            message: "CVV must contain 3 or 4 digits",
                          },
                        })}
                        placeholder="•••"
                        maxLength="4"
                        autoComplete="cc-csc"
                      />

                      {errors.cvv && (
                        <span className="activity-book-error">
                          {errors.cvv.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="activity-book-card-security">
                    <span>🔒</span>

                    <p>
                      Your card details are encrypted and securely processed. We
                      never store your complete card information.
                    </p>
                  </div>
                </section>
              </div>

              <aside className="activity-book-right">
                <div className="activity-book-summary-card">
                  <div className="activity-book-summary-header">
                    <h2>Price Summary</h2>
                    <span>1 Activity</span>
                  </div>

                  <div className="activity-book-summary-activity">
                    <div className="activity-book-summary-image">
                      {storedBookingData.image ? (
                        <img
                          src={storedBookingData.image}
                          alt={storedBookingData.name || "Activity"}
                          className="activity-book-summary-activity-image"
                        />
                      ) : (
                        <div className="activity-book-static-summary-image">
                          Activity
                        </div>
                      )}
                    </div>

                    <div className="activity-book-summary-activity-info">
                      <strong>{storedBookingData.name || "Activity"}</strong>

                      <span>{storedBookingData.startDate || ""}</span>

                      <span>
                        {travelers.length}{" "}
                        {travelers.length === 1
                          ? "Participant"
                          : "Participants"}
                      </span>
                    </div>
                  </div>

                  <div className="activity-book-summary-divider" />

                  <div className="activity-book-price-row">
                    <span>Public Price</span>
                    <strong>
                      {storedBookingData.publicPrice
                        ? `$${String(storedBookingData.publicPrice).replace(/^₹\s*/, "")}`
                        : "$0"}
                    </strong>
                  </div>

                  <div className="activity-book-price-row activity-book-savings">
                    <span>You Save</span>
                    <strong>
                      $
                      {(
                        Number(
                          String(storedBookingData.publicPrice || "0").replace(
                            /[^0-9.-]/g,
                            "",
                          ),
                        ) -
                        Number(
                          String(storedBookingData.ourPrice || "0").replace(
                            /[^0-9.-]/g,
                            "",
                          ),
                        )
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="activity-book-summary-divider" />

                  <div className="activity-book-total-row">
                    <div>
                      <span>Total Payable</span>
                      <small>Inclusive of applicable charges</small>
                    </div>

                    <strong>
                      {storedBookingData.payable
                        ? `$${String(storedBookingData.payable).replace(/^₹\s*/, "")}`
                        : "$0"}
                    </strong>
                  </div>

                  <button
                    type="submit"
                    className="activity-book-submit-btn"
                    disabled={isSubmitting || travelers.length === 0}
                  >
                    <span>
                      {isSubmitting ? "Processing..." : "Complete Booking"}
                    </span>

                    <span>→</span>
                  </button>

                  <div className="activity-book-trust">
                    <span>🔒</span>
                    <p>Safe & secure checkout</p>
                  </div>
                </div>

                <div className="activity-book-help-card">
                  <div className="activity-book-help-icon">?</div>

                  <div>
                    <strong>Need Help?</strong>

                    <p>
                      Our support team is available to help you with your
                      booking.
                    </p>
                  </div>
                </div>
              </aside>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ActivityBook;
