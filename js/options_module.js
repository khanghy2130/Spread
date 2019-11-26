/*
	This module contains input elements and their scripts.
	The only interaction with main.js is sending the input data
	when GENERATE is clicked.
*/

"use strict";
function Options_Module(p5){

	// options-menu inputs
	const generateBtn = p5.select("#generate-btn"),
	randomizeBtn = p5.select("#randomize-btn"),
	pauseBtn = p5.select("#pause-btn"),

	checkboxShowActive = p5.select("#show-active-box"),
	checkboxShowOutline = p5.select("#show-outline-box"),
	tileType = p5.select("#tile-type"),

	tileSlider = p5.select("#tile-slider"),
	tileSliderText = p5.select("#number-of-tiles-text"),
	groupSlider = p5.select("#group-slider"),
	groupSliderText = p5.select("#number-of-groups-text"),

	colorInputs = p5.selectAll("input", "#colors-container");
	

	// set up options-menu
	groupSliderText.html(groupSlider.value());
	tileSliderText.html(tileSlider.value());
	updateColorInputs();
	// set default colors
	const colors = ['#ff3721', '#f3ff14',
	 '#3fff14', '#14ffd0', '#2146ff', '#ff21ed'];
	colorInputs.forEach((inputEl, index) => {
		inputEl.value(colors[index % colors.length]);
	});



	// BUTTONS scripts

	generateBtn.mousePressed(() => {
		let groupColors = colorInputs.slice(0, groupSlider.value()).map(element => element.value());

		// send data to generator_module
		p5.generator_module.startGenerating({
			showActive : checkboxShowActive.checked(),
			showOutline : checkboxShowOutline.checked(),
			type: tileType.value(),
			tilesAmount: tileSlider.value(),
			groupsAmount: groupSlider.value(),
			groupColors: groupColors
		});

		p5.appStarted = true;
		// reset pause button
		p5.pauseBtnReady = true;
		pauseBtn.html('▐ ▌');
	});

	randomizeBtn.mousePressed(() => {
		let type = p5.random(['square', 'triangle', 'hexagon']),
			tilesAmount = p5.floor(p5.random(20, 101)),
			maxValue = p5.round(tilesAmount / 8.5),
			groupsAmount = p5.floor(p5.random(1, maxValue + 1));

		tileType.value(type);
		tileSlider.value(tilesAmount);
		groupSlider.attribute('max', maxValue);
		groupSlider.value(groupsAmount);
		tileSliderText.html(tileSlider.value()); // display value
		groupSliderText.html(groupSlider.value()); // dispaly value

		updateColorInputs();
	});

	pauseBtn.mousePressed(() => {
		// ready to use?
		if (p5.pauseBtnReady){
			if (p5.appStarted){
				p5.appStarted = false;
				pauseBtn.html('▶');
			} else {
				p5.appStarted = true;
				pauseBtn.html('▐ ▌');
			}
			
		}
	});



	// SLIDERS scripts

	tileSlider.input(() => {
		const maxValue = p5.round(tileSlider.value() / 8.5);
		groupSlider.attribute('max', maxValue); // assign limit to group slider
		tileSliderText.html(tileSlider.value()); // display value
		groupSliderText.html(groupSlider.value()); // display value

		updateColorInputs();
	});

	groupSlider.input(function(){
		groupSliderText.html(groupSlider.value());
		updateColorInputs();
	});



	function updateColorInputs() {
		const limit = groupSlider.value();
		// unhide
		for (let i = 0; i < limit; i++){
			let inputEl = colorInputs[i];
			inputEl.style('display', 'inline-block');
		}
		// hide
		for (let i = limit; i < colorInputs.length; i++){
			let inputEl = colorInputs[i];
			inputEl.style('display', 'none');
		}
	}
}