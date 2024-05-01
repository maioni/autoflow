/*
  Esse script simula o comportamento de um semáforo, gerando dados aleatórios de carros passando por ele.
*/
import { ColorStatus, Semaphore } from "../classes/semaphore";
import { Colors, getColor } from "./colors";
import express, { Request, Response } from "express";

// Logs
const changeSemaphoreLog = false;
const emergencyTriggerRushActiveLogs = false;
const emergencyTriggerDurationConditionLogs = false;
const emergencyTriggerMessageLogs = false;
const secondCounterLog = false;
// Paineis informativos
const factorInfo = true;
const uudidInfo = false;
const rushTimeInfo = true;
// Lista de semáforos disponíveis
const semaphores: Semaphore[] = [];
// Tempo auxiliar para controle de carros
let timeAux = new Date();
// Tempo de refresh do display
let refreshDisplay = 1000 * 0.1; // 100ms
// Tempo de chegada de carros em cada semáforo
let carTime = 1000 * 5; // 5s
// Verificar estado de emergência se o total de carros em um semáforo atingir o limite
let carCountEmergencyTrigger = 30; // 20 carros
let carCountNoEmergencyTrigger = 20; // 10 carros
// Tempo de saida de carros em cada cor do semáforo
let carCountReductionGreenTime = 30; // 10 carros
let carCountReductionYellowTime = 10; // 2 carros
// Tempo de cada cor do semáforo em modo normal
let normalRedTime = 1000 * 5; // 5s
let normalYellowTime = 1000 * 10; // 10s
let normalGreenTime = 1000 * 15; // 15s
// Tempo total de ciclo do semáforo
let totalCycleTime = normalRedTime + normalYellowTime + normalGreenTime;
// Tempo de diferenca de emergencia entre as cores do semáforo
let diffEmergencyTime = 1000 * 5; // 5s
// Tempo emergencia de cada cor do semáforo em modo emergência
let emergencyRedTime = normalRedTime; // 5s
let emergencyYellowTime = normalYellowTime - diffEmergencyTime; // 5s
let emergencyGreenTime = normalGreenTime + diffEmergencyTime; // 20s
// Estados do semáforo e seus tempos de duração em milissegundos (ms)
const semaphoreStates = [
  {color: ColorStatus.GREEN, duration: normalGreenTime, emergency: emergencyGreenTime, rush: false}, // rush: false = normal time, rush: true = emergency time
  {color: ColorStatus.YELLOW, duration: normalYellowTime, emergency: emergencyYellowTime, rush: false}, // rush: false = normal time, rush: true = emergency time
  {color: ColorStatus.RED, duration: normalRedTime, emergency: emergencyRedTime, rush: false}, // rush: false = normal time, rush: true = emergency time
];
// Número de semáforos e seus estados iniciais
const numberOfSempahores = 4; // 4 semáforos
const semaphoress = []; // Lista de semáforos
// Inicializa os semáforos com o estado inicial
for (let index=0; index < numberOfSempahores; index++) {
  semaphoress[index] = {
      colorStatus: semaphoreStates[semaphoreStates.length-1].color,
      emergency: false // Todos os semáforos comecam com estado de emergencia desligado (false)
  };
}

// Configurar semáforos e seus estados iniciais (verde, amarelo, vermelho)
export async function setupDevices() {
  // Busca os semáforos disponíveis na rede
  await fetchSemaphores();
  // exibir semaforos disponiveis no console
  showSemaphores();
  // Inicializa os semáforos, e incrementa os carros no semáforo a cada 5 segundos (5000ms)
  initializeSemaphores();
  //mostrar dados do dashboard e atualizar o status dos semáforos:
  dashboard();
  // Atualiza o status dos semáforos a cada 30 segundos (30000ms)
  toggleSemaphores(0, 0, false);
}

