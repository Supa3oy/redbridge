import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export const PLANS = {
  pro: {
    name: "Pro",
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
  agency: {
    name: "Agency",
    price: 49,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
  },
} as const;
