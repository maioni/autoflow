export enum Colors {
  BLUE = "\x1b[34m",
  GREEN = "\x1b[32m",
  CYAN = "\x1b[36m",
  PURPLE = "\x1b[35m",
  RED = "\x1b[31m",
  YELLOW = "\x1b[33m",
  ORANGE = "\x1b[33m",
  PINK = "\x1b[35m",
  GRAY = "\x1b[90m",
  WHITE = "\x1b[37m",
  END = "\x1b[0m",
}

export function getColor(
  color: "cyan" | "blue" | "green" | "purple" | "end" | "yellow" | "red" | "orange" | "pink" | "gray" | "white"
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
    case "gray":
      return Colors.GRAY;
    case "white":
      return Colors.GRAY;
    case "end":
      return Colors.END;
  }
}
