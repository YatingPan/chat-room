tput setab 7
tput setaf 5
tput bold

echo "==============================================================="
echo "STARTING SETUP; DELETING CONTENTS OF /srv/chat-room"
echo "==============================================================="

cd /srv
rm -rf chat-room/*
rm -rf chat-room/.*
cd /srv/chat-room

# CHANGE THIS TO THE RIGHT GITHUB REPOSITORY
repo_url="https://github.com/klueserthan/tod.git"
tput setab 7
tput setaf 5
tput bold
echo "==============================================================="
echo "YOU NEED TO USE THE RIGHT REPO URL FOR THIS SCRIPT, CURRENTLY: " $repo_url
echo "==============================================================="
git clone $repo_url .

npm install
npm run build

tput setab 7
tput setaf 5
tput bold
echo "==============================================================="
echo "DONE BUILDING, RESTARTING USING pm2 restart 0 "
echo "==============================================================="

cd /srv
pm2 restart 0