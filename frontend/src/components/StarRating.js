import React from "react";

const StarRating = ({ rating, onRatingChange, songId }) => {
  const handleStarClick = (newRating) => {
    if (onRatingChange) {
      onRatingChange(songId, newRating);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? "filled" : ""}`}
          onClick={() => handleStarClick(star)}
          title={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
