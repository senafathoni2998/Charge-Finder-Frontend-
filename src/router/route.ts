import { createElement } from "react";
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
import NotFound from "../pages/NotFound";
import RouteError from "../pages/RouteError";
import { RedirectIfAuth, RequireAdmin, RequireAuth } from "./guards";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: App,
        errorElement: createElement(RouteError),
      },
      {
        path: "station/:id",
        Component: StationDetail,
        errorElement: createElement(RouteError),
      },
      {
        Component: RequireAuth,
        children: [
          {
            path: "profile",
            Component: Profile,
            loader: profileLoader,
            action: profileAction,
            errorElement: createElement(RouteError),
          },
          {
            path: "profile/cars/new",
            Component: AddCar,
            action: addCarAction,
            errorElement: createElement(RouteError),
          },
          {
            path: "profile/cars/:carId/edit",
            Component: EditCar,
            action: editCarAction,
            errorElement: createElement(RouteError),
          },
          {
            Component: RequireAdmin,
            children: [
              {
                path: "admin",
                Component: Admin,
                errorElement: createElement(RouteError),
              },
              {
                path: "admin/stations/new",
                Component: AddStation,
                action: addStationAction,
                errorElement: createElement(RouteError),
              },
              {
                path: "admin/stations/:stationId/edit",
                Component: EditStation,
                action: editStationAction,
                errorElement: createElement(RouteError),
              },
              {
                path: "admin/users/new",
                Component: AddUser,
                action: addUserAction,
                errorElement: createElement(RouteError),
              },
            ],
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
        errorElement: createElement(RouteError),
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
        errorElement: createElement(RouteError),
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
        errorElement: createElement(RouteError),
      },
    ],
  },
]);

export default router;
