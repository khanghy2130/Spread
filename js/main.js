"use strict";
window.onload = () => {
	function sketch(p5) {
		p5.pauseBtnReady = false;
		p5.appStarted = false;
		p5.BG_COLOR = p5.color(20);

		// import modules
		// Tile types classes are already created
		p5.options_module = new Options_Module(p5);
		p5.generator_module = new Generator_Module(p5);

		p5.setup = function() {
			p5.createCanvas(500, 500);

			p5.rectMode(p5.CENTER);
			p5.textSize(50); 
			p5.textAlign(p5.CENTER, p5.CENTER);
			p5.textFont('Odibee Sans');

			p5.fill(250, 230, 0);
			p5.background(p5.BG_COLOR);
			p5.text("Customize the options\nthen click 'Generate'", p5.width/2, p5.height/2);
			p5.strokeWeight(1.2);

		}

		p5.draw = function() {
			if (p5.appStarted){
				p5.generator_module.update();
			}
		}
		
	};

	new p5(sketch, "canvas-container"); // create the canvas within target element
}