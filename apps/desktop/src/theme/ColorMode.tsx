import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";

type ColorMode = "light" | "dark";

type ColorModeContextValue = {
  mode: ColorMode;
  toggleMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

const palettes = {
  light: {
    primary: "#1D4ED8",
    secondary: "#0F172A",
    accent: "#60A5FA",
    background: "#F1F5F9",
    surface: "#FFFFFF",
    text: "#0F172A",
    muted: "#475569",
    border: "#CBD5E1",
    surfaceMuted: "#F8FAFC",
  },
  dark: {
    primary: "#60A5FA",
    secondary: "#020617",
    accent: "#93C5FD",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F1F5F9",
    muted: "#94A3B8",
    border: "#334155",
    surfaceMuted: "#273449",
  },
} as const;

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(() =>
    localStorage.getItem("colorMode") === "dark" ? "dark" : "light",
  );

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem("colorMode", mode);
  }, [mode]);

  const theme = useMemo(() => {
    const palette = palettes[mode];

    return createTheme({
      palette: {
        mode,
        primary: {
          main: palette.primary,
          contrastText: mode === "light" ? palette.surface : palette.secondary,
        },
        secondary: { main: palette.secondary },
        info: { main: palette.accent },
        background: {
          default: palette.background,
          paper: palette.surface,
        },
        text: {
          primary: palette.text,
          secondary: palette.muted,
        },
        divider: palette.border,
      },
      typography: {
        fontFamily: '"Be Vietnam Pro", "Segoe UI", Arial, sans-serif',
        button: {
          fontWeight: 700,
          textTransform: "none",
        },
      },
      shape: { borderRadius: 10 },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: palette.background,
              color: palette.text,
            },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              minHeight: 40,
              borderRadius: 10,
              paddingInline: 16,
            },
            sizeSmall: { minHeight: 34, paddingInline: 12 },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { borderRadius: 8, fontWeight: 700 },
          },
        },
        MuiDataGrid: {
          styleOverrides: {
            root: {
              color: palette.text,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: palette.surfaceMuted,
                borderColor: palette.border,
              },
              "& .MuiDataGrid-cell, & .MuiDataGrid-footerContainer": {
                borderColor: palette.border,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: `color-mix(in srgb, ${palette.primary} 8%, ${palette.surface})`,
              },
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: `color-mix(in srgb, ${palette.primary} 14%, ${palette.surface})`,
              },
              "& .MuiDataGrid-row.Mui-selected:hover": {
                backgroundColor: `color-mix(in srgb, ${palette.primary} 22%, ${palette.surface})`,
              },
            },
          },
        },
      },
    });
  }, [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((current) => current === "light" ? "dark" : "light"),
    }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return context;
}