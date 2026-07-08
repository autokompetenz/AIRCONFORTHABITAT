import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function AnimatedCounter({ target, suffix = '', duration = 1500, ...props }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    setCount(0);
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + step;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref} {...props}>{count}{suffix}</span>;
}
