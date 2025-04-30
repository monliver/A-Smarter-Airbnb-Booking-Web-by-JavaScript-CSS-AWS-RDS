const { Pool, types } = require('pg');
const config = require('./config.json');

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => String(val)); 

const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect(err => err && console.error(err));

/******************
 * SMARTSTAY ROUTES *
 ******************/

// Route 1: GET /high_rated_family_listings - Listings with high ratings in city and 4+ guests
const highRatedFamilyListings = async (req, res) => {
  const city = req.query.city
  if (!city) {
    return res.status(400).json({ error: "City name is required."})
  }
  try {
    const query = `
      SELECT l.id, l.name, l.cleaned_neighborhood as neighbourhood, ld.beds, ld.bedrooms,
             ld.accommodates, ld.review_scores_rating
      FROM Listings l
      INNER JOIN Listings_detailed ld ON l.id = ld.id
      INNER JOIN city_neighborhood as n ON n.cleaned_neighborhood = l.cleaned_neighborhood
      WHERE ld.review_scores_rating > 4.8
        AND ld.accommodates >= 4
        AND n.city ILIKE $1
    `;
    const values = [`%${city}%`];
    const result = await connection.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching high-rated family listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Route 2: GET /listingReviewKeyword - For a given listing, list all reviews containing provided keyword
const listingReviewKeyword = async (req, res) => {
  const listingId = req.params.id;
  const keyword = req.query.q || '';

  if (!listingId ) {
    return res.status(400).json({ error: "Both listing_id and keyword are required." });
  }
  try {
    const searchKeyword = `%${keyword}%`;
    const query = `
      SELECT
        r.review_id::text as review_id,
        r.listing_id::text as listing_id,
        r.comments,
        r.date, 
        r.reviewer_name
      FROM reviews r
      WHERE r.listing_id = $1
        AND r.comments ILIKE $2;
    `;
    const { rows } = await connection.query(query, [listingId, searchKeyword]);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching listing reviews by keyword:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Route 3: GET /flexible_instant_listings
// Listings with free parking & instant bookable, showing overall average price
const flexibleInstantListings = async (req, res) => {
  try {
    const query = `
      WITH Free_Parking_Listings AS (
        SELECT la.id
        FROM listings_amenities la
        JOIN amenities a 
          ON la.amenity_id = a.amenity_id
        WHERE a.amenities ILIKE '%free parking%'
      )
      SELECT
        l.id::text         AS listing_id,
        l.name,
        l.cleaned_neighborhood as neighbourhood,
        ld.review_scores_rating,
        o.overall_avg_price
      FROM listings l
      JOIN listings_detailed ld 
        ON l.id = ld.id
      JOIN Free_Parking_Listings fp 
        ON l.id = fp.id
      JOIN listing_overall_avg_price o 
        ON l.id = o.listing_id
      WHERE ld.instant_bookable = TRUE
      ORDER BY o.overall_avg_price DESC;
    `;

    const result = await connection.query(query);
    console.log("Flexible instant listings response sample:", result.rows.length > 0 ? result.rows[0] : "No results");
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching flexible instant listings:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Route 4: GET /cheapest_dates/:listing_id - 3 lowest available prices for a specific listing
const cheapestAvailableDates = async (req, res) => {
  const listingId = req.params.listing_id;

  try {
    const query = `
      SELECT listing_id::text as listing_id, date, ROUND(price, 2) AS price
      FROM Calendar
      WHERE available_boo = TRUE
        AND listing_id = $1
        AND price IS NOT NULL
      ORDER BY price ASC
      LIMIT 3;
    `;
    const { rows } = await connection.query(query, [listingId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in /cheapest_dates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Route 5: GET /avg_christmas_price - Avg price of 1-bedroom listings during Christmas week, grouped by city
const averageChristmasPrice = async (req, res) => {
  const listingId = req.params.listing_id;
  try {
    const query = `
      SELECT 
        COALESCE(NULLIF(TRIM(l.cleaned_neighborhood), ''), 'Unknown') AS neighbourhood,
        ROUND(AVG(c.price), 2) AS avg_price_christmas
      FROM listings l
      JOIN calendar c ON l.id = c.listing_id
      WHERE l.id = $1
        AND c.date BETWEEN '2023-12-20' AND '2023-12-26'
        AND c.price IS NOT NULL
      GROUP BY 1;
    `;
    const { rows } = await connection.query(query, [listingId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in /averageChristmasPrice/:listing_id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Route 6: GET /superhost_avg_price - Avg price of listings managed by superhosts by neighborhood in city
const superhostAveragePrice = async (req, res) => {
  // res.json({ message: 'This will return a superhostAveragePrice featured SmartStay listing based on filters.' });
    const { city } =  req.params;
    if (!city) {
      return res.status(400).json({ error: "City name is required."})
    } else {console.log(city)}

      const query = `
SELECT
  cleaned_neighborhood as neighbourhood,
  ROUND(AVG(avg_price), 2) AS avg_price
FROM superhost_neighborhood_monthly
WHERE city = $1
GROUP BY cleaned_neighborhood
ORDER BY cleaned_neighborhood;
      `;
      connection.query(query, [city], (err, data) => {
        if(err) {
          console.log(err);
          res.json({});
        } else {
          res.json(data.rows);
        }
      })
      
  };
  
// Route 7: GET /filtered_sorted_listings - Filter/sort listings by neighborhood, amenities, ratings, reviews
const filteredSortedListings = async (req, res) => {
  // res.json({ message: 'Filter/sort listings by neighborhood, amenities, ratings, reviews.' });
  const { amenities, min_rating, city } = req.query;

  if (!amenities || !min_rating || !city) {
    return res.status(400).json({ error: 'Missing amenities or minimum rating, or city.' });
  }

  // Convert comma-separated amenities string into array
  const amenityList = amenities.split(',').map(item => item.trim());
  const query = `
  SELECT
    l.id::text AS listing_id,
    l.name AS listing_name,
    l.cleaned_neighborhood as neighbourhood,
    ld.review_scores_rating,
    ld.number_of_reviews,
    STRING_AGG(DISTINCT a.amenities, ', ') AS amenities_list
  FROM Listings l
  LEFT JOIN Listings_detailed ld ON l.id = ld.id
  LEFT JOIN Listings_Amenities la ON l.id = la.id
  LEFT JOIN Amenities a ON la.amenity_id = a.amenity_id
  INNER JOIN city_neighborhood as n ON n.cleaned_neighborhood = l.cleaned_neighborhood
  WHERE a.amenities = ANY ($1::text[])
    AND ld.review_scores_rating >= $2
    AND n.city ILIKE $3
  GROUP BY
    l.id, l.name,
    l.cleaned_neighborhood,
    ld.review_scores_rating,
    ld.number_of_reviews
  ORDER BY
    ld.review_scores_rating DESC,
    ld.number_of_reviews DESC
`;

const values = [amenityList, parseFloat(min_rating), `%${city}%`];

connection.query(query, values, (err, data) => {
  if(err) {
    console.log(err);
    res.json({});
  } else {
    res.json(data.rows);
  }
})

};

// Route 7.1: GET /available_amenities
const getAvailableAmenities = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT amenities
      FROM amenities
      ORDER BY amenities ASC;
    `;
    const result = await connection.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching available amenities:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Route 8: GET /top_rated_with_review - Retrieve the top 10 listings in a specified city, ranked first by highest review_scores_rating (DESC) 
// and then by number_of_reviews (DESC). For each listing, show its rank, name, neighborhood, room type, listing URL, picture URL, accommodates, 
// review score, number of reviews, and one random review comment.
const topRatedWithReview = async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: "City name is required." });
  }

  try {
    const query = `
      WITH ranked_listings AS (
        SELECT
          ld.id AS id,
          l.name,
          l.cleaned_neighborhood,
          l.room_type,
          ld.listing_url,
          ld.picture_url,
          ld.accommodates,
          ld.review_scores_rating,
          ld.number_of_reviews,
          ROW_NUMBER() OVER (
            ORDER BY
              ld.review_scores_rating DESC,
              ld.number_of_reviews DESC
          ) AS rank
        FROM Listings AS l
        INNER JOIN city_neighborhood as nc ON nc.cleaned_neighborhood = l.cleaned_neighborhood
        INNER JOIN listings_detailed AS ld
          ON l.id = ld.id
        WHERE nc.city ILIKE $1
      )
      SELECT
        rl.id,
        rl.rank,
        rl.name,
        rl.cleaned_neighborhood        AS neighborhood,
        rl.room_type,
        rl.listing_url,
        rl.picture_url,
        rl.accommodates,
        rl.review_scores_rating,
        rl.number_of_reviews,
        rev.random_review
      FROM ranked_listings AS rl
      CROSS JOIN LATERAL (
        SELECT r.comments AS random_review
        FROM reviews AS r
        WHERE r.listing_id = rl.id
        ORDER BY RANDOM()
        LIMIT 1
      ) AS rev
      WHERE rl.rank <= 10
      ORDER BY rl.rank;
    `;
    const values = [`%${city}%`];
    const result = await connection.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching top-rated listings with reviews:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Route 9: GET /cheapest_months - 3 cheapest months by avg price for given city/neighborhood
const cheapestMonthsByCity = async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: "City name is required."});
  }
  try {
    const query = `
      SELECT 
        TO_CHAR(month, 'YYYY-MM') AS month,
        ROUND(avg_price, 2) AS avg_price
      FROM city_monthly_avg
      WHERE LOWER(city) = LOWER($1)
      ORDER BY avg_price ASC
      LIMIT 3;
    `;
    const values = [city];
    const result = await connection.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching cheapest months:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Route 9.1: GET /available_cities 
const getAvailableCities = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT city
      FROM city_neighborhood
      ORDER BY city ASC;
    `;
    const result = await connection.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching available cities:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Route 10: GET /monthly_price_trend/:listing_id - Avg monthly booking price trend for a listing
const monthlyPriceTrend = async (req, res) => {
  const listingId = req.params.listing_id;

  try {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', c.date), 'YYYY-MM') AS month,
        ROUND(AVG(c.price), 2) AS avg_monthly_price,
        c.listing_id::text as listing_id
      FROM Calendar c
      WHERE c.listing_id = $1
        AND c.available_boo = TRUE
        AND c.price IS NOT NULL
      GROUP BY DATE_TRUNC('month', c.date), c.listing_id
      ORDER BY month;
    `;
    const { rows } = await connection.query(query, [listingId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in /monthly_price_trend:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Route 11: GET /random_listing - Return a random featured SmartStay listing with reviews > 4.9
const randomListing = async function(req, res) {
  connection.query(`
    SELECT
      ld.id::text AS id
    FROM listings AS l
    INNER JOIN listings_detailed AS ld
      ON l.id = ld.id
    WHERE ld.review_scores_rating > 4.9
    ORDER BY RANDOM()
    LIMIT 1;
  `, (err, data) => {
    if (err) {
      // If there is an error, log it and return an empty object
      console.log(err);
      return res.json({});
    }

    // Return just the listing ID
    res.json({
      id: data.rows[0].id
    });
  });
};


// Route 12: GET /project_author - Return group number or group member names
const projectAuthor = async function (req, res) {
  const group = 'Group 7';
  const names = 'Ting Zhu, Yanghe Huo, Yitian Hou, Ziye Liu';

  if (req.params.type === 'group') {
    res.json({ data: group });
  } else if (req.params.type === 'names') {
    res.json({ data: names });
  } else {
    res.status(400).json({});
  }
};

// Route 13: get listing details by /listings/:id

const listingDetailsById = async function (req, res) {
  // res.json({ message: 'This will return a listingDetailsById featured SmartStay listing based on filters.' });
  const { id } =  req.params;
  if (!id) {
    return res.status(400).json({ error: "Listing ID is required."})
  }
    const query = `
      SELECT 
        id::text AS id,
        *
      FROM Listings_detailed l
      WHERE id = $1
    `;
    connection.query(query, [id], (err, data) => {
      if(err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows[0]);
      }
    })
    
};




module.exports = {
  highRatedFamilyListings,
  listingReviewKeyword,
  flexibleInstantListings,
  cheapestAvailableDates,
  averageChristmasPrice,
  superhostAveragePrice,
  filteredSortedListings,
  topRatedWithReview,
  cheapestMonthsByCity,
  monthlyPriceTrend,
  randomListing,
  projectAuthor,
  listingDetailsById,
  getAvailableCities,
  getAvailableAmenities
};