// Busca os semáforos disponíveis na rede e adiciona na lista de semáforos disponíveis na rede (semaphores)
async function fetchSemaphores() {
  const res = await fetch(
    "http://10.10.10.104:8000/discovery/resources?capability=semaphore"
  );

  // Busca os recursos disponíveis na rede e adiciona na lista de semáforos disponíveis na rede (semaphores)
  const resources = ((await res.json()) as any).resources as any;

  // Adiciona os semáforos na lista de semáforos disponíveis na rede (semaphores)
  for (const resource of resources) {
    semaphores.push({
      uuid: resource.uuid, // Identificador único do semáforo
      colorStatus: ColorStatus.RED, // Estado inicial do semáforo
      location: { lat: resource.lat, lon: resource.lon }, // Localização do semáforo
      carCount: 0, // Contador de carros no semáforo
      emergency: false, // Estado de emergência do semáforo
      description: resource.description, // Descrição do semáforo
      fator: Math.floor(Math.random() * 3) + 1, // Fator de incremento de carros no semáforo
    });
  }
}

// Mostra os semáforos disponíveis na rede no console com seus respectivos fatores de incremento de carros (fator)
function showSemaphores() {
  if (factorInfo) {
    for (const semaphore of semaphores) {
      let uuid = "";
      if (uudidInfo) {
        uuid = semaphore.uuid;
      }
      console.log(
        `${uuid} ${getColor(semaphore.description.split("-")[1] as any)}[•]${
          Colors.END
        } ${semaphore.description.replace("-", " ")}: ${semaphore.fator}${
          Colors.END 
        } fator` // Exibe o uuid do semáforo e seu respectivo fator de incremento de carros (fator)
      );
    }
    console.log("");
  }
}

// Inicializa os semáforos e incrementa os carros no semáforo a cada 5 segundos (5000ms)
function initializeSemaphores() {
  setInterval(() => {
    for (const semaphore of semaphores) {
      semaphore.carCount += Math.floor(Math.random() * semaphore.fator) + 1;
    }
  }, carTime); // Incrementa os carros no semáforo a cada 5 segundos (5000ms)
}

// Mostra o dashboard com os tempos de cada cor do semáforo em segundos e o status dos semáforos (verde, amarelo, vermelho)
function dashboard() {
  // Mostra os tempos em segundos
  if (rushTimeInfo) {
    console.log("DADOS DE TEMPORIZAÇÃO:");
    console.log(`${Colors.GREEN}Verde${Colors.END}    - Normal .. : ${normalGreenTime / 1000}s | Emergência !! : ${emergencyGreenTime / 1000}s`);
    console.log(`${Colors.YELLOW}Amarelo${Colors.END}  - Normal .. : ${normalYellowTime / 1000}s | Emergência !! : 0${emergencyYellowTime / 1000}s`);
    console.log(`${Colors.RED}Vermelho${Colors.END} - Normal .. : 0${normalRedTime / 1000}s | Emergência !! : 0${emergencyRedTime / 1000}s`);
    console.log("");
  }

  // Exibe o estado de emergência de cada semáforo e seu respectivos estados (verde, amarelo, vermelho)
  console.log("STATUS DOS SEMÁFOROS:");
}

// Altera o estado de cada cor do semáforo a cada 30 segundos (30000ms)
const toggleSemaphores = (semaphoreIndex: number, stateIndex: number, rushActive: boolean) => {
  const semaphore = semaphores[semaphoreIndex]; // Seleciona o semáforo
  const currentState = semaphoreStates[stateIndex]; // Obtém o estado atual do semáforo
  
  // Calcula a duração do estado do semáforo com base no "rush" ativo ou não
  let duration: number;
  if (rushActive) {
    duration = currentState.emergency; // Usa o tempo de emergência se o "rush" estiver ativo e o estado do semáforo também for de emergência
    if (emergencyTriggerDurationConditionLogs) console.log("rushActive = true >> " + rushActive + " - currentState.rush = true >> " + currentState.rush + " duration: " + duration);
  } else {
    duration = currentState.duration; // Caso contrário, usa o tempo normal
    if (emergencyTriggerDurationConditionLogs) console.log("rushActive = false >> " + rushActive + " - currentState.rush = false >> " + currentState.rush + " duration: " + duration);
  }

  semaphore.colorStatus = currentState.color; // cor do semáforo 

  // logs - comentar quando nao utilizar
  if (changeSemaphoreLog){
    process.stdout.clearLine(0); // Limpa a linha do console
    process.stdout.cursorTo(0); // Move o cursor para o início da linha
    console.log(`${getColor(semaphore.colorStatus)}` + duration / 1000 + `s - ` + currentState.color + ` - ` + semaphore.description + ` - ` + semaphore.colorStatus +  `${Colors.END}`);
  }
  // end logs

  // Verifica se o estado atual é o estado de emergência e altera o tempo de duração do estado atual
  setTimeout(() => {
    if (stateIndex < semaphoreStates.length - 1) {
      // rushActive = true; // Ativa o "rush"
      if (emergencyTriggerRushActiveLogs) console.log("rushActive " + rushActive);
      toggleSemaphores(semaphoreIndex, stateIndex + 1, rushActive); // Altera o estado do semáforo
    } else {
      let rush: boolean = checkEmergencyStatus() || false; // Verifica se o total de carros em um semáforo atingiu o limite para acionar o estado de emergência
      if (emergencyTriggerRushActiveLogs) console.log("rushActive " + rush);
      toggleSemaphores((semaphoreIndex + 1) % numberOfSempahores, 0, rush); // Altera o estado do semáforo
    }
  }, duration);
};

