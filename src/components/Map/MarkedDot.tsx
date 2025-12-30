import { Box, Tooltip } from "@mui/material";

export default function MarkerDot({
  x,
  y,
  color,
  active,
  label,
  onClick,
}: {
  x: number;
  y: number;
  color: string;
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip title={label} placement="top" arrow>
      <Box
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
        sx={{
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: "translate(-50%, -50%)",
          width: active ? 18 : 14,
          height: active ? 18 : 14,
          borderRadius: 999,
          cursor: "pointer",
          backgroundColor: color,
          boxShadow: active
            ? "0 0 0 10px rgba(124,92,255,0.14)"
            : "0 6px 18px rgba(10,10,16,0.18)",
          border: "2px solid rgba(255,255,255,0.95)",
        }}
      />
    </Tooltip>
  );
}