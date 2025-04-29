#  SmartStay
SmartStay is a full-stack web application designed to make Airbnb browsing smarter, faster, and more insightful. Built using real-world Airbnb data from 34 major U.S. cities, SmartStay enhances the travel planning experience by offering custom filtering, rating-based sorting, and data-driven insights that Airbnb itself doesn’t provide.

Whether you're a solo traveler, a family planning a group trip, or someone just looking for a cozy weekend stay, SmartStay helps you discover listings based on real review scores, amenities, price trends, and guest capacity—not just Airbnb’s internal algorithm.


## Technologies Used
Frontend: 
- React.js
- HTML & CSS
- Material UI (MUI)
- Framer Motion (for animations)

Backend:
- Node.js
- Express.js

Database:
- PostgreSQL 

External API: 
- OpenWeather API (for real-time weather data)

Authentication: 
- Firebase Authentication 


## Key Features
1. Flexible Search Filters: Filter listings by city, amenities, minimum rating, and guest capacity to find the perfect stay.

2. Data-Driven Insights: Visual tools for comparing superhost prices, monthly price trends, and cheapest booking periods.

3. Top Rated Listings: View the top 10 listings in each city with images, reviews, and listing details.

4. Smart Recommendation Tools: “Surprise Me” button provides a high-rated random listing; “Best Time” page helps you find optimal booking dates.

5. Family-Friendly Search: One-click search for listings that accommodate 4+ guests with excellent reviews.

6. Instant Bookable Listings: Easily find listings that support instant booking and include free parking.

7. Secure Authentication: Supports login via Google, GitHub, or email using Firebase.

8. Live Weather Display: Current weather conditions for selected cities powered by the OpenWeather API.


## Data Source
We use data from the [Inside Airbnb USA Kaggle dataset](https://www.kaggle.com/datasets/konradb/inside-airbnb-usa), which includes listings from 34 major U.S. cities. All CSVs were consolidated into six unified datasets to enable nationwide trend analysis.


## 🚀 Getting Started

Follow these steps to start the SmartStay app locally:

1. Clone the repo:

```bash
   git clone https://github.com/Tingzhueve/Group7-SmartStay.git
```

2. Install dependencies:

```sh
   cd server
   npm install
```

```sh
   cd ../client
   npm install
   npm install @mui/material @emotion/react @emotion/styled framer-motion
```

3. To run the app:
   In one terminal window (for the backend), type:

```sh
   cd server
   node server.js
```

    In another terminal window (for the frontend), type:

```sh
cd client
npm start
```
