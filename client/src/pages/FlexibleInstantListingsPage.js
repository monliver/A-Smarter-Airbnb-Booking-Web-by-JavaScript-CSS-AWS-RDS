import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Box, CircularProgress, Pagination, 
  Skeleton, TableFooter, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import config from '../config.json';
import './FlexibleInstantListingsPage.css';

const FlexibleInstantListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://${config.server_host}:${config.server_port}/flexible_instant_listings`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        if (data.length > 0) {
          console.log('First listing sample:', data[0]);
          console.log('First listing keys:', Object.keys(data[0]));
        }
        setListings(data);
        setTotalCount(data.length);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching flexible instant listings:', err);
        setError('Failed to load listings. Please try again later.');
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const paginatedListings = listings.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Loading skeleton for better UX during loading
  const renderSkeleton = () => {
    return Array.from(new Array(rowsPerPage)).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
        <TableCell><Skeleton animation="wave" /></TableCell>
      </TableRow>
    ));
  };

  const headerStyle = {
    fontWeight: 'bold',
    color: '#000000'
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="flexible-instant-container">
      <Typography variant="h4" component="h1" gutterBottom className="page-title">
        Instant Bookable Listings with Free Parking
      </Typography>
      <Typography variant="subtitle1" gutterBottom className="page-subtitle">
        Ready for a roadtrip? Here is list of instant bookable listings with free parking
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="rows-per-page-label">Show</InputLabel>
          <Select
            labelId="rows-per-page-label"
            id="rows-per-page"
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            label="Show"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Paper elevation={3} className="table-container">
        <TableContainer>
          <Table aria-label="flexible instant listings table" className="custom-table">
            <TableHead>
              <TableRow>
                <TableCell style={headerStyle}>ID</TableCell>
                <TableCell style={headerStyle}>Name</TableCell>
                <TableCell style={headerStyle}>City</TableCell>
                <TableCell style={headerStyle}>Rating</TableCell>
                <TableCell style={headerStyle}>Overall Avg Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeleton()
              ) : paginatedListings.length > 0 ? (
                paginatedListings.map((listing) => (
                  <TableRow key={listing.listing_id} className="listing-row">
                    <TableCell>
                      <a
                        href={`/listing-details/${listing.listing_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: '#007bff' }}
                      >
                        {listing.listing_id}
                      </a>
                    </TableCell>
                    <TableCell>{listing.name}</TableCell>
                    <TableCell>{listing.neighbourhood}</TableCell>
                    <TableCell>{listing.review_scores_rating}</TableCell>
                    <TableCell>
                      ${parseFloat(listing.overall_avg_price || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No listings found</TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
                    {loading && <CircularProgress size={24} sx={{ mr: 2 }} />}
                    <Pagination 
                      count={Math.ceil(totalCount / rowsPerPage)}
                      page={page}
                      onChange={handleChangePage}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default FlexibleInstantListingsPage; 