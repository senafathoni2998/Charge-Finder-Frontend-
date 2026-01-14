import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import RootLayout from "../layout/RootLayout";
import RouteError from "../pages/RouteError";
import { RedirectIfAuth, RequireAdmin, RequireAuth } from "./guards";

const routeErrorElement = createElement(RouteError);

const lazyMainPage = async () => {
  const module = await import("../pages/MainPage");
  return { Component: module.default };
};

const lazyStationDetail = async () => {
  const module = await import("../pages/StationDetail");
  return { Component: module.default };
};

const lazyProfile = async () => {
  const module = await import("../pages/Profile");
  return {
    Component: module.default,
    loader: module.profileLoader,
    action: module.profileAction,
  };
};

const lazyAddCar = async () => {
  const module = await import("../pages/AddCar");
  return { Component: module.default, action: module.addCarAction };
};

const lazyEditCar = async () => {
  const module = await import("../pages/EditCar");
  return { Component: module.default, action: module.editCarAction };
};

const lazyAdmin = async () => {
  const module = await import("../pages/Admin");
  return { Component: module.default };
};

const lazyAddStation = async () => {
  const module = await import("../pages/AddStation");
  return { Component: module.default, action: module.addStationAction };
};

const lazyEditStation = async () => {
  const module = await import("../pages/EditStation");
  return { Component: module.default, action: module.editStationAction };
};

const lazyAddUser = async () => {
  const module = await import("../pages/AddUser");
  return { Component: module.default, action: module.addUserAction };
};

const lazyLogin = async () => {
  const module = await import("../pages/Login");
  return { Component: module.default, action: module.loginAction };
};

const lazySignup = async () => {
  const module = await import("../pages/Signup");
  return { Component: module.default, action: module.signupAction };
};

const lazyNotFound = async () => {
  const module = await import("../pages/NotFound");
  return { Component: module.default };
};

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: lazyMainPage,
        errorElement: routeErrorElement,
      },
      {
        path: "station/:id",
        lazy: lazyStationDetail,
        errorElement: routeErrorElement,
      },
      {
        Component: RequireAuth,
        children: [
          {
            path: "profile",
            lazy: lazyProfile,
            errorElement: routeErrorElement,
          },
          {
            path: "profile/cars/new",
            lazy: lazyAddCar,
            errorElement: routeErrorElement,
          },
          {
            path: "profile/cars/:carId/edit",
            lazy: lazyEditCar,
            errorElement: routeErrorElement,
          },
          {
            Component: RequireAdmin,
            children: [
              {
                path: "admin",
                lazy: lazyAdmin,
                errorElement: routeErrorElement,
              },
              {
                path: "admin/stations/new",
                lazy: lazyAddStation,
                errorElement: routeErrorElement,
              },
              {
                path: "admin/stations/:stationId/edit",
                lazy: lazyEditStation,
                errorElement: routeErrorElement,
              },
              {
                path: "admin/users/new",
                lazy: lazyAddUser,
                errorElement: routeErrorElement,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        lazy: lazyNotFound,
        errorElement: routeErrorElement,
      },
    ],
  },
  {
    path: "/login",
    Component: RedirectIfAuth,
    children: [
      {
        index: true,
        lazy: lazyLogin,
        errorElement: routeErrorElement,
      },
    ],
  },
  {
    path: "/signup",
    Component: RedirectIfAuth,
    children: [
      {
        index: true,
        lazy: lazySignup,
        errorElement: routeErrorElement,
      },
    ],
  },
]);

export default router;
