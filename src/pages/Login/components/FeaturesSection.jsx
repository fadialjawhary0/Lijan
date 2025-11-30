import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import Card from '../../../components/ui/Card';

const CapabilitiesSection = ({ config }) => {
  if (!config.capabilities?.enabled) return null;

  const getIcon = iconName => {
    const IconComponent = LucideIcons[iconName] || LucideIcons['Target'];
    return IconComponent;
  };

  const CapabilityCard = ({ feature, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

    const handleMouseMove = e => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) / rect.width);
      y.set((e.clientY - centerY) / rect.height);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
      setIsHovered(false);
    };

    const IconComponent = getIcon(feature.icon);

    return (
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Card className="p-6 h-full relative overflow-hidden group cursor-pointer">
          {/* Gradient background on hover */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}
            animate={isHovered ? { opacity: [0, 0.08, 0] } : { opacity: 0 }}
            transition={isHovered ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
          />

          {/* Animated border glow */}
          <motion.div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient}`}
            animate={isHovered ? { opacity: [0, 0.3, 0] } : { opacity: 0 }}
            transition={isHovered ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }}
            style={{ padding: '1px' }}
          >
            <div className="w-full h-full bg-[var(--color-card-surface)] rounded-xl" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon with 3D flip effect */}
            <motion.div
              className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 relative overflow-hidden`}
              animate={isHovered ? { rotateY: 360, scale: 1.2 } : { rotateY: 0, scale: 1 }}
              transition={isHovered ? { rotateY: { duration: 1.2, ease: 'easeInOut' }, scale: { duration: 0.3 } } : { duration: 0.3 }}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}
                animate={isHovered ? { opacity: [0, 0.5, 0] } : { opacity: 0 }}
                transition={isHovered ? { duration: 1.2, repeat: Infinity } : { duration: 0.3 }}
              />
              <IconComponent className={`w-7 h-7 ${feature.color} relative z-10`} />
            </motion.div>

            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-brand)] transition-colors">{feature.title}</h3>
            <p className="text-[var(--color-text-muted)] leading-relaxed">{feature.description}</p>

            {/* Animated underline */}
            <motion.div
              className={`h-1 bg-gradient-to-r ${feature.gradient} mt-4 rounded-full`}
              animate={isHovered ? { width: '100%' } : { width: 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Floating particles on hover */}
          {isHovered && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-1 bg-gradient-to-br ${feature.gradient} rounded-full`}
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 80}%`,
                    y: `${50 + (Math.random() - 0.5) * 80}%`,
                    scale: [0, 1.5, 0],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <section className="py-20 bg-[var(--color-surface)]">
      <div className="container-app px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">{config.capabilities.title}</h2>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">{config.capabilities.subtitle}</p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.capabilities.items.map((feature, index) => (
            <CapabilityCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
