import "./App.css";
import "./components/main-form/mainform.css";
import "react-datepicker/dist/react-datepicker.css";
import "./reuseable-components/Loader/Loader.css";
import "./components/main-form/HotelForm/forms.css";
import "./components/main-form/CarRental/CarRental.css";
import "./components/main-form/Activity/Activity.css";
import "./components/main-form/Vacations/VacationForm.css";
import "swiper/css";
import "swiper/css/navigation";
import "./reuseable-components/header.css";
import "./components/HomePage/Home.css";
import "./components/FlightResultPage/FlightResultPage.css";
import "swiper/css/pagination";
import "./components/BeforeHomePage/BeforeHome.css";
import "./components/Join-Now/Join.css";
import "./components/RestPages/RestPages.css";
import "./components/PaymentPage/Checkout.css";
import "./reuseable-components/HotelLoader/HotelLoader.css";
import "./components/FlightResultPage/FlightBookingPage.css";
import "./reuseable-components/CarLoader/CarLoader.css";
import "./components/main-form/Vacations/VacationModifySearch.css";
import "leaflet/dist/leaflet.css";
import "./components/main-form/Vacations/VacationList.css";
import "./reuseable-components/VacationLoader/VacationLoader.css";
import "./components/main-form/Vacations/VacationDetail.css";
import "./reuseable-components/VacationFinalLoader/VacationFinalLoader.css";
import "./components/main-form/Vacations/VacationBilling.css";
import "./components/admin/adminDashboard/adminDash.css";
import "./components/admin/addPost/addPost.css";
import "./components/admin/loginPage/login.css";
import "./components/admin/blogDetail/blogDetail.css";
import "./components/admin/BlogPage/Blogpage.css";
import "./components/PaymentStatus/PaymentStatus.css";
import "./components/main-form/HotelForm/HotelBookingsDetails/HotelBookingsDetails.css";
import "./reuseable-components/SimpleLoader/SimpleLoader.css";
import "./components/FlightResultPage/FlightPaymentStatus/FlightPaymentStatus.css";
import "./components/main-form/CarRental/CarPayment/CarPayment.css";
import "./components/main-form/CarRental/CarBookingDetails/CarBookingDetails.css";
import "./components/main-form/Activity/ActivityPayment/ActivityPayment.css";
import "./components/FlightResultPage/FlightBookingDetails/FlightBookingDetails.css";
import "./components/main-form/Vacations/VacationPaymentStatus/VacationPaymentStatus.css";
import "./components/main-form/Activity/ActivityBookingDetails/ActivityBookingDetails.css";
import "./components/main-form/Vacations/VacationBookingDetails/VacationBookingDetails.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const Home = lazy(() => import("./components/HomePage/Home"));
const FlightResultPage = lazy(() => import("./components/FlightResultPage/FlightResultPage"));
import BeforeHome from "./components/BeforeHomePage/BeforeHome";
const Join = lazy(() => import("./components/Join-Now/Join"));
const IncludingPage = lazy(() => import("./components/RestPages/IncludingPage"));
const AboutUs = lazy(() => import("./components/RestPages/AboutUs"));
const Terms = lazy(() => import("./components/RestPages/Terms"));
const Privacy = lazy(() => import("./components/RestPages/Privacy"));
const Benefits = lazy(() => import("./components/RestPages/Benefits"));
const ProfileDetails = lazy(() => import("./components/RestPages/ProfileDetails"));
const CustomerServices = lazy(() => import("./components/RestPages/CustomerServices"));
const TravelTales = lazy(() => import("./components/RestPages/TravelTales"));
const Checkout = lazy(() => import("./components/PaymentPage/Checkout"));
const HotelResults = lazy(() => import("./components/main-form/HotelForm/HotelResults"));
const HotelDetailPage = lazy(() => import("./components/main-form/HotelForm/HotelDetailPage"));
const RefundPolicy = lazy(() => import("./components/RestPages/RefundPolicy"));
const Hotel = lazy(() => import("./components/main-form/HotelForm/Hotel"));
const MyBookings = lazy(() => import("./components/RestPages/MyBookings"));
import ProtectedRoutes from "./ProtectedRoutes";
import { lazy, Suspense, useEffect, useState } from "react";
import { newMemberDetails } from "./store/Services/AllApi";
import { useAtomValue } from "jotai";
import { tokenAtom } from "./atoms/userAtom";
const FlightBookingPage = lazy(() => import("./components/FlightResultPage/FlightBookingPage"));
const CarResults = lazy(() => import("./components/main-form/CarRental/CarResults"));
const CarBook = lazy(() => import("./components/main-form/CarRental/CarBook"));
const ActivityArea = lazy(() => import("./components/main-form/Activity/ActivityArea"));
const ActivityDetails = lazy(() => import("./components/main-form/Activity/ActivityDetails"));
const VacationList = lazy(() => import("./components/main-form/Vacations/VacationList"));
const ActivityBook = lazy(() => import("./components/main-form/Activity/ActivityBook"));
const VacationDetail = lazy(() => import("./components/main-form/Vacations/VacationDetail"));
const VacationBilling = lazy(() => import("./components/main-form/Vacations/VacationBilling"));
const AdminDash = lazy(() => import("./components/admin/adminDashboard/adminDash"));
const AddPost = lazy(() => import("./components/admin/addPost/addPost"));
const Login = lazy(() => import("./components/admin/loginPage/login"));
const BlogDetail = lazy(() => import("./components/admin/blogDetail/blogDetail"));
const BlogdetailPage = lazy(() => import("./components/admin/BlogPage/BlogdetailPage"));
import BlogProtectedRoutes from "./BlogProtectedRoutes";
const BlogPage = lazy(() => import("./components/admin/BlogPage/BlogPage"));
const PaymentStatus = lazy(() => import("./components/PaymentStatus/PaymentStatus"));
const HotelPaymentStatus = lazy(() => import("./components/main-form/HotelForm/HotelPaymentStatus/HotelPaymentStatus"));
const HotelBookingsDetails = lazy(() => import("./components/main-form/HotelForm/HotelBookingsDetails/HotelBookingsDetails"));
const FlightPaymentStatus = lazy(() => import("./components/FlightResultPage/FlightPaymentStatus/FlightPaymentStatus"));
const CarPayment = lazy(() => import("./components/main-form/CarRental/CarPayment/CarPayment"));
const CarBookingDetails = lazy(() => import("./components/main-form/CarRental/CarBookingDetails/CarBookingDetails"));
const ActivityPayment = lazy(() => import("./components/main-form/Activity/ActivityPayment/ActivityPayment"));
const FlightBookingDetails = lazy(() => import("./components/FlightResultPage/FlightBookingDetails/FlightBookingDetails"));
const VacationPaymentStatus = lazy(() => import("./components/main-form/Vacations/VacationPaymentStatus/VacationPaymentStatus"));
const ActivityBookingDetails = lazy(() => import("./components/main-form/Activity/ActivityBookingDetails/ActivityBookingDetails"));
const VacationBookingDetails = lazy(() => import("./components/main-form/Vacations/VacationBookingDetails/VacationBookingDetails"));
import Canonical from "./reuseable-components/Canonical";



