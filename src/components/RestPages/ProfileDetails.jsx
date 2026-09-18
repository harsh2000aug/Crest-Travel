import React, { useEffect, useState } from "react";
import {
  FaCoins,
  FaPlaneDeparture,
  FaWallet,
  FaEdit,
  FaCheck,
} from "react-icons/fa";
import HeaderInner from "../../reuseable-components/HeaderInner";
import Footer from "../../reuseable-components/Footer";
import {
  memberTripCoins,
  newMemberDetails,
  updateDetails,
} from "../../store/Services/AllApi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../reuseable-components/Loader/Loader";

const ProfileDetails = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({});
  const [memberPlan, setMemberPlan] = useState([]);
  const [personDetails, setPersonDetails] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("personDetails")) || {};
    } catch {
      return {};
    }
  });

  const [tripCoins, setTripCoins] = useState(0);
  const [roomCoins, setRoomCoins] = useState(0);
  const [lifetimeSavings, setLifetimeSavings] = useState(0);

  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const getMemberCoins = async (memberDetails) => {
    try {
      const email = memberDetails?.email || localStorage.getItem("Email");

      if (!email) {
        console.log("Member coins API skipped:", { email });
        return;
      }

      const [tripRes, roomRes] = await Promise.all([
        memberTripCoins({
          body: {
            email,
            type: "trip",
          },
        }),
        memberTripCoins({
          body: {
            email,
            type: "room",
          },
        }),
      ]);

      const tripCoinsValue = tripRes?.data?.balance?.result?.balance ?? 0;

      const roomCoinsValue = roomRes?.data?.balance?.result?.balance ?? 0;

      setTripCoins(tripCoinsValue);
      setRoomCoins(roomCoinsValue);
    } catch (error) {
      console.error("Member coins error:", error);
      setTripCoins(0);
      setRoomCoins(0);
    }
  };

  const fetchMemberDetails = async () => {
    try {
      const email = localStorage.getItem("Email");

      if (!email) {
        return;
      }

      const profile = await newMemberDetails({
        body: {
          email,
        },
      });

      console.log("newMemberDetails response:", profile);

      const memberDetails =
        profile?.data?.get?.result ||
        profile?.data?.result ||
        profile?.data ||
        {};

      if (Object.keys(memberDetails).length > 0) {
        setProfileData(memberDetails);
        setPersonDetails(memberDetails);

        localStorage.setItem("personDetails", JSON.stringify(memberDetails));

        if (memberDetails?.email) {
          localStorage.setItem("Email", memberDetails.email);
        }

        if (memberDetails?.tierid) {
          localStorage.setItem("programid", String(memberDetails.tierid));
        }

        await getMemberCoins(memberDetails);
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      setLoading(true);

      try {
        await fetchMemberDetails();
        await fetchPlans();
      } catch (error) {
        console.error("Profile initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, []);

  const handleChoosePlan = (plan) => {
    navigate("/checkout", {
      state: {
        membershipId: plan?._id || plan?.id,
        membershipName: plan?.name,
        price: plan?.price,
        durationDays: plan?.durationDays,
        features: plan?.features,
      },
    });
  };

  // const handleEditProfile = () => {
  //   setFirstName(personDetails?.firstname || "");
  //   setLastName(personDetails?.lastname || "");
  //   setShowEditProfilePopup(true);
  // };

  const handleProfileUpdate = async () => {
    setLoading(true);

    try {
      const response = await updateDetails({
        body: {
          firstname: firstName,
          lastname: lastName,
          email: personDetails?.email,
          country: "US",
        },
      });

      if (response?.success !== false) {
        toast.success(response?.message || "Profile updated successfully");

        const profile = await newMemberDetails({
          body: {
            email: localStorage.getItem("Email"),
          },
        });

        console.log("Updated newMemberDetails response:", profile);

        const updatedProfile =
          profile?.data?.get?.result ||
          profile?.data?.result ||
          profile?.data ||
          {};

        if (Object.keys(updatedProfile).length > 0) {
          const updatedPersonDetails = {
            ...personDetails,
            ...updatedProfile,
            firstname: updatedProfile?.firstname || firstName,
            lastname: updatedProfile?.lastname || lastName,
          };

          setProfileData(updatedPersonDetails);
          setPersonDetails(updatedPersonDetails);

          localStorage.setItem(
            "personDetails",
            JSON.stringify(updatedPersonDetails),
          );

          if (updatedPersonDetails?.email) {
            localStorage.setItem("Email", updatedPersonDetails.email);
          }

          if (updatedPersonDetails?.tierid) {
            localStorage.setItem(
              "programid",
              String(updatedPersonDetails.tierid),
            );
          }

          await getMemberCoins(updatedPersonDetails);
        } else {
          const updatedPersonDetails = {
            ...personDetails,
            firstname: firstName,
            lastname: lastName,
          };

          setPersonDetails(updatedPersonDetails);

          localStorage.setItem(
            "personDetails",
            JSON.stringify(updatedPersonDetails),
          );
        }

        setShowEditProfilePopup(false);
      } else {
        toast.error(response?.message || "Unable to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="simple-hotel-loader">
          <div className="simple-hotel-loader__box">
            <div className="simple-hotel-loader__loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <h2 className="simple-hotel-loader__title">Please wait </h2>

            <p className="simple-hotel-loader__text">
              while we fetch your profile details
            </p>
          </div>
        </div>
      )}

      <HeaderInner />

      <div className="tb-gap">
        <div className="container">
          <div className="plan_details">
            <div className="his_plan">
              <div className="profile-top">
                <div className="profile-avatar">
                  {`${personDetails?.firstname?.[0] || ""}${
                    personDetails?.lastname?.[0] || ""
                  }`}
                </div>

                <div className="profile-info">
                  <h4>
                    Hi, {personDetails?.firstname} {personDetails?.lastname}
                  </h4>

                  <p>{personDetails?.status || "Active"} Member</p>
                </div>
              </div>
            </div>

            <div className="side-btns">
              <div className="upgrade_member">
                {/* <button onClick={() => setShowUpgradePopup(true)}>
                  Upgrade tier
                </button> */}
              </div>

              <div className="cancel_member">
                {profileData?.membershipType &&
                  profileData?.membershipType !== "Free" &&
                  profileData?.membershipType !== "None" && (
                    <div className="cancel_member">
                      <button onClick={() => setShowCancelPopup(true)}>
                        Cancel Membership
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card savings">
              <div className="stat-icon">
                <FaWallet />
              </div>

              <div>
                <h4>Lifetime Savings</h4>
                <h2>${lifetimeSavings}</h2>
              </div>
            </div>

            <div className="stat-card room">
              <div className="stat-icon">
                <FaCoins />
              </div>

              <div>
                <h4>Room Coins</h4>
                <h2>{roomCoins}</h2>
              </div>
            </div>

            <div className="stat-card trip">
              <div className="stat-icon">
                <FaPlaneDeparture />
              </div>

              <div>
                <h4>Trip Coins</h4>
                <h2>{tripCoins}</h2>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>Profile Information</h2>

              {/* <button className="member-badge" onClick={handleEditProfile}>
                <FaEdit /> Edit profile
              </button> */}
            </div>

            <div className="profile-grid">
              <div className="info-item">
                <label>Member ID</label>
                <span>{personDetails?.id}</span>
              </div>

              <div className="info-item">
                <label>Full Name</label>

                <span>
                  {personDetails?.firstname} {personDetails?.lastname}
                </span>
              </div>

              <div className="info-item">
                <label>Email</label>
                <span>{personDetails?.email}</span>
              </div>

              <div className="info-item">
                <label>Phone No.</label>
                <span>{personDetails?.phone}</span>
              </div>

              <div className="info-item">
                <label>Language</label>
                <span>English</span>
              </div>

              <div className="info-item">
                <label>Enrollment Date</label>

                <span>
                  {personDetails?.enrolledat
                    ? new Date(personDetails.enrolledat).toLocaleDateString(
                        "en-GB",
                      )
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2>Billing Address</h2>
            </div>

            <div className="address-box">
              <div className="address-row">
                <label>Full Name</label>

                <span>
                  {personDetails?.firstname} {personDetails?.lastname}
                </span>
              </div>

              <div className="address-row">
                <label>Address</label>

                <span>United States Of America</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUpgradePopup && (
        <div className="upgradeMembershipModalOverlay">
          <div className="upgradeMembershipModal">
            <button
              className="upgradeMembershipCloseBtn"
              onClick={() => setShowUpgradePopup(false)}
            >
              ✕
            </button>

            {profileData?.membershipType?.toLowerCase() === "prestige" ? (
              <div className="topMembershipMessage">
                <div
                  style={{
                    fontSize: "60px",
                    marginBottom: "15px",
                  }}
                >
                  👑
                </div>

                <h2>You're Already at the Top!</h2>

                <p>
                  Congratulations! You already have our highest-tier{" "}
                  <strong>Prestige Membership</strong>.
                </p>

                <p>
                  There are currently no higher membership levels available to
                  upgrade. Enjoy all the exclusive benefits included with your
                  Prestige Membership.
                </p>

                <button
                  className="tm-upgrade-btn"
                  onClick={() => setShowUpgradePopup(false)}
                >
                  Got It
                </button>
              </div>
            ) : (
              <>
                <div className="tm-section-heading">
                  <h2>Choose Your Membership</h2>

                  <p>Select the plan that best suits your travel needs.</p>
                </div>

                <div
                  className="tm-pricing-grid"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(
                      memberPlan?.length || 1,
                      3,
                    )}, 1fr)`,
                  }}
                >
                  {memberPlan?.map((itm) => (
                    <div className="tm-price-card" key={itm?._id || itm?.id}>
                      <h3>{itm?.name}</h3>

                      <h2>${itm?.price}</h2>

                      <span>Valid for {itm?.durationDays} days</span>

                      <ul className="membershipPlans__features">
                        {itm?.features?.map((feature, index) => (
                          <li key={index}>
                            <FaCheck /> {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => {
                          handleChoosePlan(itm);
                          setShowUpgradePopup(false);
                        }}
                      >
                        Choose Plan
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCancelPopup && (
        <div className="cancelMembershipOverlay">
          <div className="cancelMembershipModal">
            <button
              className="cancelMembershipClose"
              onClick={() => setShowCancelPopup(false)}
            >
              ✕
            </button>

            <div className="cancelMembershipContent">
              <h2>Cancel Membership</h2>

              <p className="cancelMembershipMessage">
                Are you sure you want to cancel your membership?
              </p>

              <div className="cancelMembershipNote">
                <strong>Important:</strong>

                <p>
                  Before cancelling your membership, please read our{" "}
                  <Link to="/refund-and-cancellation-policies" target="_blank">
                    <span>Refund and Cancellation Policies.</span>
                  </Link>{" "}
                  Depending on your subscription, you may or may not be eligible
                  for a refund. Once your membership is cancelled, some benefits
                  may be lost immediately.
                </p>
              </div>

              <div className="cancelMembershipActions">
                <button
                  className="cancelMembershipBack"
                  onClick={() => setShowCancelPopup(false)}
                >
                  Keep Membership
                </button>

                <button
                  className="cancelMembershipDelete"
                  onClick={handleCancelMembership}
                >
                  Yes, Cancel Membership
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditProfilePopup && (
        <div className="editProfileModalOverlay">
          <div className="editProfileModal">
            <button
              className="editProfileCloseBtn"
              onClick={() => setShowEditProfilePopup(false)}
            >
              ✕
            </button>

            <h2>Edit Profile</h2>

            <p>Update your profile information.</p>

            <div className="editProfileForm">
              <div className="editProfileField">
                <label>First Name</label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
              </div>

              <div className="editProfileField">
                <label>Last Name</label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <button
                className="editProfileSaveBtn"
                onClick={handleProfileUpdate}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ProfileDetails;
