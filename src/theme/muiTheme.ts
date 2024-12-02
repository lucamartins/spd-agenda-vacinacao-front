import { createTheme } from "@mui/material";

const muiTheme = createTheme({
  typography: {
    fontFamily: ["Poppins", "Roboto", "sans-serif"].join(","),
  },
  palette: {
    mode: "light",
    background: {
      default: "#f6f8fa",
      paper: "#f6f8fa",
    },
  },
});

export default muiTheme;
