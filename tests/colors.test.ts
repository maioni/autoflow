import { getColor, Colors } from '../src/simulator/colors';

describe("Colors", () => {
  
  const colorCases = [
    { input: "cyan", expected: Colors.CYAN },
    { input: "blue", expected: Colors.BLUE },
    { input: "green", expected: Colors.GREEN },
    { input: "purple", expected: Colors.PURPLE },
    { input: "yellow", expected: Colors.YELLOW },
    { input: "red", expected: Colors.RED },
    { input: "orange", expected: Colors.ORANGE },
    { input: "pink", expected: Colors.PINK },
    { input: "magenta", expected: Colors.MAGENTA },
    { input: "gray", expected: Colors.GRAY },
    { input: "white", expected: Colors.WHITE },
    { input: "light_blue", expected: Colors.LIGHT_BLUE },
    { input: "light_green", expected: Colors.LIGHT_GREEN },
    { input: "light_cyan", expected: Colors.LIGHT_CYAN },
    { input: "light_purple", expected: Colors.LIGHT_PURPLE },
    { input: "light_red", expected: Colors.LIGHT_RED },
    { input: "light_yellow", expected: Colors.LIGHT_YELLOW },
    { input: "light_gray", expected: Colors.LIGHT_GRAY },
    { input: "bold", expected: Colors.BOLD },
    { input: "underline", expected: Colors.UNDERLINE },
    { input: "reversed", expected: Colors.REVERSED },
    { input: "end", expected: Colors.END },
  ];

  it.each(colorCases)("should return the corresponding color code for the given color - '%s'", ({ input, expected }) => {
    expect(getColor(input)).toEqual(expected);
  });

  it("should throw an error for an invalid color", () => {
    expect(() => getColor("invalid")).toThrow(`Invalid color: invalid`);
  });
});
