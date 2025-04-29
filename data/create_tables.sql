
-- 1) Hosts
CREATE TABLE Hosts (
    host_id BIGINT PRIMARY KEY,
    host_name VARCHAR(255),
    host_since DATE,
    host_location VARCHAR(255),
    host_response_time VARCHAR(100),
    host_identity_verified BOOLEAN,
    host_has_profile_pic BOOLEAN,
    host_listings_count INT,
    host_total_listings_count INT
);

-- 2) is_super_host
CREATE TABLE is_super_host (
    host_id BIGINT PRIMARY KEY REFERENCES Hosts(host_id),
    host_is_superhost_boo BOOLEAN
);

-- 3) neighborhood_city
CREATE TABLE city_neighborhood (
    cleaned_neighborhood VARCHAR(100) NOT NULL PRIMARY KEY,
    city VARCHAR(100)
);

CREATE INDEX idx_city_neighborhood_city ON city_neighborhood (city);

-- 4) Listings
CREATE TABLE listings (
    id BIGINT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    host_id BIGINT NOT NULL REFERENCES hosts,
    room_type TEXT,
    cleaned_neighborhood TEXT
        CONSTRAINT fk_listing_neighborhood
        REFERENCES city_neighborhood
);

CREATE INDEX idx_listings_cleaned_neighborhood ON listings (cleaned_neighborhood);

-- 5) Listings_detailed
CREATE TABLE Listings_detailed (
    id BIGINT PRIMARY KEY REFERENCES Listings(id) ON DELETE CASCADE,
    description TEXT,
    listing_url TEXT,
    picture_url TEXT,
    bedrooms DOUBLE PRECISION,
    beds DOUBLE PRECISION,
    number_of_reviews INTEGER,
    accommodates INTEGER,
    instant_bookable BOOLEAN,
    review_scores_rating NUMERIC(5, 2)
);

-- 6) Amenities
CREATE TABLE Amenities (
    amenity_id SERIAL PRIMARY KEY,
    amenities TEXT
);

-- 7) Listings_Amenities
CREATE TABLE Listings_amenities (
    id BIGINT NOT NULL REFERENCES Listings(id) ON DELETE CASCADE,
    amenity_id INT NOT NULL REFERENCES Amenities(amenity_id) ON DELETE CASCADE,
    PRIMARY KEY (id, amenity_id)
);

-- 8) Calendar
CREATE TABLE Calendar (
    listing_id BIGINT NOT NULL REFERENCES Listings(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    price NUMERIC(10, 2),
    adjusted_price NUMERIC(10, 2),
    minimum_nights INTEGER,
    maximum_nights INTEGER,
    available_boo BOOLEAN,
    PRIMARY KEY (listing_id, date)
);
CREATE INDEX idx_calendar_date ON calendar (date);

-- 9) Reviews
CREATE TABLE Reviews (
    review_id BIGINT PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES Listings(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(255),
    date DATE,
    comments TEXT
);
CREATE INDEX idx_reviews_listing_id ON reviews (listing_id);

-- 10) Application Users
CREATE TABLE Application_users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);

-- 11) monthly_avg_cache Materialized View
CREATE MATERIALIZED VIEW monthly_avg_cache AS
SELECT listing_id,
       date_trunc('month', date)::date AS month,
       AVG(price) AS avg_price
FROM calendar
GROUP BY listing_id, date_trunc('month', date)::date;

-- 12) city_monthly_avg Materialized View
create materialized view city_monthly_avg as
SELECT nc.city,
       mac.month,
       avg(mac.avg_price) AS avg_price
FROM monthly_avg_cache mac
         JOIN listings l ON mac.listing_id = l.id
         JOIN city_neighborhood nc ON l.cleaned_neighborhood = nc.cleaned_neighborhood::text
GROUP BY nc.city, mac.month;

create index city_monthly_avg_city_month_idx
    on city_monthly_avg (city, month);


-- 13) monthly_avg_cache Materlized View
create materialized view monthly_avg_cache as
SELECT listing_id,
       date_trunc('month'::text, date::timestamp with time zone)::date AS month,
       avg(price)                                                      AS avg_price
FROM calendar
GROUP BY listing_id, (date_trunc('month'::text, date::timestamp with time zone)::date);


-- 14) superhost_neighborhood_monthly Materlized View
create materialized view superhost_neighborhood_monthly as
SELECT n.city,
       l.cleaned_neighborhood,
       date_trunc('month'::text, c.date::timestamp with time zone) AS month,
       avg(c.price)                                                AS avg_price
FROM listings l
         JOIN city_neighborhood n ON n.cleaned_neighborhood::text = l.cleaned_neighborhood
         JOIN is_super_host i ON i.host_id = l.host_id
         JOIN calendar c ON c.listing_id = l.id
WHERE i.host_is_superhost_boo = true
GROUP BY n.city, l.cleaned_neighborhood, (date_trunc('month'::text, c.date::timestamp with time zone));

create index superhost_neighborhood_monthly_city_neighbourhood_idx
    on superhost_neighborhood_monthly (city, cleaned_neighborhood);

--15) listing_overall_avg_price View
create view listing_overall_avg_price(listing_id, overall_avg_price) as
SELECT listing_id,
       round(avg(avg_price), 2) AS overall_avg_price
FROM monthly_avg_cache
GROUP BY listing_id;


