import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import Card from '../../../components/ui/Card';

const AboutSection = ({ config }) => {
  if (!config.about?.enabled) return null;

  return (
    <section className="py-20 bg-[var(--color-surface-elevated)]">
      <div className="container-app px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-brand)]/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[var(--color-brand)]/10 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand)]/70 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)]">{config.about.title}</h2>
              </div>

              <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">{config.about.description}</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
