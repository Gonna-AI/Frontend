import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const HreflangTags = () => {
  const location = useLocation();

  useEffect(() => {
    const hostname = "https://clerktree.com";
    // Remove trailing slash if present (except for root)
    const path =
      location.pathname === "/" ? "" : location.pathname.replace(/\/$/, "");

    // Base URL without query params for English (default)
    const baseUrl = `${hostname}${path}`;

    // Define language variants
    const variants = [
      { lang: "en", href: baseUrl }, // English is default URL
      { lang: "de", href: `${baseUrl}?lang=de` }, // German uses query param
      { lang: "x-default", href: baseUrl }, // Default fallback
    ];

    // Helper to update/create link tag
    const updateLinkTag = (hreflang: string, href: string) => {
      let link = document.querySelector(
        `link[rel="alternate"][hreflang="${hreflang}"]`,
      );
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    variants.forEach((variant) => {
      updateLinkTag(variant.lang, variant.href);
    });
  }, [location]);

  return null;
};

export default HreflangTags;
