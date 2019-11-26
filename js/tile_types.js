/*
	This file provides Tile classes.
	An instance has render and checkoff methods;
	Also has list of its neighbors' coordinates, and its rendering position values
*/

"use strict";
const SPAWNING_TIME = 15;
const TILE_SIZE = 60;
// same scaling for triangle
const SQUARE_SCALING = 0.85; // 15% smaller
const HEX_SCALING = 0.5; // 50% smaller


// parent class
class Tile {

	checkOffNeighbor (targetNeighbor) {
		for (let i=0; i < this.neighbors.length; i++){
			let n = this.neighbors[i];
			if (n && n[0] === targetNeighbor[0] && n[1] === targetNeighbor[1]){
				this.neighbors[i] = null;
				return;
			}
		}
	}

	constructor (x, y) {
		this.x = x;
		this.y = y;
		this.spawnTimer = 0; // render method will make this going to SPAWNING_TIME
		// hit the new spawn if random(10) is below the chance
		this.chance = Math.random() * 3 + 3; // chance value is 3-6

		// list of neighbors' coordinates
		// fixed position
	}

	// render method
}


class Square extends Tile {
	constructor (x, y) {
		super(x, y);

		// left, right, up, down
		this.neighbors = [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1]
		];

		const scaling = TILE_SIZE * SQUARE_SCALING;
		this.position = [
			this.x * scaling, 
			this.y * scaling, 
		];
	}

	render (p5){
		// update spawn timer
		if (this.spawnTimer < SPAWNING_TIME) this.spawnTimer++;

		const scaling = TILE_SIZE * SQUARE_SCALING * this.spawnTimer/SPAWNING_TIME;
		p5.rect(
			this.position[0], 
			this.position[1], 
			scaling, 
			scaling
		);
	}
}

class Hexagon extends Tile {
	constructor (x, y) {
		super(x, y);

		//  rotate clockwise  ->  \.  ./  <-  *\  /*
		this.neighbors = [
			[x + 1, y], //      1,  0
			[x, y + 1], //      0,  1
			[x - 1, y + 1], // -1,  1
			[x - 1, y], //     -1,  0
			[x, y - 1], //      0, -1
			[x + 1, y - 1] //   1, -1
		];

		const scaling = TILE_SIZE * HEX_SCALING;
		const squareRoot = scaling * Math.sqrt(3)/2;
		// y is affected by x
		this.position = [
			this.x * scaling * 3/2,
			this.y * squareRoot * 2 + this.x * squareRoot
		];
	}

	render (p5){
		// update spawn timer
		if (this.spawnTimer < SPAWNING_TIME) this.spawnTimer++;

		const scaling = TILE_SIZE * HEX_SCALING * this.spawnTimer/SPAWNING_TIME;
		const squareRoot = scaling * p5.sqrt(3)/2; // repeating value
		const halfed = scaling/2; // repeating value
		// ->  \.  ./  <-  *\  /*
		p5.beginShape();
		p5.vertex(this.position[0] + scaling , this.position[1] );
		p5.vertex(this.position[0] + halfed , this.position[1] + squareRoot);
		p5.vertex(this.position[0] - halfed, this.position[1] + squareRoot );
		p5.vertex(this.position[0] - scaling , this.position[1] );
		p5.vertex(this.position[0] - halfed , this.position[1] - squareRoot );
		p5.vertex(this.position[0] + halfed , this.position[1] - squareRoot );
		p5.endShape(p5.CLOSE);
	}
}

class Triangle extends Tile {
	constructor (x, y) {
		super(x, y);
		// upward determines which type of triangle it is
		this.upward = (x + y) % 2 === 0;

		if (this.upward) {
			// left, right, down
			this.neighbors = [
				[x - 1, y],
				[x + 1, y],
				[x, y + 1]
			]
		} else {
			// left, right, up
			this.neighbors = [
				[x - 1, y],
				[x + 1, y],
				[x, y - 1]
			]
		}

		const TRIANGLE_HEIGHT = TILE_SIZE * Math.sqrt(3)/2;
		const CENTER_Y = TILE_SIZE / (2 * Math.sqrt(3));
		const yOffset = (this.upward) ? TRIANGLE_HEIGHT - (2 * CENTER_Y) : 0;
		this.position = [
			x * TILE_SIZE/2, 
			y * TRIANGLE_HEIGHT + yOffset
		];
	}

	render (p5){
		// update spawn timer
		if (this.spawnTimer < SPAWNING_TIME) this.spawnTimer++;

		const scaling = TILE_SIZE * this.spawnTimer/SPAWNING_TIME;
		const TRIANGLE_HEIGHT = scaling * Math.sqrt(3)/2;
		const CENTER_Y = scaling / (2 * Math.sqrt(3));

		if (this.upward){
			// top > left > right
			p5.triangle(
				this.position[0],
				this.position[1] - (TRIANGLE_HEIGHT - CENTER_Y),
				this.position[0] - scaling/2,
				this.position[1] + CENTER_Y,
				this.position[0] + scaling/2, 
				this.position[1] + CENTER_Y
			);
		} else {
			// bottom > left > right
			p5.triangle(
				this.position[0],
				this.position[1] + (TRIANGLE_HEIGHT - CENTER_Y),
				this.position[0] - scaling/2,
				this.position[1] - CENTER_Y,
				this.position[0] + scaling/2, 
				this.position[1] - CENTER_Y
			);
		}
		
	}
}

// matching string keys
const TILE_TYPE = {
	'square' : Square,
	'hexagon' : Hexagon,
	'triangle' : Triangle
};