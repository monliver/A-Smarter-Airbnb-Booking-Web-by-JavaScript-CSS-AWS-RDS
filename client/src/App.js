import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import SearchListingsPage from './pages/SearchListingsPage';
import BestTimePage from './pages/BestTimePage';
import TopCityListingsPage from './pages/TopCityListingsPage';
import SearchCityPage from './pages/SearchCityPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import LoginPage from './pages/LoginPage';
import FlexibleInstantListingsPage from './pages/FlexibleInstantListingsPage';

const theme = createTheme({
  palette: { 
    primary: { main: '#7389bc' },
    secondary: { main: '#ff5a5f' }
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Box sx={{ mt: 8 }}> {/* Add margin top to account for fixed navbar */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/top-city-listings" element={<TopCityListingsPage />} />
            <Route path="/listing-details/:id" element={<ListingDetailsPage />} />
            <Route path="/listing-details" element={<ListingDetailsPage />} />
            <Route path="/search-listings" element={<SearchListingsPage />} />
            <Route path="/search-city" element={<SearchCityPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/city-insights" element={<SearchCityPage />} />
            <Route path="/best-time/:listingId" element={<BestTimePage />} />
            <Route path="/flexible-instant-listings" element={<FlexibleInstantListingsPage />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
