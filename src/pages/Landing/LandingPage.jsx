import React, { useEffect } from 'react';

import { useBreadcrumbs } from '../../context';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { t, i18n } = useTranslation('landingPage');
  const { t: tCommon } = useTranslation('common');

  useEffect(() => {
    setBreadcrumbs([
      { label: tCommon('home'), href: '/' },
      { label: t('breadcrumbs.landingPage'), href: '/landing-page' },
    ]);
  }, [setBreadcrumbs, i18n.language]);

  return (
    <>
      <div></div>
    </>
  );
};

export default LandingPage;
