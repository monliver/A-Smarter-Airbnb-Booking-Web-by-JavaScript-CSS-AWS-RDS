import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import config from '../config.json';

export default function BestTimePage() {
  const { listingId: routeId } = useParams();
  const [listingId] = useState(routeId || '');
  const [cheapestDates, setCheapestDates] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [christmasWeekAvg, setChristmasWeekAvg] = useState([]);

  const fetchCheapestDates = async () => {
    try {
      const res = await fetch(`http://${config.server_host}:${config.server_port}/cheapest_dates/${listingId}`);
      const data = await res.json();
      setCheapestDates(data);
    } catch (err) {
      console.error('Error fetching cheapest dates:', err);
    }
  };

  const fetchMonthlyTrend = async () => {
    try {
      const res = await fetch(`http://${config.server_host}:${config.server_port}/monthly_price_trend/${listingId}`);
      const data = await res.json();
      setMonthlyTrend(data);
    } catch (err) {
      console.error('Error fetching monthly trend:', err);
    }
  };

  const fetchChristmasPrice = async () => {
    try {
      const res = await fetch(`http://${config.server_host}:${config.server_port}/averageChristmasPrice/${listingId}`);
      const data = await res.json();
      setChristmasWeekAvg(data);
    } catch (err) {
      console.error('Error fetching Christmas week average:', err);
    }
  };

  const handleSearch = () => {
    fetchCheapestDates();
    fetchMonthlyTrend();
    fetchChristmasPrice();
  };

  useEffect(() => {
    if (routeId) {
      handleSearch();
    }
  }, [routeId]);

  return (
    <Container sx={{ mt: '120px' }}>
      <Typography variant="h4" align="center" sx={{ mt: 4, mb: 2 }}>Best Time to Book</Typography>

      {cheapestDates.length > 0 && (
        <>
          <Typography variant="h6">Best Value Booking Dates</Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>Date</TableCell>
                  <TableCell sx={{ width: '50%' }}>Price ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cheapestDates.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.date.slice(0, 10)}</TableCell>
                    <TableCell>{row.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {monthlyTrend.length > 0 && (
        <>
          <Typography variant="h6">Monthly Price Trend</Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>Month</TableCell>
                  <TableCell sx={{ width: '50%' }}>Avg Price ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyTrend.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.avg_monthly_price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {christmasWeekAvg.length > 0 && (
        <>
          <Typography variant="h6">Neighborhood Prices During Peak Season (Dec 20 -26)</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>Neighborhood</TableCell>
                  <TableCell sx={{ width: '50%' }}>Avg Price ($)</TableCell>
                </TableRow> 
              </TableHead>
              <TableBody>
                {christmasWeekAvg.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.neighbourhood || 'No Data'}</TableCell>
                    <TableCell>
                      {row.avg_price_christmas !== null && row.avg_price_christmas !== undefined
                        ? row.avg_price_christmas
                        : 'No Data'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}

