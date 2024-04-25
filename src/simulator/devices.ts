/*
  Esse script simula o comportamento de um semáforo, gerando dados aleatórios de carros passando por ele.
*/
import { ColorStatus, EmergencyDuration, NormalDuration, Semaphore } from "../classes/semaphore";
import { Colors, getColor } from "./colors";
import express, { Request, Response } from "express";

// Lista de semáforos
const semaphores: Semaphore[] = [];
// Tempo auxiliar
let timeAux = new Date();
// Tempo de refresh
let refreshDisplay = 1000 * 0.1;
// Tempo de chegada de carros
let carTime = 1000 * 5;
let carCountEmergencyTrigger = 20;
let carCountNoEmergencyTrigger = 10;
// Tempo de saida de carros
let greenCarTime = 1000 * 3;
let yellowCarTime = 1000 * 5;
let carCountReductionGreenTime = 20;
let carCountReductionYellowTime = 10;
// Tempo de cada cor do semáforo
let normalRedTime = 1000 * 5;
let normalYellowTime = 1000 * 10;
let normalGreenTime = 1000 * 15;
// Tempo total de ciclo
let totalCycleTime = normalRedTime + normalYellowTime + normalGreenTime;
// Tempo de diferenca de emergencia
let diffEmergencyTime = 1000 * 5;
// Tempo emergencia de cada cor do semáforo
let emergencyRedTime = normalRedTime;
let emergencyYellowTime = normalYellowTime - diffEmergencyTime;
let emergencyGreenTime = normalGreenTime + diffEmergencyTime;

const semaphoreStates = [
  {color: ColorStatus.GREEN, duration: normalGreenTime, emergency: emergencyGreenTime, rush: false},
  {color: ColorStatus.YELLOW, duration: normalYellowTime, emergency: emergencyYellowTime, rush: false},
  {color: ColorStatus.RED, duration: normalRedTime, emergency: emergencyRedTime, rush: false},
];

const numberOfSempahores = 4;
const semaphoress = [];

for (let index=0; index < numberOfSempahores; index++) {
  semaphoress[index] = {
      colorStatus: semaphoreStates[semaphoreStates.length-1].color,
      emergency: false // Assuming all semaphores start without emergency
  };
}


