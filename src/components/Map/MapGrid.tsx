import { Box } from "@mui/material";

export default function MapGrid() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: -2,
        backgroundImage:
          "linear-gradient(rgba(10,10,16,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,16,0.06) 1px, transparent 1px), linear-gradient(rgba(10,10,16,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(10,10,16,0.12) 2px, transparent 2px)",
        backgroundSize: "32px 32px, 32px 32px, 160px 160px, 160px 160px",
        opacity: 0.6,
        pointerEvents: "none",
      }}
    />
  );
}
