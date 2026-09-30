import React, { useEffect } from "react";
import Header from "../../../reuseable-components/Header";
import Footer from "../../../reuseable-components/Footer";
import HeaderInner from "../../../reuseable-components/HeaderInner";

const Signature = () => {
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

export default Signature;
