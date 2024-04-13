/*
  Esse script simula o comportamento de um semáforo, gerando dados aleatórios de carros passando por ele.
*/
import { ColorStatus, Semaphore } from "../classes/semaphore";
import { Colors, getColor } from "./colors";
import express, { Request, Response } from "express";

const semaphores: Semaphore[] = [];
let timeAux = new Date();

// Refresh da tela
let refreshDisplay = 100;

// Tempo de chegada de carros
let carTime = 1000;
let carCountEmergencyTrigger = 40;
let carCountNoEmergencyTrigger = 20;




// Tempo total de ciclo
let totalCycleTime = 30000;

// Tempo de cada cor do semáforo
let normalRedTime = 5000;
let normalYellowTime = 10000;
let normalGreenTime = 15000;

// Tempo emergencia de cada cor do semáforo
let emergencyRedTime = 5000;
let emergencyYellowTime = 5000;
let emergencyGreenTime = 20000;

// // Tempo em que a emergência foi ativada em um dos semaforos
// let eventEmergencyTime = 120000;

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
  console.log("");

  // Inicializa os semáforos, e incrementa os carros no semáforo a cada 5 segundos
  setInterval(() => {
    for (const semaphore of semaphores) {
      semaphore.carCount += Math.floor(Math.random() * semaphore.fator) + 1;
    }
  }, carTime);

  // Mostra os tempos em segundos
  console.log("Tempos:");
  console.log(`Red Time: ${normalRedTime / 1000}s | Emergency Red Time: ${emergencyRedTime / 1000}s`);
  console.log(`Yellow Time: ${normalYellowTime / 1000}s | Emergency Yellow Time: ${emergencyYellowTime / 1000}s`);
  console.log(`Green Time: ${normalGreenTime / 1000}s | Emergency Green Time: ${emergencyGreenTime / 1000}s`);
  console.log("");

  // Listar os UUIDs e descrições dos semáforos
  console.log("UUIDs e Descrições dos Semáforos:");
  for (const semaphore of semaphores) {
    console.log(`${semaphore.uuid}: ${semaphore.description}`);
  }
  console.log("");

  // Exibe o estado de emergency de cada semáforo
  console.log("Semáforos:");
  const semaphoreStatus = semaphores.map((semaphore) => `${semaphore.description.replace("-", " ").replace("semaphore", "    emergency")}: ${semaphore.emergency ? "ON" : "OFF"}`);
  console.log(semaphoreStatus.join(" | "));

  updateSemaphoreState(); // Altera o estado de cada cor do semáforo

  checkEmergencyStatus(); // Verifica se o total de carros em um semáforo atingiu o limite para acionar o estado de emergência

}


// Atualiza o status dos semáforos
function updateSemaphoreStatus() {
  setInterval(() => {
    let currentIndex = 0;
    const semaphore = semaphores[currentIndex];

    setTimeout(() => {
      semaphore.colorStatus = ColorStatus.GREEN; // Set semaphore to green

      setTimeout(() => {
        semaphore.colorStatus = ColorStatus.YELLOW; // Set semaphore to yellow

        setTimeout(() => {
          semaphore.colorStatus = ColorStatus.RED; // Set semaphore to red
          currentIndex = (currentIndex + 1) % semaphores.length; // Change to next semaphore
      
        }, semaphore.emergency ? emergencyRedTime : normalRedTime); // Change red delay based on emergency mode
      }, semaphore.emergency ? emergencyYellowTime : normalYellowTime); // Change yellow delay to 3000ms
    }, semaphore.emergency ? emergencyGreenTime : normalGreenTime); // Change yellow delay to 3000ms
  }, totalCycleTime); // Change green delay based on emergency mode
}

// Verifica se o total de carros em um semáforo atingiu o limite para acionar o estado de emergência
function checkEmergencyStatus() {
  for (const semaphore of semaphores) {
    if (semaphore.carCount >= carCountEmergencyTrigger) {
      semaphore.emergency = true;
    } else if (semaphore.carCount <= carCountNoEmergencyTrigger) {
      semaphore.emergency = false;
    }
  }
}

// Método para alternar o tempo de estado do semáforo quando estiver no estado de emergência
function updateEmergencySemaphoreStatus() {
  let currentIndex = 0;
  setInterval(() => {
    const semaphore = semaphores[currentIndex];
    if (semaphore.emergency) {
      switch (semaphore.colorStatus) {
        case ColorStatus.GREEN:
          semaphore.colorStatus = ColorStatus.YELLOW; // Set semaphore to yellow
          setTimeout(() => {
            semaphore.colorStatus = ColorStatus.RED; // Set semaphore to red
            currentIndex = (currentIndex + 1) % semaphores.length; // Change to next semaphore
          }, emergencyRedTime); // Change red delay to 5000ms
          break;
        case ColorStatus.YELLOW:
          semaphore.colorStatus = ColorStatus.RED; // Set semaphore to red
          currentIndex = (currentIndex + 1) % semaphores.length; // Change to next semaphore
          break;
        case ColorStatus.RED:
          semaphore.colorStatus = ColorStatus.GREEN; // Set semaphore to green
          currentIndex = (currentIndex + 1) % semaphores.length; // Change to next semaphore
          break;
      }
    }
  }, emergencyGreenTime); // Change green delay to 20000ms
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
}, refreshDisplay);

// Trata o status verde
async function handleGreen(semaphore: Semaphore) {
  if (timeAux.getTime() + 3000 < new Date().getTime()) {
    semaphore.carCount = Math.max(semaphore.carCount - 3, 0);
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
}, refreshDisplay);

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
}, refreshDisplay);

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

// metodo para setar o emergency de um semaforo
function setSemaphoreEmergency(uuid: string, emergency: boolean) {
  const semaphore = semaphores.find((semaphore) => semaphore.uuid === uuid);
  if (semaphore) {
    semaphore.emergency = emergency;
  }
}

// Método para atualizar o estado de cada semáforo
function updateSemaphoreState() {
  let currentIndex = 0;
  setInterval(() => {
    const semaphore = semaphores[currentIndex];
    setTimeout(() => {
      semaphore.colorStatus = ColorStatus.GREEN; // Set semaphore to green
      setTimeout(() => {
        semaphore.colorStatus = ColorStatus.YELLOW; // Set semaphore to yellow
        setTimeout(() => {
         semaphore.colorStatus = ColorStatus.RED; // Set semaphore to red
         currentIndex = (currentIndex + 1) % semaphores.length; // Change to next semaphore
        }, semaphore.emergency ? emergencyRedTime : normalRedTime); // Change red delay based on emergency mode
      }, semaphore.emergency ? emergencyYellowTime : normalYellowTime); // Change yellow delay based on emergency mode
   }, semaphore.emergency ? emergencyGreenTime : normalGreenTime); // Change green delay based on emergency mode
  }, totalCycleTime); // Change green delay based on emergency mode
}