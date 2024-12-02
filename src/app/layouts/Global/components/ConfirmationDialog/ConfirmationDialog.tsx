import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useStateConfirmationDialog } from "../../../../stores/app/hooks";

const ConfirmationDialog = () => {
  const { details, endFlow } = useStateConfirmationDialog();
  const handleConfirm = () => {
    endFlow(true);
  };
  const handleCancel = () => {
    endFlow(false);
  };
  return (
    <Dialog
      open={details.isOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{details.title}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>{details.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {!details.supressCancelBtn && (
          <Button onClick={handleCancel}>{details.cancelLabel}</Button>
        )}
        <LoadingButton
          loading={details.isOnConfirmLoading}
          onClick={handleConfirm}
          variant="contained"
          color={details.variant === "critical" ? "error" : "primary"}
        >
          {details.confirmLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
