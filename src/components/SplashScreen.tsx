import { useEffect, useRef, useState } from "react";

export function SplashScreen() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let closed = false;
    let removeTimer = 0;

    function close() {
      if (closed) return;
      closed = true;
      setHidden(true);
      removeTimer = window.setTimeout(() => setRemoved(true), 520);
    }

    const closeTimer = window.setTimeout(close, 2800);
    videoRef.current?.play().catch(() => setShowFallback(true));

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    if (!hidden) return;
    const removeTimer = window.setTimeout(() => setRemoved(true), 520);
    return () => window.clearTimeout(removeTimer);
  }, [hidden]);

  if (removed) return null;

  return (
    <div className={`intro-screen ${hidden ? "hide" : ""} ${showFallback ? "has-fallback" : ""}`} onClick={() => setHidden(true)}>
      <video
        ref={videoRef}
        className="intro-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setShowFallback(false)}
        onEnded={() => setHidden(true)}
        onError={() => setShowFallback(true)}
      >
        <source src="/assets/intro.mp4" type="video/mp4" />
      </video>
      <img className={`intro-fallback-logo ${showFallback ? "show" : ""}`} src="/assets/icon-512.png" alt="" />
    </div>
  );
}
