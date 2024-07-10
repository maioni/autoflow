import { Semaphore, ColorStatus } from '../src/classes/semaphore';

describe("Semaphore", () => {
  let semaphore: Semaphore;

  beforeEach(() => {
    semaphore = {
      uuid: "semaphore1",
      colorStatus: ColorStatus.RED,
      location: { lat: 0, lon: 0 },
      carCount: 0,
      emergency: false,
      description: "",
      fator: 1,
    };
  });

  it("should have the correct initial properties", () => {
    expect(semaphore.uuid).toBe("semaphore1");
    expect(semaphore.colorStatus).toBe(ColorStatus.RED);
    expect(semaphore.location).toEqual({ lat: 0, lon: 0 });
    expect(semaphore.carCount).toBe(0);
    expect(semaphore.emergency).toBe(false);
    expect(semaphore.description).toBe("");
    expect(semaphore.fator).toBe(1);
  });

  it("should update the color status correctly", () => {
    semaphore.colorStatus = ColorStatus.GREEN;
    expect(semaphore.colorStatus).toBe(ColorStatus.GREEN);

    semaphore.colorStatus = ColorStatus.YELLOW;
    expect(semaphore.colorStatus).toBe(ColorStatus.YELLOW);

    semaphore.colorStatus = ColorStatus.RED;
    expect(semaphore.colorStatus).toBe(ColorStatus.RED);
  });

  it("should increment the car count correctly", () => {
    semaphore.carCount += 1;
    expect(semaphore.carCount).toBe(1);

    semaphore.carCount += 5;
    expect(semaphore.carCount).toBe(6);
  });

  it("should update the emergency status correctly", () => {
    semaphore.emergency = true;
    expect(semaphore.emergency).toBe(true);

    semaphore.emergency = false;
    expect(semaphore.emergency).toBe(false);
  });
});