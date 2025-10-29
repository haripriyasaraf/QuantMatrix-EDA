import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import { CustomThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <Dashboard />
    </CustomThemeProvider>
  );
}

export default App;
