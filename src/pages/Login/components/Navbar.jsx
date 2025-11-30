import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import devoteamLogo from '../../../assets/HHC_Logo.png';
import ThemeToggle from '../../../components/ui/ThemeToggle';

const Navbar = ({ config, onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-card-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-app px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src={devoteamLogo} alt={config.brand.name} className="h-10" />
            <span className="text-lg font-semibold text-[var(--color-text)] hidden sm:block">
              {config.brand.name}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {config.about?.enabled && (
              <a href="#about" className="text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                About
              </a>
            )}
            {config.capabilities?.enabled && (
              <a href="#capabilities" className="text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                Capabilities
              </a>
            )}
            <ThemeToggle />
            <Button variant="primary" onClick={onLoginClick}>
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[var(--color-text)] cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--color-border)] py-4"
          >
            <div className="flex flex-col gap-4">
              {config.about?.enabled && (
                <a
                  href="#about"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
              )}
              {config.capabilities?.enabled && (
                <a
                  href="#capabilities"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Capabilities
                </a>
              )}
              <Button variant="primary" onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="w-full">
                Sign In
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

