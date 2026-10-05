"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/brand/explainer.mp4?v=6";

export function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const tryPlay = () => {
      void v.play().catch(() => {
        /* Autoplay may be blocked; native controls still work. */
      });
    };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });
  }, []);

  if (failed) {
    return (
      <div className="hero-video" id="demo">
        <div className="video-fallback">
          <Image src="/brand/mark.svg" alt="" width={56} height={56} />
          <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>
            Agents propose. You approve.
          </strong>
          <p>
            Video failed to load. Open{" "}
            <a href={VIDEO_SRC} style={{ color: "#e8d3a8" }}>
              explainer.mp4
            </a>{" "}
            directly, or hard-refresh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-video" id="demo">
      <video
        ref={videoRef}
        key={VIDEO_SRC}
        src={VIDEO_SRC}
        controls
        playsInline
        muted
        preload="metadata"
        poster="/brand/mark.svg"
        aria-label="Stack Spoon explainer"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
