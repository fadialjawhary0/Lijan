import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import Card from '../../../components/ui/Card';

const MissionVisionSection = ({ config }) => {
  if (!config.missionVision?.enabled) return null;

  const getIcon = iconName => {
    const IconComponent = LucideIcons[iconName] || LucideIcons['Target'];
    return IconComponent;
  };

  const MissionCard = ({ item, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

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

    const IconComponent = getIcon(item.icon);

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
        className="h-full"
      >
        <Card
          className={`p-8 h-full relative overflow-hidden group cursor-pointer transition-all duration-500 ${
            isHovered ? 'shadow-2xl' : ''
          }`}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 opacity-0"
            style={{
              background: index === 0 
                ? `linear-gradient(135deg, var(--color-brand), var(--color-brand2))`
                : `linear-gradient(135deg, var(--color-brand2), var(--color-brand))`,
            }}
            animate={isHovered ? { opacity: 0.1, scale: [1, 1.1, 1] } : { opacity: 0, scale: 1 }}
            transition={isHovered ? { scale: { duration: 2, repeat: Infinity }, opacity: { duration: 0.3 } } : { duration: 0.3 }}
          />

          {/* Glowing effect on hover */}
          <motion.div
            className="absolute inset-0"
            animate={
              isHovered
                ? {
                    opacity: [0, 1, 0],
                    boxShadow: [
                      '0 0 0px rgba(48, 168, 226, 0)',
                      '0 0 30px rgba(48, 168, 226, 0.3)',
                      '0 0 0px rgba(48, 168, 226, 0)',
                    ],
                  }
                : { opacity: 0, boxShadow: '0 0 0px rgba(48, 168, 226, 0)' }
            }
            transition={isHovered ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
          />

          {/* Icon with 3D effect */}
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
            style={{
              background: index === 0 
                ? `linear-gradient(135deg, var(--color-brand), var(--color-brand2))`
                : `linear-gradient(135deg, var(--color-brand2), var(--color-brand))`,
              transformStyle: 'preserve-3d',
            }}
            animate={isHovered ? { rotateY: 360, scale: 1.1 } : { rotateY: 0, scale: 1 }}
            transition={isHovered ? { rotateY: { duration: 1.5, ease: 'easeInOut' }, scale: { duration: 0.3 } } : { duration: 0.3 }}
          >
            <IconComponent className="w-10 h-10 text-white relative z-10" />
            <motion.div
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{
                background: index === 0 
                  ? `linear-gradient(135deg, var(--color-brand), var(--color-brand2))`
                  : `linear-gradient(135deg, var(--color-brand2), var(--color-brand))`,
              }}
              animate={isHovered ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
              transition={isHovered ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }}
            />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">{item.title}</h3>
            <p className="text-[var(--color-text-muted)] leading-relaxed text-lg">{item.description}</p>
          </div>

          {/* Decorative corner element */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full"
            style={{
              background: index === 0 
                ? `linear-gradient(135deg, var(--color-brand), var(--color-brand2))`
                : `linear-gradient(135deg, var(--color-brand2), var(--color-brand))`,
            }}
            animate={isHovered ? { opacity: 0.05, scale: 1.2, rotate: 90 } : { opacity: 0, scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
          />
        </Card>
      </motion.div>
    );
  };

  return (
    <section className="py-20 bg-[var(--color-surface)]">
      <div className="container-app px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <MissionCard item={config.missionVision.mission} index={0} />
          <MissionCard item={config.missionVision.vision} index={1} />
        </motion.div>
      </div>
    </section>
  );
};

export default MissionVisionSection;

