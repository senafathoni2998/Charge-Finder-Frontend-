import { createBrowserRouter } from "react-router";
import App from "../pages/MainPage";
import RootLayout from "../layout/RootLayout";
import StationDetail from "../pages/StationDetail";
import Login from "../pages/Login";
import { RedirectIfAuth, RequireAuth } from "./guards";

const router = createBrowserRouter([
  {
    Component: RequireAuth,
    children: [
      {
        path: "/",
        Component: RootLayout,
        children: [
          {
            index: true,
            Component: App,
          },
          {
            path: "station/:id",
            Component: StationDetail,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    Component: RedirectIfAuth,
    children: [
      {
        index: true,
        Component: Login,
      },
    ],
  },
]);

export default router;
