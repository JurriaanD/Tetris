let grid; // Matrix of the game field
let cellSize; // Size of 1 cell
let blocks; // Array of all the possible blocks
let current; // The block that currently is falling
let score;

/**
 * Creates the canvas and initialises constants
 */
function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
  	cellSize = floor(height / 20);
  	frameRate(30);

	score = 0;
	grid = [];
	for (let row = 0; row < 20; row++) {
		grid.push(new Array(15).fill(null));
	}

	blocks = [];
	blocks.push(new Block(
		[[0, 0, 0],
		[0, 1, 0],
		[1, 1, 1]], color("#3cc7d6")
	));
	blocks.push(new Block(
		[[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]], color("#fbb414")
	));
	blocks.push(new Block(
		[[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0],
		[0, 0, 0]], color("#b04497")
	));
	blocks.push(new Block(
		[[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]], color("#b04497")
	));
	blocks.push(new Block(
		[[1, 1],
		[1, 1]], color("#3993d0")));
	blocks.push(new Block(
		[[0, 0, 0],
		[0, 1, 1],
		[1, 1, 0]], color("#ed652f")));
	blocks.push(new Block(
		[[0, 0, 0],
		[1, 1, 0],
		[0, 1, 1]], color("#95c43d")));
	current = null;
}

/**
 * Drop the current block every 10 frames
 * Draw the grid, score and current block
 */
function draw() {
	if ((frameCount-1) % 10 == 0) {
		updateBlock();
	}
	noStroke();
	drawGrid();
	drawBlock();
	drawScore();
}

/**
 * Draws the boundaries of the field
 * Colors a cell white if a block has settled there
 * Colors all other cells black	
 */
function drawGrid() {
	translate(width/2 - grid[0].length/2*cellSize, 0);
	background(0);
	let yoff = height - grid.length*cellSize;
	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[0].length; x++) {
		if (grid[y][x] == null) {
			fill(0);
			stroke(0);
		} else {
			fill(255);
			stroke(255);
		}
		rect(x*cellSize, yoff + y*cellSize, cellSize, cellSize);
		}
	}
  
  stroke(255);
  line(0, 0, 0, height);
  line(cellSize*grid[0].length, 0, cellSize*grid[0].length, height);
}


function drawScore() {
	fill(255);
	stroke(0);
	strokeWeight(5);
	textSize(30);
	text(score, cellSize * grid[0].length/2, 1.5*cellSize);
}

/**
 * Draws the block that's currently falling
 */
function drawBlock() {
  let yoff = height - grid.length*cellSize;

  stroke(255);
  fill(current.col.toString());
  for (let y = 0; y < current.shape.length; y++) {
    for (let x = 0; x < current.shape[0].length; x++) {
      if (current.shape[y][x] != 0) {
        rect((current.pos.x+x)*cellSize, yoff+(current.pos.y+y)*cellSize, cellSize, cellSize);
      }
    }
  }
}

/**
 * Tries to drop the block one cell
 * If it can't, try to spawn a new block
 * If that fails, it's game over
 */
function updateBlock() {
  if (current == null) {
    current = random(blocks).copy();
    current.pos = createVector(floor(grid[0].length/2), 0)
  } else {
    if (canDrop()) {
      moveBlock(0, 1);
    } else {
      mergeBlock();
      checkRows();
      current = null;
      updateBlock();
      if (!canSpawn()) {
        current = new Block([], color(0));
        noLoop();
        console.log("GAME OVER");
      }
    }
  }
}

/**
 * Checks whether a block can drop one cell down
 */
function canDrop() {
  /*
    Check the y-pos of the block
  */
  for (let i = 0; i < current.shape.length; i++) {
	let sum = current.shape[i].reduce((a,b)=>a+b, 0);
	// Sum will be zero if the row of the block matrix has no filled cells 
    if (sum != 0 && current.pos.y + i +1 >= grid.length) {
      return false;
    }
  }

  /*
    Check for other blocks
  */
  for (let i = 0; i < current.shape.length; i++) {
    for (let j = 0; j < current.shape[0].length; j++) {
      if (current.shape[i][j] != 0 && grid[current.pos.y+i+1][current.pos.x+j] != null) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if there is room for a block to spawn
 */
function canSpawn() {
  for (let i = 0; i < current.shape.length; i++) {
    for (let j = 0; j < current.shape[0].length; j++) {
      if (current.shape[i][j] != 0 && grid[current.pos.y+i][current.pos.x+j] != null) {
        return false;
      }
    }
  }
  return true;
}


function isValidSpot(x, y) {
  return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length;
}

/**
 * Check if rotating the current block would result in a collion
 */
function canRotate() {
  let fake = current.copy();
  fake.rotate();
  /*
    Check out of bounds
    Check collision
  */
  for (let i = 0; i < fake.shape.length; i++) {
    for (let j = 0; j < fake.shape[0].length; j++) {
      if (fake.shape[i][j] != 0) {
        if (!isValidSpot(fake.pos.x+j, fake.pos.y+i)){return false;}
        if (grid[fake.pos.y+i][fake.pos.x+j] != null){return false;}
      }
    }
  }
  return true;
}

/**
 * Check if we have completed a row with our current block
 * If so, award us a point for each completed row
 */
function checkRows() {
	// Iterate over the rows top to bottom
	for (let i = current.shape.length-1; i >= 0;i--) {
		if (current.pos.y + i < grid.length) {
			// Assume the row is complete until proven otherwise
			let full = true;
			for (let j = 0; j < grid[0].length; j++) {
				if (grid[current.pos.y+i][j] == null) {
				full = false;
				break;
				}
			}
			// If we completed a row, delete it and increase our score
			if (full) {
				grid.splice(current.pos.y + i, 1);
				grid.unshift(new Array(15).fill(null));
				score++;
				i++;
			}
		}
	}
}

/**
 * Settles the current block into the playfield
 */
function mergeBlock() {
  for (let i = 0; i < current.shape.length; i++) {
    for (let j = 0; j < current.shape[0].length; j++) {
      if (current.shape[i][j] != 0) {
        grid[current.pos.y + i][current.pos.x+j] = current.col;
      }
    }
  }
}


function rotateBlock() {
  if (canRotate()) {
    current.rotate();
  }
}

/**
 * Moves the current block x cells along the x-axis and y cells along the y-axis
 * @param int x 
 * @param int y 
 */
function moveBlock(x, y) {
  for (let i = 0; i < current.shape.length; i++) {
    for (let j = 0; j < current.shape[0].length; j++) {
      if (current.shape[i][j] != 0) {
        if (!isValidSpot(current.pos.x + x + j, current.pos.y + y + i)
            || grid[current.pos.y+i+y][current.pos.x+j+x] != null) {
              return;
        }
      }
    }
  }
  current.pos.x += x;
  current.pos.y += y;
}


function keyPressed() {
	switch (keyCode) {
		case UP_ARROW:
			rotateBlock();
			break;
    case LEFT_ARROW:
      moveBlock(-1, 0);
      break;
    case RIGHT_ARROW:
      moveBlock(1, 0);
      break;
    case DOWN_ARROW:
      moveBlock(0, 1);
      moveBlock(0, 1);
      break;
  	}
}
