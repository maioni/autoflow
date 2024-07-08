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
  setSemaphoreEmergency
} from '../src/simulator/devices';
import { main } from "../src/simulator/setup";
import { Semaphore, ColorStatus } from '../src/classes/semaphore';
import express from "express";

const testTimeout = 120000;

jest.mock('../src/simulator/devices'); // Mocking the whole module

const carCountEmergencyTrigger = 30;
const carCountNoEmergencyTrigger = 20;
let timeAux = new Date();
const semaphoreStates = [
  { color: ColorStatus.GREEN, duration: 15000, emergency: 20000, rush: false },
  { color: ColorStatus.YELLOW, duration: 10000, emergency: 5000, rush: false },
  { color: ColorStatus.RED, duration: 5000, emergency: 5000, rush: false }
];
const semaphores: Semaphore[] = [];
let server: any;

describe("Devices", () => {

  beforeAll((done) => {
    const app = express();
    const port = 8001;

    app.use(express.json());

    app.post("/webhook/:uuid", (req, res) => {
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

    server = app.listen(port, () => {
      console.log('Servidor iniciado na porta 8001 para testes');
      done();
    });
  }, testTimeout);

  afterAll((done) => {
    server.close(() => {
      console.log('Servidor fechado na porta 8001 após testes');
      done();
    });
  }, testTimeout);

  describe("create capabilities and resources", () => {
    it("should create capabilities successfully", async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve({}) })
        .mockResolvedValue({
          status: 201,
          json: () =>
            Promise.resolve({
              data: {
                uuid: "123",
                capabilities: ["semaphore", "semaphore-camera"],
              },
            }),
        });

      global.fetch = fetchMock as any;

      await main();

      expect(fetch).toHaveBeenCalledTimes(10);
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        "http://10.10.10.104:8000/catalog/capabilities",
        expect.any(Object)
      );
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        "http://10.10.10.104:8000/catalog/capabilities",
        expect.any(Object)
      );
      expect(fetch).toHaveBeenNthCalledWith(
        3,
        "http://10.10.10.104:8000/adaptor/resources",
        expect.any(Object)
      );
      expect(fetch).toHaveBeenNthCalledWith(
        4,
        "http://10.10.10.104:8000/adaptor/subscriptions",
        expect.any(Object)
      );
      expect(fetch).toHaveBeenNthCalledWith(
        5,
        "http://10.10.10.104:8000/adaptor/resources",
        expect.any(Object)
      );
      expect(fetch).toHaveBeenNthCalledWith(
        6,
        "http://10.10.10.104:8000/adaptor/subscriptions",
        expect.any(Object)
      );
      expect(fetch).toHaveBeenNthCalledWith(
        7,
        "http://10.10.10.104:8000/adaptor/resources",
        expect.any(Object)
      );
      expect(fetch).toHaveBeenNthCalledWith(
        8,
        "http://10.10.10.104:8000/adaptor/subscriptions",
        expect.any(Object)
      );
    }, testTimeout);

    it("should handle error in creating capabilities", async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ status: 500, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ status: 500, json: () => Promise.resolve({}) });

      global.fetch = fetchMock as any;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await main();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(500);
      expect(consoleSpy).toHaveBeenCalledWith(500);
      expect(consoleSpy).toHaveBeenCalledWith("Error creating capabilities");

      consoleSpy.mockRestore();
    });

    it("should handle error in creating resources", async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ status: 500, json: () => Promise.resolve({}) });

      global.fetch = fetchMock as any;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await main();

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenCalledWith(201);
      expect(consoleSpy).toHaveBeenCalledWith(201);
      expect(consoleSpy).toHaveBeenCalledWith(500);

      consoleSpy.mockRestore();
    });

    it("should handle error in creating subscriptions", async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({
          status: 201,
          json: () =>
            Promise.resolve({
              data: {
                uuid: "123",
                capabilities: ["semaphore", "semaphore-camera"],
              },
            }),
        })
        .mockResolvedValueOnce({ status: 500, json: () => Promise.resolve({}) });

      global.fetch = fetchMock as any;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await main();

      expect(fetch).toHaveBeenCalledTimes(4);
      expect(consoleSpy).toHaveBeenCalledWith(201);
      expect(consoleSpy).toHaveBeenCalledWith(201);
      expect(consoleSpy).toHaveBeenCalledWith(201);
      expect(consoleSpy).toHaveBeenCalledWith(500);

      consoleSpy.mockRestore();
    });
  });
});
