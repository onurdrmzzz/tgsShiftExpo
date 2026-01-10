import React from 'react';
import { StatusBar } from 'react-native';
import { Navigation } from './Navigation';
import { COLORS } from '../constants';

const App: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Navigation />
    </>
  );
};

export default App;
