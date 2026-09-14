import Router from "./router";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const appTheme = createTheme({
	palette: {
		primary: {
			main: "#2563eb",
			contrastText: "#ffffff",
		},
		warning: {
			main: "#ea580c",
			contrastText: "#ffffff",
		},
		error: {
			main: "#dc2626",
			contrastText: "#ffffff",
		},
	},
	typography: {
		fontFamily: '"Be Vietnam Pro", "Segoe UI", Arial, sans-serif',
		button: {
			fontWeight: 700,
			textTransform: "none",
		},
	},
	shape: {
		borderRadius: 10,
	},
	components: {
		MuiButton: {
			defaultProps: {
				disableElevation: true,
			},
			styleOverrides: {
				root: {
					minHeight: 40,
					borderRadius: 10,
					paddingInline: 16,
				},
				sizeSmall: {
					minHeight: 34,
					paddingInline: 12,
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					fontWeight: 700,
				},
			},
		},
	},
});

function App(){
return (
	<ThemeProvider theme={appTheme}>
		<Router />
	</ThemeProvider>
);

}


export default App;