import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./VacationBilling.css";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import { vacationAddOrder, vacvationPay } from "../../../store/Services/AllApi";

const formatSummaryDate = (value) => {
  if (!value) {
    return "Not selected";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const formatApiDate = (value) => {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-").map(Number);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (!year || !month || !day || !monthNames[month - 1]) {
    return value;
  }

  return `${String(day).padStart(2, "0")}-${monthNames[month - 1]}-${year}`;
};

const formatApiTime = (value) => {
  if (!value) {
    return "";
  }

  const timeMatch = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!timeMatch) {
    return value;
  }

  const [, hours, minutes, period] = timeMatch;

  return `${String(hours).padStart(2, "0")}:${minutes} ${period.toUpperCase()}`;
};

const getCountryCode = (country) => {
  const countryCodes = {
    India: "IN",
    "United States": "US",
    "United Kingdom": "GB",
    Canada: "CA",
    Australia: "AU",
  };

  return countryCodes[country] || country;
};
const encodePaymentValue = (value) => {
  return window.btoa(String(value || "").trim());
};
const waitForLoaderToRender = () => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
};
const getCardType = (value) => {
  const cardNumber = String(value || "").replace(/\D/g, "");
  const firstFourDigits = Number(cardNumber.slice(0, 4));

  if (
    /^5[1-5]/.test(cardNumber) ||
    (firstFourDigits >= 2221 && firstFourDigits <= 2720)
  ) {
    return "MC";
  }

  if (/^4/.test(cardNumber)) {
    return "VI";
  }

  if (/^3[47]/.test(cardNumber)) {
    return "AX";
  }

  if (/^6(?:011|5)/.test(cardNumber)) {
    return "DS";
  }

  return "MC";
};
const VacationBilling = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "India",
      address: "",
      apartment: "",
      city: "",
      state: "",
      postalCode: "",
      cardHolderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });
  const [bookingData] = useState(() => {
    try {
      const savedBookingData = sessionStorage.getItem("vacationBookingData");

      return savedBookingData ? JSON.parse(savedBookingData) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const property = bookingData?.property || {};
  const price = bookingData?.price || {};
  const [isPaymentRedirecting, setIsPaymentRedirecting] = useState(false);
  const formattedStartDate = formatSummaryDate(bookingData?.startDate);

  const formattedEndDate = formatSummaryDate(bookingData?.endDate);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency || "USD",
    maximumFractionDigits: 2,
  }).format(Number(price.payable ?? price.ourPrice ?? 0));

  const formattedRoomType =
    bookingData?.roomType?.replace(
      /,\s*Max Occupancy:\s*(\d+)(?:,\s*Max Occupancy:\s*\d+)+/i,
      ", Max Occupancy: $1",
    ) || "Room details unavailable";

  const propertyAddress = [
    property.addressLine1,
    property.addressLine2,
    property.city,
    property.state,
    property.country,
    property.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  const validateExpiryDate = (value) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
      return "Enter a valid expiry date in MM/YY format";
    }

    const [month, year] = value.split("/");
    const expiryDate = new Date(2000 + Number(year), Number(month), 0);
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    return expiryDate >= currentDate || "Your card has expired";
  };

  const formatCardNumber = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 16);
    event.target.value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiryDate = (event) => {
    let value = event.target.value.replace(/\D/g, "").slice(0, 4);

    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    event.target.value = value;
  };

  const onSubmit = async (data) => {
    if (!bookingData?.property?.id) {
      console.error("Vacation booking data is missing from session storage.");
      return;
    }

    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

    const input = {
      resortId: bookingData.property.id,
      mode: "ONLINE",
      test: true,
      paymentMode: "CARD",
      image: bookingData.property.image || "",
      moduleId: 1557,
      supplierId: 5346,

      startDate: formatApiDate(bookingData.startDate),
      endDate: formatApiDate(bookingData.endDate),
      startTime: formatApiTime(bookingData.startTime),
      endTime: formatApiTime(bookingData.endTime),

      roomType: formattedRoomType,

      guests: {
        title: "Mr",
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        primary: true,
      },

      property: {
        ...bookingData.property,
        id: bookingData.property.id,
        image: bookingData.property.image || "",
      },

      price: {
        currency: bookingData.price?.currency || "USD",
        rate: Number(bookingData.price?.rate ?? 1),
        ourPrice: Number(bookingData.price?.ourPrice ?? 0),
        payable: Number(bookingData.price?.payable ?? 0),
      },

      billing: {
        title: "Mr",
        name: data.cardHolderName.trim() || fullName,
        addressLine1: data.address.trim(),
        addressLine2: data.apartment.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        country: getCountryCode(data.country),
        postalCode: data.postalCode.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
      },

      cancellationPolicy: "",
      isTerm: false,
      starRating: String(bookingData.starRating || ""),
    };

    setLoading(true);

    try {
      const response = await vacationAddOrder({
        body: {
          input,
        },
      });

      const orderId = response?.data?.addOrder?.result?.itemId;

      const paymentRemaining = Number(
        response?.data?.addOrder?.result?.paymentRemaining ??
          bookingData.price?.payable ??
          0,
      );

      if (!orderId) {
        throw new Error("Order ID was not returned by the booking API.");
      }

      const paymentResponse = await makePayment({
        orderId,
        paymentRemaining,
        formData: data,
      });

      reset();
    } catch (error) {
      console.error("Vacation booking failed:", error);
    } finally {
      setLoading(false);
    }
  };
  const makePayment = async ({ orderId, paymentRemaining, formData }) => {
    const normalizedCardNumber = formData.cardNumber.replace(/\s/g, "");

    const [expiryMonth, expiryYear] = formData.expiryDate.split("/");

    const paymentInput = {
      orderid: orderId,

      success: `https://it.alphatravelclub.link/car/${orderId}/paymentSuccessful`,

      fail: `https://it.alphatravelclub.link/car/${orderId}/bookingFailed`,

      mode: "CARD",

      paymentRemaining: Number(paymentRemaining),

      identity: {
        number: encodePaymentValue(normalizedCardNumber),
        name: formData.cardHolderName.trim(),
        code: encodePaymentValue(formData.cvv),
        type: getCardType(normalizedCardNumber),
        em: encodePaymentValue(expiryMonth),
        ey: encodePaymentValue(expiryYear),
        line1: formData.address.trim(),
        postalcode: formData.postalCode.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        country: getCountryCode(formData.country),
        city: formData.city.trim(),
        state: formData.state.trim(),
      },

      retryNumber: 0,
      isRetryPayment: false,
      coin_type: "LTCT",
    };

    const response = await vacvationPay({
      body: {
        input: paymentInput,
      },
    });

    const paymentResult = response?.data?.paynow?.result;

    const paymentUrl = paymentResult?.url || paymentResult?.checkout_url;

    if (!paymentResult?.succeed || !paymentUrl) {
      throw new Error(
        paymentResult?.message || "Payment redirect URL was not returned.",
      );
    }

    setIsPaymentRedirecting(true);

    await waitForLoaderToRender();

    window.location.assign(paymentUrl);

    return response;
  };

  return (
    <>
      <HeaderInner />
      {isPaymentRedirecting && (
        <div
          className="vacationBilling__redirectOverlay"
          role="status"
          aria-live="polite"
        >
          <div className="vacationBilling__redirectCard">
            <span className="vacationBilling__redirectSpinner" />

            <h2>Redirecting to secure payment</h2>

            <p>Please do not refresh or close this page.</p>
          </div>
        </div>
      )}
      <div className="container">
        <div className="vacationBilling">
          <div className="vacationBilling__container">
            <div className="vacationBilling__heading">
              <h1>Billing Information</h1>
              <p>Enter your billing address and payment details.</p>
            </div>
            <div className="vacationBilling__layout">
              <form
                className="vacationBilling__form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <section className="vacationBilling__section">
                  <div className="vacationBilling__sectionHeader">
                    <span className="vacationBilling__sectionNumber">1</span>
                    <div>
                      <h2>Billing Address</h2>
                      <p>This address should match your payment method.</p>
                    </div>
                  </div>

                  <div className="vacationBilling__grid">
                    <div className="vacationBilling__field">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="Enter first name"
                        className={errors.firstName ? "inputError" : ""}
                        {...register("firstName", {
                          required: "First name is required",
                          minLength: {
                            value: 2,
                            message: "Enter at least 2 characters",
                          },
                        })}
                      />
                      {errors.firstName && (
                        <span className="vacationBilling__error">
                          {errors.firstName.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Enter last name"
                        className={errors.lastName ? "inputError" : ""}
                        {...register("lastName", {
                          required: "Last name is required",
                          minLength: {
                            value: 2,
                            message: "Enter at least 2 characters",
                          },
                        })}
                      />
                      {errors.lastName && (
                        <span className="vacationBilling__error">
                          {errors.lastName.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field">
                      <label htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className={errors.email ? "inputError" : ""}
                        {...register("email", {
                          required: "Email address is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                          },
                        })}
                      />
                      {errors.email && (
                        <span className="vacationBilling__error">
                          {errors.email.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Enter phone number"
                        maxLength={10}
                        className={errors.phone ? "inputError" : ""}
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Enter a valid 10-digit phone number",
                          },
                        })}
                      />
                      {errors.phone && (
                        <span className="vacationBilling__error">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field vacationBilling__fullWidth">
                      <label htmlFor="country">Country</label>
                      <select
                        id="country"
                        className={errors.country ? "inputError" : ""}
                        {...register("country", {
                          required: "Country is required",
                        })}
                      >
                        <option value="">Select country</option>
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                      {errors.country && (
                        <span className="vacationBilling__error">
                          {errors.country.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field vacationBilling__fullWidth">
                      <label htmlFor="address">Street Address</label>
                      <input
                        id="address"
                        type="text"
                        placeholder="House number and street name"
                        className={errors.address ? "inputError" : ""}
                        {...register("address", {
                          required: "Street address is required",
                          minLength: {
                            value: 5,
                            message: "Enter a complete address",
                          },
                        })}
                      />
                      {errors.address && (
                        <span className="vacationBilling__error">
                          {errors.address.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field vacationBilling__fullWidth">
                      <label htmlFor="apartment">
                        Apartment, Suite, etc.{" "}
                        <span className="vacationBilling__optional">
                          (Optional)
                        </span>
                      </label>
                      <input
                        id="apartment"
                        type="text"
                        placeholder="Apartment, floor or unit number"
                        {...register("apartment")}
                      />
                    </div>

                    <div className="vacationBilling__field">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        type="text"
                        placeholder="Enter city"
                        className={errors.city ? "inputError" : ""}
                        {...register("city", {
                          required: "City is required",
                        })}
                      />
                      {errors.city && (
                        <span className="vacationBilling__error">
                          {errors.city.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field">
                      <label htmlFor="state">State</label>
                      <input
                        id="state"
                        type="text"
                        placeholder="Enter state"
                        className={errors.state ? "inputError" : ""}
                        {...register("state", {
                          required: "State is required",
                        })}
                      />
                      {errors.state && (
                        <span className="vacationBilling__error">
                          {errors.state.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field">
                      <label htmlFor="postalCode">Postal Code</label>
                      <input
                        id="postalCode"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter postal code"
                        maxLength={6}
                        className={errors.postalCode ? "inputError" : ""}
                        {...register("postalCode", {
                          required: "Postal code is required",
                          pattern: {
                            value: /^[1-9][0-9]{5}$/,
                            message: "Enter a valid 6-digit postal code",
                          },
                        })}
                      />
                      {errors.postalCode && (
                        <span className="vacationBilling__error">
                          {errors.postalCode.message}
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <section className="vacationBilling__section">
                  <div className="vacationBilling__sectionHeader">
                    <span className="vacationBilling__sectionNumber">2</span>
                    <div>
                      <h2>Card Details</h2>
                      <p>Your payment details are securely processed.</p>
                    </div>
                  </div>

                  <div className="vacationBilling__grid">
                    <div className="vacationBilling__field vacationBilling__fullWidth">
                      <label htmlFor="cardHolderName">Name on Card</label>
                      <input
                        id="cardHolderName"
                        type="text"
                        placeholder="Enter name as shown on card"
                        className={errors.cardHolderName ? "inputError" : ""}
                        {...register("cardHolderName", {
                          required: "Name on card is required",
                          minLength: {
                            value: 3,
                            message: "Enter a valid cardholder name",
                          },
                        })}
                      />
                      {errors.cardHolderName && (
                        <span className="vacationBilling__error">
                          {errors.cardHolderName.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field vacationBilling__fullWidth">
                      <label htmlFor="cardNumber">Card Number</label>
                      <div className="vacationBilling__cardInput">
                        <input
                          id="cardNumber"
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={errors.cardNumber ? "inputError" : ""}
                          {...register("cardNumber", {
                            required: "Card number is required",
                            validate: (value) =>
                              value.replace(/\s/g, "").length === 16 ||
                              "Card number must contain 16 digits",
                          })}
                          onInput={formatCardNumber}
                        />
                        <span>💳</span>
                      </div>
                      {errors.cardNumber && (
                        <span className="vacationBilling__error">
                          {errors.cardNumber.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field">
                      <label htmlFor="expiryDate">Expiry Date</label>
                      <input
                        id="expiryDate"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        maxLength={5}
                        className={errors.expiryDate ? "inputError" : ""}
                        {...register("expiryDate", {
                          required: "Expiry date is required",
                          validate: validateExpiryDate,
                        })}
                        onInput={formatExpiryDate}
                      />
                      {errors.expiryDate && (
                        <span className="vacationBilling__error">
                          {errors.expiryDate.message}
                        </span>
                      )}
                    </div>

                    <div className="vacationBilling__field">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        id="cvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        maxLength={4}
                        className={errors.cvv ? "inputError" : ""}
                        {...register("cvv", {
                          required: "CVV is required",
                          pattern: {
                            value: /^\d{3,4}$/,
                            message: "Enter a valid 3 or 4-digit CVV",
                          },
                        })}
                      />
                      {errors.cvv && (
                        <span className="vacationBilling__error">
                          {errors.cvv.message}
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <div className="vacationBilling__security">
                  <span>🔒</span>
                  <p>Your information is encrypted and securely transmitted.</p>
                </div>

                <button
                  className="vacationBilling__submit"
                  type="submit"
                  disabled={isSubmitting || loading || isPaymentRedirecting}
                >
                  {isPaymentRedirecting
                    ? "Redirecting..."
                    : isSubmitting || loading
                      ? "Processing..."
                      : "Confirm and Pay"}
                </button>
              </form>
              <aside className="vacationBilling__bookingSummary">
                <section className="vacationBilling__stayCard">
                  {property.image ? (
                    <img
                      className="vacationBilling__stayImage"
                      src={property.image}
                      alt={property.name || "Selected resort"}
                    />
                  ) : (
                    <div className="vacationBilling__stayImageFallback">
                      Resort image unavailable
                    </div>
                  )}

                  <div className="vacationBilling__stayContent">
                    <div className="vacationBilling__propertyTitleRow">
                      <h2>{property.name || "Selected Resort"}</h2>

                      {bookingData?.starRating && (
                        <span className="vacationBilling__starRating">
                          ★ {bookingData.starRating}
                        </span>
                      )}
                    </div>

                    <p className="vacationBilling__roomType">
                      {formattedRoomType}
                    </p>

                    <div className="vacationBilling__stayDates">
                      <strong>Check In - Check Out</strong>

                      <span>
                        {formattedStartDate} - {formattedEndDate}
                      </span>

                      {(bookingData?.startTime || bookingData?.endTime) && (
                        <small>
                          {bookingData?.startTime || "--"} -{" "}
                          {bookingData?.endTime || "--"}
                        </small>
                      )}
                    </div>

                    {propertyAddress && (
                      <p className="vacationBilling__propertyAddress">
                        {propertyAddress}
                      </p>
                    )}
                  </div>
                </section>

                <section className="vacationBilling__priceCard">
                  <span>Total Price</span>
                  <strong>{formattedPrice}</strong>
                </section>

                <section className="vacationBilling__chargesCard">
                  <h2>Additional Charges</h2>

                  <p>
                    Mandatory resort fees, local taxes, energy charges or other
                    fees, if applicable, are payable directly to the resort and
                    may change without notice.
                  </p>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VacationBilling;
