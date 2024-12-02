import { Outlet } from "react-router";
import {
  GlobalConfirmationDialogProvider,
  GlobalSnackbarProvider,
} from "./components";

const GlobalLayout = () => {
  return (
    <>
      <GlobalSnackbarProvider />
      <GlobalConfirmationDialogProvider />
      <Outlet />
    </>
  );
};

export default GlobalLayout;
