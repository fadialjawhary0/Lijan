import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '../../../queries/auth';
import { useAuth } from '../../../context/AuthContext';
import ButtonLoader from '../../../components/ui/ButtonLoader';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';

const LoginModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const { mutate: login } = useLoginMutation();

  const validateFields = () => {
    const errors = {
      username: !username.trim(),
      password: !password.trim(),
    };

    setFieldErrors(errors);

    if (error) {
      setError('');
    }

    return !errors.username && !errors.password;
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFields()) {
      setError('Please enter both username and password.');
      setIsLoading(false);
      return;
    }

    login(
      { username, password },
      {
        onSuccess: response => {
          setIsLoading(false);
          if (response.succeeded) {
            if (response.data?.isPasswordChangeRequired) {
              authLogin(response);
              navigate('/change-password');
            } else {
              authLogin(response);
              navigate('/');
            }
            onClose();
          } else {
            const errorMessage = response.errors && response.errors.length > 0 ? response.errors[0] : 'Something went wrong.';
            setError(errorMessage);
          }
        },
        onError: error => {
          setIsLoading(false);
          // Handle encryption errors specifically
          const errorMessage =
            error.message?.includes('encryption') || error.message?.includes('encrypt') || error.message?.includes('public key')
              ? 'Failed to encrypt password. Please try again.'
              : error.response?.data?.errors?.[0] || error.message || 'Invalid username or password.';
          setError(errorMessage);
        },
      }
    );
  };

  const handleInputChange = (field, value) => {
    if (field === 'username') {
      setUsername(value);
    } else if (field === 'password') {
      setPassword(value);
    }

    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: false }));
    }

    if (error) {
      setError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign In" size="md">
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Username</label>
          <input
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            value={username}
            onChange={e => handleInputChange('username', e.target.value)}
            className={`input-base px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] w-full ${
              fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)] focus:ring-[var(--color-brand)]'
            }`}
            autoFocus
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => handleInputChange('password', e.target.value)}
              className={`input-base px-3 py-2 pr-10 rounded border focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] w-full ${
                fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-[var(--color-border)] focus:ring-[var(--color-brand)]'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none cursor-pointer"
              disabled={isLoading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {successMessage && <div className="text-green-500 text-sm text-center">{successMessage}</div>}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        <div className="relative mt-2">
          <Button
            type="submit"
            variant="primary"
            size="default"
            className={`w-full py-2 rounded font-semibold transition ${isLoading ? 'bg-surface-elevated)] cursor-not-allowed' : ''}`}
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;