function App() {
  const [personDetails, setPersonDetails] = useState("");
  const token = localStorage.getItem("accessToken");
  const storedemail = useAtomValue(tokenAtom);
  const location = useLocation();
  const [memberIdforVacation, setMemberIdForVacation] = useState("");
  useEffect(() => {
    const handleNewMemberDetails = async () => {
      const email = localStorage.getItem("Email");
      const accessToken = localStorage.getItem("accessToken");

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
        setMemberIdForVacation(res?.data?.get?.result?.id);
        localStorage.setItem(
          "personDetails",
          JSON.stringify(res?.data?.get?.result)
        );
        localStorage.setItem("tierId", res?.data?.get?.result?.tierid);
        localStorage.setItem("bookingId", res?.data?.get?.result?.id);
      } catch (error) {
        console.error("Error fetching new member details:", error);
      }
    };

    handleNewMemberDetails();
  }, [location.pathname]);

  return (
    <>
      <Canonical />

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

      <Suspense fallback={null}>
      <Routes>
        <Route path="/login-page" element={<Login />} />
        <Route path="/payment/status" element={<PaymentStatus />} />
        <Route path="/hotel-payment" element={<HotelPaymentStatus />} />
        <Route path="/flight-payment" element={<FlightPaymentStatus />} />
        <Route path="/vacation-payment" element={<VacationPaymentStatus />} />

        <Route path="/car-payment" element={<CarPayment />} />
        <Route path="/payment-redirect" element={<ActivityPayment />} />

        <Route element={<BlogProtectedRoutes />}>
          <Route path="/admin-dashboard" element={<AdminDash />} />
          <Route path="/admin-addpost" element={<AddPost />} />
          <Route path="/admin-blog-detail/:id" element={<BlogDetail />} />
        </Route>
        <Route
          path="/"
          element={token ? <Navigate to="/home" replace /> : <BeforeHome />}
        />
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
        <Route path="/blogs" element={<BlogdetailPage />} />
        <Route path="/blogs/:slug" element={<BlogPage />} />

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
          <Route path="/flight-bookingdet" element={<FlightBookingDetails />} />

          <Route path="/car-result" element={<CarResults />} />
          <Route path="/car-book" element={<CarBook />} />
          <Route path="/activities" element={<ActivityArea />} />
          <Route path="/activity-details" element={<ActivityDetails />} />
          <Route path="/activity-book" element={<ActivityBook />} />
          <Route
            path="/vacation-list"
            element={<VacationList vacationid={memberIdforVacation} />}
          />
          <Route path="/vacation-details" element={<VacationDetail />} />
          <Route path="/vacation-billing" element={<VacationBilling />} />
          <Route
            path="/hotel-booking-details"
            element={<HotelBookingsDetails />}
          />
          <Route path="/car-booking-details" element={<CarBookingDetails />} />
          <Route
            path="/vacation-booking-details"
            element={<VacationBookingDetails />}
          />
          <Route
            path="/activity-booking-details"
            element={<ActivityBookingDetails />}
          />
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
      </Suspense>
    </>
  );
}

export default App;
