import { useAppStore } from "../../..";
import {
  ConfirmationDialogDetails,
  confirmationDialogInitialState,
} from "../../AppStore";

const useStateConfirmationDialog = () => {
  const confirmationDialogState = useAppStore(
    (state) => state.confirmationDialog
  );

  const {
    open: isOpen,
    message,
    title,
    isOnConfirmLoading,
    variant,
    confirmLabel,
    cancelLabel,
    supressCancelBtn,
  } = confirmationDialogState;

  const startConfirmationDialogFlow = ({
    title = "Você tem certeza?",
    message,
    onConfirm,
    onCancel = null,
    variant = "default",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    supressCancelBtn,
  }: {
    message: string;
    title?: string;
    onConfirm: () => void;
    onCancel?: (() => void) | null;
    variant?: ConfirmationDialogDetails["variant"];
    confirmLabel?: string;
    cancelLabel?: string;
    supressCancelBtn?: boolean;
  }) => {
    useAppStore.setState({
      confirmationDialog: {
        ...useAppStore.getState().confirmationDialog,
        message,
        title,
        onCancel,
        onConfirm,
        open: true,
        variant,
        confirmLabel,
        cancelLabel,
        supressCancelBtn: supressCancelBtn ?? false,
      },
    });
  };

  const endFlow = async (hasAccepted: boolean) => {
    const onConfirm = useAppStore.getState().confirmationDialog.onConfirm;
    const onCancel = useAppStore.getState().confirmationDialog.onCancel;

    if (hasAccepted) {
      if (!onConfirm) {
        throw new Error(
          "Confirmation dialog has no onConfirm function to handle confirmation."
        );
      }

      useAppStore.setState({
        confirmationDialog: {
          ...useAppStore.getState().confirmationDialog,
          isOnConfirmLoading: true,
        },
      });

      try {
        await onConfirm();
      } catch (err) {
        console.error(err);
      } finally {
        useAppStore.setState({
          confirmationDialog: {
            ...useAppStore.getState().confirmationDialog,
            isOnConfirmLoading: false,
          },
        });
      }
    } else {
      try {
        await onCancel?.();
      } catch (err) {
        console.error(err);
      }
    }

    useAppStore.setState({
      confirmationDialog: confirmationDialogInitialState,
    });
  };

  return {
    startConfirmationDialogFlow,
    endFlow,
    details: {
      isOpen,
      message,
      title,
      isOnConfirmLoading,
      variant,
      confirmLabel,
      cancelLabel,
      supressCancelBtn,
    },
  };
};

export default useStateConfirmationDialog;
