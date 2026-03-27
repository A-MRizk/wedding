import {useCallback, useEffect, useRef, useState} from 'react';
import envelopeBottom from './assets/envelope-bottom.png';
import envelopeTop from './assets/envelope-top.png';

const SLIDE_COUNT = 7;
const COUNTDOWN_TARGET = new Date('Aug 15, 2026 16:00:00').getTime();

export default function WeddingInvitation() {
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);

  const [flapOpen, setFlapOpen] = useState(false);
  const [envelopeOpening, setEnvelopeOpening] = useState(false);
  const [navDotsActive, setNavDotsActive] = useState(false);
  const [scrollActive, setScrollActive] = useState(false);
  const [hideEnvelope, setHideEnvelope] = useState(false);
  const [sealBroken, setSealBroken] = useState(false);

  const [days, setDays] = useState('00');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [countdownDone, setCountdownDone] = useState(false);

  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  const handleEnvelopeClick = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    setSealBroken(true);
    window.setTimeout(() => setFlapOpen(true), 300);
    window.setTimeout(() => {
      setEnvelopeOpening(true);
      setNavDotsActive(true);
    }, 800);
    window.setTimeout(() => {
      setScrollActive(true);
      setHideEnvelope(true);
    }, 2000);
  }, []);

  useEffect(() => {
    let intervalId = 0;
    const tick = () => {
      const distance = COUNTDOWN_TARGET - Date.now();
      if (distance < 0) {
        setCountdownDone(true);
        if (intervalId) window.clearInterval(intervalId);
        return;
      }
      setDays(String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'));
      setHours(
        String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
      );
      setMinutes(String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'));
      setSeconds(String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0'));
    };
    tick();
    intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const root = mainScrollRef.current;
    if (!root) return;
    const slides = root.querySelectorAll<HTMLElement>('.slide');
    const dots = document.querySelectorAll<HTMLElement>('.nav-dots .dot');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            const index = Array.from(slides).indexOf(entry.target as HTMLElement);
            if (index >= 0) {
              setActiveDot(index);
              dots.forEach((d) => d.classList.remove('active'));
              if (dots[index]) dots[index].classList.add('active');
            }
          }
        });
      },
      {root, threshold: 0.5},
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  const scrollToSlide = (index: number) => {
    const root = mainScrollRef.current;
    if (!root) return;
    const slides = root.querySelectorAll<HTMLElement>('.slide');
    slides[index]?.scrollIntoView({behavior: 'smooth'});
  };

  return (
    <>
      <div
        id="envelope-container"
        style={hideEnvelope ? {display: 'none'} : undefined}
        onClick={handleEnvelopeClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleEnvelopeClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open invitation"
      >
        <div className={`envelope ${envelopeOpening ? 'opening' : ''}`} id="envelope">
          <div className="env-image-bottom" aria-hidden="true">
            <img src={envelopeBottom} alt="" decoding="async" fetchPriority="high" />
          </div>
          <div className={`env-top ${flapOpen ? 'open' : ''}`} id="envelope-flap">
            <img src={envelopeTop} className="env-flap-img" alt="" decoding="async" fetchPriority="high" />
          </div>
          <span id="wax-seal" className={sealBroken ? 'broken' : ''} aria-hidden="true" />
        </div>
      </div>

      <div className={`nav-dots ${navDotsActive ? 'active' : ''}`} id="nav-dots">
        {Array.from({length: SLIDE_COUNT}, (_, i) => (
          <button
            key={i}
            type="button"
            className={`dot ${activeDot === i ? 'active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollToSlide(i)}
          />
        ))}
      </div>

      <div
        ref={mainScrollRef}
        className={`scroll-container ${scrollActive ? 'active' : ''}`}
        id="main-scroll"
      >
        <section className="slide is-visible" id="slide-hero">
          <div className="fade-in">
            <h1 className="title-large">Bechara & Randa</h1>
            <div className="subtitle">Are Getting Married</div>
            {countdownDone ? (
              <div
                className="script-font"
                style={{fontSize: '2.5rem', color: 'var(--dusty-rose)'}}
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

        <section className="slide" id="slide-invite">
          <div className="fade-in">
            <div className="bible-verse">
              &quot;Therefore what God has joined together, let no one separate.&quot;
              <br />
              — Mark 10:9
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
              <br />
              request the honor of your presence at the wedding of their son and daughter
            </div>
            <h2 className="title-large" style={{fontSize: '3.5rem', marginTop: '1rem'}}>
              Bechara & Randa
            </h2>
            <div className="wedding-date">August 15, 2026</div>
          </div>
        </section>

        <section className="slide">
          <div className="info-card fade-in">
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

        <section className="slide">
          <div className="info-card fade-in">
            <h3 className="info-title">Let&apos;s Party</h3>
            <div className="info-detail">
              <strong>Kalaat al Roumiyeh Restaurant</strong>
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

        <section className="slide">
          <div className="info-card fade-in">
            <h3 className="info-title">Gift Registry</h3>
            <div className="info-detail">
              Your love, laughter, and presence are all we could wish for on our special day.
              <br />
              <br />
              For those who wish, a wedding registry is available at:
              <br />
              <br />
              <strong
                style={{
                  fontSize: '1.4rem',
                  color: 'var(--text-dark)',
                  letterSpacing: '1px',
                }}
              >
                WHISH MONEY
              </strong>
            </div>
          </div>
        </section>

        <section className="slide">
          <div className="info-card fade-in">
            <h3 className="info-title">Be Our Guest</h3>
            <div className="info-detail" style={{marginBottom: '1.5rem'}}>
              Please RSVP by July 15, 2026
            </div>
            {rsvpSubmitted ? (
              <div className="rsvp-success-message">
                Thank you for your confirmation!
                <br />
                See you there :)
              </div>
            ) : (
              <form
                id="rsvp-form"
                className="rsvp-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setRsvpSubmitted(true);
                }}
              >
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" required placeholder="John & Jane Doe" />
                </div>
                <div className="form-group">
                  <label htmlFor="attendance">Will you attend?</label>
                  <select id="attendance" required defaultValue="">
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option value="yes">Joyfully Accept</option>
                    <option value="no">Regretfully Decline</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="guests">Number of Guests</label>
                  <select id="guests" required defaultValue="1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn" style={{marginTop: '0.5rem'}}>
                  Send RSVP
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="slide" id="slide-footer">
          <div className="fade-in">
            <div className="footer-frame" />
            <div
              className="script-font"
              style={{
                fontSize: '3rem',
                color: 'var(--dusty-rose)',
                marginBottom: '1rem',
              }}
            >
              Always & Forever
            </div>
            <h2 className="title-large" style={{fontSize: '3.5rem'}}>
              Bechara & Randa
            </h2>
          </div>
        </section>
      </div>
    </>
  );
}
