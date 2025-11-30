// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import devoteamLogo from '../../assets/HHC_Logo.png';
// // import devoteamLogo from '../../assets/CompanyLogo.jpg';
// // import dvtImage from '../../assets/dvt4.jpg';
// import dvtImage from '../../assets/cover2.png';
// import { useLoginMutation } from '../../queries/auth';
// import { useAuth } from '../../context/AuthContext';
// import ButtonLoader from '../../components/ui/ButtonLoader';
// import ThemeToggle from '../../components/ui/ThemeToggle';
// import Button from '../../components/ui/Button';

// const LoginPage = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState({ username: false, password: false });
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login: authLogin, isAuthenticated } = useAuth();

//   useEffect(() => {
//     if (isAuthenticated) {
//       // const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
//       localStorage.removeItem('redirectAfterLogin');
//       // navigate(redirectTo, { replace: true });
//     }

//     // Check for success message from navigation state
//     if (location.state?.message) {
//       setSuccessMessage(location.state.message);
//       // Clear the message from location state
//       window.history.replaceState({}, document.title);
//     }
//   }, [isAuthenticated, navigate, location]);

//   const { mutate: login } = useLoginMutation();

//   const validateFields = () => {
//     const errors = {
//       username: !username.trim(),
//       password: !password.trim(),
//     };

//     setFieldErrors(errors);

//     if (error) {
//       setError('');
//     }

//     return !errors.username && !errors.password;
//   };

//   const handleSubmit = e => {
//     e.preventDefault();
//     setIsLoading(true);

//     if (!validateFields()) {
//       setError('Please enter both username and password.');
//       setIsLoading(false);
//       return;
//     }

//     login(
//       { username, password },
//       {
//         onSuccess: response => {
//           setIsLoading(false);
//           if (response.succeeded) {
//             // Check if password change is required
//             if (response.data?.isPasswordChangeRequired) {
//               // Store auth data temporarily
//               authLogin(response);
//               // Redirect to change password page
//               navigate('/change-password');
//             } else {
//               authLogin(response);
//               navigate('/');
//             }
//           } else {
//             const errorMessage = response.errors && response.errors.length > 0 ? response.errors[0] : 'Something went wrong.';
//             setError(errorMessage);
//           }
//         },
//         onError: error => {
//           setIsLoading(false);
//           const errorMessage = error.response?.data?.errors?.[0] || error.message || 'Invalid username or password.';
//           setError(errorMessage);
//         },
//       }
//     );
//   };

//   const handleInputChange = (field, value) => {
//     if (field === 'username') {
//       setUsername(value);
//     } else if (field === 'password') {
//       setPassword(value);
//     }

//     if (fieldErrors[field]) {
//       setFieldErrors(prev => ({ ...prev, [field]: false }));
//     }

//     if (error) {
//       setError('');
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Left image section */}
//       <div className="hidden md:flex w-0 md:w-2/3 h-screen">
//         <img src={dvtImage} alt="Digital transformation city" className="object-cover w-full h-full" />
//       </div>
//       {/* Right form section */}
//       <div className="flex flex-col justify-center items-center w-full md:w-1/3 bg-card-surface px-6 py-8 shadow-lg z-10">
//         <div className="flex items-center justify-center w-full mb-6 gap-4">
//           <img src={devoteamLogo} alt="Devoteam Logo" className="w-40" />
//           <ThemeToggle />
//         </div>

//         <h2 className="text-xl font-semibold mb-2">Sign in with your login credentials</h2>
//         <form className="w-full max-w-xs flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
//           <input
//             name="username"
//             type="text"
//             autoComplete="username"
//             placeholder="Username"
//             value={username}
//             onChange={e => handleInputChange('username', e.target.value)}
//             className={`input-base px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-brand  ${
//               fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-brand'
//             }`}
//             autoFocus
//             disabled={isLoading}
//           />
//           <div className="relative">
//             <input
//               name="password"
//               type={showPassword ? 'text' : 'password'}
//               placeholder="Password"
//               defaultValue=""
//               onChange={e => handleInputChange('password', e.target.value)}
//               className={`input-base px-3 py-2 pr-10 rounded border focus:outline-none focus:ring-2 focus:ring-brand w-full ${
//                 fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-brand'
//               }`}
//               disabled={isLoading}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text focus:outline-none"
//               disabled={isLoading}
//               tabIndex={-1}
//             >
//               {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//             </button>
//           </div>
//           {/* <label className="flex items-center gap-2 text-sm">
//             <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} className="accent-primary" disabled={isLoading} />
//             Login as administrator
//           </label> */}
//           {successMessage && <div className="text-green-500 text-sm text-center">{successMessage}</div>}
//           {error && <div className="text-red-500 text-sm text-center">{error}</div>}
//           <div className="relative">
//             <Button
//               type="submit"
//               variant="primary"
//               size="default"
//               className={` ${
//                 !!isLoading ? 'bg-surface-elevated cursor-not-allowed' : 'bg-brand'
//               } w-full py-2 rounded font-semibold hover:bg-brand-hover transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
//               disabled={isLoading}
//             >
//               {isLoading ? 'Logging in...' : 'Login'}
//             </Button>
//             {isLoading && <ButtonLoader />}
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { landingPageConfig } from './config/landingPageConfig';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import MissionVisionSection from './components/MissionVisionSection';
import StrategyOverviewSection from './components/StrategyOverviewSection';
import CapabilitiesSection from './components/FeaturesSection';
import LoginModal from './components/LoginModal';
import i18n from '../../i18n/i18n';

const LoginPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const loginSuccessfulRef = useRef(false);

  useEffect(() => {
    const previousLanguage = i18n.language;

    if (previousLanguage !== 'en') {
      sessionStorage.setItem('previousLanguage', previousLanguage);
    }

    i18n.changeLanguage('en');
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';

    return () => {
      if (!loginSuccessfulRef.current) {
        const storedPreviousLang = sessionStorage.getItem('previousLanguage');
        if (storedPreviousLang && storedPreviousLang !== 'en') {
          i18n.changeLanguage(storedPreviousLang);
          document.documentElement.lang = storedPreviousLang;
          document.documentElement.dir = storedPreviousLang === 'ar' ? 'rtl' : 'ltr';
        }
      }
      sessionStorage.removeItem('previousLanguage');
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loginSuccessfulRef.current = true;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      // This will be handled by the router
    }
  }, [isAuthenticated]);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {landingPageConfig.hero?.enabled && <Navbar config={landingPageConfig} onLoginClick={handleLoginClick} />}

      <main>
        {landingPageConfig.hero?.enabled && <HeroSection config={landingPageConfig} onLoginClick={handleLoginClick} />}

        <div id="about">
          <AboutSection config={landingPageConfig} />
        </div>

        <MissionVisionSection config={landingPageConfig} />

        <StrategyOverviewSection config={landingPageConfig} />

        <div id="capabilities">
          <CapabilitiesSection config={landingPageConfig} />
        </div>
      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default LoginPage;
