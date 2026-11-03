import { useEffect, useRef, useState } from 'react';

const Reveal = ({
  as: Element = 'div',
  children,
  className = '',
  delay = 0,
  ...props
}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(() => (
    typeof window === 'undefined'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || !('IntersectionObserver' in window)
  ));

  useEffect(() => {
    const element = elementRef.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Element
      ref={elementRef}
      className={`reveal${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Reveal;
