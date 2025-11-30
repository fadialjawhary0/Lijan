import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from './Card';

const UnauthorizedContent = () => {
  const { t, i18n } = useTranslation('unauthorized');

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Card className="bg-surface-elevated p-6 flex items-center justify-center h-full w-full">
      <div className="text-center max-w-[600px]">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-text mb-4">{t('title')}</h1>

        <p className="text-text-muted mb-6">{t('description')}</p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {i18n.language === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {t('goBack')}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home size={16} />
            {t('goHome')}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default UnauthorizedContent;
