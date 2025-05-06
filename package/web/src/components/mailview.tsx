"use client";

import { sanitize } from "lettersanitizer";
import { useEffect, useRef } from "react";

// Mail content view component
export function Mailview(props: { body: string }) {
  let html = "";

  // Try to sanitize the email body
  try {
    // Sanitize the email body to prevent XSS attacks
    html = sanitize(props.body, props.body, {
      allowedSchemas: ["data", "http", "https", "mailto"],
    });
  } catch (e) {
    // If sanitization fails, log the error and set a fallback HTML
    html = `<html><body><p>Failed to load email</p></body></html>`;
  }

  // Email iframe reference
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Get the iframe element
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Function to resize the iframe based on its content
    const resizeIframe = () => {
      if (!iframe.contentWindow || !iframe.contentDocument) return;

      // Reset to minimum height before measuring
      iframe.style.height = "0px";

      // Get the height of the content
      const height =
        iframe.contentDocument.documentElement.scrollHeight ||
        iframe.contentDocument.body.scrollHeight;

      // Set the height of the iframe
      iframe.style.height = `${height}px`;
    };

    // Attach load event to the iframe
    iframe.onload = () => {
      // Resize the iframe after it loads
      resizeIframe();

      if (iframe.contentDocument) {
        // Set the font family for the iframe content
        iframe.contentDocument.head.innerHTML += `<style>@font-face { font-family: 'Plus Jakarta Sans'; src: url('${location.origin}/fonts/plus_jakarta_sans.ttf') format('truetype'); }</style>`;
        iframe.contentDocument.body.style.fontFamily = "Plus Jakarta Sans";
      }
    };

    // Resize the iframe when the content changes
    if (iframe.contentWindow) {
      // Observe the iframe content for changes
      const resizeObserver = new ResizeObserver(resizeIframe);

      try {
        // Observe the iframe body for changes
        if (iframe.contentDocument && iframe.contentDocument.body) {
          resizeObserver.observe(iframe.contentDocument.body);
        }
      } catch (e) {}

      // Cleanup function to disconnect the observer
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [props.body]);

  // Render the iframe with the sanitized HTML content
  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      scrolling="no"
      className="border-none bg-white rounded-md"
      style={{
        width: "calc(100% - 1rem)",
        minHeight: "100px",
        fontFamily: "var(--font-plus-jakarta-sans)",
      }}
    />
  );
}
