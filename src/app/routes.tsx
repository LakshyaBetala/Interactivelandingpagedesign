import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import VasooliBhai from "./pages/VasooliBhai";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/vasooli-bhai",
    Component: VasooliBhai,
  },
]);
