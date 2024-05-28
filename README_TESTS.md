Projeto de  testes:

Dependências:

```bash
# Instalar dependencias
nvm ls-remote
nvm install node
nvm use node
node --version
# Atualizar o npm
nvm install-latest-npm
npm list
npm outdated
# atualizar o yarn
npm install -g yarn
# Atualizar pacotes
npm update -g
```

Configurar o JEST e types

```bash
# Instalar o JEST
npm install -D typescript jest ts-jest @types/jest ts-node
yarn add typescript jest ts-jest @types/jest ts-node
yarn jest --init
✔ It seems that you already have a jest configuration, do you want to override it? … yes

The following questions will help Jest to create a suitable configuration for your project

✔ Would you like to use Typescript for the configuration file? … no
✔ Choose the test environment that will be used for testing › node
✔ Do you want Jest to add coverage reports? … yes
✔ Which provider should be used to instrument code for coverage? › v8
✔ Automatically clear mock calls, instances, contexts and results before every test? … yes
```

Instalar o Supertest e types
yarn add -D supertest @types/supertest


pm install --save-dev ts-jest @types/jest
npx ts-jest config:init
"FUNCIONOU"


babel para suporte import e export
npm install --save-dev @babel/preset-typescript @babel/preset-env babel-jest @types/jest


## CONFIG FILES

jest.config.js // 