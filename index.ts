// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com

import runServer from './server';
import { GameState, InfoResponse, MoveResponse } from './types';
import { astar } from './astar';

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info(): InfoResponse {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "dave",       // TODO: Your Battlesnake Username
    color: "#008080", // TODO: Choose color
    head: "default",  // TODO: Choose head
    tail: "default",  // TODO: Choose tail
  };
}

// start is called when your Battlesnake begins a game
function start(gameState: GameState): void {
  console.log("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState: GameState): void {
  console.log("GAME OVER\n");
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function move(gameState: GameState): MoveResponse {

  let isMoveSafe: { [key: string]: boolean; } = {
    up: true,
    down: true,
    left: true,
    right: true
  };

  // We've included code to prevent your Battlesnake from moving backwards
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  if (myNeck.x < myHead.x) {        // Neck is left of head, don't move left
    isMoveSafe.left = false;

  } else if (myNeck.x > myHead.x) { // Neck is right of head, don't move right
    isMoveSafe.right = false;

  } else if (myNeck.y < myHead.y) { // Neck is below head, don't move down
    isMoveSafe.down = false;

  } else if (myNeck.y > myHead.y) { // Neck is above head, don't move up
    isMoveSafe.up = false;
  }

  // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;

  if (myHead.x === 0) {
    isMoveSafe.left = false;
  } else if (myHead.x === boardWidth - 1) {
    isMoveSafe.right = false;
  }

  if (myHead.y === 0) {
    isMoveSafe.down = false;
  } else if (myHead.y === boardHeight - 1) {
    isMoveSafe.up = false;
  }

  // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
  const myBody = gameState.you.body;

  for (let i = 0; i < myBody.length; i++) {
    if (myBody[i].x === myHead.x - 1 && myBody[i].y === myHead.y) {
      isMoveSafe.left = false;
    } else if (myBody[i].x === myHead.x + 1 && myBody[i].y === myHead.y) {
      isMoveSafe.right = false;
    }

    if (myBody[i].y === myHead.y - 1 && myBody[i].x === myHead.x) {
      isMoveSafe.down = false;
    } else if (myBody[i].y === myHead.y + 1 && myBody[i].x === myHead.x) {
      isMoveSafe.up = false;
    }
  }

  // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
  const opponents = gameState.board.snakes;

  for (let i = 0; i < opponents.length; i++) {
    const opponentHead = opponents[i].body[0];

    if (opponentHead.x === myHead.x - 1 && opponentHead.y === myHead.y) {
      isMoveSafe.left = false;
    } else if (opponentHead.x === myHead.x + 1 && opponentHead.y === myHead.y) {
      isMoveSafe.right = false;
    }

    if (opponentHead.y === myHead.y - 1 && opponentHead.x === myHead.x) {
      isMoveSafe.down = false;
    } else if (opponentHead.y === myHead.y + 1 && opponentHead.x === myHead.x) {
      isMoveSafe.up = false;
    }
  }

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter(key => isMoveSafe[key]);
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // Choose a random move from the safe moves
  const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
  const food = gameState.board.food;

  // sort food by distance from head
  food.sort((a, b) => {
    const aDist = Math.abs(a.x - myHead.x) + Math.abs(a.y - myHead.y);
    const bDist = Math.abs(b.x - myHead.x) + Math.abs(b.y - myHead.y);
    return aDist - bDist;
  });

  console.log(isMoveSafe);
  console.log(food);
  console.log(myHead);

  const path = astar(myHead, food[0], isMoveSafe);
  console.log(path);

  // for (let i = 0; i < food.length; i++) {
  //   if (food[i].x === myHead.x - 1 && food[i].y === myHead.y && isMoveSafe.left) {
  //     return { move: "left" };
  //   } else if (food[i].x === myHead.x + 1 && food[i].y === myHead.y && isMoveSafe.right) {
  //     return { move: "right" };
  //   }

  //   if (food[i].y === myHead.y - 1 && food[i].x === myHead.x && isMoveSafe.down) {
  //     return { move: "down" };
  //   } else if (food[i].y === myHead.y + 1 && food[i].x === myHead.x && isMoveSafe.up) {
  //     return { move: "up" };
  //   }
  // }

  console.log(`MOVE ${gameState.turn}: ${nextMove}`)
  return { move: nextMove };
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end
});
