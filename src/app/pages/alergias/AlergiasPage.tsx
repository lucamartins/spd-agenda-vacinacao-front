/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { ApiResponse } from "../../../network-interface";
import useApp from "../../shared/hooks/useApp";
import { useStateConfirmationDialog } from "../../stores/app/hooks";
import { useNavigate } from "react-router";

export type Alergia = {
  id: string;
  nome: string;
};

const ALERGIA_FORM_EMPTY: Omit<Alergia, "id"> = {
  nome: "",
};

const AlergiasPage: React.FC = () => {
  const { startConfirmationDialogFlow } = useStateConfirmationDialog();
  const { openSnackbar } = useApp();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAddAlergiaDialogOpen, setIsAddAlergiaDialogOpen] = useState(false);
  const [addAlergiaDialogErrors, setAddAlergiaDialogErrors] = useState<
    string[]
  >([]);
  const [novaAlergia, setNovaAlergia] =
    useState<Omit<Alergia, "id">>(ALERGIA_FORM_EMPTY);

  const {
    data: alergias,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["alergias"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Alergia[]>>(
        "http://localhost:8080/alergias"
      );
      return response.data.data;
    },
  });

  const deleteAlergiaMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8080/alergias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alergias"] });
    },
    onError: (error: any) => {
      openSnackbar({
        message: error.response.data.errorMessages.join(", "),
        severity: "error",
      });
    },
  });

  const addAlergiaMutation = useMutation({
    mutationFn: async (alergia: Omit<Alergia, "id">) => {
      await axios.post("http://localhost:8080/alergias", alergia);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alergias"] });
      setIsAddAlergiaDialogOpen(false);
    },
    onError: (error: any) => {
      setAddAlergiaDialogErrors(error.response.data.errorMessages);
    },
  });

  const handleDelete = (id: string) => {
    startConfirmationDialogFlow({
      title: "Excluir Alergia",
      message: "Deseja realmente excluir esta alergia?",
      onConfirm: () => deleteAlergiaMutation.mutate(id),
    });
  };

  const handleOpenDialog = () => {
    setNovaAlergia(ALERGIA_FORM_EMPTY);
    setAddAlergiaDialogErrors([]);
    setIsAddAlergiaDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddAlergiaDialogOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovaAlergia((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleAddAlergia = () => {
    addAlergiaMutation.mutate({ nome: novaAlergia.nome });
  };

  if (isLoading) {
    return <Typography>Carregando...</Typography>;
  }

  if (isError) {
    return <Typography>Erro ao carregar as alergias.</Typography>;
  }

  return (
    <Container>
      <Box my={4}>
        <Button
          startIcon={<KeyboardArrowLeftIcon />}
          onClick={() => navigate("/")}
        >
          Voltar
        </Button>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          mt={2}
        >
          <Typography variant="h4" gutterBottom>
            Alergias
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            style={{ marginBottom: 16 }}
          >
            Adicionar Nova Alergia
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alergias?.map((alergia) => (
                <TableRow key={alergia.id}>
                  <TableCell>{alergia.nome}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(alergia.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIALOG - ADD ALERGIA */}
        <Dialog
          open={isAddAlergiaDialogOpen}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Adicionar Nova Alergia</DialogTitle>
          <DialogContent>
            {!!addAlergiaDialogErrors.length && (
              <Alert severity="error">
                {addAlergiaDialogErrors.map((error) => (
                  <Typography key={error}>{error}</Typography>
                ))}
              </Alert>
            )}

            <TextField
              margin="dense"
              label="Nome"
              name="nome"
              fullWidth
              value={novaAlergia.nome}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={handleAddAlergia}
              color="primary"
              variant="contained"
            >
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AlergiasPage;
