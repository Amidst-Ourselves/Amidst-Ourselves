# Amidst-Ourselves
An Among us like game

<br>

## Setup Instructions Local

1. install Node.js
2. clone the repository
3. run `npm install` in the root directory and in the client directory
4. create a .env file in the root directory and add the following line `PORT=3000`
5. create a .env file in the client directory and add the following line `REACT_APP_SERVER_URL=http://localhost:3000`
6. run `npm run build` in the client repository
7. run `npm start` in the root directory
8. go to `http://localhost:3000` in your browser

<br>

## Setup Instructions Heroku

1. create a Heroku app
2. follow steps 1-4 from the local setup instructions, but fork the repository instead of cloning it
3. create a .env file in the client directory and add the following line `REACT_APP_SERVER_URL=https://<your heroku app name>.herokuapp.com`
4. run `npm run build` in the client directory
5. push the changes to your forked repository
6. link your Heroku app to your forked repository

<br>

## Game Create/Join Instructions

1. go to the website, either at `http://localhost:3000` or `https://<your heroku app name>.herokuapp.com`
2. either register, login, or press `Play Anonymously`
3. either create a game by clicking `...create a new game...` or join a game by typing a game code into the game window and clicking `...join an existing game...`
4. when creating a game, press the `<` or `>` buttons to change the game settings, and then click `Create Game` to start the game

<br>

## Game Play Instructions
These instructions have no particular order. They exist to help you understand how to play the game.
1. choose to enable to disable your own microphone in the browser
2. click the on-screen `mute` button to easity mute and unmute yourself
3. as host, click the on-screen `start` button to start the game
4. as host, click the on-screen `end` button to end the game prematurely
5. user the `w` `a` `s` `d` keys to move your character
6. in lobby, move to the box in the center of the spawn room and press `f` to change your color
7. in game as crewmate, press `m` to see task locations, <b>then</b> move to the location of a yellow dot on the map, <b>then</b> stand over the box at the location of the yellow dot and hold `f` for a few seconds and let go to complete a task
8. in game as imposter, wait for the cooldown timer to hit `0`, <b>then</b> press `k` when you are close to a crewmate to kill them
9. in game, press `r` when close to a dead body to report it and call a meeting
10. in game, press `r` when close to the button at the middle of the spawn room to call a meeting, note you can only call a meeting with this button once per game
11. in meeting, press `text chat` to open the text chat window, <b>then</b> type a message and press enter to send it
12. in meeting, click on a player, <b>then</b> click on the check mark to vote for them
