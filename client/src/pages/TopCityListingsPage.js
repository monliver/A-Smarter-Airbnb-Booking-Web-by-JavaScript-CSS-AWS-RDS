import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Chip, 
  Rating, 
  Button,
  CircularProgress
} from '@mui/material';
import './TopCityListingsPage.css';

export default function TopCityListingsPage() {
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!city) {
      navigate('/');
      return;
    }
    
    setLoading(true);
    
    console.log(`Attempting to fetch listings for city: ${city}`);
    
    fetch(`http://localhost:8080/top_rated_with_review?city=${encodeURIComponent(city)}`)
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Received data:', data);
        if (data && data.length > 0) {
          console.log('First listing review_scores_rating:', data[0].review_scores_rating, 
                      'Type:', typeof data[0].review_scores_rating);
        }
        setListings(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching listings:', error);
        alert(`Failed to fetch listings: ${error.message}. Check if the server is running.`);
        setLoading(false);
      });
  }, [city, navigate]);

  if (loading) {
    return (
      <>
        <Box sx={{ mt: 12, textAlign: 'center', width: '100%' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading top listings in {city}...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box sx={{ mt: 12, mb: 5, width: '100%', px: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Top Rated Stays in {city}
        </Typography>
        
        {listings.length === 0 ? (
          <Typography>No listings found. Try another city.</Typography>
        ) : (
          <Box className="listings-grid">
            {listings.map((listing) => (
              <Box key={listing.rank} className="listing-item">
                <Card 
                  elevation={3} 
                  className="listing-card"
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      className="card-media"
                      image={listing.picture_url || 'https://via.placeholder.com/300x200?text=No+Image+Available'}
                      alt={listing.name}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        const textDiv = document.createElement('div');
                        textDiv.style.height = '300px';
                        textDiv.style.display = 'flex';
                        textDiv.style.alignItems = 'center';
                        textDiv.style.justifyContent = 'center';
                        textDiv.style.backgroundColor = '#f0f0f0';
                        textDiv.style.color = '#666';
                        textDiv.style.fontSize = '16px';
                        textDiv.textContent = 'Photo not available';
                        parent.appendChild(textDiv);
                      }}
                    />
                    <Chip 
                      label={`#${listing.rank}`} 
                      color="primary"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        left: 10,
                        fontWeight: 'bold'
                      }} 
                    />
                    <Chip 
                      label={listing.room_type} 
                      color="secondary"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10
                      }} 
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} className="card-content">
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {listing.name.length > 65 ? listing.name.substring(0, 65) + '...' : listing.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {listing.neighborhood}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={Number(listing.review_scores_rating) || 0} 
                        precision={0.1} 
                        readOnly 
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({(Number(listing.review_scores_rating) || 0).toFixed(2)}/5, {listing.number_of_reviews} reviews)
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Accommodates: {listing.accommodates} guests
                    </Typography>
                    
                    <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2, flex: 1 }} className="review-box">
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{listing.random_review && listing.random_review.length > 150 
                          ? listing.random_review.substring(0, 150) + '...' 
                          : listing.random_review}"
                      </Typography>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      href={listing.listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Airbnb
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </>
  );
} 