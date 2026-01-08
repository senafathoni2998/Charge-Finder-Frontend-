import { Box } from "@mui/material";

// Adds ambient gradient shapes behind the signup card.
export default function SignupBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          left: -160,
          top: -160,
          borderRadius: 999,
          background:
            "radial-gradient(circle, rgba(124,92,255,0.22), rgba(124,92,255,0) 65%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          right: -180,
          bottom: -220,
          borderRadius: 999,
          background:
            "radial-gradient(circle, rgba(0,229,255,0.18), rgba(0,229,255,0) 65%)",
        }}
      />
    </Box>
  );
}
