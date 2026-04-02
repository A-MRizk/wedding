import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type CSSProperties,
  type TransitionEvent,
} from "react";
import sealImage from "./assets/Seal.png";
import photoBechara from "./assets/Bechara.jpeg";
import photoRanda from "./assets/Randa.jpeg";
import photoCloseLooking from "./assets/CloseLooking.jpeg";
import photoClose from "./assets/Close.jpeg";
import photoHoldingHands from "./assets/HoldingHands.jpeg";
import photoLookingAway from "./assets/LookingAway.jpeg";

function slidePhotoStyle(
  url: string,
  overlayStrong: [number, number] = [0.6, 0.8],
): CSSProperties {
  const [a, b] = overlayStrong;
  return {
    backgroundImage: `linear-gradient(rgba(253, 251, 247, ${a}), rgba(253, 251, 247, ${b})), url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

/** Heart + music motif for the floating music toggle */
function MusicFabGlyph({
  variant,
}: {
  variant: "playing" | "quiet" | "error";
}) {
  const heartGradId = `music-fab-hg-${useId().replace(/:/g, "")}`;
  const heart =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

  if (variant === "error") {
    return (
      <span className="music-fab__glyph">
        <svg className="music-fab__svg" viewBox="0 0 24 24" aria-hidden>
          <path className="music-fab__heart-fill" fill="currentColor" d={heart} />
          <path
            className="music-fab__error-x"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M8 8l8 8M16 8l-8 8"
          />
        </svg>
      </span>
    );
  }

  if (variant === "playing") {
    return (
      <span className="music-fab__glyph music-fab__glyph--playing">
        <svg className="music-fab__svg" viewBox="0 0 24 24" aria-hidden>
          <defs>
            <linearGradient
              id={heartGradId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#fffefb" />
              <stop offset="45%" stopColor="#fdeef0" />
              <stop offset="100%" stopColor="#f5d0d6" />
            </linearGradient>
          </defs>
          <path fill={`url(#${heartGradId})`} d={heart} />
          <circle className="music-fab__sparkle" cx="5" cy="6" r="1.1" fill="#fff" />
          <circle className="music-fab__sparkle music-fab__sparkle--delay" cx="19" cy="7" r="0.75" fill="#fff" />
          <text
            x="12"
            y="16.5"
            textAnchor="middle"
            className="music-fab__note-char"
            fill="#6b1828"
          >
            ♪
          </text>
        </svg>
      </span>
    );
  }

  return (
    <span className="music-fab__glyph music-fab__glyph--quiet">
      <svg className="music-fab__svg" viewBox="0 0 24 24" aria-hidden>
        <path
          className="music-fab__heart-stroke"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinejoin="round"
          d={heart}
        />
        <text
          x="12"
          y="16.5"
          textAnchor="middle"
          className="music-fab__note-char music-fab__note-char--quiet"
          fill="currentColor"
        >
          ♪
        </text>
        <path
          className="music-fab__whisper"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity={0.45}
          d="M5 20c1.2-.8 2-1 3-.5M6.5 21.5c1-.6 1.8-.7 2.6-.2"
        />
      </svg>
    </span>
  );
}

const SLIDE_COUNT = 7;
const COUNTDOWN_TARGET = new Date("Aug 15, 2026 16:00:00").getTime();

const FLAP_DURATION_MS = 700;
const BOTTOM_SLIDE_MS = 800;
const SEAL_BREAK_BEFORE_FLAP_MS = 220;

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim() ?? "";
const WEDDING_MUSIC_SRC =
  import.meta.env.VITE_WEDDING_MUSIC_URL?.trim() ||
  `${import.meta.env.BASE_URL}wedding-bg.mp3`;

