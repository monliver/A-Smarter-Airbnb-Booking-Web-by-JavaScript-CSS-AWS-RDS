import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Grid,
} from '@mui/material';
import './HomePage.css';
import config from '../config.json';

// Getting city images
import newYorkImg from '../images/New York City.jpg';
import sanFranciscoImg from '../images/San Francisco.jpg';
import seattleImg from '../images/Seattle.jpg';
import losAngelesImg from '../images/Los Angeles.jpg';
import sanDiegoImg from '../images/San Diego.jpg';
import lasVegasImg from '../images/Las Vegas.jpg';
import chicagoImg from '../images/Chicago.jpg';
import hawaiiImg from '../images/Hawaii.jpg';
import austinImg from '../images/Austin.jpg';
import nashvilleImg from '../images/Nashville.jpg';
import denverImg from '../images/Denver.jpg';
import portlandImg from '../images/Portland.jpg';

const CITY_IMAGES = {
  'New York City': newYorkImg,
  'San Francisco': sanFranciscoImg,
  'Seattle': seattleImg,
  'Los Angeles': losAngelesImg,
  'San Diego': sanDiegoImg,
  'Las Vegas': lasVegasImg,
  'Chicago': chicagoImg,
  'Hawaii': hawaiiImg,
  'Austin': austinImg,
  'Nashville': nashvilleImg,
  'Denver': denverImg,
  'Portland': portlandImg
};

// Top cities
const FEATURED_CITIES = [
  'New York City', 'Seattle', 'Los Angeles', 'San Diego', 
  'Las Vegas', 'Chicago', 'Hawaii', 'Austin', 
  'Denver', 'San Francisco', 'Portland', 'Nashville'
];

export default function HomePage() {
  const [authors, setAuthors] = React.useState('');
  const [group, setGroup] = React.useState('');
  const navigate = useNavigate();

  const handleCityClick = (city) => {
    navigate(`/city-insights?city=${encodeURIComponent(city)}`);
  };

  const handleRandomListing = async () => {
    try {
      const response = await fetch(`http://${config.server_host}:${config.server_port}/random_listing`);
      const data = await response.json();
  
      if (data && data.id) {
        window.open(`/listing-details/${data.id}`, '_blank', 'noopener,noreferrer');
      } else {
        alert("No listing found. Try again.");
      }
    } catch (err) {
      console.error('Error fetching random listing:', err);
      alert("Failed to load random listing.");
    }
  };
  

  React.useEffect(() => {
    // Fetch authors
    fetch(`http://${config.server_host}:${config.server_port}/project_author/names`)
      .then(response => response.json())
      .then(data => {
        setAuthors(data.data);
      })
      .catch(error => {
        console.error('Error fetching authors:', error);
      });
      
    // Fetch group info
    fetch(`http://${config.server_host}:${config.server_port}/project_author/group`)
      .then(response => response.json())
      .then(data => {
        setGroup(data.data);
      })
      .catch(error => {
        console.error('Error fetching group:', error);
      });
  }, []);

  return (
    <Box>
      <Box className="hero">
        <Box className="overlay" />

        <Typography variant="h2" className="hero-title" sx={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Smarter Plan for your next Airbnb Stay
        </Typography>
      </Box>

      <Box className="featured-cities-container">
        <Typography variant="h4" align="center" sx={{ mb: 2 }}>
          Explore Top Airbnbs in the Popular Cities
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
          Discover top rated listings and city's price trend
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {FEATURED_CITIES.map(city => (
            <Grid item key={city} xs={12} sm={6} md={4} lg={3}>
              <Card 
                className="city-card"
                elevation={4}
                sx={{ 
                  height: '100%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleCityClick(city)}
                  sx={{ height: '100%' }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={CITY_IMAGES[city]}
                    alt={city}
                  />
                  <CardContent sx={{ 
                    textAlign: 'center',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    py: 1.5
                  }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {city}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ 
        textAlign: 'center', 
        py: 6, 
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        mx: 4,
        my: 4,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Feeling Adventurous?
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          onClick={handleRandomListing}
          sx={{ 
            py: 1.5, 
            px: 4, 
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          Surprise me with a random best rated listing...
        </Button>
      </Box>

      <Box className="footer">
        {(group || authors) && (
          <Typography>
            {group && `Created by: ${group} - `}
            {authors}
          </Typography>
        )}
      </Box>
    </Box>
  );
} 