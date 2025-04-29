import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ListingDetailsPage.css';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/listings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setListing(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching listing:', err);
        setLoading(false);
      });
  }, [id]);

  const fetchReviews = (search = '') => {
    fetch(`http://localhost:8080/reviews/${id}?q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error('Error fetching reviews:', err));
  };

  const handleReviewClick = () => {
    setShowReviews(true);
    fetchReviews(''); // fetch all reviews on open
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    fetchReviews(e.target.value);
  };
  if (loading) return <div className="listing-details">Loading...</div>;
  if (!listing) return <div className="listing-details">Listing not found.</div>;

  return (
    <div className="listing-details">
      <h1>Listing #{listing.id}</h1>

      {!imageError ? (
        <img
          src={listing.picture_url}
          alt="Listing"
          className="listing-image"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="image-fallback">
          Photo not available
        </div>
      )}

      <hr className="listing-divider" />

      <div className="listing-meta">
        <div className="listing-basics">
          {listing.accommodates} guest{listing.accommodates > 1 ? 's' : ''} ·
          {` ${listing.bedrooms} bedroom${listing.bedrooms > 1 ? 's' : ''}`} ·
          {` ${listing.beds} bed${listing.beds > 1 ? 's' : ''}`}
        </div>
        <div className="listing-rating">
          ⭐ {listing.review_scores_rating} ·{' '}
          <span className="listing-reviews" onClick={handleReviewClick}>
            {listing.number_of_reviews} reviews
          </span>
        </div>
      </div>

      <hr className="listing-divider" />

      <div
        className="listing-description"
        dangerouslySetInnerHTML={{ __html: listing.description }}
      />

      <hr className="listing-divider" />

      {showReviews && (
        <div className="reviews-popup">
          <div className="reviews-header">  
            <button className="close-button" onClick={() => setShowReviews(false)}>Close</button>
              <div className="rating-line">
                <h2>⭐ {listing.review_scores_rating}</h2> ·{' '}
                <p>{listing.number_of_reviews} reviews</p>
              </div>
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={handleSearch}
              />
          </div>

          <div className="reviews-body">
            {reviews.length === 0 ? (
              <p>No reviews found.</p>
            ) : (
            <ul className="reviews-list">
              {reviews.map((review) => (
                <li key={review.review_id} className="review-item">
                  <strong>{review.reviewer_name}</strong>  ·{' '}
                  {new Date(review.date).toLocaleDateString()}
                  <br />
                  <p>{review.comments}</p>
                </li>
              ))}
            </ul>)}
          </div>
        </div>
      )}



      <hr className="listing-divider" />

      <a
        href={listing.listing_url}
        target="_blank"
        rel="noopener noreferrer"
        className="airbnb-link"
      >
        View on Airbnb →
      </a>

      <hr className="listing-divider" />



    </div>
  );
};

export default ListingDetailsPage;
