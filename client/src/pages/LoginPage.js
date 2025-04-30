import React, { useState } from 'react';
import { Button, Typography, Box, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  loginWithGoogle,
  loginWithGithub,
  registerWithEmail,
  loginWithEmail
} from '../firebase';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const result = await loginWithGithub();
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate('/');
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  };

  const handleEmailLogin = async () => {
    try {
      const result = await loginWithEmail(email, password);
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate('/');
    } catch (error) {
      alert('Login failed. Please check your credentials or register.');
      console.error(error);
    }
  };

  const handleEmailRegister = async () => {
    try {
      const result = await registerWithEmail(email, password);
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate('/');
    } catch (error) {
      alert('Registration failed. Maybe this email is already in use.');
      console.error(error);
    }
  };

  return (
    <Box className="login-page">
      <Box className="login-overlay" />
      <Box className="login-card">
        <Typography variant="h6" sx={{ mb: 3 }}>
          Welcome to SmartStay
        </Typography>

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}
        />

        <Button
          fullWidth
          className="email-login"
          variant="contained"
          onClick={handleEmailLogin}
        >
          LOGIN WITH EMAIL
        </Button>

        <Button
          fullWidth
          className="email-register"
          variant="contained"
          onClick={handleEmailRegister}
        >
          REGISTER WITH EMAIL
        </Button>

        <Button
          variant="contained"
          fullWidth
          className="google-login"
          onClick={handleGoogleLogin}
        >
          SIGN IN WITH GOOGLE
        </Button>

        <Button
          variant="contained"
          fullWidth
          className="github-login"
          onClick={handleGithubLogin}
        >
          SIGN IN WITH GITHUB
        </Button>
      </Box>
    </Box>
  );
}