// Verifica se o total de carros em um semáforo atingiu o limite para acionar o estado de emergência
function checkEmergencyStatus() {
  let rush = false;
  for (const semaphore of semaphores) {
    if (semaphore.carCount >= carCountEmergencyTrigger) { // Verifica se o total de carros em um semáforo atingiu o limite para acionar o estado de emergência
      semaphore.emergency = true; // Aciona o estado de emergência
      setSemaphoreEmergency(semaphore.uuid, true);
      if (emergencyTriggerMessageLogs) console.log(`${Colors.RED}EMERGÊNCIA ACIONADA!${Colors.END}`); // Exibe a mensagem de emergência acionada
      rush = true;
    }
    if (semaphore.carCount <= carCountNoEmergencyTrigger) { // Verifica se o total de carros em um semáforo atingiu o limite para desativar o estado de emergência
      semaphore.emergency = false; // Desativa o estado de emergência
      setSemaphoreEmergency(semaphore.uuid, false);
      if (emergencyTriggerMessageLogs) console.log(`${Colors.GREEN}EMERGÊNCIA DESATIVADA!${Colors.END}`); // Exibe a mensagem de emergência desativada
      rush = false;
    }
  }
  return rush;
}

// Trata o status verde do semáforo
async function handleGreen(semaphore: Semaphore) { // Trata o status verde do semáforo
  if (timeAux.getTime() + normalGreenTime < new Date().getTime()) { // Verifica se o tempo de verde do semáforo já foi atingido
    semaphore.carCount = Math.max(semaphore.carCount - carCountReductionGreenTime, 0); // Reduz o total de carros no semáforo
    timeAux = new Date(); // Atualiza o tempo auxiliar
  }
}

// Trata o status amarelo do semáforo
async function handleYellow(semaphore: Semaphore) { // Trata o status amarelo do semáforo
  if (timeAux.getTime() + normalYellowTime < new Date().getTime()) { // Verifica se o tempo de amarelo do semáforo já foi atingido
    semaphore.carCount = Math.max(semaphore.carCount - carCountReductionYellowTime, 0); // Reduz o total de carros no semáforo
    timeAux = new Date(); // Atualiza o tempo auxiliar
  }
}

// Seta o estado de emergência de um semáforo (true/false) com base no uuid do semáforo
function setSemaphoreEmergency(uuid: string, emergency: boolean) {
  const semaphore = semaphores.find((semaphore) => semaphore.uuid === uuid); // Busca o semáforo pelo uuid
  if (semaphore) {
    semaphore.emergency = emergency; // Seta o estado de emergência do semáforo
  }
}

// Atualiza o status dos semáforos a cada 100ms
setInterval(async () => {
  for (const semaphore of semaphores) {
    switch (semaphore.colorStatus) { // Verifica o status do semáforo
      case ColorStatus.GREEN: // Verifica se o status do semáforo é verde
        await handleGreen(semaphore); // Trata o status verde do semáforo
        break;
      case ColorStatus.YELLOW: // Verifica se o status do semáforo é amarelo
        handleYellow(semaphore); // Trata o status amarelo do semáforo
        break;
      case ColorStatus.RED: // Verifica se o status do semáforo é vermelho
        break; // Não faz nada
    }
  }
}, refreshDisplay); // Atualiza o status dos semáforos a cada 100ms

