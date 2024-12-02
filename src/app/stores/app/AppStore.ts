import { AlertProps } from "@mui/material";
import { create } from "zustand";

export interface AppStoreSnackbar {
  open: boolean;
  message: string | null;
  severity: AlertProps["severity"] | null;
}

export const snackbarInitialState: AppStoreSnackbar = {
  open: false,
  message: null,
  severity: null,
};

export interface ConfirmationDialogDetails {
  open: boolean;
  title: string | null;
  message: string | null;
  onConfirm: (() => void | Promise<void>) | null;
  onCancel: (() => void | Promise<void>) | null;
  variant: "critical" | "default";
  isOnConfirmLoading: boolean;
  confirmLabel: string;
  cancelLabel: string;
  supressCancelBtn: boolean;
}

export const confirmationDialogInitialState: ConfirmationDialogDetails = {
  open: false,
  title: null,
  message: null,
  onConfirm: null,
  onCancel: null,
  variant: "default",
  isOnConfirmLoading: false,
  confirmLabel: "Confirmar",
  cancelLabel: "Cancelar",
  supressCancelBtn: false,
};

export interface AppStore {
  snackbar: AppStoreSnackbar;
  confirmationDialog: ConfirmationDialogDetails;
}

export const appStoreInitialState: AppStore = {
  snackbar: snackbarInitialState,
  confirmationDialog: confirmationDialogInitialState,
};

const appStore = create<AppStore>(() => appStoreInitialState);

export default appStore;
