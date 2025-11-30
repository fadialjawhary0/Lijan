import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

const StrategyOverviewSection = ({ config }) => {
  if (!config.strategyOverview?.enabled) return null;

  const getIcon = iconName => {
    const IconComponent = LucideIcons[iconName] || LucideIcons['Target'];
    return IconComponent;
  };

  const brandColors = [
    { bg: 'var(--color-brand)', bg2: 'var(--color-brand2)' },
    { bg: 'var(--color-brand2)', bg2: 'var(--color-brand3)' },
    { bg: 'var(--color-brand3)', bg2: 'var(--color-brand)' },
  ];

  const StrategyCard = ({ item, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = getIcon(item.icon);
    const colors = brandColors[index % brandColors.length];

    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2, duration: 0.6 }}
      >
        <motion.div
          className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg2})`,
            minHeight: isHovered ? 'auto' : '300px',
          }}
          animate={isHovered ? { scale: 1.02, y: -5 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background number (subtle) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={isHovered ? { opacity: 0.1, scale: 1.1 } : { opacity: 0.15, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-[120px] md:text-[150px] font-bold text-white/30">{item.count}</span>
          </motion.div>

          {/* Content Container */}
          <div className="relative z-10 p-6 md:p-8 min-h-[300px] flex flex-col">
            {/* Header Section */}
            <div className="flex items-start gap-4 mb-6">
              <motion.div
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0"
                animate={isHovered ? { rotate: 360, scale: 1.15 } : { rotate: 0, scale: 1 }}
                transition={isHovered ? { rotate: { duration: 1.5, ease: 'easeInOut' }, scale: { duration: 0.3 } } : { duration: 0.3 }}
              >
                <IconComponent className="w-8 h-8 text-white" strokeWidth={2} />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{item.label}</h3>
                <AnimatePresence>
                  {!isHovered && (
                    <motion.p initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-white/80 text-sm">
                      {item.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Large Number */}
            <AnimatePresence>
              {!isHovered && (
                <motion.div initial={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }} className="mt-auto">
                  <span className="text-7xl md:text-8xl font-bold text-white">{item.count}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Content */}
            <AnimatePresence>
              {isHovered && item.items && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="mt-4 overflow-hidden"
                >
                  <div
                    className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.3) transparent' }}
                  >
                    {item.items.map((listItem, idx) => {
                      const ItemIcon = getIcon(listItem.icon);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <ItemIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold text-sm md:text-base mb-1">{listItem.title}</h4>
                              <p className="text-white/80 text-xs md:text-sm leading-relaxed">{listItem.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll indicator when expanded */}
            {isHovered && item.items && item.items.length > 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex justify-center">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-white/40 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Shine effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            animate={isHovered ? { x: ['-100%', '200%'] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ transform: 'skewX(-20deg)' }}
          />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-elevated)]">
      <div className="container-app px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">{config.strategyOverview.title}</h2>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">{config.strategyOverview.subtitle}</p>
        </motion.div>

        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {config.strategyOverview.items.map((item, index) => (
            <StrategyCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StrategyOverviewSection;
