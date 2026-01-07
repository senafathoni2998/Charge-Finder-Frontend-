import { createBrowserRouter } from "react-router";
import App from "../pages/MainPage";
import RootLayout from "../layout/RootLayout";
import StationDetail from "../pages/StationDetail";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Profile, { profileLoader } from "../pages/Profile";
import AddCar from "../pages/AddCar";
import { RedirectIfAuth, RequireAuth } from "./guards";

const router = createBrowserRouter([
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
        Component: RequireAuth,
        children: [
          {
            path: "profile",
            Component: Profile,
            loader: profileLoader,
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
