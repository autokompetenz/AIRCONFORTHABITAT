export default function Card({ children, hover = true, padding = '24px', style, ...props }) {
  return (
    <div
      className={hover ? 'card card-hover' : 'card'}
      style={{ padding, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
