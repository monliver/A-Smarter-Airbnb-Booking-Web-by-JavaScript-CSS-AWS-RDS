import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './NavBar.css';
import WeatherTicker from './WeatherTicker';

export default function NavBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
      navigate('/');
    });
  };

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{
        px: 4,
        py: 2,
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        top: 0
      }}
    >
<Toolbar sx={{ justifyContent: 'space-between' }}>
  {/* 左侧：Logo + Weather */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
    <Typography
      component={Link}
      to="/"
      sx={{ textDecoration: 'none', color: '#333', fontWeight: 'bold', fontSize: '1.6rem' }}
    >
      SmartStay
    </Typography>
    <WeatherTicker />
  </Box>

  {/* 中间 */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Button component={Link} to="/search-listings" color="inherit">
      Search Listings
    </Button>
    <Button component={Link} to="/flexible-instant-listings" color="inherit">
      Instant Bookables
    </Button>
    <Button component={Link} to="/city-insights" color="inherit">
      City Insights
    </Button>
  </Box>

  {/* 右侧：登录状态 */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    {user ? (
      <>
        <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
          Welcome, {user.displayName || user.email}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            px: 2.5,
            py: 1,
            borderRadius: '20px',
            borderColor: '#888',
            color: '#333'
          }}
        >
          Logout
        </Button>
      </>
    ) : (
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate('/login')}
        sx={{
          textTransform: 'none',
          fontWeight: 'bold',
          px: 3,
          py: 1,
          borderRadius: '20px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}
      >
        Login
      </Button>
    )}
  </Box>
</Toolbar>

    </AppBar>
  );
}
