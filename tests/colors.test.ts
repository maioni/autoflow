import { getColor, Colors } from '../src/simulator/colors';

describe("getColor function", () => {
  it("should return the corresponding color code for the given color", () => {
    expect(getColor("cyan")).toBe(Colors.CYAN);
    expect(getColor("blue")).toBe(Colors.BLUE);
    expect(getColor("green")).toBe(Colors.GREEN);
    expect(getColor("purple")).toBe(Colors.PURPLE);
    expect(getColor("yellow")).toBe(Colors.YELLOW);
    expect(getColor("red")).toBe(Colors.RED);
    expect(getColor("orange")).toBe(Colors.ORANGE);
    expect(getColor("pink")).toBe(Colors.PINK);
    expect(getColor("magenta")).toBe(Colors.MAGENTA);
    expect(getColor("gray")).toBe(Colors.GRAY);
    expect(getColor("white")).toBe(Colors.WHITE);
    expect(getColor("light_blue")).toBe(Colors.LIGHT_BLUE);
    expect(getColor("light_green")).toBe(Colors.LIGHT_GREEN);
    expect(getColor("light_cyan")).toBe(Colors.LIGHT_CYAN);
    expect(getColor("light_purple")).toBe(Colors.LIGHT_PURPLE);
    expect(getColor("light_red")).toBe(Colors.LIGHT_RED);
    expect(getColor("light_yellow")).toBe(Colors.LIGHT_YELLOW);
    expect(getColor("light_gray")).toBe(Colors.LIGHT_GRAY);
    expect(getColor("bold")).toBe(Colors.BOLD);
    expect(getColor("underline")).toBe(Colors.UNDERLINE);
    expect(getColor("reversed")).toBe(Colors.REVERSED);
    expect(getColor("end")).toBe(Colors.END);
  });
});

it("should return 'undefined' for an invalid color", () => {
  expect(getColor("")).toBe("");
  expect(getColor("123")).toBe("");
  expect(getColor("invalid_color")).toBe("");
});

it("should throw an error for an invalid color", () => {
  expect(() => getColor("invalid_color")).toThrowError("Invalid color: invalid_color");
});