import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import StarRating from "./StarRating";

test("renders star rating component", () => {
  const mockOnRatingChange = jest.fn();

  render(
    <StarRating
      rating={3}
      onRatingChange={mockOnRatingChange}
      songId="test-song"
    />
  );

  const stars = screen.getAllByText("★");
  expect(stars).toHaveLength(5);

  // Check that first 3 stars are filled
  for (let i = 0; i < 3; i++) {
    expect(stars[i]).toHaveClass("filled");
  }

  // Check that last 2 stars are not filled
  for (let i = 3; i < 5; i++) {
    expect(stars[i]).not.toHaveClass("filled");
  }
});

test("handles star click", () => {
  const mockOnRatingChange = jest.fn();

  render(
    <StarRating
      rating={2}
      onRatingChange={mockOnRatingChange}
      songId="test-song"
    />
  );

  const stars = screen.getAllByText("★");

  // Click the 4th star
  fireEvent.click(stars[3]);

  expect(mockOnRatingChange).toHaveBeenCalledWith("test-song", 4);
});

test("displays correct tooltips", () => {
  render(
    <StarRating rating={0} onRatingChange={() => {}} songId="test-song" />
  );

  const stars = screen.getAllByText("★");

  expect(stars[0]).toHaveAttribute("title", "Rate 1 star");
  expect(stars[4]).toHaveAttribute("title", "Rate 5 stars");
});
