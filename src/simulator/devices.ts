import { ColorStatus, Semaphore } from "../classes/semaphore";
import { Colors, getColor } from "./colors";
import express, { Request, Response } from "express";

// Configuração dos Logs
const changeSemaphoreLog = false;
const emergencyTriggerRushActiveLogs = false;
const emergencyTriggerDurationConditionLogs = false;
const emergencyTriggerMessageLogs = false;
const secondCounterLog = false;

// Configuração dos Paineis Informativos
const factorInfo = true;
const uudidInfo = false;
const rushTimeInfo = true;

// Lista de semáforos
const semaphores: Semaphore[] = [];
let timeAux = new Date();
const refreshDisplay = 100;
const carTime = 5000;
const carCountEmergencyTrigger = 30;
const carCountNoEmergencyTrigger = 20;
const carCountReductionGreenTime = 30;
const carCountReductionYellowTime = 10;
const normalRedTime = 5000;
const normalYellowTime = 10000;
const normalGreenTime = 15000;
const diffEmergencyTime = 5000;
const emergencyRedTime = normalRedTime;
const emergencyYellowTime = normalYellowTime - diffEmergencyTime;
const emergencyGreenTime = normalGreenTime + diffEmergencyTime;

const semaphoreStates = [
  { color: ColorStatus.GREEN, duration: normalGreenTime, emergency: emergencyGreenTime, rush: false },
  { color: ColorStatus.YELLOW, duration: normalYellowTime, emergency: emergencyYellowTime, rush: false },
  { color: ColorStatus.RED, duration: normalRedTime, emergency: emergencyRedTime, rush: false },
];

const numberOfSempahores = 4;
const arrayOfSemaphores = Array.from({ length: numberOfSempahores }, () => ({
  colorStatus: ColorStatus.RED,
  emergency: false,
}));

export async function setupDevices() {
  await fetchSemaphores();
  showSemaphores();
  initializeSemaphores();
  dashboard();
  toggleSemaphores(0, 0, false);
}

export async function fetchSemaphores() {
  const res = await fetch("http://10.10.10.104:8000/discovery/resources?capability=semaphore");
  const resources = ((await res.json()) as any).resources as any;

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

export function showSemaphores() {
  if (factorInfo) {
    for (const semaphore of semaphores) {
      let uuid = "";
      if (uudidInfo) {
        uuid = semaphore.uuid;
      }
      console.log(
        `${uuid} ${getColor(semaphore.description.split("-")[1] as keyof typeof Colors)}[•]${Colors.END} ${semaphore.description.replace("-", " ")}: ${semaphore.fator}${Colors.END} fator`
      );
    }
    console.log("");
  }
}

export function initializeSemaphores() {
  setInterval(() => {
    for (const semaphore of semaphores) {
      semaphore.carCount += Math.floor(Math.random() * semaphore.fator) + 1;
    }
  }, carTime);
}

export function dashboard() {
  if (rushTimeInfo) {
    console.log("DADOS DE TEMPORIZAÇÃO:");
    console.log(`${Colors.GREEN}Verde${Colors.END}    - Normal .. : ${normalGreenTime / 1000}s | Emergência !! : ${emergencyGreenTime / 1000}s`);
    console.log(`${Colors.YELLOW}Amarelo${Colors.END}  - Normal .. : ${normalYellowTime / 1000}s | Emergência !! : ${emergencyYellowTime / 1000}s`);
    console.log(`${Colors.RED}Vermelho${Colors.END} - Normal .. : ${normalRedTime / 1000}s | Emergência !! : ${emergencyRedTime / 1000}s`);
    console.log("");
  }

  console.log("STATUS DOS SEMÁFOROS:");
}

export const toggleSemaphores = (semaphoreIndex: number, stateIndex: number, rushActive: boolean) => {
  const semaphore = semaphores[semaphoreIndex];
  const currentState = semaphoreStates[stateIndex];
  const duration = rushActive ? currentState.emergency : currentState.duration;
  semaphore.colorStatus = currentState.color;

  if (changeSemaphoreLog) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`${getColor(semaphore.colorStatus)}${duration / 1000}s - ${currentState.color} - ${semaphore.description} - ${semaphore.colorStatus}${Colors.END}`);
  }

  setTimeout(() => {
    if (stateIndex < semaphoreStates.length - 1) {
      toggleSemaphores(semaphoreIndex, stateIndex + 1, rushActive);
    } else {
      const rush = checkEmergencyStatus() || false;
      toggleSemaphores((semaphoreIndex + 1) % numberOfSempahores, 0, rush);
    }
  }, duration);
};

