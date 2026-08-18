import React, { useEffect, useState } from "react";
import Header from "../../reuseable-components/Header";
import Footer from "../../reuseable-components/Footer";
import "./Checkout.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Loader from "../../reuseable-components/Loader/Loader";
import {
  checkoutDetails,
  memberProfile,
  memberSignup,
} from "../../store/Services/AllApi";
import { Country, State } from "country-state-city";
import { toast } from "react-toastify";
import HeaderInner from "../../reuseable-components/HeaderInner";
const Checkout = () => {
  const navigate = useNavigate();
  const API_LOGIN_ID = "376nNNvw";
  const CLIENT_KEY =
    "6g272UfSzNs9z6nU7t49wf62Sn8cFSqTC2UL4PmR9M65RFJd975YBH53awCFh3ts";
  const location = useLocation();
  const [loadingState, setLoadingState] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const membership = location.state || {
    membershipId: "",
    membershipName: "",
    price: 0,
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const selectedCountry = watch("country");

  const handleSignUp = async (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      country: data.country,
      state: data.state,
      city: data.city,
    };

    try {
      const res = await memberSignup({
        body: payload,
      });

      localStorage.setItem("accessToken", res.token);
      localStorage.setItem("firstName", res.data.firstName);
      localStorage.setItem("lastName", res.data.lastName);
      localStorage.setItem("userFinal", res.data._id);
      toast.success(res.message);

      return res;
    } catch (error) {
      toast.error("Email or Phone already exists");
      throw error;
    }
  };

  const onSubmit = async (data) => {
    setLoadingState(true);
    let memberId = localStorage.getItem("userFinal");
    if (!localStorage.getItem("accessToken")) {
      try {
        const signupRes = await handleSignUp(data);
        memberId = signupRes.data._id;
      } catch (error) {
        setLoadingState(false);
        return;
      }
    }

    try {
      const [month, year] = data.expiryDate.split("/");

      const secureData = {
        authData: {
          clientKey: CLIENT_KEY,
          apiLoginID: API_LOGIN_ID,
        },
        cardData: {
          cardNumber: data.cardNumber.replace(/\s/g, ""),
          month: month.trim(),
          year: `20${year.trim()}`,
          cardCode: data.cvv,
        },
      };

      window.Accept.dispatchData(secureData, async (response) => {
        console.log("FULL RESPONSE", response);

        if (response.messages.resultCode === "Error") {
          setLoadingState(false);

          setFailureMessage(
            response.messages.message?.map((msg) => msg.text).join("\n") ||
              "Card validation failed.",
          );

          setShowFailurePopup(true);
          return;
        }

        console.log("TOKEN CREATED SUCCESSFULLY");

        const { dataDescriptor, dataValue } = response.opaqueData;

        try {
          const res = await checkoutDetails({
            body: {
              amount: membership.price,
              dataDescriptor,
              dataValue,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password,
              phone: data.phone,
              address: data.address,
              city: data.city,
              state: data.state,
              country: data.country,
              zipCode: data.zipCode,
              promoCode: data.promoCode,
              membershipId: membership.membershipId,
              membershipName: membership.membershipName,
              memberId: memberId,
            },
          });
          console.log("Checkout Response:", res);
          if (!res?.success) {
            setLoadingState(false);
            setFailureMessage(
              res?.message || "Payment could not be completed.",
            );
            setShowFailurePopup(true);
            return;
          }
          setLoadingState(false);
          setShowSuccessPopup(true);

          let timer = 5;
          setCountdown(timer);

          const interval = setInterval(() => {
            timer--;
            setCountdown(timer);

            if (timer === 0) {
              clearInterval(interval);
              navigate("/home");
            }
          }, 1000);
        } catch (error) {
          console.log("Checkout API Error:", error);
          setLoadingState(false);
          setFailureMessage(
            error?.data?.message ||
              error?.data?.error ||
              error?.message ||
              "Payment could not be completed.",
          );
          setShowFailurePopup(true);
        }
      });
    } catch (error) {
      console.log("Outer Error:", error);
      setLoadingState(false);
      setFailureMessage("Something went wrong.");
      setShowFailurePopup(true);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await memberProfile({});

        if (response?.success) {
          const profile = response.data;

          reset({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || "",
            phone: profile.phone || "",
            country: profile.country || "",
            state: profile.state || "",
            city: profile.city || "",

            address: "",
            zipCode: "",
            password: "",
            promoCode: "",
            cardNumber: "",
            cvv: "",
            expiryDate: "",
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfileData();
  }, [reset]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <>
      {loadingState && <Loader />}
      {showSuccessPopup && (
        <div className="payment-success-overlay">
          <div className="payment-success-popup">
            <div className="payment-success-check">✓</div>
            <h2>Transaction Successful!</h2>
            <p>Congratulations 🎉</p>
            <p className="payment-success-message">
              Your membership has been activated successfully.
            </p>
            <p className="payment-success-redirect">
              Redirecting to Home Page in
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
            <p>{failureMessage}</p>
            <button onClick={() => setShowFailurePopup(false)}>
              Try Again
            </button>
          </div>
        </div>
      )}

      <section className="itc-membership-page">
        {isLoggedIn ? <HeaderInner /> : <Header />}
        <div className="itc-container">
          <div className="itc-page-header">
            <h1>Become a member</h1>
            <p>
              Unlock exclusive travel deals, luxury stays, member-only rewards,
              and premium travel experiences.
            </p>
          </div>
          <div className="itc-membership-wrapper">
            <form id="membershipForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="itc-form-section">
                <div className="itc-card">
                  <h3>Account Information</h3>

                  <div className="itc-grid">
                    <div className="itc-input-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        placeholder="John"
                        readOnly={isLoggedIn}
                        {...register("firstName", {
                          required: "First Name is required",
                        })}
                      />
                      {errors.firstName && <p>{errors.firstName.message}</p>}
                    </div>

                    <div className="itc-input-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        readOnly={isLoggedIn}
                        {...register("lastName", {
                          required: "Last Name is required",
                        })}
                      />
                      {errors.lastName && <p>{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="itc-input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      readOnly={isLoggedIn}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                          message: "Enter a valid email address",
                        },
                      })}
                    />

                    {errors.email && <p>{errors.email.message}</p>}
                  </div>
                  {!localStorage.getItem("accessToken") && (
                    <div className="itc-input-group">
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder="********"
                        {...register("password", {
                          required: "Password is required",
                          pattern: {
                            value:
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                            message:
                              "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.",
                          },
                        })}
                      />

                      {errors.password && <p>{errors.password.message}</p>}
                    </div>
                  )}

                  <div className="itc-input-group">
                    <label>Phone Number</label>

                    <div className="phone-input-wrapper">
                      <select
                        disabled={isLoggedIn}
                        className="country-code"
                        defaultValue="91"
                        {...register("phoneCode")}
                      >
                        {Country.getAllCountries().map((country) => (
                          <option
                            key={country.isoCode}
                            value={country.phonecode}
                          >
                            {country.flag} {country.name} (+{country.phonecode})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        readOnly={isLoggedIn}
                        placeholder="Phone Number"
                        maxLength={15}
                        {...register("phone", {
                          required: "Phone number is required",
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, "");
                          },
                        })}
                      />
                    </div>

                    {errors.phone && <p>{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="itc-card">
                  <h3>Promo Code</h3>

                  <div className="itc-coupon-row">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      {...register("promoCode")}
                    />
                    <button type="button">Apply</button>
                  </div>
                </div>

                <div className="itc-card">
                  <h3>Payment Details</h3>

                  <div className="itc-card-icons">
                    <span>💳 Visa</span>
                    <span>💳 Mastercard</span>
                    <span>💳 Amex</span>
                  </div>

                  <div className="itc-input-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      {...register("cardNumber", {
                        required: "Card Number is required",
                        pattern: {
                          value: /^[0-9]{13,19}$/,
                          message:
                            "Card number must be between 13 and 19 digits",
                        },
                        onChange: (e) => {
                          e.target.value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 19);
                        },
                      })}
                    />
                    {errors.cardNumber && <p>{errors.cardNumber.message}</p>}
                  </div>

                  <div className="itc-grid">
                    <div className="itc-input-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength={4}
                        {...register("cvv", {
                          required: "CVV is required",
                          pattern: {
                            value: /^[0-9]{3,4}$/,
                            message: "CVV must be 3 or 4 digits",
                          },
                          onChange: (e) => {
                            e.target.value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                          },
                        })}
                      />
                      {errors.cvv && <p>{errors.cvv.message}</p>}
                    </div>

                    <div className="itc-input-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        {...register("expiryDate", {
                          required: "Expiry Date is required",
                          pattern: {
                            value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                            message: "Enter a valid expiry date (MM/YY)",
                          },
                          onChange: (e) => {
                            let value = e.target.value.replace(/\D/g, "");

                            if (value.length >= 2) {
                              let month = parseInt(value.substring(0, 2), 10);

                              if (month > 12) {
                                value = "12" + value.substring(2);
                              } else if (month === 0) {
                                value = "01" + value.substring(2);
                              }
                            }

                            if (value.length > 2) {
                              value =
                                value.substring(0, 2) +
                                "/" +
                                value.substring(2, 4);
                            }

                            e.target.value = value;
                          },
                        })}
                      />
                      {errors.expiryDate && <p>{errors.expiryDate.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="itc-card">
                  <h3>Billing Address</h3>

                  <div className="itc-input-group">
                    <label>Address</label>
                    <input
                      type="text"
                      placeholder="Street Address"
                      {...register("address", {
                        required: "Address is required",
                      })}
                    />
                    {errors.address && <p>{errors.address.message}</p>}
                  </div>

                  <div className="itc-grid">
                    <div className="itc-input-group">
                      <label>City</label>
                      <input
                        type="text"
                        placeholder="City"
                        {...register("city", {
                          required: "City is required",
                        })}
                      />
                      {errors.city && <p>{errors.city.message}</p>}
                    </div>

                    <div className="itc-input-group">
                      <label>Zip Code</label>
                      <input
                        type="text"
                        placeholder="Zip Code"
                        {...register("zipCode", {
                          required: "Zip Code is required",
                        })}
                      />
                      {errors.zipCode && <p>{errors.zipCode.message}</p>}
                    </div>
                  </div>

                  <div className="itc-grid">
                    <div className="itc-input-group">
                      <label>Country</label>
                      <select
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

                      {errors.country && <p>{errors.country.message}</p>}
                    </div>

                    <div className="itc-input-group">
                      <label>State</label>
                      <select
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

                      {errors.state && <p>{errors.state.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <div className="itc-summary-section">
              <div className="itc-summary-card">
                <h2>{membership.membershipName}</h2>

                <div className="itc-price">
                  <span>${membership.price}</span>/month
                </div>

                <div className="itc-summary-terms">
                  <label className="itc-checkbox">
                    <input
                      type="checkbox"
                      {...register("acceptTerms", {
                        required:
                          "Please accept the Terms & Conditions and Privacy Policy.",
                      })}
                    />
                    <span>
                      I agree to the{" "}
                      <Link to="/terms-and-conditions" target="_blank">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy-policy" target="_blank">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {errors.acceptTerms && (
                    <p className="itc-error">{errors.acceptTerms.message}</p>
                  )}

                  <label className="itc-checkbox">
                    <input
                      type="checkbox"
                      {...register("acceptRefundPolicy", {
                        required: "Please accept the Refund Policy.",
                      })}
                    />
                    <span>
                      I agree to the{" "}
                      <Link
                        to="/refund-and-cancellation-policies"
                        target="_blank"
                      >
                        Refund & Cancellation Policy
                      </Link>
                    </span>
                  </label>

                  {errors.acceptRefundPolicy && (
                    <p className="itc-error">
                      {errors.acceptRefundPolicy.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  form="membershipForm"
                  className="itc-join-btn"
                >
                  Complete Membership
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Checkout;
