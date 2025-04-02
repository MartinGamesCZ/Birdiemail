"use client";

import { sanitize } from "lettersanitizer";
import { useEffect, useRef } from "react";

export function Mailview(props: { body: string }) {
  const html = sanitize(props.body, props.body);
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

    iframe.onload = resizeIframe;

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
      className="w-full border-none"
      style={{ minHeight: "100px" }}
    />
  );
}
