/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

type Vacina = {
  id: number;
  titulo: string;
  descricao: string;
  doses: number;
  periodicidade: "DIAS" | "SEMANAS" | "MESES" | "ANOS";
  intervalo: number;
};

const VACINA_FORM_EMPTY: Omit<Vacina, "id"> = {
  titulo: "",
  descricao: "",
  doses: 1,
  periodicidade: "DIAS",
  intervalo: 1,
};

const VacinasPage: React.FC = () => {
  const { startConfirmationDialogFlow } = useStateConfirmationDialog();
  const { openSnackbar } = useApp();

  const queryClient = useQueryClient();

  const [isAddVacinaDialogOpen, setIsAddVacinaDialogOpen] = useState(false);
  const [addVacinaDialogErrors, setAddVacinaDialogErrors] = useState<string[]>(
    []
  );
  const [novaVacina, setNovaVacina] =
    useState<Omit<Vacina, "id">>(VACINA_FORM_EMPTY);

  const {
    data: vacinas,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vacinas"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Vacina[]>>(
        "http://localhost:8080/vacinas"
      );
      return response.data.data;
    },
  });

  const deleteVacinaMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`http://localhost:8080/vacinas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacinas"] });
    },
    onError: (error: any) => {
      openSnackbar({
        message: error.response.data.errorMessages.join(", "),
        severity: "error",
      });
    },
  });

  const addVacinaMutation = useMutation({
    mutationFn: async (vacina: Omit<Vacina, "id">) => {
      const vacinaToSend =
        vacina.doses > 1
          ? vacina
          : { ...vacina, periodicidade: null, intervalo: null };
      await axios.post("http://localhost:8080/vacinas", vacinaToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacinas"] });
      setIsAddVacinaDialogOpen(false);
    },
    onError: (error: any) => {
      setAddVacinaDialogErrors(error.response.data.errorMessages);
    },
  });

  const handleDelete = (id: number) => {
    startConfirmationDialogFlow({
      title: "Excluir Vacina",
      message: "Deseja realmente excluir esta vacina?",
      onConfirm: () => deleteVacinaMutation.mutate(id),
    });
  };

  const handleOpenDialog = () => {
    setNovaVacina(VACINA_FORM_EMPTY);
    setAddVacinaDialogErrors([]);
    setIsAddVacinaDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddVacinaDialogOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovaVacina((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleAddVacina = () => {
    const { titulo, descricao, doses, periodicidade, intervalo } = novaVacina;
    addVacinaMutation.mutate({
      titulo,
      descricao,
      doses: Number(doses),
      periodicidade,
      intervalo: Number(intervalo),
    });
  };

  if (isLoading) {
    return <Typography>Carregando...</Typography>;
  }

  if (isError) {
    return <Typography>Erro ao carregar as vacinas.</Typography>;
  }

  return (
    <Container>
      <Box my={4}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Typography variant="h4" gutterBottom>
            Listagem de Vacinas
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            style={{ marginBottom: 16 }}
          >
            Adicionar Nova Vacina
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Doses</TableCell>
                <TableCell>Periodicidade</TableCell>
                <TableCell>Intervalo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vacinas?.map((vacina) => (
                <TableRow key={vacina.id}>
                  <TableCell>{vacina.titulo}</TableCell>
                  <TableCell>{vacina.descricao}</TableCell>
                  <TableCell>{vacina.doses}</TableCell>
                  <TableCell>{vacina.periodicidade || "N/A"}</TableCell>
                  <TableCell>{vacina.intervalo || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(vacina.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIALOG - ADD VACINA */}
        <Dialog open={isAddVacinaDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Adicionar Nova Vacina</DialogTitle>
          <DialogContent>
            {!!addVacinaDialogErrors.length && (
              <Alert severity="error">
                {addVacinaDialogErrors.map((error) => (
                  <Typography key={error}>{error}</Typography>
                ))}
              </Alert>
            )}

            <TextField
              margin="dense"
              label="Título"
              name="titulo"
              fullWidth
              value={novaVacina.titulo}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Descrição"
              name="descricao"
              fullWidth
              value={novaVacina.descricao}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Doses"
              name="doses"
              type="number"
              fullWidth
              value={novaVacina.doses}
              onChange={handleChange}
            />

            {novaVacina.doses > 1 && (
              <>
                <Typography variant="caption" color="textSecondary">
                  A vacina possui mais de uma dose. Preencha os campos abaixo
                </Typography>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="periodicidade-label">
                    Periodicidade
                  </InputLabel>
                  <Select
                    labelId="periodicidade-label"
                    name="periodicidade"
                    value={novaVacina.periodicidade}
                    label="Periodicidade"
                    onChange={(e) => handleChange(e as any)}
                  >
                    <MenuItem value="DIAS">DIAS</MenuItem>
                    <MenuItem value="SEMANAS">SEMANAS</MenuItem>
                    <MenuItem value="MESES">MESES</MenuItem>
                    <MenuItem value="ANOS">ANOS</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  margin="dense"
                  label="Intervalo"
                  name="intervalo"
                  type="number"
                  fullWidth
                  value={novaVacina.intervalo}
                  onChange={handleChange}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={handleAddVacina}
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

export default VacinasPage;
