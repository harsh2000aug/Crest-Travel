import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Home from "./components/HomePage/Home";
import FlightResultPage from "./components/FlightResultPage/FlightResultPage";
import BeforeHome from "./components/BeforeHomePage/BeforeHome";
import Join from "./components/Join-Now/Join";
import IncludingPage from "./components/RestPages/IncludingPage";
import AboutUs from "./components/RestPages/AboutUs";
import Terms from "./components/RestPages/Terms";
import Privacy from "./components/RestPages/Privacy";
import Benefits from "./components/RestPages/Benefits";
import ProfileDetails from "./components/RestPages/ProfileDetails";
import CustomerServices from "./components/RestPages/CustomerServices";
import TravelTales from "./components/RestPages/TravelTales";
import Checkout from "./components/PaymentPage/Checkout";
import HotelResults from "./components/main-form/HotelForm/HotelResults";
import HotelDetailPage from "./components/main-form/HotelForm/HotelDetailPage";
import RefundPolicy from "./components/RestPages/RefundPolicy";
import Hotel from "./components/main-form/HotelForm/Hotel";
import MyBookings from "./components/RestPages/MyBookings";
import ProtectedRoutes from "./ProtectedRoutes";
import { useEffect, useState } from "react";
import { newMemberDetails } from "./store/Services/AllApi";
import { useAtomValue } from "jotai";
import { tokenAtom } from "./atoms/userAtom";
import FlightBookingPage from "./components/FlightResultPage/FlightBookingPage";
import CarResults from "./components/main-form/CarRental/CarResults";
import CarBook from "./components/main-form/CarRental/CarBook";
import ActivityArea from "./components/main-form/Activity/ActivityArea";
import ActivityDetails from "./components/main-form/Activity/ActivityDetails";
import VacationList from "./components/main-form/Vacations/VacationList";
import ActivityBook from "./components/main-form/Activity/ActivityBook";
import VacationDetail from "./components/main-form/Vacations/VacationDetail";
import VacationBilling from "./components/main-form/Vacations/VacationBilling";
import AdminDash from "./components/admin/adminDashboard/adminDash";
import AddPost from "./components/admin/addPost/addPost";
import Login from "./components/admin/loginPage/login";

function App() {
  const [personDetails, setPersonDetails] = useState("");
  const token = localStorage.getItem("accessToken");
  const storedemail = useAtomValue(tokenAtom);
  const location = useLocation();

  useEffect(() => {
    const handleNewMemberDetails = async () => {
      const email = localStorage.getItem("Email");
      const accessToken = localStorage.getItem("accessToken");

      // Don't call API if user is not logged in
      if (!email || !accessToken) {
        return;
      }

      try {
        const res = await newMemberDetails({
          body: {
            email: email,
          },
        });

        setPersonDetails(res?.data?.get?.result);
        localStorage.setItem(
          "personDetails",
          JSON.stringify(res?.data?.get?.result)
        );
      } catch (error) {
        console.error("Error fetching new member details:", error);
      }
    };

    handleNewMemberDetails();
  }, [location.pathname]);
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/home" replace /> : <BeforeHome />}
        />

        <Route path="/login-page" element={<Login />} />
        <Route path="/admin-addPost" element={<AddPost />} />
        <Route path="/admin-dash" element={<AdminDash />} />
        <Route path="/whats-included" element={<IncludingPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/join-now" element={<Join />} />
        <Route path="/terms-and-conditions" element={<Terms />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route
          path="/refund-and-cancellation-policies"
          element={<RefundPolicy />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/customer-service" element={<CustomerServices />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<Home />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile-details" element={<ProfileDetails />} />
          <Route path="/travel-tales" element={<TravelTales />} />
          <Route path="/hotel-results" element={<HotelResults />} />
          <Route path="/hotel-details" element={<HotelDetailPage />} />
          <Route path="/hotel" element={<Hotel />} />
          <Route path="/flight-result" element={<FlightResultPage />} />
          <Route path="/flight-booking" element={<FlightBookingPage />} />
          <Route path="/car-result" element={<CarResults />} />
          <Route path="/car-book" element={<CarBook />} />
          <Route path="/activities" element={<ActivityArea />} />
          <Route path="/activity-details" element={<ActivityDetails />} />
          <Route path="/activity-book" element={<ActivityBook />} />
          <Route path="/vacation-list" element={<VacationList />} />
          <Route path="/vacation-details" element={<VacationDetail />} />
          <Route path="/vacation-billing" element={<VacationBilling />} />
        </Route>

        <Route
          path="*"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
