import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../components/ui/Button';
import devoteamLogo from '../../../assets/HHC_Logo.png';
import coverImage1 from '../../../assets/cover2.png';
import coverImage2 from '../../../assets/dvt4.jpg';
import coverImage3 from '../../../assets/strategyMapBackgroundHHC.png';

const HeroSection = ({ config, onLoginClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(config.hero?.autoPlay ?? true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const images = config.hero?.backgroundImages || [coverImage1, coverImage2, coverImage3];

  useEffect(() => {
    const imagePromises = images.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(() => setImagesLoaded(true));
  }, [images]);

  useEffect(() => {
    if (!isAutoPlaying || !config.hero?.autoPlay || !imagesLoaded) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, config.hero?.autoPlayInterval || 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length, config.hero?.autoPlay, config.hero?.autoPlayInterval, imagesLoaded]);

  const goToSlide = index => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Image Carousel Background */}
      <div className="absolute inset-0 z-0">
        {/* Render all images, show only current one */}
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: idx === currentIndex ? 1 : 0,
              scale: idx === currentIndex ? 1 : 1.05,
            }}
            transition={{
              opacity: { duration: 0.6, ease: 'easeInOut' },
              scale: { duration: 0.6, ease: 'easeInOut' },
            }}
            style={{
              zIndex: idx === currentIndex ? 1 : 0,
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${img})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            </div>
          </motion.div>
        ))}

        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand)]/20 via-transparent to-[var(--color-brand)]/20"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />

        {/* Floating particles effect */}
        {config.hero.showAnimation && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[var(--color-brand)]/30 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all group"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all group"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Content */}
      <motion.div className="relative z-10 container-app text-center px-4 py-20" variants={containerVariants} initial="hidden" animate="visible">
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-8">
          <img src={devoteamLogo} alt={config.brand.name} className="h-30 mx-auto mb-6" />
        </motion.div>

        {/* Title */}
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {config.hero.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto">
          {config.hero.subtitle}
        </motion.p>

        {/* Description */}
        <motion.p variants={itemVariants} className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          {config.hero.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onLoginClick}
            className="bg-white text-[var(--color-brand)] hover:bg-white/90 font-semibold px-8 py-4 text-lg"
          >
            {config.hero.ctaText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-8 py-4 text-lg backdrop-blur-sm"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </motion.div>
      </motion.div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${index === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <motion.div className="w-1 h-3 bg-white/70 rounded-full" animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
