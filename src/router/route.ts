import { createBrowserRouter } from "react-router"
import App from "../pages/MainPage";
import RootLayout from "../layout/RootLayout";

const router = createBrowserRouter([
    {
        path: "/",
        Component: RootLayout,
        children: [
            {
                index: true,
                Component: App,
            },
        ],
    },
]);

export default router;