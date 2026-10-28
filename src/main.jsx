import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import DefaultTitle from "./reuseable-components/DefaultTitle";

// React takes ownership of both the page metadata and the default title.
document.querySelectorAll("[data-prerender-head], title[data-default-title]").forEach((node) => node.remove());

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <HelmetProvider>
      <DefaultTitle />
      <App />
    </HelmetProvider>
  </BrowserRouter>
);
