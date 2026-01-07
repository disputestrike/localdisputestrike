import { useState, useEffect } from "react";

export function BannerCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set target time to 24 hours from first visit (stored in localStorage)
    const getTargetTime = () => {
      const stored = localStorage.getItem("promoEndTime");
      if (stored) {
        return parseInt(stored);
      } else {
        const newTarget = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem("promoEndTime", String(newTarget));
        return newTarget;
      }
    };

    const targetTime = getTargetTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        // Reset to 24 hours when countdown reaches zero
        const newTarget = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem("promoEndTime", String(newTarget));
        
        setTimeLeft({
          hours: 24,
          minutes: 0,
          seconds: 0,
        });
      } else {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const pad = (num: number) => String(num).padStart(2, "0");

  return (
    <span className="font-mono font-bold">
      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  );
}
