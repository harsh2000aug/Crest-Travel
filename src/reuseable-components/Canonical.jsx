import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.cresttravelclub.com";

const Canonical = () => {
  const location = useLocation();

  let pathname = location.pathname;

  // Remove trailing slash except homepage
  if (pathname !== "/") {
    pathname = pathname.replace(/\/+$/, "");
  }

  const canonicalUrl = `${SITE_URL}${pathname}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default Canonical;
