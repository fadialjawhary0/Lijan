import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  const cardClasses = `
    card
    ${hover ? 'card-hover cursor-pointer' : ''}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? {
        whileHover: { y: -2 },
        whileTap: { scale: 0.98 },
      }
    : {};

  return (
    <Component className={cardClasses} onClick={onClick} {...motionProps} {...props}>
      {children}
    </Component>
  );
};

const CardHeader = ({ children, className = '' }) => <div className={`pb-4 border-b border-[var(--color-border)] ${className}`}>{children}</div>;

const CardContent = ({ children, className = '' }) => <div className={`py-4 ${className}`}>{children}</div>;

const CardFooter = ({ children, className = '' }) => <div className={`pt-4 border-t border-[var(--color-border)] ${className}`}>{children}</div>;

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