// Mostra o status dos semáforos no console a cada 100ms
setInterval(() => {
  process.stdout.clearLine(0); // Limpa a linha do console
  process.stdout.cursorTo(0); // Move o cursor para o início da linha
  const currentTime = new Date().getTime(); // Obtém o tempo atual

  const semaphoresStatus = semaphores.map((semaphore) => {
    const emergencyStatus = semaphore.emergency ? "!!" : ".."; // Exibe ! para estado de emergência

    let seconds = 0; // Inicializa os segundos

    switch (semaphore.colorStatus) { // Verifica o status do semáforo
      case ColorStatus.GREEN: // Verifica se o status do semáforo é verde
        seconds = Math.max(Math.floor((currentTime - timeAux.getTime()) / 1000), 0); // Calcula os segundos para o status verde
        break;
      case ColorStatus.YELLOW: // Verifica se o status do semáforo é amarelo
        seconds = Math.max(Math.floor((currentTime - timeAux.getTime()) / 1000), 0); // Calcula os segundos para o status amarelo
        break;
      case ColorStatus.RED: // Verifica se o status do semáforo é vermelhoa
        seconds = Math.max(Math.floor((currentTime - timeAux.getTime() - normalYellowTime) / 1000), 0); // Calcula os segundos para o status vermelho
        break;
    }

    let message = `${getColor(semaphore.colorStatus)} [•]${Colors.END} ${getColor(
      semaphore.description.split("-")[1] as any
    )} ${semaphore.description.replace("-", " ").replace("semaphore", "s.")}: ${semaphore.carCount} ${emergencyStatus}${
      Colors.END // Exibe o status dos semáforos no console
    } `;

    if (secondCounterLog) {
      message = message.replace(` [`, `${seconds}s []`);
    } 

    return message;
  });

  process.stdout.write(semaphoresStatus.join(" | "));
}, refreshDisplay);

// Envia os dados dos semáforos para o servidor a cada 100ms (100ms)
setInterval(async () => {
  for (const semaphore of semaphores) {
    const body = {
      data: {
        "semaphore-camera": [
          {
            timestamp: new Date().toISOString(), // Data e hora do registro
            value: semaphore.carCount, // Total de carros no semáforo
          },
        ],
      },
    };
    fetch(`http://10.10.10.104:8000/adaptor/resources/${semaphore.uuid}/data`, { // Envia os dados dos semáforos para o servidor
      method: "POST", // Método POST
      body: JSON.stringify(body), // Corpo da requisição
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((err) => console.log(err));
  }
}, refreshDisplay);

// Inicializa os semáforos e seus estados iniciais (verde, amarelo, vermelho)
setupDevices();

// Inicializa o servidor para receber os comandos dos semáforos (verde, amarelo, vermelho)
const app = express(); // Inicializa o servidor
const port = 8000; // Porta do servidor
// Habilita o uso de JSON no corpo da requisição
app.use(express.json());
// Habilita o uso de CORS na aplicação
app.post("/webhook/:uuid", (req: Request<{ uuid: string }>, res: Response) => {
  for (const semaphore of semaphores) {
    if (semaphore.uuid === req.params.uuid) { // Verifica se o uuid do semáforo é igual ao uuid da requisição
      semaphore.colorStatus = req.body.command.value; // Altera o estado do semáforo
      if (semaphore.colorStatus === ColorStatus.GREEN) { // Verifica se o estado do semáforo é verde
        timeAux = new Date(); // Atualiza o tempo auxiliar
      }
      break;
    }
  }
  res.status(200).send("Webhook recebido com sucesso!"); // Retorna a mensagem de sucesso
});
// Inicializa o servidor na porta 8000 para receber os comandos dos semáforos (verde, amarelo, vermelho)
app.listen(port, () => {
  console.log(`RECEBIMENTO DE COMANDOS HABILITADOS`); // Exibe a mensagem de sucesso
});
