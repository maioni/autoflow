// Este script informa as cores dos semáforos que serão criados no adaptador.

// Cores disponíveis que podem ser usadas na aplicação:
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
  ERROR = "ERROR: Invalid color.",
}

// Função que retorna a cor de acordo com o parâmetro passado
export function getColor(color: string) {
  const colorMapping: { [key: string]: string } = {
    cyan: Colors.CYAN,
    blue: Colors.BLUE,
    green: Colors.GREEN,
    purple: Colors.PURPLE,
    yellow: Colors.YELLOW,
    red: Colors.RED,
    orange: Colors.ORANGE,
    pink: Colors.PINK,
    magenta: Colors.MAGENTA,
    gray: Colors.GRAY,
    white: Colors.WHITE,
    light_blue: Colors.LIGHT_BLUE,
    light_green: Colors.LIGHT_GREEN,
    light_cyan: Colors.LIGHT_CYAN,
    light_purple: Colors.LIGHT_PURPLE,
    light_red: Colors.LIGHT_RED,
    light_yellow: Colors.LIGHT_YELLOW,
    light_gray: Colors.LIGHT_GRAY,
    bold: Colors.BOLD,
    underline: Colors.UNDERLINE,
    reversed: Colors.REVERSED,
    end: Colors.END,
  };

  const colorCode = colorMapping[color.toLowerCase()];

  if (!colorCode) {
    throw new Error(`Invalid color: ${color}`);
  }

  return colorCode;
}
