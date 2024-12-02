import { AlertProps } from "@mui/material";
import appStore from "../../../stores/app/AppStore";

const useApp = () => {
  const openSnackbar = ({
    message,
    severity,
  }: {
    message: string;
    severity: AlertProps["severity"];
  }) => {
    appStore.setState({
      snackbar: {
        open: true,
        message,
        severity,
      },
    });
  };

  const closeSnackbar = () => {
    appStore.setState({
      snackbar: {
        open: false,
        message: null,
        severity: null,
      },
    });
  };

  return { openSnackbar, closeSnackbar };
};

export default useApp;
