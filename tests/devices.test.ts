import {
  setupDevices,
  fetchSemaphores,
  showSemaphores,
  initializeSemaphores,
  dashboard,
  toggleSemaphores,
  checkEmergencyStatus,
  handleGreen,
  handleYellow,
  setSemaphoreEmergency,
} from "../src/simulator/devices";
import { Semaphore, ColorStatus } from "../src/classes/semaphore";
import express, { Request, Response } from "express"; // Importando express

const testTimeout = 120000;

jest.mock("../src/simulator/devices"); // Mocking the whole module

// Definindo constantes que estão faltando no escopo dos testes
const carCountEmergencyTrigger = 30; // Ajuste conforme necessário
const carCountNoEmergencyTrigger = 20; // Ajuste conforme necessário
let timeAux = new Date();

// Definindo o array semaphoreStates para uso nos testes
const semaphoreStates = [
  {
    color: ColorStatus.GREEN,
    duration: 15000,
    emergency: 20000,
    rush: false,
  },
  {
    color: ColorStatus.YELLOW,
    duration: 10000,
    emergency: 5000,
    rush: false,
  },
  { color: ColorStatus.RED, duration: 5000, emergency: 5000, rush: false },
];

// Mock semaphores array
const semaphores: Semaphore[] = [];

// Variável para armazenar o servidor Express
let server: any;

