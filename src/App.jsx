import React from 'react';

import AppRoutes from './routes/AppRoutes';
import ToasterContainer from './components/layout/ToasterContainer';

const App = () => {
  return (
    <div className=" min-h-screen">
      <AppRoutes />
      <ToasterContainer />
    </div>
  );
};

export default App;
