import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router";
import { GlobalLayout } from "../app/layouts";
import { HomePage, VacinasPage } from "../app/pages";

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<GlobalLayout />}>
      <Route index element={<HomePage />} />
      <Route path="vacinas" element={<VacinasPage />} />
    </Route>
  )
);

export default appRouter;