export default function WeddingInvitation() {
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSnapIndexRef = useRef(0);
  const skipScrollClampRef = useRef(false);
  const openedRef = useRef(false);
  const flapRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bottomRevealRequestedRef = useRef(false);
  const invitationRevealRequestedRef = useRef(false);

  const [flapOpen, setFlapOpen] = useState(false);
  const [bottomRevealed, setBottomRevealed] = useState(false);
  const [navDotsActive, setNavDotsActive] = useState(false);
  const [scrollActive, setScrollActive] = useState(false);
  const [hideEnvelope, setHideEnvelope] = useState(false);
  const [sealBroken, setSealBroken] = useState(false);

  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [countdownDone, setCountdownDone] = useState(false);

  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSending, setRsvpSending] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [rsvpAttendance, setRsvpAttendance] = useState<"" | "yes" | "no">(
    "",
  );
  const [activeDot, setActiveDot] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicLoadError, setMusicLoadError] = useState(false);

  const handleRsvpSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!WEB3FORMS_KEY) return;
      setRsvpError(null);
      setRsvpSending(true);
      try {
        const form = e.currentTarget;
        const fd = new FormData(form);
        const guestName = String(fd.get("name") ?? "").trim();
        const attendance = String(fd.get("attendance") ?? "");
        const guests = String(fd.get("guests") ?? "");
        const attendanceLabel =
          attendance === "yes"
            ? "Accept"
            : attendance === "no"
              ? "Decline"
              : attendance;
        const message = [
          `Name(s): ${guestName}`,
          `Response: ${attendanceLabel}`,
          attendance === "yes" ? `Number of guests: ${guests}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        const payload: Record<string, string> = {
          access_key: WEB3FORMS_KEY,
          subject: "RSVP — Bechara & Randa",
          name: guestName,
          message,
        };

        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as {
          success?: boolean | string;
          message?: string;
        };
        const ok = data.success === true || data.success === "true";
        if (!res.ok || !ok) {
          throw new Error(
            data.message || "Could not send your RSVP. Please try again.",
          );
        }
        setRsvpSubmitted(true);
      } catch (err) {
        setRsvpError(
          err instanceof Error
            ? err.message
            : "Could not send your RSVP. Please try again.",
        );
      } finally {
        setRsvpSending(false);
      }
    },
    [],
  );

  /** Starts playback when the user opens the envelope (counts as a user gesture for autoplay rules). */
  const tryPlayWeddingMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    setMusicLoadError(false);
    void el.play().catch(() => {
      const onCanPlay = () => {
        void el.play().catch(() => setMusicLoadError(true));
        el.removeEventListener("canplay", onCanPlay);
      };
      el.addEventListener("canplay", onCanPlay);
    });
  }, []);

  const toggleMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el
        .play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    } else {
      el.pause();
      setMusicPlaying(false);
    }
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setMusicPlaying(true);
    const onPause = () => setMusicPlaying(false);
    const onError = () => setMusicLoadError(true);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("error", onError);
    };
  }, []);

  const requestBottomReveal = useCallback(() => {
    if (bottomRevealRequestedRef.current) return;
    bottomRevealRequestedRef.current = true;
    setBottomRevealed(true);
  }, []);

  const requestInvitationReveal = useCallback(() => {
    if (invitationRevealRequestedRef.current) return;
    invitationRevealRequestedRef.current = true;
    setNavDotsActive(true);
    setScrollActive(true);
    setHideEnvelope(true);
  }, []);

  const handleEnvelopeClick = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    tryPlayWeddingMusic();
    setSealBroken(true);
    window.setTimeout(() => {
      setFlapOpen(true);
      window.setTimeout(requestBottomReveal, FLAP_DURATION_MS + 120);
    }, SEAL_BREAK_BEFORE_FLAP_MS);
  }, [requestBottomReveal, tryPlayWeddingMusic]);

  const handleFlapTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform") return;
      if (e.target !== flapRef.current) return;
      requestBottomReveal();
    },
    [requestBottomReveal],
  );

  const handleBottomTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform") return;
      if (e.target !== bottomRef.current) return;
      requestInvitationReveal();
    },
    [requestInvitationReveal],
  );

  useEffect(() => {
    if (!bottomRevealed) return;
    const id = window.setTimeout(
      requestInvitationReveal,
      BOTTOM_SLIDE_MS + 150,
    );
    return () => window.clearTimeout(id);
  }, [bottomRevealed, requestInvitationReveal]);

  useEffect(() => {
    let intervalId = 0;
    const tick = () => {
      const distance = COUNTDOWN_TARGET - Date.now();
      if (distance < 0) {
        setCountdownDone(true);
        if (intervalId) window.clearInterval(intervalId);
        return;
      }
      setDays(
        String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0"),
      );
      setHours(
        String(
          Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        ).padStart(2, "0"),
      );
      setMinutes(
        String(
          Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        ).padStart(2, "0"),
      );
      setSeconds(
        String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, "0"),
      );
    };
    tick();
    intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const root = mainScrollRef.current;
    if (!root) return;
    const slides = root.querySelectorAll<HTMLElement>(".slide");
    const dots = document.querySelectorAll<HTMLElement>(".nav-dots .dot");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            const index = Array.from(slides).indexOf(
              entry.target as HTMLElement,
            );
            if (index >= 0) {
              setActiveDot(index);
              dots.forEach((d) => d.classList.remove("active"));
              if (dots[index]) dots[index].classList.add("active");
            }
          }
        });
      },
      { root, threshold: 0.5 },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!scrollActive) return;
    const root = mainScrollRef.current;
    if (!root) return;

    const pageWidth = () => root.clientWidth;
    const slideCount = () => root.querySelectorAll(".slide").length;

    const syncLastIndexFromScroll = () => {
      const w = pageWidth();
      if (w <= 0) return;
      lastSnapIndexRef.current = Math.round(root.scrollLeft / w);
    };

    syncLastIndexFromScroll();

    let rafClamp = 0;
    const onScroll = () => {
      if (skipScrollClampRef.current) {
        syncLastIndexFromScroll();
        return;
      }
      cancelAnimationFrame(rafClamp);
      rafClamp = requestAnimationFrame(() => {
        const w = pageWidth();
        if (w <= 0) return;
        const idx = Math.round(root.scrollLeft / w);
        const last = lastSnapIndexRef.current;
        const n = slideCount();
        if (n === 0) return;
        if (Math.abs(idx - last) > 1) {
          const step = idx > last ? 1 : -1;
          const clamped = Math.max(0, Math.min(n - 1, last + step));
          root.scrollLeft = clamped * w;
          lastSnapIndexRef.current = clamped;
        } else {
          lastSnapIndexRef.current = idx;
        }
      });
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      const w = pageWidth();
      if (w <= 0) return;
      const n = slideCount();
      if (n === 0) return;
      const current = Math.round(root.scrollLeft / w);
      const dir = e.deltaX > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(n - 1, current + dir));
      lastSnapIndexRef.current = next;
      root.scrollTo({ left: next * w, behavior: "auto" });
    };

    const endProgrammaticScroll = () => {
      if (skipScrollClampRef.current) {
        skipScrollClampRef.current = false;
      }
      syncLastIndexFromScroll();
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("wheel", onWheel, { passive: false, capture: true });
    root.addEventListener("scrollend", endProgrammaticScroll);

    return () => {
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("wheel", onWheel, true);
      root.removeEventListener("scrollend", endProgrammaticScroll);
      cancelAnimationFrame(rafClamp);
    };
  }, [scrollActive]);

  const scrollToSlide = useCallback((index: number) => {
    const root = mainScrollRef.current;
    if (!root) return;
    const slides = root.querySelectorAll<HTMLElement>(".slide");
    skipScrollClampRef.current = true;
    slides[index]?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      if (!skipScrollClampRef.current) return;
      skipScrollClampRef.current = false;
      const w = root.clientWidth;
      if (w > 0) {
        lastSnapIndexRef.current = Math.round(root.scrollLeft / w);
      }
    }, 850);
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        className="wedding-audio-hidden"
        src={WEDDING_MUSIC_SRC}
        loop
        playsInline
        preload="auto"
      />
      <div
        id="envelope-container"
        className={flapOpen ? "env-open" : ""}
        style={hideEnvelope ? { display: "none" } : undefined}
        onClick={handleEnvelopeClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleEnvelopeClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open invitation"
      >
        <div className="envelope-backdrop" aria-hidden="true">
          <div className="env-backdrop-under" />
          <div className="env-backdrop-mid" />
          <div className="env-backdrop-top" />
          <div className="env-backdrop-bottom" />
        </div>
        <div
          className={`envelope-hero-seal${sealBroken ? " is-broken" : ""}`}
          aria-hidden="true"
        >
          <img
            className="envelope-hero-seal-img"
            src={sealImage}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="envelope" id="envelope">
          <div
            ref={bottomRef}
            className={`env-image-bottom ${bottomRevealed ? "revealed" : ""}`}
            onTransitionEnd={handleBottomTransitionEnd}
            aria-hidden="true"
          />
          <div
            ref={flapRef}
            className={`env-top ${flapOpen ? "open" : ""}`}
            id="envelope-flap"
            onTransitionEnd={handleFlapTransitionEnd}
          />
          <span
            id="wax-seal"
            className={sealBroken ? "broken" : ""}
            aria-hidden="true"
          />
        </div>
      </div>

      {sealBroken ? (
        <button
          type="button"
          className={`music-fab ${musicPlaying ? "is-playing" : ""} ${musicLoadError ? "is-error" : ""}`}
          aria-label={
            musicPlaying ? "Mute background music" : "Unmute background music"
          }
          title="Tap to turn wedding music on or off"
          onClick={toggleMusic}
        >
          <MusicFabGlyph
            variant={
              musicLoadError ? "error" : musicPlaying ? "playing" : "quiet"
            }
          />
        </button>
      ) : null}

      <div
        className={`nav-dots ${navDotsActive ? "active" : ""}`}
        id="nav-dots"
      >
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`dot ${activeDot === i ? "active" : ""}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollToSlide(i)}
          />
        ))}
      </div>

      <div
        ref={mainScrollRef}
        className={`scroll-container ${scrollActive ? "active" : ""}`}
        id="main-scroll"
      >
        <section
          className="slide is-visible slide-photo-bg"
          id="slide-hero"
          style={slidePhotoStyle(photoCloseLooking)}
        >
          <div className="fade-in">
            <h1 className="title-large">Bechara & Randa</h1>
            <div className="subtitle">Are Getting Married</div>
            {countdownDone ? (
              <div
                className="script-font"
                style={{ fontSize: "2.5rem", color: "var(--dusty-rose)" }}
              >
                Today is the day!
              </div>
            ) : (
              <div className="countdown" id="countdown">
                <div className="countdown-item">
                  <span className="countdown-value">{days}</span>
                  <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{hours}</span>
                  <span className="countdown-label">Hours</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{minutes}</span>
                  <span className="countdown-label">Mins</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{seconds}</span>
                  <span className="countdown-label">Secs</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section
          className="slide slide-photo-bg"
          id="slide-invite"
          style={slidePhotoStyle(photoClose, [0.88, 0.92])}
        >
          <div className="fade-in slide-invite__content">
            <div className="bible-verse">
              &quot;Therefore what God has joined together, let no one
              separate.&quot;
              <br />— Mark 10:9
            </div>
            <div className="parents-text">
              With joyous hearts,
              <br />
              <strong>Hanna & Liliane Tayeh</strong>
              <br />
              and
              <br />
              <strong>Fawaz & Mona Zgheib</strong>
              <br />
              request the honor of your presence at the wedding of their son and
              daughter
            </div>
            <h2 className="title-large slide-invite__names">Bechara & Randa</h2>
            <div className="wedding-date">August 15, 2026</div>
            <div className="polaroid-row polaroid-row--invite">
              <figure className="polaroid polaroid--tilt-left">
                <img src={photoBechara} alt="Bechara" loading="lazy" />
                <figcaption>Bechara</figcaption>
              </figure>
              <figure className="polaroid polaroid--tilt-right">
                <img src={photoRanda} alt="Randa" loading="lazy" />
                <figcaption>Randa</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section
          className="slide slide-photo-bg"
          style={slidePhotoStyle(photoHoldingHands, [0.48, 0.66])}
        >
          <div className="slide-text fade-in">
            <h3 className="info-title">Wedding Ceremony</h3>
            <div className="info-detail">
              <strong>St. Ephrem Church</strong>
              <br />
              كنيسة مار أفرام
              <br />
              Kfardebian, Lebanon
              <br />
              <br />
              Saturday, August 15, 2026
              <br />
              4:00 PM
            </div>
            <a
              href="https://maps.app.goo.gl/t4zHV3ffWHWBH5QcA"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              View on Map
            </a>
          </div>
        </section>

        <section
          className="slide slide-photo-bg"
          style={slidePhotoStyle(photoLookingAway, [0.48, 0.66])}
        >
          <div className="slide-text fade-in">
            <h3 className="info-title">Let&apos;s Party</h3>
            <div className="info-detail">
              <strong>Kalaat al Roumieh Restaurant</strong>
              <br />
              مطعم قلعة الرومية
              <br />
              Klayaat, Lebanon
              <br />
              <br />
              Following the ceremony
              <br />
              7:00 PM
            </div>
            <a
              href="https://maps.app.goo.gl/2bBYMPXtK9YErMk76"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              View on Map
            </a>
          </div>
        </section>

        <section
          className="slide slide-photo-bg"
          style={slidePhotoStyle(photoBechara, [0.52, 0.7])}
        >
          <div className="slide-text fade-in">
            <h3 className="info-title">Gift Registry</h3>
            <div className="info-detail">
              Your love, laughter, and presence are all we could wish for on our
              special day.
              <br />
              <br />
              For those who wish, a wedding registry is available at:
              <br />
              <br />
              <strong
                style={{
                  fontSize: "1.4rem",
                  color: "var(--text-dark)",
                  letterSpacing: "1px",
                }}
              >
                WHISH MONEY
              </strong>
            </div>
          </div>
        </section>

        <section
          className="slide slide-photo-bg"
          style={slidePhotoStyle(photoRanda, [0.52, 0.7])}
        >
          <div className="slide-text fade-in">
            <h3 className="info-title">Be Our Guest</h3>
            <div className="info-detail" style={{ marginBottom: "1rem" }}>
              Please RSVP by July 15, 2026
            </div>
            {!WEB3FORMS_KEY ? (
              <p className="rsvp-config-hint">
                Add <code>VITE_WEB3FORMS_ACCESS_KEY</code> to your{" "}
                <code>.env</code> (free key at{" "}
                <a
                  href="https://web3forms.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rsvp-mailto-link"
                >
                  web3forms.com
                </a>
                ) so RSVP submissions are emailed to you.
              </p>
            ) : null}
            {rsvpSubmitted ? (
              <div className="rsvp-success-message">
                Thank you — we&apos;ve received your RSVP.
              </div>
            ) : (
              <form
                id="rsvp-form"
                className="rsvp-form"
                onSubmit={handleRsvpSubmit}
              >
                {rsvpError ? (
                  <p className="rsvp-error" role="alert">
                    {rsvpError}
                  </p>
                ) : null}
                <div className="form-group">
                  <label htmlFor="name">Name(s) of guest(s)</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    disabled={rsvpSending}
                    placeholder="John & Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="attendance">Will you attend?</label>
                  <select
                    id="attendance"
                    name="attendance"
                    required
                    disabled={rsvpSending}
                    value={rsvpAttendance}
                    onChange={(e) => {
                      setRsvpAttendance(
                        e.target.value as "" | "yes" | "no",
                      );
                    }}
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option value="yes">Joyfully Accept</option>
                    <option value="no">Regretfully Decline</option>
                  </select>
                </div>
                {rsvpAttendance !== "no" ? (
                  <div className="form-group">
                    <label htmlFor="guests">Number of guests</label>
                    <select
                      id="guests"
                      name="guests"
                      required={rsvpAttendance === "yes"}
                      defaultValue="1"
                      disabled={rsvpSending}
                    >
                      {[
                        "0",
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                      ].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <button
                  type="submit"
                  className="btn"
                  style={{ marginTop: "0.5rem" }}
                  disabled={!WEB3FORMS_KEY || rsvpSending}
                >
                  {rsvpSending ? "Sending…" : "Send RSVP"}
                </button>
              </form>
            )}
          </div>
        </section>

        <section
          className="slide slide-photo-bg"
          id="slide-footer"
          style={slidePhotoStyle(photoClose, [0.75, 0.92])}
        >
          <div className="fade-in">
            <div
              className="footer-frame"
              style={{ backgroundImage: `url(${photoClose})` }}
            />
            <div
              className="script-font"
              style={{
                fontSize: "3rem",
                color: "var(--dusty-rose)",
                marginBottom: "1rem",
              }}
            >
              Always & Forever
            </div>
            <h2 className="title-large" style={{ fontSize: "3.5rem" }}>
              Bechara & Randa
            </h2>
          </div>
        </section>
      </div>
    </>
  );
}