export function checkEmergencyStatus() {
  let rush = false;
  for (const semaphore of semaphores) {
    if (semaphore.carCount >= carCountEmergencyTrigger) {
      semaphore.emergency = true;
      setSemaphoreEmergency(semaphore.uuid, true);
      if (emergencyTriggerMessageLogs) console.log(`${Colors.RED}EMERGÊNCIA ACIONADA!${Colors.END}`);
      rush = true;
    }
    if (semaphore.carCount <= carCountNoEmergencyTrigger) {
      semaphore.emergency = false;
      setSemaphoreEmergency(semaphore.uuid, false);
      if (emergencyTriggerMessageLogs) console.log(`${Colors.GREEN}EMERGÊNCIA DESATIVADA!${Colors.END}`);
      rush = false;
    }
  }
  return rush;
}

export async function handleGreen(semaphore: Semaphore) {
  if (timeAux.getTime() + normalGreenTime < new Date().getTime()) {
    semaphore.carCount = Math.max(semaphore.carCount - carCountReductionGreenTime, 0);
    timeAux = new Date();
  }
}

export async function handleYellow(semaphore: Semaphore) {
  if (timeAux.getTime() + normalYellowTime < new Date().getTime()) {
    semaphore.carCount = Math.max(semaphore.carCount - carCountReductionYellowTime, 0);
    timeAux = new Date();
  }
}

export function setSemaphoreEmergency(uuid: string, emergency: boolean) {
  const semaphore = semaphores.find((semaphore) => semaphore.uuid === uuid);
  if (semaphore) {
    semaphore.emergency = emergency;
  }
}

setInterval(async () => {
  for (const semaphore of semaphores) {
    switch (semaphore.colorStatus) {
      case ColorStatus.GREEN:
        await handleGreen(semaphore);
        break;
      case ColorStatus.YELLOW:
        await handleYellow(semaphore);
        break;
      case ColorStatus.RED:
        break;
    }
  }
}, refreshDisplay);

setInterval(() => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  const currentTime = new Date().getTime();
  const semaphoresStatus = semaphores.map((semaphore) => {
    const emergencyStatus = semaphore.emergency ? "!!" : "..";
    let seconds = 0;

    switch (semaphore.colorStatus) {
      case ColorStatus.GREEN:
        seconds = Math.max(Math.floor((currentTime - timeAux.getTime()) / 1000), 0);
        break;
      case ColorStatus.YELLOW:
        seconds = Math.max(Math.floor((currentTime - timeAux.getTime()) / 1000), 0);
        break;
      case ColorStatus.RED:
        seconds = Math.max(Math.floor((currentTime - timeAux.getTime() - normalYellowTime) / 1000), 0);
        break;
    }

    let message = `${getColor(semaphore.colorStatus)} [•]${Colors.END} ${getColor(semaphore.description.split("-")[1] as keyof typeof Colors)} ${semaphore.description.replace("-", " ").replace("semaphore", "s.")}: ${semaphore.carCount} ${emergencyStatus}${Colors.END}`;
    if (secondCounterLog) {
      message = message.replace(` [`, `${seconds}s [`);
    }
    return message;
  });

  process.stdout.write(semaphoresStatus.join(" | "));
}, refreshDisplay);

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

setupDevices();

const app = express();
const port = 8000;
app.use(express.json());
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
app.listen(port, () => {
  console.log(`RECEBIMENTO DE COMANDOS HABILITADOS`);
});

export { Semaphore };
