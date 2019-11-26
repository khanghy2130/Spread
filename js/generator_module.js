/*
	This module controls the generation process.
	this.data => showActive, showOutline, type, tilesAmount, groupsAmount, groupColors
*/

"use strict";
function Generator_Module(p5){

	const SPAWN_WAVE_DELAY = 25;
	const JUMP_ANIMATION_DURATION = 450;
	const BASE_COLOR = p5.color(50);
	var layoutTiles = []; // base tiles
	var activeTiles = []; // only active tiles can spread
	var groups = []; // a list of groups of tiles


	
	let data = null,
		phase = null,
		changePhaseDelay = 0,
		delay = null,
		baseImage = null,
		numberOfFilledTiles = 0,
		jumpingTimer = null;



	// when GENERATE button is clicked
	this.startGenerating = function(dataReceived){
		data = dataReceived;
		phase = 'layout'; // 'layout' > 'spread' > 'complete' 
		changePhaseDelay = 0;
		delay = 80; // delay after clearing previous creation
		baseImage = null;
		numberOfFilledTiles = 0;

		camera = {
			xBounds : [-100, 100],
			yBounds : [-100, 100],
			position : {
				x : 0,
				y : 0,
				scaling : 2.0
			},
			targetPosition : {
				x : 0,
				y : 0,
				scaling : 2.0
			}
		};

		// reset tiles
		layoutTiles = [];
		activeTiles = [];
		groups = [];
		for (let i=0; i < data.groupsAmount; i++){
			let group = [];
			// set up for complete phase animation
			group.jumpDelay = p5.round(p5.random(0, 30) * 3);
			group.yOffset = 0;
			group.yAcceleration = 0;

			groups.push(group);
		}
		
	};

	this.update = function() {
		switch (phase){

			case 'layout':
				// camera positioning and zooming
				p5.translate(p5.width/2 + camera.position.x, p5.height/2 + camera.position.y);
				p5.scale(camera.position.scaling);
				updateCameraLive(); // update camera real position
				p5.background(p5.BG_COLOR);

				// spawn wave
				if (delay > 0){
					delay--;
				} else {
					delay = SPAWN_WAVE_DELAY;
					spawnLayoutTile();
				}

				// render layoutTiles
				p5.fill(BASE_COLOR);
				p5.stroke(BASE_COLOR);
				layoutTiles.forEach(tile => tile.render(p5));

				// completed the layout?
				if (layoutTiles.length === data.tilesAmount){
					if (changePhaseDelay > 0){
						changePhaseDelay--;
						// setup for next phase
						if (changePhaseDelay === 0){
							phase = 'spread';
							delay = 10; // delay before starting to spread
							baseImage = p5.get(0, 0, p5.width, p5.height);
							activeTiles = [];
						}
					} else {
						changePhaseDelay = 50; // delay before changing phase
					}
				}
				break;

			case 'spread':
				p5.image(baseImage, 0, 0); // base image
				p5.translate(p5.width/2 + camera.position.x, p5.height/2 + camera.position.y);
				p5.scale(camera.position.scaling);
				
				// render groups
				groups.forEach((group, index) => {
					let colour = data.groupColors[index];
					if (data.showOutline){
						p5.stroke(0);
					} else {
						p5.stroke(colour);
					}
					p5.fill(colour);
					group.forEach(tile => tile.render(p5));
				});

				// render this to see activeTiles in action
				if (data.showActive){
					p5.stroke(0, 0, 0, 180);
					p5.fill(0, 0, 0, 180); 
					activeTiles.forEach(tile => tile.render(p5));
				}
				
				// filled out?
				if (numberOfFilledTiles < data.tilesAmount){
					// spawn wave
					if (delay > 0){
						delay--;
					} else {
						delay = SPAWN_WAVE_DELAY;
						spawnGroupTile();
					}
				} 
				// completely filled => phase change
				else {
					if (changePhaseDelay > 0){
						changePhaseDelay--;
						// setup for next phase
						if (changePhaseDelay === 0){
							phase = 'complete';
							jumpingTimer = JUMP_ANIMATION_DURATION;
						}
					} else {
						changePhaseDelay = 100; // delay before changing phase
						activeTiles = []; // empty the list
					}
				}
				break;

			case 'complete':
				p5.image(baseImage, 0, 0); // base image
				p5.translate(p5.width/2 + camera.position.x, p5.height/2 + camera.position.y);
				p5.scale(camera.position.scaling);

				// jumping duration
				if (jumpingTimer > 0){
					jumpingTimer--;
					
					groups.forEach(group => {
						// cool down the delay
						if (group.jumpDelay > 0){
							group.jumpDelay--;
						} 
						// any touching ground? bounce em!!!
						else if(group.yOffset >= 0) {
							group.yAcceleration = -3.6; // jumping power value
						}
					});
				}

				// render and apply gravity
				groups.forEach((group, index) => {
					p5.push();
					p5.translate(0, group.yOffset);

					let colour = data.groupColors[index];
					if (data.showOutline){
						p5.stroke(0);
					} else {
						p5.stroke(colour);
					}
					p5.fill(colour);
					group.forEach(tile => tile.render(p5));

					p5.pop();

					// update position
					group.yOffset = p5.min(0, group.yOffset + group.yAcceleration);
					group.yAcceleration += 0.5; // gravity value
				});

				break;
		}
	};

	function spawnLayoutTile(){
		if (layoutTiles.length > 0){
			// reach target number of tiles?
			if (layoutTiles.length < data.tilesAmount){

				activeTiles.forEach((tile, index) => {
					// hit the chance? and still not enough tiles?
					if (p5.random(10) < tile.chance && layoutTiles.length < data.tilesAmount){
						// get a list of non-null neighbors
						let neighbors = tile.neighbors.filter(n => n !== null);

						// (FORCE) pick a random neighbor to spread
						// break if found an empty neighbor
						let chosenPosition = null;
						while (neighbors.length > 0){
							let pickedIndex = p5.floor(p5.random(0, neighbors.length));
							let pos = neighbors[pickedIndex];
							// empty? 
							if (checkEmpty(pos)){
								tile.checkOffNeighbor(pos);
								neighbors.splice(pickedIndex, 1);
								chosenPosition = pos;
								break;
							} 
							else {
								// set null to the neighbor reference, then remove from list
								tile.checkOffNeighbor(pos);
								neighbors.splice(pickedIndex, 1);
							}
						}

						// spawn the chosen tile
						if (chosenPosition){
							let newTile = new TILE_TYPE[data.type](...chosenPosition);
							layoutTiles.push(newTile);
							activeTiles.push(newTile);
							updateCamera(newTile.position);
						}

						// becomes unactive if no more empty neighbor
						if (neighbors.length === 0){
							activeTiles.splice(index, 1); // removes self
						}
					}
				});

			} 
			else if (changePhaseDelay === 0){
				changePhaseDelay = 20;
			}
		} 
		else {
			// spawning first tile (position is 0,0)
			let newTile = new TILE_TYPE[data.type](0, 0);
			newTile.chance = 10; // 100% chance
			layoutTiles.push(newTile);
			activeTiles.push(newTile);
		}
	}

	// the tiles would have groupIndex property
	function spawnGroupTile(){
		// spread from existing group members
		if (groups[0].length > 0){

			let newTilesAmount = 0; // prevent newly spawned tiles from spreading
			for (let index=0; index < activeTiles.length - newTilesAmount; index++){
				let tile = activeTiles[index];
			
				// hit the chance? and still have unfilled tiles left?
				if (p5.random(10) < tile.chance && layoutTiles.length > 0){
					// get a list of non-null neighbors
					let neighbors = tile.neighbors.filter(n => n !== null);

					// (FORCE) pick a random neighbor to spread
					// break if found an empty neighbor
					let pickedIndex, chosenPosition = null;
					while (neighbors.length > 0){
						pickedIndex = p5.floor(p5.random(0, neighbors.length));
						let pos = neighbors[pickedIndex];
						// empty? 
						if (checkEmptySpread(pos)){
							tile.checkOffNeighbor(pos);
							neighbors.splice(pickedIndex, 1);
							chosenPosition = pos;
							break;
						} 
						else {
							// set null to the neighbor reference, then remove from list
							tile.checkOffNeighbor(pos);
							neighbors.splice(pickedIndex, 1);
						}
					}

					// spawn the chosen tile
					if (chosenPosition){
						let newTile = new TILE_TYPE[data.type](...chosenPosition);
						newTile.groupIndex = tile.groupIndex;

						groups[tile.groupIndex].push(newTile);
						activeTiles.push(newTile);
						numberOfFilledTiles++;
						newTilesAmount++;
					}

					// becomes unactive if no more empty neighbor
					if (neighbors.length === 0){
						activeTiles.splice(index, 1); // removes self
					}
				}

			}
			// no delay if no new tiles spawned
			if (newTilesAmount === 0) delay = 1;

		}
		// spawn the first tile for each group
		else {
			groups.forEach((group, index) => {
				// pick a tile on the base then check if it's empty
				let pos = [];

				// keeps the loop searching for acceptable tile by having pos empty
				while(pos.length === 0){
					let pickedTile = p5.random(layoutTiles);
					pos = [pickedTile.x, pickedTile.y];

					// not filled yet?
					if (checkEmptySpread(pos)){
						let newTile = new TILE_TYPE[data.type](...pos);
						newTile.groupIndex = index;

						group.push(newTile);
						activeTiles.push(newTile);
						numberOfFilledTiles++;
					}
					else {
						pos = [];
					}
				}
			});
		}
	}

	// not in layoutTiles? then return true
	function checkEmpty(tilePosition){
		for (let i=0; i < layoutTiles.length; i++){
			let tile = layoutTiles[i];
			if (tile.x === tilePosition[0] && tile.y === tilePosition[1]){
				return false;
			}
		}
		return true;
	}
	// check the picked neighbor for SPREAD phase
	function checkEmptySpread(tilePosition){
		// check if the tile is already in a group
		for (let gi=0; gi < groups.length; gi++){
			for (let ti = 0; ti < groups[gi].length; ti++){
				let tile = groups[gi][ti];
				if (tile.x === tilePosition[0] && tile.y === tilePosition[1]){
					return false;
				}
			}
		}
		
		// is an unfilled tile?
		for (let i=0; i < layoutTiles.length; i++){
			let tile = layoutTiles[i];
			if (tile.x === tilePosition[0] && tile.y === tilePosition[1]){
				return true;
			}
		}
		return false;
	}


	// THE CAMERA
	var camera = {
		xBounds : [-100, 100],
		yBounds : [-100, 100],

		// real data that controls the camera
		position : {
			x : 0,
			y : 0,
			scaling : 1
		},
		targetPosition : {} // use to gradually update position
	};

	// update target position
	function updateCamera(tilePosition){
		let {xBounds, yBounds} = camera;
		const SURROUNDING_WIDTH = 10; // distance from tile center

		// adjust xBounds
		if (tilePosition[0] - SURROUNDING_WIDTH < xBounds[0]){
			xBounds[0] = tilePosition[0] - SURROUNDING_WIDTH;
		} else if (tilePosition[0] + SURROUNDING_WIDTH > xBounds[1]){
			xBounds[1] = tilePosition[0] + SURROUNDING_WIDTH;
		}

		// adjust yBounds
		if (tilePosition[1] - SURROUNDING_WIDTH < yBounds[0]){
			yBounds[0] = tilePosition[1] - SURROUNDING_WIDTH;
		} else if (tilePosition[1] + SURROUNDING_WIDTH > yBounds[1]){
			yBounds[1] = tilePosition[1] + SURROUNDING_WIDTH;
		}

		camera.targetPosition = {
			x: -(xBounds[0] + xBounds[1]) / 2, 
			y: -(yBounds[0] + yBounds[1]) / 2
		};

		let s = p5.max(xBounds[1] - xBounds[0], yBounds[1] - yBounds[0]);
		camera.targetPosition.scaling = -p5.log(s)/p5.log(4.12) + 5.2;
	}

	// update real position
	function updateCameraLive(){
		let {targetPosition: tp, position: p} = camera;
		// update scale
		if (p.scaling > tp.scaling) p.scaling -= 0.005 / tp.scaling;
		// update position (if difference is significant)
		if (p5.abs(tp.x - p.x) > 0.05) p.x += (tp.x - p.x) * 0.1;
		if (p5.abs(tp.y - p.y) > 0.1) p.y += (tp.y - p.y) * 0.1;
	}

}