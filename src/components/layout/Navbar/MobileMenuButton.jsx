import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';
import { NAVBAR_CLASSES } from '../../../constants/navbarConstants';

const MobileMenuButton = ({ onToggle }) => {
  return (
    <button onClick={onToggle} className={NAVBAR_CLASSES.mobileMenuButton} aria-label="Toggle mobile menu">
      <Menu className="w-5 h-5 text-gray-600" />
    </button>
  );
};

MobileMenuButton.propTypes = {
  onToggle: PropTypes.func.isRequired,
};

export default MobileMenuButton;
