import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Container, Grid, TextField, Table, TableHead, TableBody, TableRow, TableCell, Typography, Autocomplete, Paper,Box, MenuItem, Slider, TableContainer } from '@mui/material';
import config from '../config.json';
import './SearchListingsPage.css';

function SearchListingsPage() {
  const [city, setCity] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const [jumpFilteredPage, setJumpFilteredPage] = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filteredPage, setFilteredPage] = useState(1);
  const [formError, setFormError] = useState('');


  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/available_cities`)
      .then(res => res.json())
      .then(data => {
        const cityList = data.map(row => row.city);
        setCityOptions(cityList);
      })
      .catch(err => console.error('Error fetching cities:', err));

    fetch(`http://${config.server_host}:${config.server_port}/available_amenities`)
      .then(res => res.json())
      .then(data => {
        const amenityList = data.map(row => row.amenities);
        setAmenityOptions(amenityList);
      })
      .catch(err => console.error('Error fetching amenities:', err));
  }, []);
  
  const itemsPerPage = 10;
  const filteredItemsPerPage = 10;

  const handleSearch = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/high_rated_family_listings?city=${city}`);
      const data = await response.json();
      setResults(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const safeFilteredResults = Array.isArray(filteredResults) ? filteredResults : [];
  const totalFilteredPages = Math.ceil(safeFilteredResults.length / filteredItemsPerPage);
  const currentFilteredResults = safeFilteredResults.slice(
    (filteredPage - 1) * filteredItemsPerPage,
    filteredPage * filteredItemsPerPage
  );

  const handleJumpPage = () => {
    const pageNumber = parseInt(jumpPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFilteredJumpPage = () => {
    const pageNum = parseInt(jumpFilteredPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalFilteredPages) {
      setFilteredPage(pageNum);
    }
  };  
  
  // Filter Function
  const handleFilterSearch = async () => {
    setFormError(''); 
    if (!city) {
      setFormError("Please select a city.");
      return;
    }

    if (selectedAmenities.length === 0) {
      setFormError("Please select at least one amenity.");
      return;
    }

    if (!minRating && minRating !== 0) {
      setFormError("Please select a minimum rating.");
      return;
    }    
  
    const params = new URLSearchParams();
    params.append('city', city);
    params.append('amenities', selectedAmenities.join(','));
    params.append('min_rating', minRating);
  
    try {
      const res = await fetch(`http://localhost:8080/filtered_sorted_listings?${params.toString()}`);
      const data = await res.json();
      setFilteredResults(data);
    } catch (err) {
      console.error('Error fetching filtered results:', err);
      setFormError("Failed to fetch listings. Please try again later.");
      setFilteredResults([]); 
    }
  };
  

  const tableVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.5 } }
  };

  return (
    <div className="city-page">
      <Container sx={{ mb: 8 }} className="content">
        <div className="filter-container">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mt: 18, mb: 5 }}>
            Find Your Next Stay
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={12}>
              <Autocomplete
                className="filter-input"
                options={cityOptions}
                value={city}
                onChange={(event, newValue) => setCity(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Choose a City" variant="outlined" fullWidth sx={{ borderRadius: '10px', minWidth: '400px' }} />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                className="filter-input"
                fullWidth
                sx={{ minWidth: '250px', borderRadius: '10px' }}
                select
                label="Select Amenities"
                value={selectedAmenities}
                onChange={(e) =>
                  setSelectedAmenities(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
                }
                SelectProps={{ multiple: true }}
              >
                {amenityOptions.map((amenity, i) => (
                  <MenuItem key={i} value={amenity}>{amenity}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mt: { xs: 3, md: 0 } }}>
                <Typography gutterBottom>Minimum Rating: {minRating}</Typography>
                <Slider
                  value={minRating}
                  min={0}
                  max={5}
                  step={0.1}
                  onChange={(e, newValue) => setMinRating(newValue)}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
          </Grid>

          <Box textAlign="center" mt={4}>
            <Button onClick={handleFilterSearch} 
            sx={{
                padding: '10px 20px',
                backgroundColor: '#7389bc',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#5d6f9d',
                },
              }}>
              Search
            </Button>
            {formError && (
              <Typography
                sx={{
                  color: 'red',
                  fontWeight: 'bold',
                  mt: 2,
                  textAlign: 'center',
                }}
              >
                {formError}
              </Typography>
            )}
          </Box>

          {filteredResults.length > 0 && (
            <Container sx={{ mt: 5 }}>
              <TableContainer component={Paper}>
                <Table className="custom-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Neighbourhood</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Reviews</TableCell>
                      <TableCell>Amenities</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentFilteredResults.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <a
                            href={`/listing-details/${row.listing_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: '#007bff' }}
                          >
                            {row.listing_id}
                          </a>
                        </TableCell>
                        <TableCell>{row.listing_name}</TableCell>
                        <TableCell>{row.neighbourhood}</TableCell>
                        <TableCell>{row.review_scores_rating}</TableCell>
                        <TableCell>{row.number_of_reviews}</TableCell>
                        <TableCell>{row.amenities_list}</TableCell>
                        <TableCell>
                          <a
                            href={`/best-time/${row.listing_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="best-time-btn">
                              Best Time
                            </button>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                </Table>
              </TableContainer>
              <Box mt={2} display="flex" alignItems="center" justifyContent="center" gap={2} className="pagination">
                <Button onClick={() => setFilteredPage(prev => Math.max(prev - 1, 1))} disabled={filteredPage === 1}>
                  Prev
                </Button>
                {filteredPage > 3 && (<><Button onClick={() => setFilteredPage(1)}>1</Button><span>...</span></>)}
                {filteredPage - 1 > 0 && (
                  <Button onClick={() => setFilteredPage(filteredPage - 1)}>{filteredPage - 1}</Button>
                )}
                <Button className="active" disabled>
                  {filteredPage}
                </Button>
                {filteredPage + 1 <= totalFilteredPages && (
                  <Button onClick={() => setFilteredPage(filteredPage + 1)}>{filteredPage + 1}</Button>
                )}
                {filteredPage < totalFilteredPages - 1 && (<><span>...</span><Button onClick={() => setFilteredPage(totalFilteredPages)}>{totalFilteredPages}</Button></>)}
                <Button
                  onClick={() => setFilteredPage(prev => Math.min(prev + 1, totalFilteredPages))}
                  disabled={filteredPage === totalFilteredPages}
                >
                  Next
                </Button>
                <div className="page-jump">
                  <input
                    type="number"
                    placeholder="Go to page"
                    value={jumpFilteredPage}
                    onChange={(e) => setJumpFilteredPage(e.target.value)}
                    min="1"
                    max={totalFilteredPages}
                  />
                  <button onClick={handleFilteredJumpPage}>Go</button>
                </div>
              </Box>


            </Container>
          )}
        </div>
      </Container>

      <div className="content">
        <div className="page-container search-listings" >
          <h2>Search Listings for Families</h2>
          <p>Find listings in your city that are highly rated and accommodate at least 4 guests.</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={tableVariants}
                style={{ height: '100%' }}
              >
                {results.length > 0 ? (
                  <>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Neighborhood</th>
                          <th>Accommodates</th>
                          <th>Rating</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentResults.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <a
                                href={`/listing-details/${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', color: '#007bff' }}
                              >
                                {item.id}
                              </a>
                            </td>
                            <td>{item.name}</td>
                            <td>{item.neighbourhood}</td>
                            <td>{item.accommodates}</td>
                            <td>{item.review_scores_rating}</td>
                            <td>
                              <a
                                href={`/best-time/${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button className="best-time-btn">
                                  Best Time
                                </button>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination">
                      <button 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                      {currentPage > 3 && (<><button onClick={() => handlePageChange(1)}>1</button><span>...</span></>)}
                      {currentPage - 1 > 0 && (
                        <button onClick={() => handlePageChange(currentPage - 1)}>{currentPage - 1}</button>
                      )}
                      <button className="active">{currentPage}</button>
                      {currentPage + 1 <= totalPages && (
                        <button onClick={() => handlePageChange(currentPage + 1)}>{currentPage + 1}</button>
                      )}
                      {currentPage < totalPages - 1 && (<><span>...</span><button onClick={() => handlePageChange(totalPages)}>{totalPages}</button></>)}
                      <button 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                      <div className="page-jump">
                        <input
                          type="number"
                          placeholder="Go to page"
                          value={jumpPage}
                          onChange={(e) => setJumpPage(e.target.value)}
                          min="1"
                          max={totalPages}
                        />
                        <button onClick={handleJumpPage}>Go</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>No results found.</p>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
      </div>
  );
}

export default SearchListingsPage;
