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
import { useNavigate } from "react-router";
import { ApiResponse } from "../../../network-interface";
import useApp from "../../shared/hooks/useApp";
import { useStateConfirmationDialog } from "../../stores/app/hooks";
import { Alergia } from "../alergias/AlergiasPage";

type Usuario = {
  id: string;
  nome: string;
  dataNascimento: string;
  sexo: "MASCULINO" | "FEMININO";
  logradouro: string;
  numero: string;
  setor: string;
  cidade: string;
  uf: string;
  alergias: Alergia[];
};

const USUARIO_FORM_EMPTY: Omit<Usuario, "id" | "alergias"> = {
  nome: "",
  dataNascimento: "",
  sexo: "MASCULINO",
  logradouro: "",
  numero: "",
  setor: "",
  cidade: "",
  uf: "",
  // alergias: [],
};

const estadosBrasil = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const UsuariosPage: React.FC = () => {
  const { startConfirmationDialogFlow } = useStateConfirmationDialog();
  const { openSnackbar } = useApp();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAddUsuarioDialogOpen, setIsAddUsuarioDialogOpen] = useState(false);
  const [addUsuarioDialogErrors, setAddUsuarioDialogErrors] = useState<
    string[]
  >([]);
  const [novoUsuario, setNovoUsuario] =
    useState<Omit<Usuario, "id" | "alergias">>(USUARIO_FORM_EMPTY);

  const {
    data: usuarios,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Usuario[]>>(
        "http://localhost:8080/usuarios"
      );
      return response.data.data;
    },
  });

  const deleteUsuarioMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8080/usuarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
    onError: (error: any) => {
      openSnackbar({
        message: error.response.data.errorMessages.join(", "),
        severity: "error",
      });
    },
  });

  const addUsuarioMutation = useMutation({
    mutationFn: async (usuario: Omit<Usuario, "id" | "alergias">) => {
      await axios.post("http://localhost:8080/usuarios", usuario);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setIsAddUsuarioDialogOpen(false);
    },
    onError: (error: any) => {
      setAddUsuarioDialogErrors(error.response.data.errorMessages);
    },
  });

  const handleDelete = (id: string) => {
    startConfirmationDialogFlow({
      title: "Excluir Usuário",
      message: "Deseja realmente excluir este usuário?",
      onConfirm: () => deleteUsuarioMutation.mutate(id),
    });
  };

  const handleOpenDialog = () => {
    setNovoUsuario(USUARIO_FORM_EMPTY);
    setAddUsuarioDialogErrors([]);
    setIsAddUsuarioDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddUsuarioDialogOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setNovoUsuario((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleAddUsuario = () => {
    addUsuarioMutation.mutate(novoUsuario);
  };

  if (isLoading) {
    return <Typography>Carregando...</Typography>;
  }

  if (isError) {
    return <Typography>Erro ao carregar os usuários.</Typography>;
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
            Usuários
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            style={{ marginBottom: 16 }}
          >
            Adicionar Novo Usuário
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Data de Nascimento</TableCell>
                <TableCell>Sexo</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Alergias</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios?.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.nome}</TableCell>
                  <TableCell>{usuario.dataNascimento}</TableCell>
                  <TableCell>{usuario.sexo}</TableCell>
                  <TableCell>
                    {usuario.logradouro}, {usuario.numero}, {usuario.setor},{" "}
                    {usuario.cidade} - {usuario.uf.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {usuario.alergias.map((a) => a.nome).join(", ") || "N/A"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(usuario.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIALOG - ADD USUARIO */}
        <Dialog open={isAddUsuarioDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogContent>
            {!!addUsuarioDialogErrors.length && (
              <Alert severity="error">
                {addUsuarioDialogErrors.map((error) => (
                  <Typography key={error}>{error}</Typography>
                ))}
              </Alert>
            )}

            <TextField
              margin="dense"
              label="Nome"
              name="nome"
              fullWidth
              value={novoUsuario.nome}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Data de Nascimento"
              name="dataNascimento"
              type="date"
              fullWidth
              value={novoUsuario.dataNascimento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="sexo-label">Sexo</InputLabel>
              <Select
                labelId="sexo-label"
                name="sexo"
                value={novoUsuario.sexo}
                label="Sexo"
                onChange={(e) => handleChange(e as any)}
              >
                <MenuItem value="MASCULINO">MASCULINO</MenuItem>
                <MenuItem value="FEMININO">FEMININO</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Logradouro"
              name="logradouro"
              fullWidth
              value={novoUsuario.logradouro}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Número"
              name="numero"
              fullWidth
              value={novoUsuario.numero}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Setor"
              name="setor"
              fullWidth
              value={novoUsuario.setor}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Cidade"
              name="cidade"
              fullWidth
              value={novoUsuario.cidade}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="uf-label">UF</InputLabel>
              <Select
                labelId="uf-label"
                name="uf"
                value={novoUsuario.uf}
                label="UF"
                onChange={(e) => handleChange(e as any)}
              >
                {estadosBrasil.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* <TextField
              margin="dense"
              label="Alergias (separadas por vírgula)"
              name="alergias"
              fullWidth
              value={novoUsuario.alergias.join(", ")}
              onChange={(e) =>
                setNovoUsuario((prev) => ({
                  ...prev,
                  alergias: e.target.value.split(",").map((a) => a.trim()),
                }))
              }
            /> */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={handleAddUsuario}
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

export default UsuariosPage;
