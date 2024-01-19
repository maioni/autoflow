echo "CLEAN UP STARTS ..."
echo "REMOVE YARN FROM FROM SYSTEM ..."
sudo apt remove cmdtest
sudo apt remove yarn
echo "REMOVING NODEJS FROM SYSTEM ..."
sudo apt autoremove nodejs
echo "REMOVING NODEJS FROM NVM ..."
nvm uninstall * 
for i in {1..30}; do echo $i; nvm uninstall  $i.*; done
sudo rm -rf ~/.nvm/versions/node/*
nvm cache clear
echo "REMOVING NVM FROM SYSTEM ..."
rm -rf "$NVM_DIR"
rm -rf ~/.nvm
rm -rf ~/.npm
rm -rf ~/.bower
echo "CLEAN UP COMPLETE."