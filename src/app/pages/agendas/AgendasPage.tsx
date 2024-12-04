/* eslint-disable @typescript-eslint/no-explicit-any */
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
import { UsuarioEntity } from "../usuarios/UsuariosPage";
import { VacinaEntity } from "../vacinas/VacinasPage";

export type AgendaEntity = {
  id: string;
  data: string;
  observacoes: string | null;
  vacina: VacinaEntity;
  doseIdx: number;
  usuario: UsuarioEntity;
  dataSituacao: string | null;
  situacao: string;
};

export interface AgendaToAdd {
  data: string;
  observacoes: string | null;
  vacinaId: string;
  usuarioId: string;
}

const AGENDA_FORM_EMPTY: AgendaToAdd = {
  data: "",
  observacoes: "",
  vacinaId: "",
  usuarioId: "",
};

const AgendasPage: React.FC = () => {
  const { startConfirmationDialogFlow } = useStateConfirmationDialog();
  const { openSnackbar } = useApp();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAddAgendaDialogOpen, setIsAddAgendaDialogOpen] = useState(false);
  const [addAgendaDialogErrors, setAddAgendaDialogErrors] = useState<string[]>(
    []
  );
  const [novaAgenda, setNovaAgenda] = useState<AgendaToAdd>(AGENDA_FORM_EMPTY);
  const [isBaixaDialogOpen, setIsBaixaDialogOpen] = useState<string | null>(
    null
  );
  const [situacao, setSituacao] = useState<"DONE" | "CANCELED">("DONE");
  const [filterSituacao, setFilterSituacao] = useState<string | "">("");
  const [filterDataStart, setFilterDataStart] = useState<string>("");
  const [filterDataEnd, setFilterDataEnd] = useState<string>("");
  const [filterUsuarioId, setFilterUsuarioId] = useState<string | "">("");
  const [isReagendarDialogOpen, setIsReagendarDialogOpen] = useState<
    string | null
  >(null);
  const [novaDataReagendamento, setNovaDataReagendamento] =
    useState<string>("");

  const {
    data: agendas,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "agendas",
      { filterSituacao, filterDataStart, filterDataEnd, filterUsuarioId },
    ],
    queryFn: async () => {
      const timeZoneOffset = new Date().getTimezoneOffset() / 60;
      const endOfDay = filterDataEnd && new Date(filterDataEnd);
      if (endOfDay) {
        endOfDay.setUTCHours(23 + timeZoneOffset, 59, 59, 999);
      }

      const response = await axios.get<ApiResponse<AgendaEntity[]>>(
        "http://localhost:8080/agendas",
        {
          params: {
            situacao: filterSituacao || undefined,
            dataStart:
              (filterDataStart &&
                new Date(
                  new Date(filterDataStart).setHours(
                    new Date(filterDataStart).getHours() + timeZoneOffset
                  )
                ).toISOString()) ||
              undefined,
            dataEnd: (endOfDay && endOfDay.toISOString()) || undefined,
            usuarioId: filterUsuarioId || undefined,
          },
        }
      );

      const sortedAgendasByDateAsc = response.data.data.sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
      );

      const sortedAgendasBySituacao = sortedAgendasByDateAsc.sort((a, b) => {
        const situacaoOrder: { [key: string]: number } = {
          SCHEDULED: 1,
          DONE: 2,
          CANCELED: 3,
        };
        return situacaoOrder[a.situacao] - situacaoOrder[b.situacao];
      });

      return sortedAgendasBySituacao;
    },
  });

  const { data: vacinas } = useQuery({
    queryKey: ["vacinas"],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<{ id: string; titulo: string }[]>
      >("http://localhost:8080/vacinas");
      return response.data.data;
    },
  });

  const { data: usuarios } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<{ id: string; nome: string }[]>
      >("http://localhost:8080/usuarios");
      return response.data.data;
    },
  });

  const deleteAgendaMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8080/agendas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] });
    },
    onError: (error: any) => {
      openSnackbar({
        message: error.response.data.errorMessages.join(", "),
        severity: "error",
      });
    },
  });

  const addAgendaMutation = useMutation({
    mutationFn: async (agenda: AgendaToAdd) => {
      await axios.post("http://localhost:8080/agendas", {
        ...agenda,
        data: new Date(agenda.data).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] });
      setIsAddAgendaDialogOpen(false);
    },
    onError: (error: any) => {
      setAddAgendaDialogErrors(error.response.data.errorMessages);
    },
  });

  const baixaAgendaMutation = useMutation({
    mutationFn: async ({
      id,
      situacao,
    }: {
      id: string;
      situacao: "DONE" | "CANCELED";
    }) => {
      await axios.post(`http://localhost:8080/agendas/${id}/baixa`, {
        situacao,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] });
      setIsBaixaDialogOpen(null);
    },
    onError: (error: any) => {
      openSnackbar({
        message: error.response.data.errorMessages.join(", "),
        severity: "error",
      });
    },
  });

  const reagendarAgendaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: string }) => {
      await axios.post(`http://localhost:8080/agendas/${id}/reagendar`, {
        data: new Date(data).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendas"] });
      setIsReagendarDialogOpen(null);
      setNovaDataReagendamento("");
    },
    onError: (error: any) => {
      openSnackbar({
        message: error.response.data.errorMessages.join(", "),
        severity: "error",
      });
    },
  });

  const handleOpenReagendarDialog = (id: string) => {
    setIsReagendarDialogOpen(id);
    setNovaDataReagendamento("");
  };

  const handleReagendarAgenda = () => {
    if (isReagendarDialogOpen) {
      reagendarAgendaMutation.mutate({
        id: isReagendarDialogOpen,
        data: novaDataReagendamento,
      });
    }
  };

  const handleDelete = (id: string) => {
    startConfirmationDialogFlow({
      title: "Excluir Agenda",
      message: "Deseja realmente excluir esta agenda?",
      onConfirm: () => deleteAgendaMutation.mutate(id),
    });
  };

  const handleOpenDialog = () => {
    setNovaAgenda(AGENDA_FORM_EMPTY);
    setAddAgendaDialogErrors([]);
    setIsAddAgendaDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddAgendaDialogOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setNovaAgenda((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleAddAgenda = () => {
    addAgendaMutation.mutate(novaAgenda);
  };

  const handleOpenBaixaDialog = (id: string) => {
    setIsBaixaDialogOpen(id);
    setSituacao("DONE");
  };

  const handleBaixaAgenda = () => {
    if (isBaixaDialogOpen) {
      baixaAgendaMutation.mutate({ id: isBaixaDialogOpen, situacao });
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    switch (name) {
      case "situacao":
        setFilterSituacao(value as string);
        break;
      case "dataStart":
        setFilterDataStart(value as string);
        break;
      case "dataEnd":
        setFilterDataEnd(value as string);
        break;
      case "usuarioId":
        setFilterUsuarioId(value as string);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return <Typography>Carregando...</Typography>;
  }

  if (isError) {
    return <Typography>Erro ao carregar as agendas.</Typography>;
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
            Agendas
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            style={{ marginBottom: 16 }}
          >
            Adicionar Nova Agenda
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} my={2}>
          <FormControl fullWidth>
            <InputLabel id="filter-situacao-label">Situação</InputLabel>
            <Select
              labelId="filter-situacao-label"
              name="situacao"
              value={filterSituacao}
              label="Situação"
              onChange={(e) => handleFilterChange(e as any)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="SCHEDULED">Agendada</MenuItem>
              <MenuItem value="DONE">Concluída</MenuItem>
              <MenuItem value="CANCELED">Cancelada</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="filter-usuario-label">Usuário</InputLabel>
            <Select
              labelId="filter-usuario-label"
              name="usuarioId"
              value={filterUsuarioId}
              label="Usuário"
              onChange={(e) => handleFilterChange(e as any)}
            >
              <MenuItem value="">Todos</MenuItem>
              {usuarios?.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} my={2}>
          <TextField
            label="Data Início"
            type="date"
            name="dataStart"
            value={filterDataStart}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Data Fim"
            type="date"
            name="dataEnd"
            value={filterDataEnd}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell>Vacina</TableCell>
                <TableCell>Dose</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell>Data situação</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agendas?.map((agenda) => (
                <TableRow key={agenda.id}>
                  <TableCell>
                    {new Date(agenda.data).toLocaleString()}
                  </TableCell>
                  <TableCell>{agenda.observacoes || "N/A"}</TableCell>
                  <TableCell>{agenda.vacina.titulo || "N/A"}</TableCell>
                  <TableCell>{agenda.doseIdx + 1}</TableCell>
                  <TableCell>{agenda.usuario.nome || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={agenda.situacao}
                      size="small"
                      color={
                        agenda.situacao === "SCHEDULED"
                          ? "primary"
                          : agenda.situacao === "DONE"
                          ? "success"
                          : "error"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {(agenda.dataSituacao &&
                      new Date(agenda.dataSituacao).toLocaleString()) ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        disabled={agenda.situacao !== "SCHEDULED"}
                        onClick={() => handleOpenReagendarDialog(agenda.id)}
                        sx={{ marginRight: 1 }}
                      >
                        Reagendar
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        disabled={agenda.situacao !== "SCHEDULED"}
                        onClick={() => handleOpenBaixaDialog(agenda.id)}
                        sx={{ marginRight: 1 }}
                      >
                        Dar Baixa
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => handleDelete(agenda.id)}
                      >
                        Excluir
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIALOG - ADD AGENDA */}
        <Dialog
          open={isAddAgendaDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Adicionar Nova Agenda</DialogTitle>
          <DialogContent>
            {!!addAgendaDialogErrors.length && (
              <Alert severity="error">
                {addAgendaDialogErrors.map((error) => (
                  <Typography key={error}>{error}</Typography>
                ))}
              </Alert>
            )}

            <TextField
              margin="dense"
              label="Data"
              name="data"
              type="datetime-local"
              fullWidth
              value={novaAgenda.data}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense"
              label="Observações"
              name="observacoes"
              fullWidth
              value={novaAgenda.observacoes || ""}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="vacina-label">Vacina</InputLabel>
              <Select
                labelId="vacina-label"
                name="vacinaId"
                value={novaAgenda.vacinaId}
                label="Vacina"
                onChange={(e) => handleChange(e as any)}
              >
                {vacinas?.map((vacina) => (
                  <MenuItem key={vacina.id} value={vacina.id}>
                    {vacina.titulo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="usuario-label">Usuário</InputLabel>
              <Select
                labelId="usuario-label"
                name="usuarioId"
                value={novaAgenda.usuarioId}
                label="Usuário"
                onChange={(e) => handleChange(e as any)}
              >
                {usuarios?.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={handleAddAgenda}
              color="primary"
              variant="contained"
            >
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG - DAR BAIXA AGENDA */}
        <Dialog
          open={!!isBaixaDialogOpen}
          onClose={() => setIsBaixaDialogOpen(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Dar Baixa na Agenda</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel id="situacao-label">Situação</InputLabel>
              <Select
                labelId="situacao-label"
                value={situacao}
                label="Situação"
                onChange={(e) =>
                  setSituacao(e.target.value as "DONE" | "CANCELED")
                }
              >
                <MenuItem value="DONE">Concluída</MenuItem>
                <MenuItem value="CANCELED">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsBaixaDialogOpen(null)} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={handleBaixaAgenda}
              color="primary"
              variant="contained"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG - REAGENDAR AGENDA */}
        <Dialog
          open={!!isReagendarDialogOpen}
          onClose={() => setIsReagendarDialogOpen(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reagendar Agenda</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Nova Data"
              type="datetime-local"
              fullWidth
              value={novaDataReagendamento}
              onChange={(e) => setNovaDataReagendamento(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsReagendarDialogOpen(null)}
              color="primary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReagendarAgenda}
              color="primary"
              variant="contained"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AgendasPage;
