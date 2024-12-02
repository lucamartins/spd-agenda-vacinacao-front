import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router";
import { GlobalLayout } from "../app/layouts";
import {
  AlergiasPage,
  HomePage,
  UsuariosPage,
  VacinasPage,
} from "../app/pages";

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<GlobalLayout />}>
      <Route index element={<HomePage />} />
      <Route path="vacinas" element={<VacinasPage />} />
      <Route path="alergias" element={<AlergiasPage />} />
      <Route path="usuarios" element={<UsuariosPage />} />
    </Route>
  )
);

export default appRouter;
