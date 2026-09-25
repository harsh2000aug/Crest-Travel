import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import "./Activity.css";
import {
  activityOrder,
  activityOrderPlace,
} from "../../../store/Services/AllApi";

const ActivityBook = () => {
  const [loading, setLoading] = useState(false);
  const [bookingQuestions, setBookingQuestions] = useState([]);

  const storedBookingData = JSON.parse(
    sessionStorage.getItem("activityBookingData") || "{}",
  );

  const activityBookingData = JSON.parse(
    sessionStorage.getItem("activityBookingData") || "{}",
  );

  const languageGuides = Array.isArray(activityBookingData?.languageGuides)
    ? activityBookingData.languageGuides
    : [];

  useEffect(() => {
    try {
      const storedActivityBookingData = JSON.parse(
        sessionStorage.getItem("activityBookingData") || "{}",
      );

      const questions = Array.isArray(
        storedActivityBookingData?.bookingQuestions,
      )
        ? storedActivityBookingData.bookingQuestions
        : [];

      setBookingQuestions(
        questions.filter((question) => question?.required === "MANDATORY"),
      );
    } catch (error) {
      console.error("Error parsing activityBookingData:", error);
      setBookingQuestions([]);
    }
  }, []);

  const getRelatedQuestions = (question, selectedAnswer) => {
    if (!question?.allowedAnswers || !selectedAnswer) {
      return [];
    }

    const selectedOption = question.allowedAnswers.find((option) => {
      const answerValue = typeof option === "object" ? option?.answer : option;

      return answerValue === selectedAnswer;
    });

    return Array.isArray(selectedOption?.relatedQuestions)
      ? selectedOption.relatedQuestions
      : [];
  };

  const hasMandatoryQuestion = (questionId) =>
    bookingQuestions.some((question) => question?.id === questionId);

  const getMandatoryQuestion = (questionId) =>
    bookingQuestions.find((question) => question?.id === questionId);

  const getBookingQuestionKey = (questionId) => {
    const keyMap = {
      FULL_NAMES_FIRST: "bookingFirstName",
      FULL_NAMES_LAST: "bookingLastName",
      AGEBAND: "bookingAgeBand",
      DATE_OF_BIRTH: "bookingDateOfBirth",
    };

    return keyMap[questionId] || `booking_${questionId}`;
  };

  const travelers = Array.isArray(storedBookingData?.guests)
    ? storedBookingData.guests
    : [];

  const getTravelerLabel = (type) => {
    if (type === "ADULT") return "Adult";
    if (type === "SENIOR") return "Senior";
    if (type === "YOUTH") return "Youth";
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
    control,
    watch,
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
        bookingFirstName: "",
        bookingLastName: "",
        bookingAgeBand: traveler.type || "",
        bookingDateOfBirth: "",
      })),

      bookingQuestions: {},

      languageGuide: "",
      arrivalTime: "",
      pickupLocation: "",
      dropoffAddress: "",
      arrivalFlightNumber: "",
      arrivalAirline: "",
      disembarkationTime: "",
      cruiseShipName: "",
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

  const bookingQuestionValues = watch("bookingQuestions");

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

  const getQuestionAnswer = (answer) => {
    if (typeof answer === "object") {
      return answer?.answer || "";
    }

    return answer || "";
  };

  const buildQuestionAnswer = (question, answer, travelerNum = null) => {
    return {
      question: question.id,
      answer: answer || "",
      travelerNum,
      unit:
        Array.isArray(question?.units) && question.units.length > 0
          ? question.units[0]
          : null,
    };
  };

  const handlePayment = async (formData) => {
    setLoading(true);

    try {
      const latestBookingData = JSON.parse(
        sessionStorage.getItem("activityBookingData") || "{}",
      );

      const selectedLanguageGuide = formData?.languageGuide
        ? JSON.parse(formData.languageGuide)
        : null;

      const updatedBookingData = {
        ...latestBookingData,
        ...(selectedLanguageGuide
          ? { languageGuide: selectedLanguageGuide }
          : {}),
      };

      sessionStorage.setItem(
        "activityBookingData",
        JSON.stringify(updatedBookingData),
      );

      const primaryTraveler =
        formData.travelers?.find((traveler) => traveler.primary) ||
        formData.travelers?.[0] ||
        {};

      const guestTypeMap = {
        ADULT: "ADULT",
        SENIOR: "ADULT",
        YOUTH: "CHILD",
        CHILD: "CHILD",
        INFANT: "INFANT",
      };

      const guests = (formData.travelers || []).map((traveler, index) => {
        const originalType =
          traveler.ageBand ||
          latestBookingData.guests?.[index]?.type ||
          "ADULT";

        const normalizedType =
          guestTypeMap[String(originalType).toUpperCase()] || "ADULT";

        return {
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
          type: normalizedType,
        };
      });

      const bookingQuestionAnswers = [];

      const bookingAgeBandMap = {
        ADULT: "ADULT",
        SENIOR: "ADULT",
        YOUTH: "CHILD",
        CHILD: "CHILD",
        INFANT: "INFANT",
      };

      (formData.travelers || []).forEach((traveler, index) => {
        const travelerNum = index + 1;

        bookingQuestions
          .filter((question) => question?.group === "PER_TRAVELER")
          .forEach((question) => {
            const fieldKey = getBookingQuestionKey(question.id);

            const originalAnswer = traveler[fieldKey] || "";

            const answer =
              question.id === "AGEBAND"
                ? bookingAgeBandMap[String(originalAnswer).toUpperCase()] ||
                  "ADULT"
                : originalAnswer;

            bookingQuestionAnswers.push(
              buildQuestionAnswer(question, answer, travelerNum),
            );
          });
      });

      const perBookingQuestions = bookingQuestions.filter(
        (question) => question?.group === "PER_BOOKING",
      );

      perBookingQuestions.forEach((question) => {
        const answer = formData?.bookingQuestions?.[question.id] || "";

        bookingQuestionAnswers.push(
          buildQuestionAnswer(question, answer, null),
        );

        const relatedQuestions = getRelatedQuestions(question, answer);

        relatedQuestions.forEach((relatedQuestion) => {
          const relatedAnswer =
            formData?.bookingQuestions?.[relatedQuestion.id] || "";

          bookingQuestionAnswers.push({
            question: relatedQuestion.id,
            answer: relatedAnswer,
            travelerNum: null,
            unit:
              Array.isArray(relatedQuestion?.units) &&
              relatedQuestion.units.length > 0
                ? relatedQuestion.units[0]
                : null,
          });
        });
      });

      if (
        bookingQuestions.some((question) => question?.id === "PICKUP_POINT") &&
        !bookingQuestionAnswers.some((item) => item.question === "PICKUP_POINT")
      ) {
        bookingQuestionAnswers.push({
          question: "PICKUP_POINT",
          answer: formData.pickupLocation || "",
          travelerNum: null,
          unit: "FREETEXT",
        });
      }

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
        gradeCode: latestBookingData?.gradeCode || "",
      };

      console.log(
        "FINAL BOOKING QUESTION ANSWERS:",
        JSON.stringify(bookingQuestionAnswers, null, 2),
      );

      console.log("FINAL REQUEST BODY:", JSON.stringify(requestBody, null, 2));

      const res = await activityOrder({
        body: requestBody,
      });

      console.log("activityOrder RESPONSE:", res);

      const itemId = res?.data?.addorder?.result?.itemid;

      if (!itemId) {
        console.log("Activity order itemId not found:", res);
        return;
      }

      const paymentResponse = await handleAnkit(
        itemId,
        formData,
        updatedBookingData,
        bookingQuestionAnswers,
      );

      console.log("Final Payment Response:", paymentResponse);
    } catch (error) {
      console.log("activityOrder ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnkit = async (
    orderId,
    formData,
    latestBookingData,
    bookingQuestionAnswers,
  ) => {
    try {
      const primaryTraveler =
        formData.travelers?.find((traveler) => traveler.primary) ||
        formData.travelers?.[0] ||
        {};

      const cardNumber = String(formData.cardNumber || "").replace(/\s/g, "");

      const expiry = String(formData.expiry || "").replace(/\D/g, "");

      const expiryMonth = expiry.slice(0, 2);
      const expiryYear = expiry.slice(2, 4);

      const paymentRemaining = Number(latestBookingData.ourPrice);

      const response = await activityOrderPlace({
        body: {
          orderid: orderId,
          success: `${window.location.origin}/payment-redirect?status=success`,
          fail: `${window.location.origin}/payment-redirect?status=fail`,
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

      if (paymentUrl) {
        const paymentRedirectData = {
          bookingDate: latestBookingData.startDate || "",

          activityCode: latestBookingData.activityCode || "",

          gradeCode:
            latestBookingData.gradeCode ||
            latestBookingData.grade?.gradeCode ||
            latestBookingData.grade_code ||
            "",

          orderId:
            response?.data?.paynow?.result?.orderId ||
            response?.data?.paynow?.result?.paymentIntentId ||
            orderId,

          startTime: latestBookingData.startTime || "",

          primaryTraveller: {
            firstName: primaryTraveler.firstName || "",

            type: (() => {
              const ageBandMap = {
                ADULT: "Adult",
                SENIOR: "Adult",
                YOUTH: "Child",
                CHILD: "Child",
                INFANT: "Infant",
              };

              const ageBand =
                primaryTraveler.ageBand || primaryTraveler.type || "ADULT";

              return ageBandMap[ageBand] || "Adult";
            })(),

            title: primaryTraveler.title || "",

            lastName: primaryTraveler.lastName || "",

            email: primaryTraveler.email || "",

            contactNo: primaryTraveler.phone || "",
          },

          ageBandCount: (formData.travelers || []).reduce((acc, traveler) => {
            const ageBand = traveler.ageBand || traveler.type;

            const ageBandMap = {
              ADULT: "ADULT",
              SENIOR: "ADULT",
              YOUTH: "CHILD",
              CHILD: "CHILD",
              INFANT: "INFANT",
            };

            const mappedAgeBand = ageBandMap[ageBand] || "ADULT";

            acc[mappedAgeBand] = (acc[mappedAgeBand] || 0) + 1;

            return acc;
          }, {}),

          bookingQuestionAnswers,

          ...(latestBookingData?.languageGuide
            ? {
                languageGuide: latestBookingData.languageGuide,
              }
            : {}),
        };

        sessionStorage.setItem(
          "activityPaymentRedirectData",
          JSON.stringify(paymentRedirectData),
        );

        console.log("Redirecting to:", paymentUrl);

        window.location.href = paymentUrl;

        return;
      }

      console.log("Payment URL not found:", response);
    } catch (error) {
      console.log("activityOrderPlace ERROR:", error);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  return (
    <>
      {loading && (
        <div className="activityDetailsUi__loading">
          <div className="activityDetailsUi__loader"></div>
          <p>Processing payment please wait...</p>
        </div>
      )}

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

                              <Controller
                                control={control}
                                name={`travelers.${index}.birthDate`}
                                rules={{
                                  required: "Birth date is required",
                                  validate: (value) =>
                                    validateBirthDate(value, traveler.type),
                                }}
                                render={({ field }) => (
                                  <DatePicker
                                    selected={
                                      field.value
                                        ? new Date(`${field.value}T00:00:00`)
                                        : null
                                    }
                                    onChange={(date) => {
                                      if (!date) {
                                        field.onChange("");
                                        return;
                                      }

                                      const year = date.getFullYear();

                                      const month = String(
                                        date.getMonth() + 1,
                                      ).padStart(2, "0");

                                      const day = String(
                                        date.getDate(),
                                      ).padStart(2, "0");

                                      field.onChange(`${year}-${month}-${day}`);
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    maxDate={new Date()}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    className="activity-book-date-picker"
                                    autoComplete="off"
                                  />
                                )}
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

                {bookingQuestions.some(
                  (question) => question?.group === "PER_TRAVELER",
                ) && (
                  <section className="activity-book-card">
                    <div className="activity-book-section-header">
                      <div>
                        <h2>Required Activity Information</h2>

                        <p>Enter the required information for all travelers</p>
                      </div>
                    </div>

                    {travelers.map((traveler, index) => {
                      const travelerNumber = getTravelerNumber(
                        traveler.type,
                        index,
                      );

                      const travelerLabel = getTravelerLabel(traveler.type);

                      return (
                        <div
                          key={`mandatory-${traveler.type}-${index}`}
                          className="activity-book-traveler-box"
                        >
                          <div className="activity-book-traveler-heading">
                            <div>
                              <h3>
                                {travelerLabel} {travelerNumber}
                              </h3>

                              <span>{travelerLabel}</span>
                            </div>
                          </div>

                          <div className="activity-book-form-grid">
                            {bookingQuestions
                              .filter(
                                (question) =>
                                  question?.group === "PER_TRAVELER" &&
                                  question?.required === "MANDATORY",
                              )
                              .map((question) => {
                                const fieldKey = getBookingQuestionKey(
                                  question.id,
                                );

                                const fieldName = `travelers.${index}.${fieldKey}`;

                                const fieldError =
                                  errors.travelers?.[index]?.[fieldKey];

                                const hasAllowedAnswers =
                                  Array.isArray(question?.allowedAnswers) &&
                                  question.allowedAnswers.length > 0;

                                if (hasAllowedAnswers) {
                                  return (
                                    <div
                                      className="activity-book-field"
                                      key={question.id}
                                    >
                                      <label>
                                        {question.label} <span>*</span>
                                      </label>

                                      <select
                                        {...register(fieldName, {
                                          required: `${question.label} is required`,
                                        })}
                                      >
                                        <option value="">
                                          Select {question.label}
                                        </option>

                                        {question.allowedAnswers.map(
                                          (answer, answerIndex) => {
                                            const answerValue =
                                              getQuestionAnswer(answer);

                                            return (
                                              <option
                                                key={`${question.id}-${answerValue}-${answerIndex}`}
                                                value={answerValue}
                                              >
                                                {answerValue}
                                              </option>
                                            );
                                          },
                                        )}
                                      </select>

                                      {fieldError && (
                                        <span className="activity-book-error">
                                          {fieldError.message}
                                        </span>
                                      )}
                                    </div>
                                  );
                                }

                                if (question.type === "DATE") {
                                  return (
                                    <div
                                      className="activity-book-field"
                                      key={question.id}
                                    >
                                      <label>
                                        {question.label} <span>*</span>
                                      </label>

                                      <Controller
                                        control={control}
                                        name={fieldName}
                                        rules={{
                                          required: `${question.label} is required`,
                                        }}
                                        render={({ field }) => (
                                          <DatePicker
                                            selected={
                                              field.value
                                                ? new Date(
                                                    `${field.value}T00:00:00`,
                                                  )
                                                : null
                                            }
                                            onChange={(date) => {
                                              if (!date) {
                                                field.onChange("");
                                                return;
                                              }

                                              const year = date.getFullYear();

                                              const month = String(
                                                date.getMonth() + 1,
                                              ).padStart(2, "0");

                                              const day = String(
                                                date.getDate(),
                                              ).padStart(2, "0");

                                              field.onChange(
                                                `${year}-${month}-${day}`,
                                              );
                                            }}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="DD/MM/YYYY"
                                            maxDate={new Date()}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            className="activity-book-date-picker"
                                            autoComplete="off"
                                          />
                                        )}
                                      />

                                      {fieldError && (
                                        <span className="activity-book-error">
                                          {fieldError.message}
                                        </span>
                                      )}
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    className="activity-book-field"
                                    key={question.id}
                                  >
                                    <label>
                                      {question.label} <span>*</span>
                                    </label>

                                    <input
                                      type="text"
                                      maxLength={
                                        question.maxLength || undefined
                                      }
                                      placeholder={question.hint || ""}
                                      {...register(fieldName, {
                                        required: `${question.label} is required`,
                                        maxLength: question.maxLength
                                          ? {
                                              value: question.maxLength,
                                              message: `Maximum ${question.maxLength} characters allowed`,
                                            }
                                          : undefined,
                                      })}
                                    />

                                    {fieldError && (
                                      <span className="activity-book-error">
                                        {fieldError.message}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                )}

                {bookingQuestions.some(
                  (question) => question?.group === "PER_BOOKING",
                ) && (
                  <section className="activity-book-card">
                    <div className="activity-book-section-header">
                      <div>
                        <h2>Booking Information</h2>

                        <p>Enter the required information for your activity</p>
                      </div>
                    </div>

                    <div className="activity-book-form-grid">
                      {bookingQuestions
                        .filter((question) => question?.group === "PER_BOOKING")
                        .map((question) => {
                          const fieldName = `bookingQuestions.${question.id}`;

                          const fieldError =
                            errors.bookingQuestions?.[question.id];

                          const selectedAnswer =
                            bookingQuestionValues?.[question.id] || "";

                          const hasAllowedAnswers =
                            Array.isArray(question?.allowedAnswers) &&
                            question.allowedAnswers.length > 0;

                          return (
                            <React.Fragment key={question.id}>
                              <div className="activity-book-field">
                                <label>
                                  {question.label}{" "}
                                  {question.required === "MANDATORY" && (
                                    <span>*</span>
                                  )}
                                </label>

                                {hasAllowedAnswers ? (
                                  <select
                                    {...register(fieldName, {
                                      required:
                                        question.required === "MANDATORY"
                                          ? `${question.label} is required`
                                          : false,
                                    })}
                                  >
                                    <option value="">
                                      Select {question.label}
                                    </option>

                                    {question.allowedAnswers.map(
                                      (answer, answerIndex) => {
                                        const answerValue =
                                          getQuestionAnswer(answer);

                                        return (
                                          <option
                                            key={`${question.id}-${answerValue}-${answerIndex}`}
                                            value={answerValue}
                                          >
                                            {answerValue}
                                          </option>
                                        );
                                      },
                                    )}
                                  </select>
                                ) : question.type === "DATE" ? (
                                  <input
                                    type="date"
                                    {...register(fieldName, {
                                      required:
                                        question.required === "MANDATORY"
                                          ? `${question.label} is required`
                                          : false,
                                    })}
                                  />
                                ) : question.type === "TIME" ? (
                                  <input
                                    type="time"
                                    {...register(fieldName, {
                                      required:
                                        question.required === "MANDATORY"
                                          ? `${question.label} is required`
                                          : false,
                                    })}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    maxLength={question.maxLength || undefined}
                                    placeholder={question.hint || ""}
                                    {...register(fieldName, {
                                      required:
                                        question.required === "MANDATORY"
                                          ? `${question.label} is required`
                                          : false,
                                    })}
                                  />
                                )}

                                {fieldError && (
                                  <span className="activity-book-error">
                                    {fieldError.message}
                                  </span>
                                )}
                              </div>

                              {selectedAnswer &&
                                getRelatedQuestions(
                                  question,
                                  selectedAnswer,
                                ).map((relatedQuestion) => {
                                  const relatedFieldName = `bookingQuestions.${relatedQuestion.id}`;

                                  const relatedFieldError =
                                    errors.bookingQuestions?.[
                                      relatedQuestion.id
                                    ];

                                  const hasRelatedAllowedAnswers =
                                    Array.isArray(
                                      relatedQuestion?.allowedAnswers,
                                    ) &&
                                    relatedQuestion.allowedAnswers.length > 0;

                                  return (
                                    <div
                                      className="activity-book-field"
                                      key={`${question.id}-${relatedQuestion.id}`}
                                    >
                                      <label>
                                        {relatedQuestion.label}{" "}
                                        {relatedQuestion.required ===
                                          "CONDITIONAL" && <span>*</span>}
                                      </label>

                                      {hasRelatedAllowedAnswers ? (
                                        <select
                                          {...register(relatedFieldName, {
                                            required:
                                              relatedQuestion.required ===
                                              "CONDITIONAL"
                                                ? `${relatedQuestion.label} is required`
                                                : false,
                                          })}
                                        >
                                          <option value="">
                                            Select {relatedQuestion.label}
                                          </option>

                                          {relatedQuestion.allowedAnswers.map(
                                            (answer, answerIndex) => {
                                              const answerValue =
                                                getQuestionAnswer(answer);

                                              return (
                                                <option
                                                  key={`${relatedQuestion.id}-${answerValue}-${answerIndex}`}
                                                  value={answerValue}
                                                >
                                                  {answerValue}
                                                </option>
                                              );
                                            },
                                          )}
                                        </select>
                                      ) : relatedQuestion.type === "DATE" ? (
                                        <input
                                          type="date"
                                          {...register(relatedFieldName, {
                                            required:
                                              relatedQuestion.required ===
                                              "CONDITIONAL"
                                                ? `${relatedQuestion.label} is required`
                                                : false,
                                          })}
                                        />
                                      ) : relatedQuestion.type === "TIME" ? (
                                        <input
                                          type="time"
                                          {...register(relatedFieldName, {
                                            required:
                                              relatedQuestion.required ===
                                              "CONDITIONAL"
                                                ? `${relatedQuestion.label} is required`
                                                : false,
                                          })}
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          maxLength={
                                            relatedQuestion.maxLength ||
                                            undefined
                                          }
                                          placeholder={
                                            relatedQuestion.hint || ""
                                          }
                                          {...register(relatedFieldName, {
                                            required:
                                              relatedQuestion.required ===
                                              "CONDITIONAL"
                                                ? `${relatedQuestion.label} is required`
                                                : false,
                                          })}
                                        />
                                      )}

                                      {relatedFieldError && (
                                        <span className="activity-book-error">
                                          {relatedFieldError.message}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                            </React.Fragment>
                          );
                        })}
                    </div>
                  </section>
                )}

                {bookingQuestions.some(
                  (question) =>
                    question?.id === "PICKUP_POINT" &&
                    (!Array.isArray(question?.allowedAnswers) ||
                      question.allowedAnswers.length === 0),
                ) && (
                  <section className="activity-book-card">
                    <div className="activity-book-section-header">
                      <div>
                        <h2>Pickup Details</h2>

                        <p>Enter your pickup location</p>
                      </div>
                    </div>

                    <div className="activity-book-field">
                      <label>
                        Pickup Location <span>*</span>
                      </label>

                      <input
                        type="text"
                        placeholder="Enter pickup location"
                        {...register("pickupLocation", {
                          required: "Pickup location is required",
                        })}
                      />

                      {errors.pickupLocation && (
                        <span className="activity-book-error">
                          {errors.pickupLocation.message}
                        </span>
                      )}
                    </div>
                  </section>
                )}

                {languageGuides.length > 0 && (
                  <section className="activity-book-card">
                    <div className="activity-book-language-selection">
                      <div className="activity-book-field">
                        <label>
                          Your Language <span>*</span>
                        </label>

                        <select
                          {...register("languageGuide", {
                            required: "Please select a language",
                          })}
                        >
                          <option value="">Select language</option>

                          {languageGuides.map((guide, index) => {
                            const languageNames = {
                              en: "English",
                              hi: "Hindi",
                              mr: "Marathi",
                              fr: "French",
                              de: "German",
                              es: "Spanish",
                              it: "Italian",
                              ru: "Russian",
                              ja: "Japanese",
                            };

                            const languageName =
                              languageNames[guide?.language] ||
                              guide?.language ||
                              "Unknown";

                            return (
                              <option
                                key={`${guide?.language}-${guide?.type}-${index}`}
                                value={JSON.stringify(guide)}
                              >
                                {languageName} - {guide?.type}
                              </option>
                            );
                          })}
                        </select>

                        {errors.languageGuide && (
                          <span className="activity-book-error">
                            {errors.languageGuide.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                <section className="activity-book-card">
                  <div className="activity-book-section-header">
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
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="SG">Singapore</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option>
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
                    <div>
                      <h2>Card Details</h2>

                      <p>Enter your card details to complete payment</p>
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
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(
                              /[^A-Za-zÀ-ÿ\s'-]/g,
                              "",
                            );
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
                      <strong>{storedBookingData.name}</strong>

                      <span>{storedBookingData.startDate}</span>

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
                        ? `$${String(storedBookingData.publicPrice).replace(
                            /^₹\s*/,
                            "",
                          )}`
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
                        ? `$${String(storedBookingData.payable).replace(
                            /^₹\s*/,
                            "",
                          )}`
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
