# Instalar o curl
sudo apt install curl
# Instalar o nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source ~/.bashrc
nvm ls
nvm --version
# Atualizar o nvm
cd ~/.nvm/
git fetch --tags origin
git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)` && \. "$NVM_DIR/nvm.sh"
nvm ls-remote
nvm --version
# Instalar última versão do nodejs no  nvm
nvm ls-remote
nvm install node
nvm use node
node --version
# Atualizar o npm
nvm install-latest-npm
npm list
npm outdated
# Instalar o yarn
nom install -g yarn 
# Atualizar pacotes
npm update -g