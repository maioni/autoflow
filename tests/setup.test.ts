import { main } from "../src/simulator/setup";
import * as http from "http";
import app from "../src/simulator/devices"; // Certifique-se de exportar o `app` do arquivo devices.ts

let server: http.Server;

const testTimeout = 1000;

describe("Setup Simulator", () => {

  beforeAll(async () => {
    await new Promise((resolve) => {
      server = app.listen(8001, () => {
        console.log("Servidor iniciado na porta 8000 para testes");
        resolve(null);
      });
    });
  }, testTimeout); // Aumenta o timeout para 10 segundos se necessário
  
  afterAll(async () => {
    await new Promise((resolve) => {
      server.close(() => {
        console.log("Servidor fechado após testes");
        resolve(null);
      });
    });
  }, testTimeout); // Aumenta o timeout para 10 segundos se necessário

  it("should create capabilities and resources successfully", async () => {
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

    expect(fetch).toHaveBeenCalledTimes(8);
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
      "http://10.10.10.104:8000/adaptor/resources",
      expect.any(Object)
    );
    expect(fetch).toHaveBeenNthCalledWith(
      5,
      "http://10.10.10.104:8000/adaptor/resources",
      expect.any(Object)
    );
    expect(fetch).toHaveBeenNthCalledWith(
      6,
      "http://10.10.10.104:8000/adaptor/resources",
      expect.any(Object)
    );
    expect(fetch).toHaveBeenNthCalledWith(
      7,
      "http://10.10.10.104:8000/adaptor/subscriptions",
      expect.any(Object)
    );
    expect(fetch).toHaveBeenNthCalledWith(
      8,
      "http://10.10.10.104:8000/adaptor/subscriptions",
      expect.any(Object)
    );
  });

  it("should handle error in creating capabilities", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ status: 500, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ status: 500, json: () => Promise.resolve({}) });

    global.fetch = fetchMock as any;

    await main();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith(500);
    expect(console.log).toHaveBeenCalledWith(500);
    expect(console.log).toHaveBeenCalledWith("Error creating capabilities");
  });

  it("should handle error in creating resources", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ status: 201, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ status: 500, json: () => Promise.resolve({}) });

    global.fetch = fetchMock as any;

    await main();

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(console.log).toHaveBeenCalledWith(201);
    expect(console.log).toHaveBeenCalledWith(201);
    expect(console.log).toHaveBeenCalledWith(500);
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

    await main();

    expect(fetch).toHaveBeenCalledTimes(4);
    expect(console.log).toHaveBeenCalledWith(201);
    expect(console.log).toHaveBeenCalledWith(201);
    expect(console.log).toHaveBeenCalledWith(201);
    expect(console.log).toHaveBeenCalledWith(500);
  });
});
