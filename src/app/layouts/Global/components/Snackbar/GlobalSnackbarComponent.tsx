import { Alert, Snackbar as MUISnackbar } from "@mui/material";
import useApp from "../../../../shared/hooks/useApp";
import appStore from "../../../../stores/app/AppStore";

const GlobalSnackbarComponent = () => {
  const { closeSnackbar } = useApp();
  const snackbarDetails = appStore((state) => state.snackbar);

  if (!snackbarDetails.message || !snackbarDetails.severity) return null;

  return (
    <MUISnackbar
      open={snackbarDetails.open}
      onClose={closeSnackbar}
      autoHideDuration={5000}
    >
      <Alert
        severity={snackbarDetails.severity}
        onClose={closeSnackbar}
        sx={{ width: "100%" }}
      >
        {snackbarDetails.message}
      </Alert>
    </MUISnackbar>
  );
};

export default GlobalSnackbarComponent;
