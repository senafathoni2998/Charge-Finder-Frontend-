import { createBrowserRouter } from "react-router";
import App from "../pages/MainPage";
import RootLayout from "../layout/RootLayout";
import StationDetail from "../pages/StationDetail";
import Login, { loginAction } from "../pages/Login";
import Signup, { signupAction } from "../pages/Signup";
import Profile, { profileAction, profileLoader } from "../pages/Profile";
import AddCar, { addCarAction } from "../pages/AddCar";
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
            action: profileAction,
          },
          {
            path: "profile/cars/new",
            Component: AddCar,
            action: addCarAction,
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
        action: loginAction,
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
        action: signupAction,
      },
    ],
  },
]);

export default router;