// Configurar semáforos
export async function setupDevices() {
  // Busca os semáforos
  await fetchSemaphores();

  // exibir semaforos
  await showSemaphores();

  // Inicializa os semáforos, e incrementa os carros no semáforo a cada 5 segundos
  await initializeSemaphores();

  //mostrar dados do dashboard:
  await dashboard();

  // Atualiza o status dos semáforos
  await toggleSemaphores(0, 0);

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

// Mostra os semáforos
function showSemaphores() {
  for (const semaphore of semaphores) {
    console.log(
      `${semaphore.uuid}: ${getColor(semaphore.description.split("-")[1] as any)}[•]${
        Colors.END
      } ${semaphore.description.replace("-", " ")}: ${semaphore.fator}${
        Colors.END
      } fator`
    );
  }
  console.log("");
}

// Inicializa os semáforos
function initializeSemaphores() {
  setInterval(() => {
    for (const semaphore of semaphores) {
      semaphore.carCount += Math.floor(Math.random() * semaphore.fator) + 1;
    }
  }, carTime);
}

// Mostra o dashboard
function dashboard() {
  // Mostra os tempos em segundos
  console.log("DADOS DE TEMPORIZAÇÃO:");
  console.log(`Verde   - Normal: ${normalGreenTime / 1000}s | Emergência: ${emergencyGreenTime / 1000}s`);
  console.log(`Amarelo - Normal: ${normalYellowTime / 1000}s | Emergência: ${emergencyYellowTime / 1000}s`);
  console.log(`Vermelho - Normal: ${normalRedTime / 1000}s | Emergência: ${emergencyRedTime / 1000}s`);
  console.log("");

  // Exibe o estado de emergência de cada semáforo
  console.log("STATUS DOS SEMÁFOROS:");
}

// const toggleSemaphores = (semaphore: number, state: number) => {
//   semaphoress[semaphore] = semaphoreStates[state].color;
//   setTimeout(() => {
//       if(state < semaphoreStates.length - 1) {
//           toggleSemaphores(semaphore, state + 1);
//       } else {
//           toggleSemaphores((semaphore + 1) % numberOfSempahores, 0);
//       }
//   }, semaphoreStates[state].rushDuration ? semaphoreStates[state].rushDuration : semaphoreStates[state].normalDuration);
// };



const toggleSemaphores = (semaphoreIndex: number, stateIndex: number) => {
  const semaphore = semaphores[semaphoreIndex];
  semaphore.colorStatus = semaphoreStates[stateIndex].color;

  setTimeout(() => {
      if(stateIndex < semaphoreStates.length - 1) {
          toggleSemaphores(semaphoreIndex, stateIndex + 1); // Change to next state
      } else {
          toggleSemaphores((semaphoreIndex + 1) % numberOfSempahores, 0); // Change to next semaphore
          checkEmergencyStatus(); // Verifica se o total de carros em um semáforo atingiu o limite para acionar o estado de emergência
      }
  }, semaphoreStates[stateIndex].rush ? semaphoreStates[stateIndex].emergency : semaphoreStates[stateIndex].duration);
};

// Altera o estado de cada cor do semáforo
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
          checkEmergencyStatus(); // Verifica se o total de carros em um semáforo atingiu o limite para acionar o estado de emergência
        }, semaphore.emergency ? emergencyRedTime : normalRedTime); // Change red delay based on emergency mode (5s ou 5s)
      }, semaphore.emergency ? emergencyYellowTime : normalYellowTime); // Change yellow delay based on emergency mode (10s ou 5s)
    }, semaphore.emergency ? emergencyGreenTime : normalGreenTime); // Change green delay based on emergency mode (10s ou 15s)
  }, totalCycleTime); // Change green delay based on emergency mode (30s ou 20s)
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

// Trata o status verde
async function handleGreen(semaphore: Semaphore) {
  if (timeAux.getTime() + normalGreenTime < new Date().getTime()) {
    semaphore.carCount = Math.max(semaphore.carCount - carCountReductionGreenTime, 0);
    timeAux = new Date();
  }
}

// Trata o status amarelo
async function handleYellow(semaphore: Semaphore) {
  if (timeAux.getTime() + normalYellowTime < new Date().getTime()) {
    semaphore.carCount = Math.max(semaphore.carCount - carCountReductionYellowTime, 0);
    timeAux = new Date();
  }
}

// Método para atualizar o estado de cada semáforo em 30 segundos
function changeSemaphoreColors() {
  setInterval(() => {
    for (const semaphore of semaphores) {
      switch (semaphore.colorStatus) {
        case ColorStatus.GREEN:
          semaphore.colorStatus = ColorStatus.YELLOW;
          break;
        case ColorStatus.YELLOW:
          semaphore.colorStatus = ColorStatus.RED;
          break;
        case ColorStatus.RED:
          semaphore.colorStatus = ColorStatus.GREEN;
          break;
      }
    }
  }, totalCycleTime);
}

// Seta o estado de emergency de um semáforo
function setSemaphoreEmergency(uuid: string, emergency: boolean) {
  const semaphore = semaphores.find((semaphore) => semaphore.uuid === uuid);
  if (semaphore) {
    semaphore.emergency = emergency;
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

// Mostra o status dos semáforos
setInterval(() => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  const semaphoresStatus = semaphores.map((semaphore) => {
    const emergencyStatus = semaphore.emergency ? "!" : ".";
    const currentTime = new Date().getTime() - timeAux.getTime();
    const seconds = Math.floor(currentTime / 1000);
    return `${seconds}s ${getColor(semaphore.colorStatus)}[•]${Colors.END} ${getColor(
      semaphore.description.split("-")[1] as any
    )} ${semaphore.description.replace("-", " ").replace("semaphore", "s.")}: ${semaphore.carCount} [${emergencyStatus}]${
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
  console.log(`RECEBIMENTO DE COMANDOS HABILITADOS`);
});
