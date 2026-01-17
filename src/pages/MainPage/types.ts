import type {
  Availability,
  ConnectorType,
  Station as StationModel,
} from "../../models/model";

// Station shape needed for list + map views.
export type Station = StationModel;

export type StationWithDistance = StationModel & { distanceKm: number };

export type FilterStatus = "" | Availability;

export type StationFilters = {
  q: string;
  status: FilterStatus;
  connectorSet: Set<ConnectorType>;
  minKW: number;
  radiusKm: number;
};

export type StationBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  latSpan: number;
  lngSpan: number;
};
