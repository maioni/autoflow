/*
  Esse script simula o comportamento de um semáforo, gerando dados aleatórios de carros passando por ele.
*/

import { ColorStatus, Semaphore } from "../classes/semaphore";
import { Colors, getColor } from "./colors";
import express, { Request, Response } from "express";

const semaphores: Semaphore[] = [];
let timeAux = new Date();

// Tempo de chegada de carros
let carTime = 5000;

// Tempo de cada cor do semáforo
let redTime = 5000;
let yellowTime = 10000;
let greenTime = 15000;

// Inicializa os semáforos
export async function setupDevices() {

  // Busca os semáforos
  await fetchSemaphores();

  // Mostra os semáforos
  for (const semaphore of semaphores) {
    console.log(
      `${getColor(semaphore.description.split("-")[1] as any)}[•]${
        Colors.END
      } ${semaphore.description.replace("-", " ")}: ${semaphore.fator}${
        Colors.END
      } fator`
    );
  }

  console.log("\n");

  // Inicializa os semáforos
  setInterval(() => {
    for (const semaphore of semaphores) {
      semaphore.carCount += Math.floor(Math.random() * semaphore.fator) + 1;
    }
  }, carTime);

  // Mostra os tempos
  console.log(`Red Time: ${redTime}ms`);
  console.log(`Yellow Time: ${yellowTime}ms`);
  console.log(`Green Time: ${greenTime}ms`);
  console.log("\n");

  // Atualiza o status dos semáforos
  updateSemaphoreStatus(); // Altera o tempo de cada cor do semáforo

}

// Atualiza o status dos semáforos
function updateSemaphoreStatus() {
  let currentIndex = 0;
  setInterval(() => {
    const semaphore = semaphores[currentIndex];
    semaphore.colorStatus = ColorStatus.GREEN; // Set semaphore to green
    setTimeout(() => {
      semaphore.colorStatus = ColorStatus.YELLOW; // Set semaphore to yellow
      setTimeout(() => {
        semaphore.colorStatus = ColorStatus.RED; // Set semaphore to red
        currentIndex = (currentIndex + 1) % semaphores.length; // Change to next semaphore
      }, redTime); // Change red delay to 2000ms
    }, yellowTime); // Change yellow delay to 3000ms
  }, greenTime); // Change green delay to 10000ms
}

function setAllSemaphoresRed() {
  for (const semaphore of semaphores) {
    semaphore.colorStatus = ColorStatus.RED;
  }
}

// Busca os semáforos
async function fetchSemaphores() {
  const res = await fetch(
    "http://10.10.10.104:8000/discovery/resources?capability=semaphore"
  );

  // Busca os recursos
  const resources = ((await res.json()) as any).resources as any;

  // Adiciona os semáforos
  for (const resource of resources) {
    semaphores.push({
      uuid: resource.uuid,
      colorStatus: ColorStatus.RED,
      location: { lat: resource.lat, lon: resource.lon },
      carCount: 0,
      emergency: false,
      description: resource.description,
      fator: Math.floor(Math.random() * 3) + 1,
    });
  }
}

// Atualiza o status dos semáforos
setInterval(async () => {
  for (const semaphore of semaphores) {
    switch (semaphore.colorStatus) {
      case ColorStatus.GREEN:
        await handleGreen(semaphore);
        break;
      case ColorStatus.YELLOW:
        handleYellow(semaphore);
        break;
      case ColorStatus.RED:
        break;
    }
  }
}, 500);

// Trata o status verde
async function handleGreen(semaphore: Semaphore) {
  if (timeAux.getTime() + 3000 < new Date().getTime()) {
    semaphore.carCount = Math.max(semaphore.carCount - 2, 0);
    timeAux = new Date();
  }
}

// Trata o status amarelo
async function handleYellow(semaphore: Semaphore) {
  semaphore.carCount = semaphore.carCount > 0 ? semaphore.carCount - 1 : 0;
}

// Mostra o status dos semáforos
console.log("STATUS DOS SEMAFOROS");
// Mostra o status dos semáforos
setInterval(() => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  const semaphoresStatus = semaphores.map((semaphore) => {
    return `${getColor(semaphore.colorStatus)}[•]${Colors.END} ${getColor(
      semaphore.description.split("-")[1] as any
    )} ${semaphore.description.replace("-", " ")}: ${semaphore.carCount}${
      Colors.END
    } `;
  });
  process.stdout.write(semaphoresStatus.join(" | "));
}, 500);

// Envia os dados dos semáforos
setInterval(async () => {
  for (const semaphore of semaphores) {
    const body = {
      data: {
        "semaphore-camera": [
          {
            timestamp: new Date().toISOString(),
            value: semaphore.carCount,
          },
        ],
      },
    };
    fetch(`http://10.10.10.104:8000/adaptor/resources/${semaphore.uuid}/data`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((err) => console.log(err));
  }
}, 500);

// Inicializa os semáforos
setupDevices();
// Inicializa o servidor
const app = express();
const port = 8000;
// Habilita o uso de JSON
app.use(express.json());
// Habilita o uso de CORS
app.post("/webhook/:uuid", (req: Request<{ uuid: string }>, res: Response) => {
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
// Inicializa o servidor
app.listen(port, () => {
  console.log(`RECEBIMENTO DE COMANDOS HABILITADOS\n`);
});
