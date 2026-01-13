import { createBrowserRouter } from "react-router";
import App from "../pages/MainPage";
import RootLayout from "../layout/RootLayout";
import StationDetail from "../pages/StationDetail";
import Login, { loginAction } from "../pages/Login";
import Signup, { signupAction } from "../pages/Signup";
import Profile, { profileAction, profileLoader } from "../pages/Profile";
import AddCar, { addCarAction } from "../pages/AddCar";
import EditCar, { editCarAction } from "../pages/EditCar";
import Admin from "../pages/Admin";
import AddStation, { addStationAction } from "../pages/AddStation";
import EditStation, { editStationAction } from "../pages/EditStation";
import AddUser, { addUserAction } from "../pages/AddUser";
import { RedirectIfAuth, RequireAdmin, RequireAuth } from "./guards";

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
          {
            path: "profile/cars/:carId/edit",
            Component: EditCar,
            action: editCarAction,
          },
          {
            Component: RequireAdmin,
            children: [
              {
                path: "admin",
                Component: Admin,
              },
              {
                path: "admin/stations/new",
                Component: AddStation,
                action: addStationAction,
              },
              {
                path: "admin/stations/:stationId/edit",
                Component: EditStation,
                action: editStationAction,
              },
              {
                path: "admin/users/new",
                Component: AddUser,
                action: addUserAction,
              },
            ],
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
