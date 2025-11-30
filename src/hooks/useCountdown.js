import { useState, useEffect } from 'react';

/**
 * Custom hook for countdown timer
 * @param {string|Date} targetDate - Target date for countdown
 * @param {number} interval - Update interval in milliseconds (default: 1000ms)
 * @returns {Object} Countdown object with time units
 */
const useCountdown = (targetDate, interval = 1000) => {
  const [timeLeft, setTimeLeft] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      });
      return;
    }

    const calculateTimeLeft = () => {
      const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        return {
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        };
      }

      const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
      const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        weeks,
        days,
        hours,
        minutes,
        seconds,
        total: difference,
      };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    // Set up interval
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, interval);

    return () => clearInterval(timer);
  }, [targetDate, interval]);

  return timeLeft;
};

export default useCountdown;

