# 🏡 SmartStay  
**Your Ultimate Data-Powered Airbnb Travel Planner** https://smartstay-84693.web.app (Only UI) https://smartstay-84693.web.app

SmartStay is a full-stack web app that empowers users to make smarter Airbnb booking decisions. It enhances the search experience with custom filters, review-based rankings, and price insights that Airbnb itself doesn’t offer. Built with real Airbnb data from 34 major U.S. cities, SmartStay supports both casual travelers and data-savvy planners.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Material UI (MUI), Framer Motion  
- **Backend**: Node.js, Express.js  
- **Database**: PostgreSQL (hosted on AWS RDS, 58M+ calendar records)  
- **Authentication**: Firebase (Google, GitHub, Email/Password)  
- **External API**: OpenWeatherMap API (for live weather updates)

---

## 🔍 Key Features

1. **Flexible Filters**  
   Filter listings by city, rating, amenities, and guest capacity. Results are interactive and linked to deeper analytics.

2. **Top Rated Explorer**  
   See the top 10 highest-rated listings per city, each with live reviews, pictures, and ratings.

3. **Best Time to Book**  
   Analyze monthly price trends and get the 3 cheapest booking dates per listing. Holiday week prices also included.

4. **“Surprise Me” Tool**  
   Discover a random high-rated listing—ideal for spontaneous planners.

5. **Instant Bookable View**  
   One-click filter for listings that support instant booking and include free parking.

6. **Family Travel Finder**  
   Search listings that accommodate 4+ guests and maintain high ratings.

7. **Live Weather Widget**  
   Displays current weather in top cities using OpenWeatherMap API, updated every time the homepage loads.

8. **Secure Multi-Platform Login**  
   Firebase Authentication supports Email/Password, Google, and GitHub login.

---

## 📊 Dataset

Data sourced from the [Inside Airbnb USA Kaggle Dataset](https://www.kaggle.com/datasets/konradb/inside-airbnb-usa), covering:

- 34 U.S. cities  
- Over 58 million records in `calendar.csv`  
- ~8.7M reviews  
- 166K listings  
- 27K unique amenities (normalized)  

We consolidated the CSVs into 6 unified nationwide datasets and stored them in PostgreSQL using 3NF schema.

---

## ⚙️ Performance Highlights

- **Query Optimization**: Reduced /top_rated_with_review runtime from 15.2s → 3.1s with indexing, filter pushdown, and materialized views.
- **Efficient Dropdown Search**: City dropdown auto-populated via backend `/available_cities` route and Material UI's Autocomplete with fuzzy search.
- **Data Normalization**: 1NF and 3NF compliance; amenities and neighborhoods normalized for fast querying and join performance.

---


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
