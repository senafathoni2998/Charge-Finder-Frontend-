export type { Station, StationPhoto, StationPricing } from "../../models/model";

export type PaymentMethod = {
  id: string;
  label: string;
  helper: string;
};

export type ChargingStatus = "idle" | "charging" | "done";

export type Ticket = {
  id: string;
  methodId: string;
  methodLabel: string;
  priceLabel: string;
  purchasedAt: string;
  chargingStatus?: ChargingStatus;
  progressPercent?: number;
  chargingStartedAt?: string;
  chargingUpdatedAt?: string;
  chargingCompletedAt?: string;
};
