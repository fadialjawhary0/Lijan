import { useState, useEffect } from 'react';
import { DEFAULT_CHART_TYPE } from '../constants/chartTypes';

const STORAGE_KEY = 'chartPreferences';

const getChartPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading chart preferences from localStorage:', error);
    return {};
  }
};

const setChartPreference = (chartKey, chartType) => {
  try {
    const preferences = getChartPreferences();
    preferences[chartKey] = chartType;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving chart preference to localStorage:', error);
  }
};

export const useChartType = (chartKey, defaultType = DEFAULT_CHART_TYPE) => {
  const [chartType, setChartType] = useState(() => {
    const preferences = getChartPreferences();
    return preferences[chartKey] || defaultType;
  });

  useEffect(() => {
    setChartPreference(chartKey, chartType);
  }, [chartType, chartKey]);

  return [chartType, setChartType];
};
