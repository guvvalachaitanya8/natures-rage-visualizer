import { useEffect } from "react";

interface HelmetProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  ogUrl?: string;
  ogImage?: string;
}

export default function Helmet({
  title,
  description,
  keywords = "natural disaster, simulator, planetary sciences, volcano tracker, storm simulation, tsunami metrics, earthquakes, meteorology",
  ogType = "website",
  ogUrl = window.location.href,
  ogImage = "/og-image.jpg" // fallback to absolute-relative path
}: HelmetProps) {
  useEffect(() => {
    // 1. Dynamic Title Management
    document.title = title;

    // Helper functions to manage meta tags in head
    const updateOrCreateMeta = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", contentVal);
    };

    // Helper function to manage link tag
    const updateOrCreateLink = (relVal: string, hrefVal: string) => {
      let element = document.querySelector(`link[rel="${relVal}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", relVal);
        document.head.appendChild(element);
      }
      element.setAttribute("href", hrefVal);
    };

    // 2. Standard Meta Tags (SEO / Crawler / Robots)
    updateOrCreateMeta("name", "description", description);
    updateOrCreateMeta("name", "keywords", keywords);
    updateOrCreateMeta("name", "robots", "index, follow, max-image-preview:large");
    updateOrCreateMeta("name", "googlebot", "index, follow");

    // 3. Open Graph Meta Tags (Social Media Integration & AdSense compliance proofing)
    updateOrCreateMeta("property", "og:title", title);
    updateOrCreateMeta("property", "og:description", description);
    updateOrCreateMeta("property", "og:type", ogType);
    updateOrCreateMeta("property", "og:url", ogUrl);
    updateOrCreateMeta("property", "og:image", ogImage);
    updateOrCreateMeta("property", "og:site_name", "Nature's Rage Portal");

    // 4. Twitter Cards
    updateOrCreateMeta("name", "twitter:card", "summary_large_image");
    updateOrCreateMeta("name", "twitter:title", title);
    updateOrCreateMeta("name", "twitter:description", description);
    updateOrCreateMeta("name", "twitter:image", ogImage);

    // 5. Canonical Link (Crucial for AdSense & duplicate content safety)
    updateOrCreateLink("canonical", ogUrl);

  }, [title, description, keywords, ogType, ogUrl, ogImage]);

  return null; // Side-effect only component
}
