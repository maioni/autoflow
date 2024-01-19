echo "INSTALL PACKAGES ..."
yarn install
echo "SETUP INTERSCITY ..."
yarn setup:simulator
echo "START AUTOFLOW ..."
yarn start:dev