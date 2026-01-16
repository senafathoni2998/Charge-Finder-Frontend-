import { Box, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

const MiniPhoto = ({
  label,
  gradient,
}: {
  label: string;
  gradient: string;
}) => {
  const background =
    typeof gradient === "string" && gradient.trim() ? gradient : UI.brandGrad;
  return (
    <Box
      sx={{
        height: 140,
        flex: 1,
        minWidth: 0,
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${UI.border2}`,
        background,
        position: "relative",
      }}
      aria-label={label}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.65))",
          mixBlendMode: "soft-light",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: 10,
          bottom: 10,
          px: 1,
          py: 0.5,
          borderRadius: 999,
          border: `1px solid ${UI.border}`,
          backgroundColor: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography variant="caption" sx={{ color: UI.text2, fontWeight: 750 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default MiniPhoto;
