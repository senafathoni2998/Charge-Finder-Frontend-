import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { useLocation, useNavigate } from "react-router";
import { UI } from "../../theme/theme";

// Not found page that guides users back to valid routes.
export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigates to the app landing page.
  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  // Navigates back to the previous page.
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 5,
            borderColor: UI.border2,
            background: UI.surface,
            boxShadow: UI.shadow,
            overflow: "hidden",
          }}
        >
          <Box sx={{ height: 6, background: UI.brandGradStrong }} />
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={2}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(244,67,54,0.12)",
                  color: "rgba(244,67,54,0.9)",
                }}
              >
                <ReportGmailerrorredIcon />
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: 28, color: UI.text }}>
                404 - Page not found
              </Typography>
              <Typography sx={{ color: UI.text2 }}>
                The page you are looking for does not exist or has been moved.
              </Typography>
              <Typography sx={{ color: UI.text3, fontSize: 13 }}>
                Requested path: {location.pathname}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  onClick={handleGoHome}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    background: UI.brandGrad,
                    boxShadow: "0 12px 24px rgba(124,92,255,0.2)",
                  }}
                >
                  Go to home
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleGoBack}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                  }}
                >
                  Go back
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
