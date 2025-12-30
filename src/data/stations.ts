/**
 * @typedef Station
 * @property {string} id
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 * @property {string} address
 * @property {{type: ConnectorType, powerKW: number}[]} connectors
 * @property {Availability} status
 * @property {string} lastUpdatedISO
 */
export const MOCK_STATIONS = /** @type {Station[]} */ [
  {
    id: "st-001",
    name: "Central Plaza Fast Charge",
    lat: -6.2009,
    lng: 106.8167,
    address: "Jl. MH Thamrin, Jakarta",
    connectors: [
      { type: "CCS2", powerKW: 100 },
      { type: "Type2", powerKW: 22 },
    ],
    status: "AVAILABLE",
    lastUpdatedISO: new Date(Date.now() - 7 * 60_000).toISOString(),
  },
  {
    id: "st-002",
    name: "Sudirman Hub",
    lat: -6.2146,
    lng: 106.8227,
    address: "Jl. Jend. Sudirman, Jakarta",
    connectors: [
      { type: "CCS2", powerKW: 60 },
      { type: "CHAdeMO", powerKW: 50 },
    ],
    status: "BUSY",
    lastUpdatedISO: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: "st-003",
    name: "Gandaria City Charger",
    lat: -6.2446,
    lng: 106.783,
    address: "Kebayoran Lama, Jakarta",
    connectors: [{ type: "Type2", powerKW: 11 }],
    status: "OFFLINE",
    lastUpdatedISO: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
  },
  {
    id: "st-004",
    name: "Kelapa Gading Supercharge",
    lat: -6.1577,
    lng: 106.905,
    address: "Kelapa Gading, Jakarta",
    connectors: [
      { type: "CCS2", powerKW: 150 },
      { type: "Type2", powerKW: 22 },
    ],
    status: "AVAILABLE",
    lastUpdatedISO: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
];