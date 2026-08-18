import "./HotelLoader.css";
import { FaHotel } from "react-icons/fa";
const Loader = () => {
  return (
    <div className="hotel-loader-wrapper">
      <div className="hotel-loader">
        <div className="hotel-loader-building">
          <FaHotel className="hotel-title-icon" />
        </div>

        <div className="hotel-loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <p>Please wait...</p>
      </div>
    </div>
  );
};

export default Loader;
