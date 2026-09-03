import React, { useEffect, useState } from "react";
import Header from "../../reuseable-components/Header";
import Footer from "../../reuseable-components/Footer";
import "./Checkout.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Country, State } from "country-state-city";
import { toast } from "react-toastify";
import HeaderInner from "../../reuseable-components/HeaderInner";

const Checkout = () => {
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const membership = location.state || {
    membershipId: "",
    membershipName: "",
    price: 0,
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const selectedCountry = watch("country");

  const handleCheckout = async (formData) => {
    try {
      setLoading(true);

      const formattedDateOfBirth = formData.dateOfBirth
        ? formData.dateOfBirth.toISOString().split("T")[0]
        : "";

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password || "",
        gender: formData.gender,
        dateOfBirth: formattedDateOfBirth,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        postalcode: formData.zipCode,
        address1: formData.address,
        address2: "",
        productId: Number(membership.membershipId),
      };

      console.log("Membership Order Payload:", payload);

      const response = await fetch(
        "https://backendcms.cresttravelclub.com/index.php?rest_route=%2Fcrest%2Fv1%2Fcreate-membership-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      console.log("Membership Order Response:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create membership order");
      }

      const checkoutUrl = data?.checkoutUrl;
      const orderId = data?.orderId;
      const orderKey = data?.orderKey;

      console.log("Checkout URL:", checkoutUrl);
      console.log("Order ID:", orderId);
      console.log("Order Key:", orderKey);

      if (!checkoutUrl) {
        throw new Error("Checkout URL not received from server");
      }

      if (!orderId || !orderKey) {
        throw new Error("Order ID or Order Key not received from server");
      }

      // Save payment/order information before leaving your website
      localStorage.setItem("membershipOrderId", String(orderId));
      localStorage.setItem("membershipOrderKey", orderKey);

      // Optional: save the status URL as well
      if (data?.statusUrl) {
        localStorage.setItem("membershipStatusUrl", data.statusUrl);
      }

      // Redirect to WooCommerce payment page
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Membership Order Error:", error);

      toast.error(
        error?.message ||
          "Something went wrong while creating membership order.",
      );
    } finally {
      setLoading(false);
    }
  };

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
      {loading && (
        <div className="proceed-payment-overlay">
          <div className="proceed-payment-popup">
            <div className="proceed-payment-loader">
              <div className="proceed-payment-spinner"></div>
            </div>

            <div className="proceed-payment-content">
              <div className="proceed-payment-title">Proceeding to Payment</div>

              <div className="proceed-payment-message">
                Please wait while we securely redirect you to the payment page.
              </div>

              <div className="proceed-payment-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
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
            <form id="membershipForm" onSubmit={handleSubmit(handleCheckout)}>
              <div className="itc-form-section">
                {/* ACCOUNT INFORMATION */}
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

                  <div className="itc-grid">
                    {/* GENDER */}
                    <div className="itc-input-group">
                      <label>Gender</label>

                      <select
                        disabled={isLoggedIn}
                        {...register("gender", {
                          required: "Gender is required",
                          validate: (value) =>
                            ["Male", "Female", "Other"].includes(value) ||
                            "Please select a valid gender",
                        })}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>

                      {errors.gender && <p>{errors.gender.message}</p>}
                    </div>

                    {/* DATE OF BIRTH */}
                    <div className="itc-input-group">
                      <label>Date of Birth</label>

                      <Controller
                        name="dateOfBirth"
                        control={control}
                        rules={{
                          required: "Date of Birth is required",
                          validate: (value) => {
                            if (!value) return "Date of Birth is required";

                            const today = new Date();

                            let age = today.getFullYear() - value.getFullYear();
                            const monthDifference =
                              today.getMonth() - value.getMonth();

                            if (
                              monthDifference < 0 ||
                              (monthDifference === 0 &&
                                today.getDate() < value.getDate())
                            ) {
                              age--;
                            }

                            if (age < 18) {
                              return "You must be at least 18 years old";
                            }

                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            onChange={(date) => field.onChange(date)}
                            onBlur={field.onBlur}
                            placeholderText="Select Date of Birth"
                            dateFormat="dd/MM/yyyy"
                            maxDate={new Date()}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            disabled={isLoggedIn}
                            className="itc-date-picker"
                          />
                        )}
                      />

                      {errors.dateOfBirth && (
                        <p>{errors.dateOfBirth.message}</p>
                      )}
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

                  {!isLoggedIn && (
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
                            {country.flag} {country.name} (+
                            {country.phonecode})
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

                {/* PROMO CODE */}
                {/* <div className="itc-card">
                  <h3>Promo Code</h3>

                  <div className="itc-coupon-row">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      {...register("promoCode")}
                    />

                    <button type="button">Apply</button>
                  </div>
                </div> */}

                {/* BILLING ADDRESS */}
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

            {/* SUMMARY */}
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
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Proceed to checkout"}
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
