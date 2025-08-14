"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./CloudHint.module.css";

type CursorEventDetail = { x: number; isMoon: boolean };

export default function CloudHint({ hidden = false }: { hidden?: boolean }) {
  const [isMobileTouch, setIsMobileTouch] = useState(false);
  const [hideLabel, setHideLabel] = useState(false);
  const [isMoonActive, setIsMoonActive] = useState(false);

  useEffect(() => {
    // Detect ONLY mobile platforms (Android/iOS). Some desktops report touch points; we ignore those.
    const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || "").toLowerCase();
    const uaDataMobile = (navigator as any).userAgentData?.mobile === true;
    const isAndroid = /android/.test(ua);
    const isIOS = /iphone|ipad|ipod|ios/.test(ua);
    setIsMobileTouch(Boolean(uaDataMobile || isAndroid || isIOS));
  }, []);

  // Hide the hint label once the moon cursor is shown for the first time
  useEffect(() => {
    const onCursorUpdate = (e: Event) => {
      const detail = (e as CustomEvent<CursorEventDetail>).detail;
      if (!detail) return;
      setIsMoonActive(!!detail.isMoon);
      // Persist the label: do not hide it when moon is active
    };
    window.addEventListener('cursorPosition' as any, onCursorUpdate as EventListener);
    return () => window.removeEventListener('cursorPosition' as any, onCursorUpdate as EventListener);
  }, []);

  // Default: "come here"; on iOS/Android devices: "tap here"
  const label = useMemo(() => (isMobileTouch ? "tap here" : "come here"), [isMobileTouch]);

  // Only hide if explicitly requested via props; keep visible even when moon is active
  if (hidden) return null;

  return (
    <div className={styles.container} aria-hidden>
      <div className={styles.wrapper}>
        <div className={styles.cloud} />
        <div className={styles.labelOverlay}>
          <div className={styles.label}>
            <div className={styles.textWrap}>
              {/* Base black text */}
              <div className={styles.textBase}>
                {(() => {
                  const parts = label.split(' ');
                  const first = parts[0] ?? '';
                  const second = parts.slice(1).join(' ');
                  return (
                    <>
                      <span>{first}</span>
                      <br />
                      <span>{second}</span>
                    </>
                  );
                })()}
              </div>
              {/* RGB shimmer overlay */}
              <div className={styles.textRGB} aria-hidden>
                {(() => {
                  const parts = label.split(' ');
                  const first = parts[0] ?? '';
                  const second = parts.slice(1).join(' ');
                  return (
                    <>
                      <span>{first}</span>
                      <br />
                      <span>{second}</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
