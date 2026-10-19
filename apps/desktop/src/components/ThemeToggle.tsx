import { Moon, Sun } from "lucide-react";
import { useColorMode } from "../theme/ColorMode";

export default function ThemeToggle() {
  const { mode, toggleMode } = useColorMode();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Chế độ tối" : "Chế độ sáng"}
      title={isDark ? "Chế độ tối" : "Chế độ sáng"}
      onClick={toggleMode}
      className="theme-switch"
    >
      <span className="theme-switch-track-icon theme-switch-sun">
        <Sun size={12} />
      </span>
      <span className="theme-switch-track-icon theme-switch-moon">
        <Moon size={12} />
      </span>
      <span className="theme-switch-thumb">
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  );
}