import useReveal from '../../hooks/useReveal';

// Fades and lifts its children in when they scroll into view. `delay` (ms)
// staggers siblings. Styles live in motion.css (.reveal).
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', style, ...rest }) {
  const [ref, inView] = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()} data-in={inView ? 'true' : 'false'}
      style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
