import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.cresttravelclub.com";

// Article routes supply their own CMS schema in BlogPage.
const PUBLIC_PAGE_NAMES = {
  "/": "Travel Club Membership and Discounts",
  "/about-us": "About Crest Travel Club",
  "/whats-included": "Membership Benefits",
  "/join-now": "Membership Plans and Pricing",
  "/customer-service": "Customer Service",
  "/terms-and-conditions": "Terms and Conditions",
  "/privacy-policy": "Privacy Policy",
  "/refund-and-cancellation-policies": "Refund and Cancellation Policies",
  "/blogs": "Travel Blog",
  "/signature-membership": "Signature Membership",
  "/elite-membership": "Elite Membership",
  "/prestige-membership": "Prestige Membership",
};

const Canonical = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const canonicalUrl = SITE_URL + normalizedPath;
  const pageName = PUBLIC_PAGE_NAMES[normalizedPath];
  const pageSchema = pageName
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": canonicalUrl + "#webpage",
        url: canonicalUrl,
        name: pageName,
      }).replace(/</g, "\\u003c")
    : null;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      {pageSchema && (
        <script id="page-schema" type="application/ld+json">
          {pageSchema}
        </script>
      )}
    </Helmet>
  );
};

export default Canonical;
