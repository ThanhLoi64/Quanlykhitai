import Router from "./router";
import { ColorModeProvider } from "./theme/ColorMode";

function App() {
  return (
    <ColorModeProvider>
      <Router />
    </ColorModeProvider>
  );
}

export default App;