export enum ColorStatus {
  GREEN = "green",
  YELLOW = "yellow",
  RED = "red",
}

export enum NormalDuration {
  GREEN = 1000 * 15,
  YELLOW = 1000 * 10,
  RED = 1000 * 5,
}

export enum EmergencyDuration {
  GREEN = 1000 *20,
  YELLOW = 1000 * 5,
  RED = 1000 * 5,
}

export interface Semaphore {
  uuid: string;
  colorStatus: ColorStatus;
  location: { lat: number; lon: number };
  carCount: number;
  emergency: boolean;
  description: string;
  fator: number;
}