describe("Devices", () => {
  beforeAll((done) => {
    const app = express();
    const port = 8002;

    app.use(express.json());

    app.post("/webhook/:uuid", (req: Request, res: Response) => {
      for (const semaphore of semaphores) {
        if (semaphore.uuid === req.params.uuid) {
          semaphore.colorStatus = req.body.command.value;
          if (semaphore.colorStatus === ColorStatus.GREEN) {
            timeAux = new Date();
          }
          break;
        }
      }
      res.status(200).send("Webhook recebido com sucesso!");
    });

    // Inicia o servidor antes de todos os testes
    server = app.listen(port, () => {
      console.log("Servidor iniciado na porta 8000 para testes");
      done();
    });
  }, testTimeout);

  afterAll((done) => {
    // Fecha o servidor após todos os testes
    server.close(() => {
      console.log("Servidor fechado na porta 8000 após testes");
      done();
    });
  }, testTimeout);

  describe("setupDevices", () => {
    it("should call the necessary functions", async () => {
      const fetchSemaphoresSpy = jest.spyOn(
        require("../src/simulator/devices"),
        "fetchSemaphores"
      );
      const showSemaphoresSpy = jest.spyOn(
        require("../src/simulator/devices"),
        "showSemaphores"
      );
      const initializeSemaphoresSpy = jest.spyOn(
        require("../src/simulator/devices"),
        "initializeSemaphores"
      );
      const dashboardSpy = jest.spyOn(
        require("../src/simulator/devices"),
        "dashboard"
      );
      const toggleSemaphoresSpy = jest.spyOn(
        require("../src/simulator/devices"),
        "toggleSemaphores"
      );

      await setupDevices();

      expect(fetchSemaphoresSpy).toHaveBeenCalled();
      expect(showSemaphoresSpy).toHaveBeenCalled();
      expect(initializeSemaphoresSpy).toHaveBeenCalled();
      expect(dashboardSpy).toHaveBeenCalled();
      expect(toggleSemaphoresSpy).toHaveBeenCalled();
    });
  });

  describe("fetchSemaphores", () => {
    it("should fetch semaphores and add them to the list", async () => {
      const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          resources: [
            { uuid: "semaphore1", description: "", lat: 0, lon: 0 },
            { uuid: "semaphore2", description: "", lat: 0, lon: 0 },
          ],
        }),
      } as any);

      (fetchSemaphores as jest.Mock).mockImplementation(() => {
        semaphores.push(
          {
            uuid: "semaphore1",
            colorStatus: ColorStatus.RED,
            location: { lat: 0, lon: 0 },
            carCount: 0,
            emergency: false,
            description: "",
            fator: 1,
          },
          {
            uuid: "semaphore2",
            colorStatus: ColorStatus.RED,
            location: { lat: 0, lon: 0 },
            carCount: 0,
            emergency: false,
            description: "",
            fator: 1,
          }
        );
      });

      await fetchSemaphores();

      expect(fetchSpy).toHaveBeenCalledWith(
        "http://10.10.10.104:8000/discovery/resources?capability=semaphore"
      );
      expect(semaphores.length).toBe(2);
      expect(semaphores[0].uuid).toBe("semaphore1");
      expect(semaphores[1].uuid).toBe("semaphore2");
    });
  });

  describe("showSemaphores", () => {
    it("should log the semaphores with their factors", () => {
      const consoleLogSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      semaphores.push(
        {
          uuid: "semaphore1",
          description: "Semaphore-1",
          carCount: 10,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          emergency: false,
          fator: 1,
        },
        {
          uuid: "semaphore2",
          description: "Semaphore-2",
          carCount: 5,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          emergency: false,
          fator: 2,
        }
      );

      (showSemaphores as jest.Mock).mockImplementation(() => {
        for (const semaphore of semaphores) {
          console.log(`${semaphore.description}: ${semaphore.fator} fator`);
        }
      });

      showSemaphores();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Semaphore-1")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Semaphore-2")
      );
    });
  });

  describe("initializeSemaphores", () => {
    it("should increment cars in the semaphores every 5 seconds", () => {
      jest.useFakeTimers();
      const setIntervalSpy = jest.spyOn(global, "setInterval");

      semaphores.push(
        {
          uuid: "semaphore1",
          carCount: 0,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          emergency: false,
          fator: 1,
          description: "",
        },
        {
          uuid: "semaphore2",
          carCount: 0,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          emergency: false,
          fator: 1,
          description: "",
        }
      );

      (initializeSemaphores as jest.Mock).mockImplementation(() => {
        setInterval(() => {
          for (const semaphore of semaphores) {
            semaphore.carCount +=
              Math.floor(Math.random() * semaphore.fator) + 1;
          }
        }, 5000);
      });

      initializeSemaphores();

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

      jest.advanceTimersByTime(5000);

      expect(semaphores[0].carCount).toBeGreaterThanOrEqual(1);
      expect(semaphores[1].carCount).toBeGreaterThanOrEqual(1);

      jest.advanceTimersByTime(5000);

      expect(semaphores[0].carCount).toBeGreaterThanOrEqual(2);
      expect(semaphores[1].carCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("dashboard", () => {
    it("should log the times and status of the semaphores", () => {
      const consoleLogSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      dashboard();

      expect(consoleLogSpy).toHaveBeenCalledWith("DADOS DE TEMPORIZAÇÃO:");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Verde")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Amarelo")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Vermelho")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith("STATUS DOS SEMÁFOROS:");
    });
  });

  describe("toggleSemaphores", () => {
    it("should toggle the semaphores based on the given parameters", () => {
      jest.useFakeTimers();
      const setTimeoutSpy = jest.spyOn(global, "setTimeout");

      semaphores.push(
        {
          uuid: "semaphore1",
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          carCount: 0,
          emergency: false,
          description: "",
          fator: 1,
        },
        {
          uuid: "semaphore2",
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          carCount: 0,
          emergency: false,
          description: "",
          fator: 1,
        }
      );

      (toggleSemaphores as jest.Mock).mockImplementation(
        (semaphoreIndex, stateIndex, rushActive) => {
          const semaphore = semaphores[semaphoreIndex];
          const currentState = semaphoreStates[stateIndex];
          semaphore.colorStatus = currentState.color;
          const duration = rushActive
            ? currentState.emergency
            : currentState.duration;

          setTimeout(() => {
            toggleSemaphores(
              (semaphoreIndex + 1) % semaphores.length,
              0,
              rushActive
            );
          }, duration);
        }
      );

      toggleSemaphores(0, 0, false);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 15000);

      jest.advanceTimersByTime(15000);

      expect(semaphores[0].colorStatus).toBe(ColorStatus.GREEN);
      expect(semaphores[1].colorStatus).toBe(ColorStatus.GREEN);

      jest.advanceTimersByTime(15000);

      expect(semaphores[0].colorStatus).toBe(ColorStatus.YELLOW);
      expect(semaphores[1].colorStatus).toBe(ColorStatus.YELLOW);

      jest.advanceTimersByTime(10000);

      expect(semaphores[0].colorStatus).toBe(ColorStatus.RED);
      expect(semaphores[1].colorStatus).toBe(ColorStatus.RED);
    });
  });

  describe("checkEmergencyStatus", () => {
    it("should return true if the car count exceeds the emergency trigger", () => {
      semaphores.push(
        {
          uuid: "semaphore1",
          carCount: 25,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          emergency: false,
          description: "",
          fator: 1,
        },
        {
          uuid: "semaphore2",
          carCount: 35,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          emergency: false,
          description: "",
          fator: 1,
        }
      );

      (checkEmergencyStatus as jest.Mock).mockImplementation(() => {
        let rush = false;
        for (const semaphore of semaphores) {
          if (semaphore.carCount >= carCountEmergencyTrigger) {
            semaphore.emergency = true;
            rush = true;
          }
          if (semaphore.carCount <= carCountNoEmergencyTrigger) {
            semaphore.emergency = false;
            rush = false;
          }
        }
        return rush;
      });

      const result = checkEmergencyStatus();

      expect(result).toBe(true);
    });

    it("should return false if the car count does not exceed the emergency trigger", () => {
      semaphores.push(
        {
          uuid: "semaphore1",
          carCount: 15,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          emergency: false,
          description: "",
          fator: 1,
        },
        {
          uuid: "semaphore2",
          carCount: 20,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          emergency: false,
          description: "",
          fator: 1,
        }
      );

      (checkEmergencyStatus as jest.Mock).mockImplementation(() => {
        let rush = false;
        for (const semaphore of semaphores) {
          if (semaphore.carCount >= carCountEmergencyTrigger) {
            semaphore.emergency = true;
            rush = true;
          }
          if (semaphore.carCount <= carCountNoEmergencyTrigger) {
            semaphore.emergency = false;
            rush = false;
          }
        }
        return rush;
      });

      const result = checkEmergencyStatus();

      expect(result).toBe(false);
    });
  });

  describe("handleGreen", () => {
    it("should reduce the car count when the green time is reached", () => {
      const semaphore: Semaphore = {
        uuid: "semaphore1",
        carCount: 10,
        colorStatus: ColorStatus.GREEN,
        location: { lat: 0, lon: 0 },
        emergency: false,
        description: "",
        fator: 1,
      };
      timeAux = new Date();
      timeAux.setSeconds(timeAux.getSeconds() - 15);

      handleGreen(semaphore);

      expect(semaphore.carCount).toBe(0);
    });
  });

  describe("handleYellow", () => {
    it("should reduce the car count when the yellow time is reached", () => {
      const semaphore: Semaphore = {
        uuid: "semaphore1",
        carCount: 5,
        colorStatus: ColorStatus.YELLOW,
        location: { lat: 0, lon: 0 },
        emergency: false,
        description: "",
        fator: 1,
      };
      timeAux = new Date();
      timeAux.setSeconds(timeAux.getSeconds() - 10);

      handleYellow(semaphore);

      expect(semaphore.carCount).toBe(3);
    });
  });

  describe("setSemaphoreEmergency", () => {
    it("should set the emergency status of the semaphore", () => {
      semaphores.push(
        {
          uuid: "semaphore1",
          emergency: false,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          carCount: 0,
          description: "",
          fator: 1,
        },
        {
          uuid: "semaphore2",
          emergency: false,
          colorStatus: ColorStatus.RED,
          location: { lat: 0, lon: 0 },
          carCount: 0,
          description: "",
          fator: 1,
        }
      );

      (setSemaphoreEmergency as jest.Mock).mockImplementation(
        (uuid: string, emergency: boolean) => {
          const semaphore = semaphores.find((s) => s.uuid === uuid);
          if (semaphore) {
            semaphore.emergency = emergency;
          }
        }
      );

      setSemaphoreEmergency("semaphore1", true);

      expect(semaphores[0].emergency).toBe(true);
      expect(semaphores[1].emergency).toBe(false);
    });
  });
});
