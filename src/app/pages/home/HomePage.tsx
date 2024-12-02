import { Button, Container, Stack, Typography } from "@mui/material";
import VaccinesOutlinedIcon from "@mui/icons-material/VaccinesOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import TodayIcon from "@mui/icons-material/Today";
import { useNavigate } from "react-router";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Typography variant="h1" fontSize={32} mt={4}>
        Agenda de Vacinação
      </Typography>

      <Typography variant="h2" fontSize={22} mt={4}>
        Menu de Opções
      </Typography>

      <Stack direction="column" spacing={2} mt={2} alignItems="flex-start">
        <Button
          variant="text"
          startIcon={<VaccinesOutlinedIcon />}
          onClick={() => navigate("vacinas")}
        >
          Gerenciar Vacinas
        </Button>
        <Button
          variant="text"
          startIcon={<MedicalInformationIcon />}
          onClick={() => navigate("alergias")}
        >
          Gerenciar Alergias
        </Button>
        <Button
          variant="text"
          startIcon={<PersonOutlineIcon />}
          onClick={() => navigate("usuarios")}
        >
          Gerenciar Usuários
        </Button>
        <Button
          variant="text"
          startIcon={<TodayIcon />}
          onClick={() => navigate("agendas")}
        >
          Gerenciar Agendas
        </Button>
      </Stack>
    </Container>
  );
};

export default HomePage;
