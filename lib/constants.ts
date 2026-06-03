export const INDUSTRIES = [
  "Skincare & Beauty",
  "Body Care & Wellness",
  "Hair Care",
  "Supplements & Nutrition",
  "Food & Grocery",
  "Café & Coffee",
  "Restaurant & Dining",
  "Bakery & Desserts",
  "Wine & Beverages",
  "Fashion & Apparel",
  "Jewellery & Accessories",
  "Homewares & Interior",
  "Baby & Kids",
  "Pet Care",
  "Fitness & Sport",
  "Travel & Tourism",
  "Education & Tutoring",
  "Real Estate",
  "Medical & Dental",
  "Other",
] as const;

// Trends are AI-generated per industry; "Other" is not meaningful here
export const TREND_INDUSTRIES = INDUSTRIES.filter((i) => i !== "Other") as string[];
