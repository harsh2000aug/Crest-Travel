import React, { useEffect } from "react";
import HeaderInner from "../../../reuseable-components/HeaderInner";
import Header from "../../../reuseable-components/Header";
import "./AllMembershipPlans.css";
import Footer from "../../../reuseable-components/Footer";
const Elite = () => {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  return (
    <div>
      {isLoggedIn ? <HeaderInner /> : <Header />}
      <Footer />
    </div>
  );
};

export default Elite;
