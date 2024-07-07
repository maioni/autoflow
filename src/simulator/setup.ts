
// Este script é responsável por criar os recursos de semáforos no adaptador e criar as subscrições para cada um deles.
// Para isso, ele faz requisições HTTP para o adaptador, criando os recursos e as subscrições.
// O adaptador deve estar rodando na máquina
// Para rodar o script, basta executar o comando `yarn setup:simulator` no terminal

// Aqui 4 semaforos são criados, cada um com uma descriacao diferente, e cada um com as capacidades de semáforo e câmera de semáforo

const semaphores = [
  {
    description: "semaphore-purple", // Descrição do recurso
    capabilities: ["semaphore", "semaphore-camera"], // Capacidades do recurso
    status: "active", // Status do recurso
    lat: "-23.51589487776733", // Latitude do recurso
    lon: "-47.465608073541446", // Longitude do recurso
  },
  {
    description: "semaphore-cyan",
    capabilities: ["semaphore", "semaphore-camera"],
    status: "active",
    lat: "-23.515657540631693",
    lon: "-47.4655711931671",
  },
  // {
  //   description: "semaphore-green",
  //   capabilities: ["semaphore", "semaphore-camera"],
  //   status: "active",
  //   lat: "-23.51577912049188",
  //   lon: "-47.46587839196468",
  // },
  {
    description: "semaphore-blue",
    capabilities: ["semaphore", "semaphore-camera"],
    status: "active",
    lat: "-23.51604852055936",
    lon: "-47.465888593372455",
  },
  // {
  //   description: "semaphore-red",
  //   capabilities: ["semaphore", "semaphore-camera"],
  //   status: "active",
  //   lat: "-23.51589487776733",
  //   lon: "-47.465608073541446",
  // },
  // {
  //   description: "semaphore-yellow",
  //   capabilities: ["semaphore", "semaphore-camera"],
  //   status: "active",
  //   lat: "-23.515657540631693",
  //   lon: "-47.4655711931671",
  // },
  {
    description: "semaphore-orange",
    capabilities: ["semaphore", "semaphore-camera"],
    status: "active",
    lat: "-23.51589487776733",
    lon: "-47.465608073541446",
  },
  // {
  //   description: "semaphore-pink",
  //   capabilities: ["semaphore", "semaphore-camera"],
  //   status: "active",
  //   lat: "-23.515657540631693",
  //   lon: "-47.4655711931671",
  // },
  // {
  //   description: "semaphore-gray",
  //   capabilities: ["semaphore", "semaphore-camera"],
  //   status: "active",
  //   lat: "-23.51577912049188",
  //   lon: "-47.46587839196468",
  // },
  // {
  //   description: "semaphore-white",
  //   capabilities: ["semaphore", "semaphore-camera"],
  //   status: "active",
  //   lat: "-23.51604852055936",
  //   lon: "-47.465888593372455",
  // },
];

// Função principal, que cria as capacidades e os recursos no adaptador
export async function main() {
  const cap1 = await fetch("http://10.10.10.104:8000/catalog/capabilities", { // Requisição para criar a capacidade de semáforo
    method: "POST", // Método POST
    headers: { // Headers da requisição
      "Content-Type": "application/json", // Tipo do conteúdo da requisição
    },
    body: JSON.stringify({ // Corpo da requisição
      name: "semaphore-camera", // Nome da capacidade de câmera de semáforo
      description: `Capability to sensor of a semaphore camera`, // Descrição da capacidade de câmera de semáforo (senro da câmera de semáforo)
      capability_type: "sensor", // Tipo da capacidade (sensor)
    }),
  });

  const cap2 = await fetch("http://10.10.10.104:8000/catalog/capabilities", { // Requisição para criar a capacidade de câmera de semáforo
    method: "POST", // Método POST
    headers: { // Headers da requisição
      "Content-Type": "application/json", // Tipo do conteúdo da requisição
    },
    body: JSON.stringify({ // Corpo da requisição
      name: "semaphore", // Nome da capacidade de semáforo
      description: `Capability to control of a semaphore`, // Descrição da capacidade de semáforo (controle do semáforo)
      capability_type: "actuator", // Tipo da capacidade (atuador)
    }),
  });

  console.log(cap1.status); // Status da requisição de criação da capacidade de câmera de semáforo
  console.log(cap2.status); // Status da requisição de criação da capacidade de semáforo
  if (cap1.status !== 201 || cap2.status !== 201) { // Se a requisição de criação de capacidades não foi bem sucedida
    console.log("Error creating capabilities"); // Exibe mensagem de erro
    return;
  }

  for (const resource of semaphores) { // Para cada recursos de semáforo 
    const sendData = resource; // Dados do recurso
    const response = await fetch("http://10.10.10.104:8000/adaptor/resources", { // Requisição para criar o recurso
      method: "POST", // Método POST
      headers: { // Headers da requisição
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: sendData }), // Corpo da requisição com os dados do recurso
    });
    console.log(response.status); // Status da requisição de criação do recurso

    const data = ((await response.json()) as any).data; // Dados do recurso criado (uuid, capabilities)
    if (response.status === 500) {
      return;
    }


    const subscription = await fetch( // Requisição para criar a subscrição do recurso
      "http://10.10.10.104:8000/adaptor/subscriptions", // URL da requisição
      {
        method: "POST", // Método POST
        headers: { // Headers da requisição
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ // Corpo da requisição
          subscription: { // Dados da subscrição
            uuid: data.uuid, // UUID do recurso
            capabilities: data.capabilities, // Capacidades do recurso
            url: `http://10.10.10.1:8000/webhook/${data.uuid}`, // URL do webhook do recurso (URL do adaptador)
          },
        }),
      }
    );
    console.log(subscription.status); // Status da requisição de criação da subscrição
    if (subscription.status === 500) {
      return;
    }
  }
}

// << INICIANDO O SCRIPT >>
main();
