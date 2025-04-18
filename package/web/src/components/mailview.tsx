"use client";

import { sanitize } from "lettersanitizer";
import { useEffect, useRef } from "react";

export function Mailview(props: { body: string }) {
  let html = "";
  try {
    html = sanitize(props.body, props.body);
  } catch (e) {
    html = `<html><body><p>Failed to load email</p></body></html>`;
  }

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

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

    iframe.onload = () => {
      resizeIframe();

      if (iframe.contentDocument)
        iframe.contentDocument.body.style.fontFamily = "Plus Jakarta Sans";
    };

    if (iframe.contentWindow) {
      const resizeObserver = new ResizeObserver(resizeIframe);
      try {
        if (iframe.contentDocument && iframe.contentDocument.body) {
          resizeObserver.observe(iframe.contentDocument.body);
        }
      } catch (e) {
        console.error("Failed to observe iframe content:", e);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [props.body]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      scrolling="no"
      className="border-none"
      style={{
        width: "calc(100% - 1rem)",
        minHeight: "100px",
        fontFamily: "var(--font-plus-jakarta-sans)",
      }}
    />
  );
}
