import { useLayoutEffect, useState } from "react";

// Keep ownership of the fallback in React, just like Helmet's page titles.
const DefaultTitle = () => {
  const [showDefault, setShowDefault] = useState(true);

  useLayoutEffect(() => {
    const syncTitle = () => {
      setShowDefault(!document.head.querySelector("title:not([data-default-title])"));
    };
    const observer = new MutationObserver(syncTitle);
    observer.observe(document.head, { childList: true, subtree: true });
    syncTitle();
    return () => observer.disconnect();
  }, []);

  return showDefault ? <title data-default-title="">Crest Travel Club</title> : null;
};

export default DefaultTitle;
