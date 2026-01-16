import type { PaymentMethod } from "./types";

// Payment methods shown in the ticket purchase dialog.
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card",
    label: "Card - Visa **** 4242",
    helper: "Instant approval",
  },
  {
    id: "ewallet",
    label: "E-Wallet - GoPay",
    helper: "Balance required",
  },
  {
    id: "bank",
    label: "Bank transfer - BCA",
    helper: "May take 1-3 min",
  },
];

// Issue types offered in the report dialog.
export const REPORT_ISSUE_TYPES = [
  "Broken connector",
  "Occupied but shown available",
  "Payment problem",
  "Station offline",
  "Other",
];

// Default ticket size and estimated session length.
export const TICKET_KWH = 20;
export const TOTAL_CHARGE_MINUTES = 0;
