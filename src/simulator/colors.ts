export enum Colors {
  BLUE = "\x1b[34m",
  GREEN = "\x1b[32m",
  CYAN = "\x1b[36m",
  PURPLE = "\x1b[35m",
  RED = "\x1b[31m",
  YELLOW = "\x1b[33m",
  ORANGE = "\x1b[38;5;208m",
  PINK = "\x1b[35m",
  GRAY = "\x1b[90m",
  WHITE = "\x1b[37m",
  MAGENTA = "\x1b[35m",
  // Additional colors
  LIGHT_BLUE = "\x1b[94m",
  LIGHT_GREEN = "\x1b[92m",
  LIGHT_CYAN = "\x1b[96m",
  LIGHT_PURPLE = "\x1b[95m",
  LIGHT_RED = "\x1b[91m",
  LIGHT_YELLOW = "\x1b[93m",
  LIGHT_GRAY = "\x1b[37m", // Light gray may vary on different terminals
  BOLD = "\x1b[1m", // Bold text
  UNDERLINE = "\x1b[4m", // Underlined text
  REVERSED = "\x1b[7m", // Reversed text (background and foreground colors are swapped)
  END = "\x1b[0m",
}

export function getColor(
  color: "cyan" | "blue" | "green" | "purple" | "end" | "yellow" | "red" | "orange" | "pink" | "gray" | "white" | "light_blue" | "light_green" | "light_cyan" | "light_purple" | "light_red" | "light_yellow" | "light_gray" | "bold" | "underline" | "reversed" | "magenta"
) {
  switch (color) {
    case "cyan":
      return Colors.CYAN;
    case "blue":
      return Colors.BLUE;
    case "green":
      return Colors.GREEN;
    case "purple":
      return Colors.PURPLE;
    case "yellow":
      return Colors.YELLOW;
    case "red":
      return Colors.RED;
    case "orange":
      return Colors.ORANGE;
    case "pink":
      return Colors.PINK;
    case "magenta":
      return Colors.MAGENTA;    
    case "gray":
      return Colors.GRAY;
    case "white":
      return Colors.WHITE;
    case "light_blue":
      return Colors.LIGHT_BLUE
    case "light_green":
      return Colors.LIGHT_GREEN
    case "light_cyan":
      return Colors.LIGHT_CYAN
    case "light_purple":
      return Colors.LIGHT_PURPLE
    case "light_red":
      return Colors.LIGHT_RED
    case "light_yellow":
      return Colors.LIGHT_YELLOW
    case "light_gray":
      return Colors.LIGHT_GRAY
    case "bold":
      return Colors.BOLD
    case "underline":
      return Colors.UNDERLINE
    case "reversed":
      return Colors.REVERSED
    case "end":
      return Colors.END;
  }
}
