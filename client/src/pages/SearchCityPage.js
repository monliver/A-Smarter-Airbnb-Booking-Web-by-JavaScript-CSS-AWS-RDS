import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Autocomplete,
  TextField,
  Box,
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  Rating, 
} from '@mui/material';

import config from '../config.json';
import './SearchCityPage.css';
import { useLocation } from 'react-router-dom';



export default function SearchCityPage() {
  const [city, setCity] = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [superhostData, setSuperhostData] = useState([]);
  const [cheapestMonths, setCheapestMonths] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(superhostData.length / pageSize);
  const paginatedData = superhostData.slice((page - 1) * pageSize, page * pageSize);
  const location = useLocation();
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [topListings, setTopListings] = useState([]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityFromQuery = params.get('city');
    if (cityFromQuery) {
      setCity(cityFromQuery);
      setHasAutoSearched(false); // reset so next effect knows to run
    }
  }, [location.search]);

  useEffect(() => {
    if (city && !hasAutoSearched) {
      handleSearch();
      setHasAutoSearched(true);
    }
  }, [city, hasAutoSearched]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/available_cities`)
      .then(res => res.json())
      .then(data => {
        const cityList = data.map(row => row.city);
        setCityOptions(cityList);
      })
      .catch(err => console.error('Error fetching cities:', err));
  }, []);

  const handleSearch = async () => {
    if (!city) return;
    setLoading(true);
    setPage(1);
    try {
      const encodedCity = encodeURIComponent(city.trim());
      const [superhostRes, monthsRes, listingsRes] = await Promise.all([
        fetch(`http://${config.server_host}:${config.server_port}/superhost_avg_price/${encodedCity}`),
        fetch(`http://${config.server_host}:${config.server_port}/cheapest_months?city=${encodedCity}`),
        fetch(`http://${config.server_host}:${config.server_port}/top_rated_with_review?city=${encodedCity}`)
      ]);

      const superhostJson = await superhostRes.json();
      const monthsJson = await monthsRes.json();
      const listingsJson = await listingsRes.json();

      setSuperhostData(superhostJson || []);
      setCheapestMonths(monthsJson|| []);
      setTopListings(listingsJson || []);
    } catch (err) {
      console.error('Error fetching city insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="city-page">
      <Container className="content">
        <Typography variant="h4" component="h1" gutterBottom className="page-title">City Insights</Typography>

        <Autocomplete
          options={cityOptions}
          value={city}
          onChange={(event, newValue) => setCity(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Choose a City"
              variant="outlined"
              fullWidth
            />
          )}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </Button>
        {topListings.length > 0 && (
  <Box sx={{ mt: 6, mb: 6 }}>
    <Typography variant="h5" gutterBottom>
      Top Rated Stays in {city}
    </Typography>

    <Box
      sx={{
        display: 'flex',
        overflowX: 'auto',
        gap: 2,
        py: 2,
        px: 1,
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#ccc',
          borderRadius: '4px',
        }
      }}
    >
      {topListings.map((listing, index) => (
        <Box
          key={listing.id || index}
          sx={{
            flex: '0 0 auto',
            scrollSnapAlign: 'start',
            minWidth: 300,
            maxWidth: 320,
          }}
        >
          <Card elevation={3} className="listing-card">
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={listing.picture_url || 'https://placehold.co/300x200/e0e0e0/808080?text=No+Image+Available'}
                alt={listing.name}
                onError={(e) => {
                  if (!e.target.dataset.usedFallback) {
                    e.target.dataset.usedFallback = 'true';
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/300x200/e0e0e0/808080?text=No+Image+Available';
                  }
                }}
              />
              <Chip label={listing.room_type} color="secondary" sx={{ position: 'absolute', top: 10, right: 10 }} />
            </Box>

            <CardContent>
              <Typography variant="h6" gutterBottom>
                {listing.name.length > 65 ? listing.name.substring(0, 65) + '...' : listing.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {listing.neighborhood}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Rating value={Number(listing.review_scores_rating) || 0} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({(Number(listing.review_scores_rating) || 0).toFixed(2)}/5, {listing.number_of_reviews} reviews)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Accommodates: {listing.accommodates} guests
              </Typography>
              <Box sx={{ mt: 2, mb: 2, p: 1.5, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="body2" fontStyle="italic">
                  "{listing.random_review?.length > 150
                    ? listing.random_review.substring(0, 150) + '...'
                    : listing.random_review}"
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                href={`/listing-details/${listing.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Listing Details
              </Button>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  </Box>
)}



        {superhostData.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4 }}>Average Price by Superhosts</Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Neighborhood</TableCell>
                    <TableCell align="center">Avg Price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="center">{row.neighbourhood || 'Unknown'}</TableCell>
                      <TableCell align="center">{row.avg_price || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" alignItems="center" gap={1} flexWrap="wrap" mb={4}>
              <Button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Prev</Button>

              {page > 2 && (
                <>
                  <Button onClick={() => setPage(1)} variant="outlined">1</Button>
                  {page > 3 && <span>...</span>}
                </>
              )}

              {page - 1 > 0 && (
                <Button onClick={() => setPage(page - 1)} variant="outlined">{page - 1}</Button>
              )}

              <Button variant="contained" disabled>{page}</Button>

              {page + 1 <= totalPages && (
                <Button onClick={() => setPage(page + 1)} variant="outlined">{page + 1}</Button>
              )}

              {page < totalPages - 1 && (
                <>
                  {page < totalPages - 2 && <span>...</span>}
                  <Button onClick={() => setPage(totalPages)} variant="outlined">{totalPages}</Button>
                </>
              )}

              <Button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</Button>
            </Box>

          </>
        )}

        {cheapestMonths.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4 }}>Cheapest Months to Book</Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Month</TableCell>
                    <TableCell align="center">Avg Price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cheapestMonths.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="center">{row.month}</TableCell>
                      <TableCell align="center">{row.avg_price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </div>
  );
}
