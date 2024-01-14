# Simulador dos Sensores

A criação de um sistema que trabalha com dispositivos IoT nem sempre é fácil, trabalhar diretamente com um dispositivo físico pode enfrentar barreiras das mais diversas possíveis. Por isso, uma solução viável para validação do seu sistema é trabalhar com sensores virtualmente.

A estratégia de trabalhar com componentes virtuais nos trás o benefício de avaliar como estes respondem antes mesmo de ter a necessidade de dispositivos reais, com a capacidade de avaliar diversos cenários possíveis - inclusive críticos - que nem sempre são simples de realizar. Além disso, não há custo para sua significativo e diminui o tempo necessário para obtenção dos mesmo.

O objetivo desta parte do projeto é criar dispositivos que possam simular dados sobre um cruzamento de transito, sendo eles: quantidade de carros, tipos de carros, quantidade de pedestres, automação e temporização dos semáforos.

Os seguintes dipositivos estão listados:

- **Semáforos:** que recebem sinais do sistema controlador via interscity;
- **Câmeras:** identifica a quantidade e os tipos de carros em uma determinada rua.

## Como Rodar?
<!-- Yarn e Nodejs -->
Para rodar o projeto é necessário ter o intérprete JavaScript chamado [Nodejs](https://nodejs.org/en/) e um gerenciador de pacotes: o [Yarn](https://yarnpkg.com/) ou o [Npm](https://www.npmjs.com/) instalados. Após isso, basta rodar os seguintes comandos:

```bash
# Instalar as dependências
npm  install
# ou
yarn install
````

```bash
# Criar uma única vez os sensores na interscity [interscity deve estar ativo]
# após criado, rodar este comando novamente, será exibido erro, pois a capabilities já estão criadas
npm run setup:simulator
# ou
yarn setup:simulator
````

```bash
# Rodar os sensores
npm run start:dev
# ou
yarn start:dev
```

Após isso, os sensores estarão rodando e enviando dados para a interscity. Os sensores aumentaram a quantidade de carros conforme o tempo baseado no seu fator, o fator indica o quanto o sensor aumenta a quantidade de carros.


- Quando os semáforos estão vermelho é possível visualizar um aumento de carro;
- Quando os semáforos estão verde é possível visualizar uma diminuição de carro;
- Quando os semáforos estão amarelo é possível visualizar uma diminuição de carro em uma velocidade menor que o verde.


Também é possível receber os comandos enviados pela interscity. 

Caso queira alterar o estado dos sensores, basta enviar uma requisição http para o endereço `http://10.10.10.104:8000/actuator/commands` com o seguinte corpo:

```json
{
  "data": [
    {
      "uuid": "ffbadd7e-f27a-4a01-a666-77c69887db3c",
      "capabilities": {
        "semaphore": "green"
      }
    }
  ]
}
```

Commands:

Listar sensores e identificar o uuid destes

```bash
curl -X GET 'http://10.10.10.104:8000/catalog/resources' -H 'Accept: application/json' | json_pp
```
OU
```bash
curl -X GET 'http://10.10.10.104:8000/catalog/resources/sensors' -H 'Accept: application/json' | json_pp
```
Resposta:

```json
{
    "resources": [
        {
            "id": 4,
            "uri": null,
            "created_at": "2024-01-14T21:08:45.528Z",
            "updated_at": "2024-01-14T21:08:45.528Z",
            "lat": -23.5160485205594,
            "lon": -47.4658885933725,
            "status": "active",
            "collect_interval": null,
            "description": "semaphore-blue",
            "uuid": "8c283a3d-ea1f-4b55-8f18-0b34b38431eb",
            "city": null,
            "neighborhood": null,
            "state": null,
            "postal_code": null,
            "country": null,
            "capabilities": [
                "semaphore-camera",
                "semaphore"
            ]
        },
        {
            "id": 3,
            "uri": null,
            "created_at": "2024-01-14T21:08:45.306Z",
            "updated_at": "2024-01-14T21:08:45.306Z",
            "lat": -23.5157791204919,
            "lon": -47.4658783919647,
            "status": "active",
            "collect_interval": null,
            "description": "semaphore-green",
            "uuid": "3467abf2-cc58-4f96-b4c7-8b1b149f7815",
            "city": null,
            "neighborhood": null,
            "state": null,
            "postal_code": null,
            "country": null,
            "capabilities": [
                "semaphore-camera",
                "semaphore"
            ]
        },
        {
            "id": 2,
            "uri": null,
            "created_at": "2024-01-14T21:08:45.138Z",
            "updated_at": "2024-01-14T21:08:45.138Z",
            "lat": -23.5156575406317,
            "lon": -47.4655711931671,
            "status": "active",
            "collect_interval": null,
            "description": "semaphore-cyan",
            "uuid": "eaa204d1-4032-4da8-9689-da3ec5aa4712",
            "city": null,
            "neighborhood": null,
            "state": null,
            "postal_code": null,
            "country": null,
            "capabilities": [
                "semaphore-camera",
                "semaphore"
            ]
        },
        {
            "id": 1,
            "uri": null,
            "created_at": "2024-01-14T21:08:44.935Z",
            "updated_at": "2024-01-14T21:08:44.935Z",
            "lat": -23.5158948777673,
            "lon": -47.4656080735414,
            "status": "active",
            "collect_interval": null,
            "description": "semaphore-purple",
            "uuid": "c15ae710-b9ff-4c03-b349-da12cf6243a4",
            "city": null,
            "neighborhood": null,
            "state": null,
            "postal_code": null,
            "country": null,
            "capabilities": [
                "semaphore-camera",
                "semaphore"
            ]
        }
    ]
}
```

- Para listar apenas os uuids de cadas sensor:

```bash
curl -X GET 'http://10.10.10.104:8000/catalog/resources' -H 'Accept: application/json' | json_pp | grep 'descripti
on\|uuid'
```
OU 
```bash
curl -X GET 'http://10.10.10.104:8000/catalog/resources/sensors' -H 'Accept: application/json' | json_pp | grep 'descripti
on\|uuid'
```
Resposta:
```json
         "description" : "semaphore-blue",
         "uuid" : "8c283a3d-ea1f-4b55-8f18-0b34b38431eb"
         "description" : "semaphore-green",
         "uuid" : "3467abf2-cc58-4f96-b4c7-8b1b149f7815"
         "description" : "semaphore-cyan",
         "uuid" : "eaa204d1-4032-4da8-9689-da3ec5aa4712"
         "description" : "semaphore-purple",
         "uuid" : "c15ae710-b9ff-4c03-b349-da12cf6243a4"
```

Setar semaphore para o estado green

```bash
curl -X GET 'http://10.10.10.104:8000/actuator/commands' -H 'Content-Type: application/json' -d '{"data": [{"uuid": "8c283a3d-ea1f-4b55-8f18-0b34b38431eb", "capabilities": {"semaphore": "green"}}]}' | json_pp
```

Resposta:
```json
{
    "success": [
        {
            "_id": {
                "$oid": "65a45946c47a7b0001cce094"
            },
            "capability": "semaphore",
            "created_at": "2024-01-14T21:59:34.921Z",
            "platform_resource_id": {
                "$oid": "65a44d5dc47a7b0001cce088"
            },
            "status": "pending",
            "updated_at": "2024-01-14T21:59:34.921Z",
            "uuid": "8c283a3d-ea1f-4b55-8f18-0b34b38431eb",
            "value": "green"
        }
    ],
    "failure": []
}
```

Setar semaphore blue para o estado yellow

```bash
curl -X GET 'http://10.10.10.104:8000/actuator/commands' -H 'Content-Type: application/json' -d '{"data": [{"uuid": "8c283a3d-ea1f-4b55-8f18-0b34b38431eb", "capabilities": {"semaphore": "yellow"}}]}' | json_pp
```
Resposta:
```json
{
    "success": [
        {
            "_id": {
                "$oid": "65a459acc47a7b0001cce095"
            },
            "capability": "semaphore",
            "created_at": "2024-01-14T22:01:16.625Z",
            "platform_resource_id": {
                "$oid": "65a44d5dc47a7b0001cce088"
            },
            "status": "pending",
            "updated_at": "2024-01-14T22:01:16.625Z",
            "uuid": "8c283a3d-ea1f-4b55-8f18-0b34b38431eb",
            "value": "yellow"
        }
    ],
    "failure": []
}
```

Setar semaphore blue para o estado red

```bash
curl -X GET 'http://10.10.10.104:8000/actuator/commands' -H 'Content-Type: application/json' -d '{"data": [{"uuid": "8c283a3d-ea1f-4b55-8f18-0b34b38431eb", "capabilities": {"semaphore": "red"}}]}' | json_pp
```

Resposta:
```json
{
    "success": [
        {
            "_id": {
                "$oid": "65a459cfc47a7b0001cce096"
            },
            "capability": "semaphore",
            "created_at": "2024-01-14T22:01:51.779Z",
            "platform_resource_id": {
                "$oid": "65a44d5dc47a7b0001cce088"
            },
            "status": "pending",
            "updated_at": "2024-01-14T22:01:51.779Z",
            "uuid": "8c283a3d-ea1f-4b55-8f18-0b34b38431eb",
            "value": "red"
        }
    ],
    "failure": []
}
```