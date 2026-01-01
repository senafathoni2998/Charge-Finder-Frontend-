import { createBrowserRouter } from "react-router";
import App from "../pages/MainPage";
import RootLayout from "../layout/RootLayout";
import StationDetail from "../pages/StationDetail";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Profile from "../pages/Profile";
import AddCar from "../pages/Profile/AddCar";
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
          {
            path: "profile",
            Component: Profile,
          },
          {
            path: "profile/cars/new",
            Component: AddCar,
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
  {
    path: "/signup",
    Component: RedirectIfAuth,
    children: [
      {
        index: true,
        Component: Signup,
      },
    ],
  },
]);

export default router;
