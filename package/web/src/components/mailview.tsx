"use client";

import { sanitize } from "lettersanitizer";
import { useEffect, useRef } from "react";
import ical from "ical.js";
import { Button } from "./ui/button";
import Link from "next/link";
import { openLink } from "@/utils/desktop/app";

export function Mailview(props: { body: string }) {
  let html = "";

  // Try to sanitize the email body
  try {
    html = sanitize(props.body, props.body, {
      allowedSchemas: ["data", "http", "https", "mailto"],
    });
  } catch (e) {
    html = `<html><body><p>Failed to load email</p></body></html>`;
  }

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let resizeCount = 0;
    const maxResizeCount = 3;

    const resizeIframe = () => {
      if (resizeCount > maxResizeCount) return;

      resizeCount++;

      if (!iframe.contentWindow || !iframe.contentDocument) return;

      // Reset to minimum height before measuring
      iframe.style.height = "0px";

      // Get the height of the content
      const height =
        iframe.contentDocument.documentElement.scrollHeight ||
        iframe.contentDocument.body?.scrollHeight;

      iframe.style.height = `${height}px`;
    };

    // Track the last click time to prevent multiple rapid clicks
    let lastClickTime = 0;

    const linkHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Prevent multiple clicks within 500ms
      const now = Date.now();
      if (now - lastClickTime < 500) {
        return;
      }
      lastClickTime = now;

      const target = e.target as HTMLElement;
      const href = target.closest("a")?.getAttribute("href");

      if (href) {
        openLink(href);
      }

      return false; // Prevent further handling
    };

    const attachLinkHandler = (doc: Document) => {
      const links = doc.querySelectorAll("a");

      links.forEach((link) => {
        link.addEventListener("click", linkHandler);
      });
    };

    const detachLinkHandler = (doc: Document) => {
      const links = doc.querySelectorAll("a");

      links.forEach((link) => {
        link.removeEventListener("click", linkHandler);
      });
    };

    iframe.onload = () => {
      resizeIframe();

      if (iframe.contentDocument) {
        attachLinkHandler(iframe.contentDocument);

        // Set the font family for the iframe content
        iframe.contentDocument.head.innerHTML += `<style>@font-face { font-family: 'Plus Jakarta Sans'; src: url('${location.origin}/fonts/plus_jakarta_sans.ttf') format('truetype'); }</style>`;
        iframe.contentDocument.body.style.fontFamily = "Plus Jakarta Sans";
      }
    };

    let i = null;

    // Resize the iframe when the content changes
    if (iframe.contentWindow) {
      i = setInterval(() => {
        resizeIframe();
      }, 250);
    }
    return () => {
      if (i) clearInterval(i);

      if (iframe.contentDocument) detachLinkHandler(iframe.contentDocument!);
    };
  }, [props.body]);

  const vdom = new DOMParser().parseFromString(html, "text/html");
  const rawText = vdom.body.innerText.trim();

  // Parse calendar events (iCalendar format)
  if (rawText.startsWith("BEGIN:VCALENDAR")) {
    // Parse the iCalendar data
    const parsed = ical
      .parse(rawText)
      .find(
        (e: any) => typeof e != "string" && e.some((f: any) => f[0] == "vevent")
      )
      .find((e: any) => e[0] == "vevent")[1];

    const [, , , title] = parsed.find((p: any) => p[0] == "summary");
    const [, , , start] = parsed.find((p: any) => p[0] == "dtstart");
    const [, , , end] = parsed.find((p: any) => p[0] == "dtend");
    const [, , , location] = parsed.find((p: any) => p[0] == "location");

    // TODO: Style
    // TODO: Implement into Birdiemail calendar (replace google calendar)

    return (
      <div>
        <h1>Calendar event</h1>
        <p>{title}</p>
        <Link
          href={"#"}
          target="_blank"
          onClick={(e) => {
            e.preventDefault();

            navigator.clipboard.writeText(
              `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                title
              )}&dates=${encodeURIComponent(
                start.replace("-", "").replace(":", "")
              )}/${encodeURIComponent(
                end.replace("-", "").replace(":", "")
              )}&details=${encodeURIComponent(
                "Added from Birdiemail"
              )}&location=${encodeURIComponent(location)}&sf=true&output=xml`
            );
          }}
        >
          Add into Google Calendar (copy link)
        </Link>
      </div>
    );
  }

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
