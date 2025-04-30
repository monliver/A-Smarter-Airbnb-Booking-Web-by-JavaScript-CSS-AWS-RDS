const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js

// SmartStay Routes
app.get('/high_rated_family_listings', routes.highRatedFamilyListings);
app.get('/reviews/:id', routes.listingReviewKeyword);
app.get('/flexible_instant_listings', routes.flexibleInstantListings);
app.get('/cheapest_dates/:listing_id', routes.cheapestAvailableDates);
app.get('/averageChristmasPrice/:listing_id', routes.averageChristmasPrice);
app.get('/superhost_avg_price/:city', routes.superhostAveragePrice);
app.get('/filtered_sorted_listings', routes.filteredSortedListings);
app.get('/top_rated_with_review', routes.topRatedWithReview);
app.get('/cheapest_months', routes.cheapestMonthsByCity);
app.get('/monthly_price_trend/:listing_id', routes.monthlyPriceTrend);
app.get('/random_listing', routes.randomListing);
app.get('/project_author/:type', routes.projectAuthor);
app.get('/listings/:id', routes.listingDetailsById);
app.get('/available_cities', routes.getAvailableCities);
app.get('/available_amenities', routes.getAvailableAmenities);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
