import React from "react";
import { useForm } from "react-hook-form";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Footer from "../../../reuseable-components/Footer";
import "./Activity.css";
import { useSearchParams } from "react-router-dom";

const ActivityBook = () => {
  const [searchParams] = useSearchParams();

  const participantCounts = {
    adult: Math.max(Number(searchParams.get("adult")) || 0, 1),
    youth: Number(searchParams.get("youth")) || 0,
    child: Number(searchParams.get("child")) || 0,
    infant: Number(searchParams.get("infant")) || 0,
  };

  const travelers = [
    ...Array.from({ length: participantCounts.adult }, (_, index) => ({
      type: "ADULT",
      label: "Adult",
      index: index + 1,
      primary: index === 0,
    })),
    ...Array.from({ length: participantCounts.youth }, (_, index) => ({
      type: "YOUTH",
      label: "Youth",
      index: index + 1,
      primary: false,
    })),
    ...Array.from({ length: participantCounts.child }, (_, index) => ({
      type: "CHILD",
      label: "Child",
      index: index + 1,
      primary: false,
    })),
    ...Array.from({ length: participantCounts.infant }, (_, index) => ({
      type: "INFANT",
      label: "Infant",
      index: index + 1,
      primary: false,
    })),
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      travelers: travelers.map((traveler) => ({
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        ageBand: traveler.type,
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

  const handlePayment = async (formData) => {
    console.log("FORM DATA:", formData);
  };

  return (
    <div className="activity-book-page">
      <HeaderInner />

      <main className="activity-book-main">
        <div className="activity-book-container">
          <div className="activity-book-heading">
            <div>
              <span className="activity-book-eyebrow">Secure Checkout</span>

              <h1>Complete Your Booking</h1>

              <p>
                Review your activity details, enter your billing information and
                complete your payment.
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
              <section className="activity-book-card">
                <div className="activity-book-section-header">
                  <div className="activity-book-section-number">02</div>

                  <div>
                    <h2>Booking Details</h2>
                    <p>Enter the details of all travelers</p>
                  </div>
                </div>

                {travelers.map((traveler, index) => (
                  <div
                    key={`${traveler.type}-${traveler.index}`}
                    className="activity-book-traveler-box"
                  >
                    <div className="activity-book-traveler-heading">
                      <div>
                        <h3>
                          {traveler.label} {traveler.index}
                        </h3>

                        <span>{traveler.label}</span>
                      </div>

                      {traveler.primary && (
                        <span className="activity-book-primary-tag">
                          Primary Guest
                        </span>
                      )}
                    </div>

                    <div className="activity-book-form-grid">
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

                      {traveler.primary && (
                        <>
                          <div className="activity-book-field">
                            <label>Email Address *</label>

                            <input
                              type="email"
                              {...register(`travelers.${index}.email`, {
                                required: "Email is required",
                                pattern: {
                                  value:
                                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: "Please enter a valid email address",
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
                            <label>Phone Number *</label>

                            <input
                              type="tel"
                              {...register(`travelers.${index}.phone`, {
                                required: "Phone number is required",
                                pattern: {
                                  value: /^\+?[0-9\s()-]{8,20}$/,
                                  message: "Please enter a valid phone number",
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
                ))}
              </section>

              <section className="activity-book-card">
                <div className="activity-book-section-header">
                  <div className="activity-book-section-number">02</div>

                  <div>
                    <h2>Booking Details</h2>
                    <p>Enter the details of the primary traveler</p>
                  </div>
                </div>

                <div className="activity-book-traveler-box">
                  <div className="activity-book-traveler-heading">
                    <div>
                      <h3>Primary Traveler</h3>
                      <span>Adult</span>
                    </div>

                    <span className="activity-book-primary-tag">
                      Primary Guest
                    </span>
                  </div>

                  <div className="activity-book-form-grid">
                    <div className="activity-book-field activity-book-field-small">
                      <label>
                        Title <span>*</span>
                      </label>

                      <select
                        {...register("title", {
                          required: "Title is required",
                        })}
                      >
                        <option value="">Select title</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                      </select>

                      {errors.title && (
                        <span className="activity-book-error">
                          {errors.title.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>
                        First Name <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("firstName", {
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

                      {errors.firstName && (
                        <span className="activity-book-error">
                          {errors.firstName.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>
                        Last Name <span>*</span>
                      </label>

                      <input
                        type="text"
                        {...register("lastName", {
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

                      {errors.lastName && (
                        <span className="activity-book-error">
                          {errors.lastName.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>Email Address *</label>

                      <input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address",
                          },
                        })}
                      />

                      {errors.email && (
                        <span className="activity-book-error">
                          {errors.email.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>Phone Number *</label>

                      <input
                        type="tel"
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\+?[0-9\s()-]{8,20}$/,
                            message: "Please enter a valid phone number",
                          },
                        })}
                      />

                      {errors.phone && (
                        <span className="activity-book-error">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>

                    <div className="activity-book-field">
                      <label>Age Band *</label>

                      <select
                        {...register("ageBand", {
                          required: "Age band is required",
                        })}
                      >
                        <option value="">Select age band</option>
                        <option value="ADULT">Adult</option>
                        <option value="YOUTH">Youth</option>
                        <option value="CHILD">Child</option>
                        <option value="INFANT">Infant</option>
                      </select>

                      {errors.ageBand && (
                        <span className="activity-book-error">
                          {errors.ageBand.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
                    <label>Billing Name *</label>

                    <input
                      type="text"
                      {...register("billingName", {
                        required: "Billing name is required",
                        minLength: {
                          value: 2,
                          message: "Billing name must be at least 2 characters",
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
                    <label>Address Line 1 *</label>

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
                    <label>City *</label>

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
                    <label>State *</label>

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
                    <label>Country *</label>

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
                      <option value="AG">Antigua and Barbuda</option>
                      <option value="AR">Argentina</option>
                      <option value="AM">Armenia</option>
                      <option value="AU">Australia</option>
                      <option value="AT">Austria</option>
                      <option value="AZ">Azerbaijan</option>
                      <option value="BS">Bahamas</option>
                      <option value="BH">Bahrain</option>
                      <option value="BD">Bangladesh</option>
                      <option value="BB">Barbados</option>
                      <option value="BY">Belarus</option>
                      <option value="BE">Belgium</option>
                      <option value="BZ">Belize</option>
                      <option value="BJ">Benin</option>
                      <option value="BT">Bhutan</option>
                      <option value="BO">Bolivia</option>
                      <option value="BA">Bosnia and Herzegovina</option>
                      <option value="BW">Botswana</option>
                      <option value="BR">Brazil</option>
                      <option value="BN">Brunei</option>
                      <option value="BG">Bulgaria</option>
                      <option value="BF">Burkina Faso</option>
                      <option value="BI">Burundi</option>
                      <option value="CV">Cabo Verde</option>
                      <option value="KH">Cambodia</option>
                      <option value="CM">Cameroon</option>
                      <option value="CA">Canada</option>
                      <option value="CF">Central African Republic</option>
                      <option value="TD">Chad</option>
                      <option value="CL">Chile</option>
                      <option value="CN">China</option>
                      <option value="CO">Colombia</option>
                      <option value="KM">Comoros</option>
                      <option value="CG">Congo</option>
                      <option value="CD">Congo, Democratic Republic</option>
                      <option value="CR">Costa Rica</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="HR">Croatia</option>
                      <option value="CU">Cuba</option>
                      <option value="CY">Cyprus</option>
                      <option value="CZ">Czech Republic</option>
                      <option value="DK">Denmark</option>
                      <option value="DJ">Djibouti</option>
                      <option value="DM">Dominica</option>
                      <option value="DO">Dominican Republic</option>
                      <option value="EC">Ecuador</option>
                      <option value="EG">Egypt</option>
                      <option value="SV">El Salvador</option>
                      <option value="GQ">Equatorial Guinea</option>
                      <option value="ER">Eritrea</option>
                      <option value="EE">Estonia</option>
                      <option value="SZ">Eswatini</option>
                      <option value="ET">Ethiopia</option>
                      <option value="FJ">Fiji</option>
                      <option value="FI">Finland</option>
                      <option value="FR">France</option>
                      <option value="GA">Gabon</option>
                      <option value="GM">Gambia</option>
                      <option value="GE">Georgia</option>
                      <option value="DE">Germany</option>
                      <option value="GH">Ghana</option>
                      <option value="GR">Greece</option>
                      <option value="GD">Grenada</option>
                      <option value="GT">Guatemala</option>
                      <option value="GN">Guinea</option>
                      <option value="GW">Guinea-Bissau</option>
                      <option value="GY">Guyana</option>
                      <option value="HT">Haiti</option>
                      <option value="HN">Honduras</option>
                      <option value="HU">Hungary</option>
                      <option value="IS">Iceland</option>
                      <option value="IN">India</option>
                      <option value="ID">Indonesia</option>
                      <option value="IR">Iran</option>
                      <option value="IQ">Iraq</option>
                      <option value="IE">Ireland</option>
                      <option value="IL">Israel</option>
                      <option value="IT">Italy</option>
                      <option value="JM">Jamaica</option>
                      <option value="JP">Japan</option>
                      <option value="JO">Jordan</option>
                      <option value="KZ">Kazakhstan</option>
                      <option value="KE">Kenya</option>
                      <option value="KI">Kiribati</option>
                      <option value="KP">North Korea</option>
                      <option value="KR">South Korea</option>
                      <option value="KW">Kuwait</option>
                      <option value="KG">Kyrgyzstan</option>
                      <option value="LA">Laos</option>
                      <option value="LV">Latvia</option>
                      <option value="LB">Lebanon</option>
                      <option value="LS">Lesotho</option>
                      <option value="LR">Liberia</option>
                      <option value="LY">Libya</option>
                      <option value="LI">Liechtenstein</option>
                      <option value="LT">Lithuania</option>
                      <option value="LU">Luxembourg</option>
                      <option value="MG">Madagascar</option>
                      <option value="MW">Malawi</option>
                      <option value="MY">Malaysia</option>
                      <option value="MV">Maldives</option>
                      <option value="ML">Mali</option>
                      <option value="MT">Malta</option>
                      <option value="MH">Marshall Islands</option>
                      <option value="MR">Mauritania</option>
                      <option value="MU">Mauritius</option>
                      <option value="MX">Mexico</option>
                      <option value="FM">Micronesia</option>
                      <option value="MD">Moldova</option>
                      <option value="MC">Monaco</option>
                      <option value="MN">Mongolia</option>
                      <option value="ME">Montenegro</option>
                      <option value="MA">Morocco</option>
                      <option value="MZ">Mozambique</option>
                      <option value="MM">Myanmar</option>
                      <option value="NA">Namibia</option>
                      <option value="NR">Nauru</option>
                      <option value="NP">Nepal</option>
                      <option value="NL">Netherlands</option>
                      <option value="NZ">New Zealand</option>
                      <option value="NI">Nicaragua</option>
                      <option value="NE">Niger</option>
                      <option value="NG">Nigeria</option>
                      <option value="MK">North Macedonia</option>
                      <option value="NO">Norway</option>
                      <option value="OM">Oman</option>
                      <option value="PK">Pakistan</option>
                      <option value="PW">Palau</option>
                      <option value="PA">Panama</option>
                      <option value="PG">Papua New Guinea</option>
                      <option value="PY">Paraguay</option>
                      <option value="PE">Peru</option>
                      <option value="PH">Philippines</option>
                      <option value="PL">Poland</option>
                      <option value="PT">Portugal</option>
                      <option value="QA">Qatar</option>
                      <option value="RO">Romania</option>
                      <option value="RU">Russia</option>
                      <option value="RW">Rwanda</option>
                      <option value="KN">Saint Kitts and Nevis</option>
                      <option value="LC">Saint Lucia</option>
                      <option value="VC">
                        Saint Vincent and the Grenadines
                      </option>
                      <option value="WS">Samoa</option>
                      <option value="SM">San Marino</option>
                      <option value="ST">São Tomé and Príncipe</option>
                      <option value="SA">Saudi Arabia</option>
                      <option value="SN">Senegal</option>
                      <option value="RS">Serbia</option>
                      <option value="SC">Seychelles</option>
                      <option value="SL">Sierra Leone</option>
                      <option value="SG">Singapore</option>
                      <option value="SK">Slovakia</option>
                      <option value="SI">Slovenia</option>
                      <option value="SB">Solomon Islands</option>
                      <option value="SO">Somalia</option>
                      <option value="ZA">South Africa</option>
                      <option value="SS">South Sudan</option>
                      <option value="ES">Spain</option>
                      <option value="LK">Sri Lanka</option>
                      <option value="SD">Sudan</option>
                      <option value="SR">Suriname</option>
                      <option value="SE">Sweden</option>
                      <option value="CH">Switzerland</option>
                      <option value="SY">Syria</option>
                      <option value="TW">Taiwan</option>
                      <option value="TJ">Tajikistan</option>
                      <option value="TZ">Tanzania</option>
                      <option value="TH">Thailand</option>
                      <option value="TL">Timor-Leste</option>
                      <option value="TG">Togo</option>
                      <option value="TO">Tonga</option>
                      <option value="TT">Trinidad and Tobago</option>
                      <option value="TN">Tunisia</option>
                      <option value="TR">Turkey</option>
                      <option value="TM">Turkmenistan</option>
                      <option value="TV">Tuvalu</option>
                      <option value="UG">Uganda</option>
                      <option value="UA">Ukraine</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="UY">Uruguay</option>
                      <option value="UZ">Uzbekistan</option>
                      <option value="VU">Vanuatu</option>
                      <option value="VA">Vatican City</option>
                      <option value="VE">Venezuela</option>
                      <option value="VN">Vietnam</option>
                      <option value="YE">Yemen</option>
                      <option value="ZM">Zambia</option>
                      <option value="ZW">Zimbabwe</option>
                    </select>

                    {errors.country && (
                      <span className="activity-book-error">
                        {errors.country.message}
                      </span>
                    )}
                  </div>

                  <div className="activity-book-field">
                    <label>Postal Code *</label>

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
                    <label>Cardholder Name *</label>

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
                    <label>Card Number *</label>

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
                    <label>Expiry Date *</label>

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
                    <label>CVV *</label>

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
                    <div className="activity-book-static-summary-image">
                      Activity
                    </div>
                  </div>

                  <div>
                    <strong>Activity Test</strong>
                    <span>10 Sep 2026</span>
                    <span>2 Participants</span>
                  </div>
                </div>

                <div className="activity-book-summary-divider" />

                <div className="activity-book-price-row">
                  <span>Public Price</span>
                  <strong>₹246.38</strong>
                </div>

                <div className="activity-book-price-row activity-book-savings">
                  <span>You Save</span>
                  <strong>₹33.65</strong>
                </div>

                <div className="activity-book-summary-divider" />

                <div className="activity-book-total-row">
                  <div>
                    <span>Total Payable</span>
                    <small>Inclusive of applicable charges</small>
                  </div>

                  <strong>₹212.73</strong>
                </div>

                <button
                  type="submit"
                  className="activity-book-submit-btn"
                  disabled={isSubmitting}
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
                    Our support team is available to help you with your booking.
                  </p>

                  <button type="button">Contact Support</button>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ActivityBook;
