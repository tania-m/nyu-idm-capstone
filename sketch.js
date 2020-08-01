// music constants
let mainTrack, snowForest, ecg;
let thunder = new Array(4);
let soundScape;
let mainMusicPlaying = false;
let amplitude, ecgAmplitude;
let fft;

// colors and color palettes
let backgroundBluesPalette, backgroundGeneralPalette, redPalette;
let backgroundBlueSpikesColor, characterBalanceColor, ecgBeatColor;
let spikeColorChangeCounter = 0,
	triangleColorChangeCounter = 0;

// background image
let backgroundImage;

// foreground bottom image
let foregroundImage;

// drawing constants
const BOTH_SIDES = false;

// setup ==============================================================================
function setup() {
	noFill();

	// round line endings
	strokeCap(ROUND);
	strokeJoin(ROUND);

	// to limit speed on different machines
	// (some machines have more computing power... so the animation there was too fast)
	frameRate(15);

	// canvas
	let cnv = createCanvas(1800, 1000);

	// music must be started via a user action, here a simple canvas press
	cnv.mousePressed(canvasPressed);

	// to display waveforms
	amplitude = new p5.Amplitude();
	fft = new p5.FFT();

	// colors and color palettes
	ecgBeatColor = color(0, 52, 92);

	// for blues
	backgroundBluesPalette = [
		color(35, 101, 158),
		color(27, 79, 125),
		color(51, 76, 125),
		color(0, 79, 125),
		color(37, 102, 161),
		color(35, 61, 125),
		color(34, 99, 161),
		color(34, 92, 169)
	];

	// for gray towards yellow
	backgroundGeneralPalette = [
		color(10, 17, 23),
		color(83, 95, 107),
		color(117, 124, 132),
		color(135, 129, 129),
		color(186, 173, 165),
		color(227, 202, 172),
		color(222, 210, 196),
		color(255, 228, 207)
	];

	// for reds towards yellow
	redPalette = [
		color(168, 5, 0),
		color(229, 106, 107),
		color(255, 204, 176),
		color(255, 220, 163),
		color(255, 236, 150)
	];
}

// images and audio should be pre-loaded
// Regarding urls: urls changed on deployed version - this is for local dev!
function preload() {
	// pictures/collages
	backgroundImage = loadImage('http://localhost:3000/images/background-30.png');
	foregroundImage = loadImage('http://localhost:3000/images/foreground.png');

	// music
	mainTrack = loadSound('http://localhost:3000/music/depressing-music-track.mp3');
	snowForest = loadSound('http://localhost:3000/music/falling-snow.wav');
	ecg = loadSound('http://localhost:3000/music/ecg.wav');

	// random thunder sounds
	thunder[0] = loadSound('http://localhost:3000/music/thunder-1.wav');
	thunder[1] = loadSound('http://localhost:3000/music/thunder-2.wav');
	thunder[2] = loadSound('http://localhost:3000/music/thunder-3.wav');
	thunder[3] = loadSound('http://localhost:3000/music/thunder-4.wav');
}

// For the audio ==============================================================================
// starting music must be an explicit user action
// in this case it will be a press on the canvas
function canvasPressed() {
	if (!mainMusicPlaying) { // main soundscape, composed of 3 tracks
		//console.log('Starting music...');
		userStartAudio();
		mainTrack.setVolume(0.80);
		mainTrack.loop();
		ecg.setVolume(0.20);
		ecg.loop();
		mainTrack.setVolume(0.60);
		snowForest.loop();
		mainMusicPlaying = true;
		//console.log('Main track loop started!');
	} else { // stop music when canvas is pressed a second time
		// (but a running random thunder sound will finish playing in its entirety)
		mainTrack.stop();
		snowForest.stop();
		ecg.stop();
		mainMusicPlaying = false;
		//console.log('Main track loop stopped!');
	}
}

// randomly play a thunder sound
function playRandomThunder() {
	if (mainMusicPlaying) {

		let playThunderEvent = getRandomInt(0, 1000);
		if (playThunderEvent < 25) { 
			// 25 << 1000, to not have new thunder sounds starting all the time!
			// distribution is uniform (js default)
			console.log("Has to play a thunder sound!")
			let chosenThunderSound = getRandomInt(0, 3);
			thunder[chosenThunderSound].setVolume(0.95);
			thunder[chosenThunderSound].play();
		}
	}
}

// For the visuals ============================================================================
function draw() {
	background(backgroundGeneralPalette[0]); // choose background color
	image(backgroundImage, 0, 0); // display background image

	// from time to time, there is a random thunder playing
	playRandomThunder();

	// single-color background (replaced by picture)
	// drawBackground();

	// bottom foreground
	drawBottomForeground();

	// draw moving music lines
	drawMusicLines();

	// move the dancer towards the right
	translate(600, 0);

	// main character
	drawMainCharacter();
}

// draws the dancer 
function drawMainCharacter() {
	// to define silhouette:
	// uses bezier curves for gently sloping curves
	// bezier(x1, y1, x2, y2, x3, y3, x4, y4)
	// (x1, y1): first anchor
	// (x4, y4): second anchor
	// (x2, y2): first control point (pulls the curve towards it)
	// (x3, y3): second control point (pulls the curve towards it)

	// bezier curves are the (hidden) skeleton for the dancer
	// random broken noisy lines will actually move around the bezier curve

	// right leg
	drawRightLeg();

	// body + leg (front) - main shaping line for the dancer
	drawBodyLine();

	// left arm (front, brightest light) 
	drawLeftArm();

	// right arm 
	drawRightArm();

	// head, on foreground
	drawHead();
}

// draws right leg (back leg)
function drawRightLeg(){
	//bezier(465, 520, 425, 575, 445, 775, 498, 920);

	let colorPalette = {
		colorFrom: backgroundBluesPalette[5],
		colorTo: backgroundBluesPalette[0],
		strokeWeight: 3,
		colorLerp: 0.2
	};

	let rightLegCoordinates = {
		xBegin: 465,
		yBegin: 520,
		xControl1: 425,
		yControl1: 575,
		xControl2: 445,
		yControl2: 775,
		xEnd: 504,
		yEnd: 920
	};

	rightLegCoordinates.xBegin = rightLegCoordinates.xBegin + getRandomInt(-2, 2); 
	rightLegCoordinates.yBegin = rightLegCoordinates.yBegin + getRandomInt(-2, 2);
	rightLegCoordinates.yEnd = rightLegCoordinates.yEnd + getRandomInt(-20, 20);
	rightLegCoordinates.xEnd = rightLegCoordinates.xEnd + getRandomInt(-22, 22); 

	rightLegCoordinates.xControl1 = rightLegCoordinates.xControl1 + getRandomInt(-12, 12); 
	rightLegCoordinates.yControl1 = rightLegCoordinates.yControl1 + getRandomInt(-11, 11);
	rightLegCoordinates.xControl2 = rightLegCoordinates.xControl2 + getRandomInt(-6, 6); 
	rightLegCoordinates.yControl2 = rightLegCoordinates.yControl2 + getRandomInt(-4, 4);

	// drawing points to give some depth

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	colorPalette.colorLerp = 0.9;
	drawPoints(rightLegCoordinates.xBegin,
		rightLegCoordinates.yBegin,
		rightLegCoordinates.xControl1,
		rightLegCoordinates.yControl1,
		rightLegCoordinates.xControl2,
		rightLegCoordinates.yControl2,
		rightLegCoordinates.xEnd,
		rightLegCoordinates.yEnd, 
		60, 20, colorPalette);

	colorPalette.colorLerp = 0.7;
	drawPoints(rightLegCoordinates.xBegin,
		rightLegCoordinates.yBegin,
		rightLegCoordinates.xControl1,
		rightLegCoordinates.yControl1,
		rightLegCoordinates.xControl2,
		rightLegCoordinates.yControl2,
		rightLegCoordinates.xEnd,
		rightLegCoordinates.yEnd, 
		50, 40, colorPalette);

	colorPalette.strokeWeight = 2;
	colorPalette.colorLerp = 0.5;
	drawPoints(rightLegCoordinates.xBegin,
		rightLegCoordinates.yBegin,
		rightLegCoordinates.xControl1,
		rightLegCoordinates.yControl1,
		rightLegCoordinates.xControl2,
		rightLegCoordinates.yControl2,
		rightLegCoordinates.xEnd,
		rightLegCoordinates.yEnd, 
		40, 60, colorPalette);

	colorPalette.colorLerp = 0.3;
	drawPoints(rightLegCoordinates.xBegin,
		rightLegCoordinates.yBegin,
		rightLegCoordinates.xControl1,
		rightLegCoordinates.yControl1,
		rightLegCoordinates.xControl2,
		rightLegCoordinates.yControl2,
		rightLegCoordinates.xEnd,
		rightLegCoordinates.yEnd, 
		20, 80, colorPalette);

		colorPalette.strokeWeight = 1;
	colorPalette.colorLerp = 0.2;
	drawPoints(rightLegCoordinates.xBegin,
		rightLegCoordinates.yBegin,
		rightLegCoordinates.xControl1,
		rightLegCoordinates.yControl1,
		rightLegCoordinates.xControl2,
		rightLegCoordinates.yControl2,
		rightLegCoordinates.xEnd,
		rightLegCoordinates.yEnd, 
		10, 90, colorPalette);

	// drawing the shaping line

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	let level = 2,
		lineSteps = 8;
	colorPalette.strokeWeight = 5;
	if (mainMusicPlaying) {
		level = amplitude.getLevel() || 0;
		colorPalette.colorLerp = 3*level;
		if(colorPalette.colorLerp > 1.00){
			colorPalette.colorLerp = 1.00;
		}
		colorPalette.colorTo = ecgBeatColor;

		lineSteps = Math.trunc(level * 200);
		drawNoiseLineWithSoundAmplitude(rightLegCoordinates.xBegin,
			rightLegCoordinates.yBegin,
			rightLegCoordinates.xControl1,
			rightLegCoordinates.yControl1,
			rightLegCoordinates.xControl2,
			rightLegCoordinates.yControl2,
			rightLegCoordinates.xEnd,
			rightLegCoordinates.yEnd, 
			lineSteps, 100, colorPalette, 250);
	} else {
		drawNoiseLine(rightLegCoordinates.xBegin,
			rightLegCoordinates.yBegin,
			rightLegCoordinates.xControl1,
			rightLegCoordinates.yControl1,
			rightLegCoordinates.xControl2,
			rightLegCoordinates.yControl2,
			rightLegCoordinates.xEnd,
			rightLegCoordinates.yEnd, 
			lineSteps, 100, colorPalette, 250);
	}
}

// body + leg (front) (main shaping line)
function drawBodyLine(){
	let colorPalette = {
		colorFrom: backgroundBluesPalette[5],
		colorTo: backgroundBluesPalette[0],
		strokeWeight: 3,
		colorLerp: 0.2
	};

	let bodyLine = {
		xBegin: 480,
		yBegin: 320,
		xControl1: 450,
		yControl1: 350,
		xControl2: 435,
		yControl2: 675,
		xEnd: 680,
		yEnd: 820
	};

	bodyLine.xControl1 = bodyLine.xControl1 + getRandomInt(-12, 12); 
	bodyLine.yControl1 = bodyLine.yControl1 + getRandomInt(-11, 11);
	bodyLine.xControl2 = bodyLine.xControl2 + getRandomInt(-6, 6); 
	bodyLine.yControl2 = bodyLine.yControl2 + getRandomInt(-12, 4);
	bodyLine.xEnd = bodyLine.xEnd + getRandomInt(-8, 8); 
	bodyLine.yEnd = bodyLine.yEnd + getRandomInt(-10, 10);

	// drawing points to give some depth

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	colorPalette.strokeWeight = 1;
	colorPalette.colorLerp = 0.95;
	drawPoints(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd,
		bodyLine.yEnd, 
		12, 240, colorPalette);

	colorPalette.colorLerp = 0.8;
	drawPoints(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd,
		bodyLine.yEnd, 
		35, 200, colorPalette);

	colorPalette.colorLerp = 0.7;
	drawPoints(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd,
		bodyLine.yEnd, 
		75, 160, colorPalette);

	colorPalette.strokeWeight = 2;
	colorPalette.colorLerp = 0.5;
	drawPoints(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd,
		bodyLine.yEnd, 
		150, 80, colorPalette);

	colorPalette.colorLerp = 0.4;
	drawPoints(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd,
		bodyLine.yEnd, 
		300, 60, colorPalette);

	colorPalette.strokeWeight = 3;
	colorPalette.colorLerp = 0.2;
	drawPoints(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd,
		bodyLine.yEnd, 
		400, 40, colorPalette);

	colorPalette.colorLerp = 0.05;
	drawPoints(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd,
		bodyLine.yEnd, 
		600, 30, colorPalette);

	colorPalette = {
		colorFrom: backgroundBluesPalette[5],
		colorTo: backgroundBluesPalette[0],
		strokeWeight: 3,
		colorLerp: 0.95
	};

	stroke(backgroundBluesPalette[0]);

	// draw shaping lines
	//bezier(480, 320, 450, 350, 435, 675, 680, 820);

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	let level = 2;
	colorPalette.strokeWeight = 3;
	drawNoiseLine(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd + level * 4, 
		bodyLine.yEnd + level * 6, 
		80, 70, colorPalette);
	drawNoiseLine(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd - level * 10, 
		bodyLine.yEnd - level * 4, 
		40, 35, colorPalette, 125);
	colorPalette.strokeWeight = 2;
	drawNoiseLine(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd + level * 8, 
		bodyLine.yEnd - level * 6, 
		60, 25, colorPalette, 175);
	drawNoiseLine(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd - level * 6, 
		bodyLine.yEnd + level * 2, 
		50, 50, colorPalette, 125);
	colorPalette.strokeWeight = 1;
	drawNoiseLine(bodyLine.xBegin,
		bodyLine.yBegin,
		bodyLine.xControl1,
		bodyLine.yControl1,
		bodyLine.xControl2,
		bodyLine.yControl2,
		bodyLine.xEnd + level * 4, 
		bodyLine.yEnd + level * 8, 
		60, 40, colorPalette, 255);
}

// draws head (exploding head)
function drawHead() {
	// head (front)
	strokeWeight(5);
	stroke(131, 229, 255);

	let headCoordinates = {
		xBegin: 400 + 35,
		yBegin: 200 + 40,
		xControl1: 350 + 35,
		yControl1: 300 + 40,
		xControl2: 650 + 35,
		yControl2: 320 + 40,
		xEnd: 420 + 35,
		yEnd: 200 + 40
	};
	/*
	bezier(headCoordinates.xBegin, headCoordinates.yBegin, 
			headCoordinates.xControl1, headCoordinates.yControl1, 
			headCoordinates.xControl2, headCoordinates.yControl2, 
			headCoordinates.xEnd, headCoordinates.yEnd);
	*/

	// draw noisy lines

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	let colorPalette = {
		colorFrom: redPalette[0],
		colorTo: redPalette[1],
		strokeWeight: 1,
		colorLerp: 0.01
	};
	let lineSteps = 50;
	let previousLastPoint;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 850, colorPalette, getRandomInt(0, 100));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin - 80, headCoordinates.yBegin - 40);

	colorPalette = {
		colorFrom: redPalette[0],
		colorTo: redPalette[1],
		strokeWeight: 2,
		colorLerp: 0.5
	}
	lineSteps = 40;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 700, colorPalette, getRandomInt(150, 250));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin - 20, headCoordinates.yBegin - 12);

	colorPalette = {
		colorFrom: redPalette[0],
		colorTo: redPalette[1],
		strokeWeight: 2,
		colorLerp: 0.75
	}
	lineSteps = 35;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 500, colorPalette, getRandomInt(50, 150));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin - 35, headCoordinates.yBegin);

	colorPalette = {
		colorFrom: redPalette[1],
		colorTo: redPalette[2],
		strokeWeight: 2,
		colorLerp: 0.01
	}
	lineSteps = 30;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 450, colorPalette, getRandomInt(150, 250));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin - 50, headCoordinates.yBegin - 25);

	colorPalette = {
		colorFrom: redPalette[1],
		colorTo: redPalette[2],
		strokeWeight: 2,
		colorLerp: 0.5
	}
	lineSteps = 30;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 375, colorPalette, getRandomInt(50, 150));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin - 45, headCoordinates.yBegin - 24);

	colorPalette = {
		colorFrom: redPalette[1],
		colorTo: redPalette[2],
		strokeWeight: 2,
		colorLerp: 0.75
	}
	lineSteps = 25;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 350, colorPalette, getRandomInt(100, 200));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin - 34, headCoordinates.yBegin - 19);

	colorPalette = {
		colorFrom: redPalette[2],
		colorTo: redPalette[3],
		strokeWeight: 2,
		colorLerp: 0.01
	}
	lineSteps = 25;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 310, colorPalette, getRandomInt(0, 100));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin - 20, headCoordinates.yBegin - 10);

	colorPalette = {
		colorFrom: redPalette[2],
		colorTo: redPalette[3],
		strokeWeight: 2,
		colorLerp: 0.5
	}
	lineSteps = 20;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 290, colorPalette, getRandomInt(100, 200));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin - 11, headCoordinates.yBegin - 2);

	colorPalette = {
		colorFrom: redPalette[3],
		colorTo: redPalette[4],
		strokeWeight: 2,
		colorLerp: 0.01
	}
	lineSteps = 20;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 220, colorPalette, getRandomInt(0, 100));
	strokeWeight(colorPalette.strokeWeight);
	line(previousLastPoint.x, previousLastPoint.y, headCoordinates.xBegin + 3, headCoordinates.yBegin);

	colorPalette = {
		colorFrom: redPalette[3],
		colorTo: redPalette[4],
		strokeWeight: 2,
		colorLerp: 0.5
	}
	lineSteps = 20;
	previousLastPoint = drawNoiseLine(headCoordinates.xBegin,
		headCoordinates.yBegin,
		headCoordinates.xControl1,
		headCoordinates.yControl1,
		headCoordinates.xControl2,
		headCoordinates.yControl2,
		headCoordinates.xEnd,
		headCoordinates.yEnd,
		lineSteps, 180, colorPalette, getRandomInt(250, 420));
}

// draws right arm (back arm)
function drawRightArm() {
	let colorPalette = {
		colorFrom: backgroundBluesPalette[5],
		colorTo: backgroundBluesPalette[0],
		strokeWeight: 5,
		colorLerp: 0.01
	};

	//bezier(280, 600, 300, 480, 400, 390, 440, 400);

	let rightArmCoordinates = {
		xBegin: 280,
		yBegin: 600,
		xControl1: 300,
		yControl1: 480,
		xControl2: 400,
		yControl2: 390,
		xEnd: 460,
		yEnd: 400
	};

	rightArmCoordinates.xBegin = rightArmCoordinates.xBegin + getRandomInt(-10, 10); 
	rightArmCoordinates.yBegin = rightArmCoordinates.yBegin + getRandomInt(-8, 8);
	rightArmCoordinates.xEnd = rightArmCoordinates.xEnd + getRandomInt(-7, 7); 
	rightArmCoordinates.yEnd = rightArmCoordinates.yEnd + getRandomInt(-5, 5);

	rightArmCoordinates.xControl1 = rightArmCoordinates.xControl1 + getRandomInt(-12, 12); 
	rightArmCoordinates.yControl1 = rightArmCoordinates.yControl1 + getRandomInt(-11, 11);
	rightArmCoordinates.xControl2 = rightArmCoordinates.xControl2 + getRandomInt(-6, 6); 
	rightArmCoordinates.yControl2 = rightArmCoordinates.yControl2 + getRandomInt(-4, 4);

	// drawing points to give some depth

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	colorPalette.strokeWeight = 4;
	drawPoints(rightArmCoordinates.xBegin,
		rightArmCoordinates.yBegin,
		rightArmCoordinates.xControl1,
		rightArmCoordinates.yControl1,
		rightArmCoordinates.xControl2,
		rightArmCoordinates.yControl2,
		rightArmCoordinates.xEnd,
		rightArmCoordinates.yEnd,
		100, 40, colorPalette, 1);

	colorPalette.strokeWeight = 2;
	drawPoints(rightArmCoordinates.xBegin,
		rightArmCoordinates.yBegin,
		rightArmCoordinates.xControl1,
		rightArmCoordinates.yControl1,
		rightArmCoordinates.xControl2,
		rightArmCoordinates.yControl2,
		rightArmCoordinates.xEnd,
		rightArmCoordinates.yEnd,
		70, 70, colorPalette, 1);

	colorPalette.strokeWeight = 5;
	stroke(backgroundBluesPalette[0]);

	// draw shaping line

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	let lineSteps = 12;
	if (mainMusicPlaying) {
		let level = amplitude.getLevel();
		colorPalette.colorLerp = 3*level;
		if(colorPalette.colorLerp > 1.00){
			colorPalette.colorLerp = 1.00;
		}
		colorPalette.colorTo = ecgBeatColor;
		lineSteps = Math.trunc(level * 100);
		drawNoiseLineWithSoundAmplitude(rightArmCoordinates.xBegin,
			rightArmCoordinates.yBegin,
			rightArmCoordinates.xControl1,
			rightArmCoordinates.yControl1,
			rightArmCoordinates.xControl2,
			rightArmCoordinates.yControl2,
			rightArmCoordinates.xEnd,
			rightArmCoordinates.yEnd,
			lineSteps, 100, colorPalette, 1);
	} else {
		drawNoiseLine(rightArmCoordinates.xBegin,
			rightArmCoordinates.yBegin,
			rightArmCoordinates.xControl1,
			rightArmCoordinates.yControl1,
			rightArmCoordinates.xControl2,
			rightArmCoordinates.yControl2,
			rightArmCoordinates.xEnd,
			rightArmCoordinates.yEnd,
			lineSteps, 100, colorPalette, 1);
	}
}

// draws left arm (foreground arm)
function drawLeftArm() {
	let colorPalette = {
		colorFrom: backgroundBluesPalette[0],
		colorTo: backgroundBluesPalette[5],
		strokeWeight: 4,
		colorLerp: 0.2
	};

	// stroke(129, 217, 235);
	strokeWeight(4);
	stroke(backgroundBluesPalette[0]);
	//bezier(500, 400, 550, 435, 585, 450, 715, 360);

	let leftArmCoordinates = {
		xBegin: 460,
		yBegin: 415,
		xControl1: 550,
		yControl1: 435,
		xControl2: 585,
		yControl2: 450,
		xEnd: 715,
		yEnd: 360
	};

	leftArmCoordinates.xBegin = leftArmCoordinates.xBegin + getRandomInt(-7, 7); 
	leftArmCoordinates.yBegin = leftArmCoordinates.yBegin + getRandomInt(-5, 5);
	leftArmCoordinates.xEnd = leftArmCoordinates.xEnd + getRandomInt(-10, 10);
	leftArmCoordinates.yEnd = leftArmCoordinates.yEnd + getRandomInt(-20, 20);

	leftArmCoordinates.xControl1 = leftArmCoordinates.xControl1 + getRandomInt(-12, 12); 
	leftArmCoordinates.yControl1 = leftArmCoordinates.yControl1 + getRandomInt(-11, 11);
	leftArmCoordinates.xControl2 = leftArmCoordinates.xControl2 + getRandomInt(-6, 6); 
	leftArmCoordinates.yControl2 = leftArmCoordinates.yControl2 + getRandomInt(-4, 4);

	// drawing points to give some depth

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	colorPalette.colorLerp = 0.5;
	colorPalette.strokeWeight = 1;
	drawPoints(leftArmCoordinates.xBegin, leftArmCoordinates.yBegin,
		leftArmCoordinates.xControl1, leftArmCoordinates.yControl1,
		leftArmCoordinates.xControl2, leftArmCoordinates.yControl2,
		leftArmCoordinates.xEnd, leftArmCoordinates.yEnd,
		120, 80, colorPalette, 1);

	colorPalette.colorLerp = 0.2;
	colorPalette.strokeWeight = 2;
	drawPoints(leftArmCoordinates.xBegin + 10, leftArmCoordinates.yBegin + 5,
		leftArmCoordinates.xControl1, leftArmCoordinates.yControl1,
		leftArmCoordinates.xControl2, leftArmCoordinates.yControl2,
		leftArmCoordinates.xEnd + 5, leftArmCoordinates.yEnd + 5,
		240, 40, colorPalette, 1);

	colorPalette.colorLerp = 0.10;
	colorPalette.strokeWeight = 3;
	drawPoints(leftArmCoordinates.xBegin + 10, leftArmCoordinates.yBegin + 5,
		leftArmCoordinates.xControl1, leftArmCoordinates.yControl1,
		leftArmCoordinates.xControl2, leftArmCoordinates.yControl2,
		leftArmCoordinates.xEnd + 5, leftArmCoordinates.yEnd + 5,
		300, 30, colorPalette, 1);

	// draw shaping line

	// the last params chosen so to have an animation that looks good (no special logic here)
	// but renders impossible to rather use calls in a loop
	colorPalette.colorLerp = 0;
	colorPalette.strokeWeight = 4;
	drawNoiseLine(leftArmCoordinates.xBegin, leftArmCoordinates.yBegin,
		leftArmCoordinates.xControl1, leftArmCoordinates.yControl1,
		leftArmCoordinates.xControl2, leftArmCoordinates.yControl2,
		leftArmCoordinates.xEnd, leftArmCoordinates.yEnd,
		20, 60, colorPalette, 1);

	colorPalette.strokeWeight = 2;
	drawNoiseLine(leftArmCoordinates.xBegin + 10, leftArmCoordinates.yBegin + 5,
		leftArmCoordinates.xControl1, leftArmCoordinates.yControl1,
		leftArmCoordinates.xControl2, leftArmCoordinates.yControl2,
		leftArmCoordinates.xEnd + 5, leftArmCoordinates.yEnd + 5,
		5, 120, colorPalette, 1);
}

// draws points (for the dancer's body)
function drawPoints(x1, y1, x2, y2, x3, y3, x4, y4, steps, maxDistance, palette, side = -1) {
	if (palette && palette.strokeWeight) { // uses a palette if defined
		strokeWeight(palette.strokeWeight);
	} else {
		strokeWeight(2);
	}

	for (let i = 0; i <= steps; i++) { // draw a <<steps>> amount of points</steps>
		let noiseFactor = noise(i);
		let distance = noiseFactor * maxDistance;
		let t = i / steps;
		let x = bezierPoint(x1, x2, x3, x4, t);
		let y = bezierPoint(y1, y2, y3, y4, t);
		let tx = bezierTangent(x1, x2, x3, x4, t);
		let ty = bezierTangent(y1, y2, y3, y4, t);

		let a = atan2(ty, tx); // using the tangent to the bezier curve to draw points

		if (side < 0) {
			a -= HALF_PI;
		} else {
			a += HALF_PI;
		}

		if (palette && palette.colorLerp) { // color lerp
			stroke(lerpColor(palette.colorFrom, palette.colorTo, palette.colorLerp));
		} else {
			stroke(lerpColor(palette.colorFrom, palette.colorTo, noiseFactor));
		}

		// point coordinates depends on the bezier curve it is linked to
		let currentPoint = {
			x: cos(a) * distance + x,
			y: sin(a) * distance + y
		};

		// draws the point
		point(currentPoint.x, currentPoint.y);
	}

	strokeWeight(1);
}

// draws noisy line that is a dancer body part
function drawNoiseLine(x1, y1, x2, y2, x3, y3, x4, y4, steps, maxDistance, palette, fuzz = 1, side = -1) {
	if (palette && palette.strokeWeight) { // use palette if set
		strokeWeight(palette.strokeWeight);
	} else {
		strokeWeight(4);
	}

	let currentPoint;
	let previousPoint = {
		x: x1,
		y: y1
	};
	for (let i = 0; i <= steps; i++) {
		// framecount to have every time "different noise"
		let noiseFactor = noise(fuzz + i + frameCount * side);
		let distance = (noiseFactor - 0.5) * maxDistance;
		let t = i / steps;

		// use bezier curve to find the point's coordinate
		let x = bezierPoint(x1, x2, x3, x4, t);
		let y = bezierPoint(y1, y2, y3, y4, t);
		let tx = bezierTangent(x1, x2, x3, x4, t);
		let ty = bezierTangent(y1, y2, y3, y4, t);
		let a = atan2(ty, tx);

		if (side < 0) {
			a -= HALF_PI;
		} else {
			a += HALF_PI;
		}

		if (palette && palette.colorLerp) {
			stroke(lerpColor(palette.colorFrom, palette.colorTo, palette.colorLerp));
		}

		// new "end point" depends on bezier curve (so using tangent and trigonometry here)
		currentPoint = {
			x: cos(a) * distance + x,
			y: sin(a) * distance + y
		};

		// now that we have the new point, link it to the previous one to draw the noisy line
		line(previousPoint.x, previousPoint.y, currentPoint.x, currentPoint.y);
		previousPoint = currentPoint;
	}

	strokeWeight(1);

	// return last drawn point
	return currentPoint;
}

// draws noisy line depending on playing sound that is a dancer body part 
function drawNoiseLineWithSoundAmplitude(x1, y1, x2, y2, x3, y3, x4, y4, steps, maxDistance, palette, fuzz = 1, side = -1) {
	// logic similar to drawNoiseLine...

	// Except that some parameters will also depend on the sound intensity!
	let level = amplitude.getLevel();

	if(palette && !palette.noStrokeWeightChange) {
		if (palette && palette.strokeWeight) {
			strokeWeight(palette.strokeWeight + Math.trunc(level * 20));
		} else {
			strokeWeight(5 + Math.trunc(level * 20));
		}
	} else {
		strokeWeight(palette.strokeWeight);
	}

	let currentPoint;
	let previousPoint = {
		x: x1,
		y: y1
	};
	for (let i = 0; i <= steps; i++) {
		let noiseFactor = noise(fuzz + i + level + frameCount * side);
		let distance = (noiseFactor - 0.5) * maxDistance;
		let t = i / steps;
		let x = bezierPoint(x1, x2, x3, x4, t);
		let y = bezierPoint(y1, y2, y3, y4, t);
		let tx = bezierTangent(x1, x2, x3, x4, t);
		let ty = bezierTangent(y1, y2, y3, y4, t);
		let a = Math.atan2(ty, tx);

		if (side < 0) {
			a -= HALF_PI;
		} else {
			a += HALF_PI;
		}

		if (palette && palette.colorLerp) {
			stroke(lerpColor(palette.colorFrom, palette.colorTo, palette.colorLerp));
		}

		currentPoint = {
			x: Math.cos(a) * distance + x,
			y: Math.sin(a) * distance + y
		};
		line(Math.trunc(previousPoint.x), Math.trunc(previousPoint.y),
			Math.trunc(currentPoint.x), Math.trunc(currentPoint.y));
		previousPoint = currentPoint;
	}

	strokeWeight(1);

	// return last drawn point
	return currentPoint;
}

// draws a full color background (fallback)
function drawBackground() { // fallback background for quicker loading when developing/debugging
	fill(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.35));
	strokeWeight(5);
	stroke(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.35));
	quad(700, 1000, 750, 410, 1210, 350, 1280, 1000);

	fill(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.25));
	strokeWeight(5);
	stroke(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.30));
	quad(600, 1000, 710, 580, 1350, 750, 1075, 1000);

	fill(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.15));
	strokeWeight(5);
	stroke(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.25));
	quad(700, 1000, 720, 640, 1200, 680, 1300, 1000);

	fill(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.10));
	strokeWeight(5);
	stroke(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.17));
	quad(780, 1000, 740, 710, 1200, 670, 1200, 1000);

	fill(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.05));
	strokeWeight(5);
	stroke(lerpColor(backgroundGeneralPalette[0], backgroundGeneralPalette[1], 0.10));
	quad(900, 1000, 820, 250, 1200, 300, 1100, 1000);
}

// draws bottom with spikes 
// (background, spikes pointing towards the dancer and place on which the dancer is standing)
let backgroundTriangleCoordinates = [];
function drawBottomForeground() {
	if (spikeColorChangeCounter === 250) {
		spikeColorChangeCounter = 0;
	} else {
		spikeColorChangeCounter++;
	}

	strokeWeight(3);
	stroke(backgroundBluesPalette[0]);

	if (backgroundTriangleCoordinates.length < 50 &&
		(backgroundTriangleCoordinates.length === 0 || spikeColorChangeCounter === 200)) {
		let x1 = 0;
		let x3 = getRandomInt(50, 150);
		while (x1 < 1100) {
			// create some random spikes
			x2 = getRandomInt(x1 - 100, x3 - 140);
			y2 = getRandomInt(950, 760);
			backgroundTriangleCoordinates.push([x1, 1000, x2, y2, x3, 1000,
				backgroundBluesPalette[getRandomInt(4, 7)]
			]);

			x1 = x1 + getRandomInt(50, 120);
			x3 = x1 + getRandomInt(50, 120);
		}

		x1 = 0;
		x3 = getRandomInt(50, 150);
		while (x1 < 1100) {
			x2 = getRandomInt(x1 - 80, x3 - 120);
			y2 = getRandomInt(960, 780);
			backgroundTriangleCoordinates.push([x1, 1000, x2, y2, x3, 1000,
				backgroundBluesPalette[getRandomInt(3, 4)]
			]);

			x1 = x1 + getRandomInt(50, 110);
			x3 = x1 + getRandomInt(50, 110);
		}

		x1 = 0;
		x3 = getRandomInt(30, 120);
		while (x1 < 1100) {
			x2 = getRandomInt(x1 - 60, x3 - 100);
			y2 = getRandomInt(980, 830);
			backgroundTriangleCoordinates.push([x1, 1000, x2, y2, x3, 1000,
				backgroundBluesPalette[getRandomInt(1, 3)]
			]);

			x1 = x1 + getRandomInt(50, 110);
			x3 = x1 + getRandomInt(50, 110);
		}

		x1 = 0;
		x3 = getRandomInt(50, 160);
		while (x1 < 1100) {
			x2 = getRandomInt(x1 - 60, x3 - 100);
			y2 = getRandomInt(980, 840);
			backgroundTriangleCoordinates.push([x1, 1000, x2, y2, x3, 1000,
				backgroundBluesPalette[getRandomInt(1, 3)]
			]);

			x1 = x1 + getRandomInt(50, 90);
			x3 = x1 + getRandomInt(50, 100);
		}

		x1 = 1100;
		x3 = 1100 + getRandomInt(50, 150);
		while (x1 < width) {
			x2 = getRandomInt(x3 + 80, x3 + 120);
			y2 = getRandomInt(950, 780);
			backgroundTriangleCoordinates.push([x1, 1000, x2, y2, x3, 1000,
				backgroundBluesPalette[getRandomInt(4, 7)]
			]);

			x1 = x1 + getRandomInt(50, 110);
			x3 = x1 + getRandomInt(50, 110);
		}

		x1 = 1100;
		x3 = 1100 + getRandomInt(50, 150);
		while (x1 < width) {
			x2 = getRandomInt(x3 + 50, x3 + 120);
			y2 = getRandomInt(960, 830);
			backgroundTriangleCoordinates.push([x1, 1000, x2, y2, x3, 1000,
				backgroundBluesPalette[getRandomInt(3, 4)]
			]);

			x1 = x1 + getRandomInt(50, 110);
			x3 = x1 + getRandomInt(50, 110);
		}

		x1 = 1100;
		x3 = 1100 + getRandomInt(20, 110);
		while (x1 < width) {
			x2 = getRandomInt(x3 + 30, x3 + 100);
			y2 = getRandomInt(980, 790);
			backgroundTriangleCoordinates.push([x1, 1000, x2, y2, x3, 1000,
				backgroundBluesPalette[getRandomInt(1, 2)]
			]);

			x1 = x1 + getRandomInt(50, 110);
			x3 = x1 + getRandomInt(50, 110);
		}

		x1 = 1100;
		x3 = 1100 + getRandomInt(20, 110);
		while (x1 < width) {
			x2 = getRandomInt(x3 + 30, x3 + 100);
			y2 = getRandomInt(980, 790);
			backgroundTriangleCoordinates.push([x1, 1000, x2, y2, x3, 1000,
				backgroundBluesPalette[getRandomInt(1, 2)]
			]);

			x1 = x1 + getRandomInt(50, 80);
			x3 = x1 + getRandomInt(50, 70);
		}
	}

	// draw spikes
	for (let i = 0; i < backgroundTriangleCoordinates.length; i++) {
		let currentTriangle = backgroundTriangleCoordinates[i];
		fill(currentTriangle[6]);
		triangle(currentTriangle[0],
			currentTriangle[1],
			currentTriangle[2],
			currentTriangle[3],
			currentTriangle[4],
			currentTriangle[5]);
	}

	drawBottomSpikesForeground();
	drawCharacterBalancePoint();

	// draws foreground overlay picture
	image(foregroundImage, 0, 0);
}

// place around which the dancer is trying to balance 
// place on which the dancer tries to keep their right foot
function drawCharacterBalancePoint() {
	strokeWeight(3);
	stroke(backgroundGeneralPalette[5]);
	backgroundBluesPalette[getRandomInt(1, 2)]

	if (!characterBalanceColor || spikeColorChangeCounter === 200) {
		characterBalanceColor = [
			backgroundBluesPalette[getRandomInt(1, 3)],
			backgroundBluesPalette[getRandomInt(1, 3)],
			backgroundBluesPalette[getRandomInt(1, 3)],
			backgroundBluesPalette[getRandomInt(1, 2)],
			backgroundBluesPalette[getRandomInt(1, 2)],
			backgroundBluesPalette[getRandomInt(1, 2)],
			backgroundBluesPalette[getRandomInt(1, 2)]
		];
	}

	strokeWeight(3);
	fill(characterBalanceColor[0]);
	triangle(1060, 1000, 935, 945, 1160, 1000);

	strokeWeight(2);
	fill(characterBalanceColor[1]);
	triangle(1110, 1000, 1360, 940, 1230, 1000);

	strokeWeight(3);
	fill(characterBalanceColor[2]);
	triangle(1110, 1000, 1280, 930, 1180, 1000);

	strokeWeight(4);
	fill(characterBalanceColor[3]);
	triangle(1060, 1000, 1050, 950, 1230, 1000);

	strokeWeight(2);
	fill(characterBalanceColor[4]);
	triangle(1085, 1000, 1100, 920, 1230, 1000);

	strokeWeight(3);
	fill(characterBalanceColor[5]);
	triangle(1080, 1000, 1190, 930, 1200, 1000);

	strokeWeight(2);
	fill(characterBalanceColor[6]);
	triangle(1120, 1000, 1160, 900, 1175, 1000);

	noFill();
}

// "dangerous" spikes pointing towards the dancer
function drawBottomSpikesForeground() {
	// handle color change for spikes
	if (!backgroundBlueSpikesColor || spikeColorChangeCounter === 250) {
		backgroundBlueSpikesColor = [
			backgroundBluesPalette[getRandomInt(1, 2)],
			backgroundBluesPalette[getRandomInt(1, 3)],
			backgroundBluesPalette[getRandomInt(1, 2)],
			backgroundBluesPalette[getRandomInt(2, 3)],
			backgroundBluesPalette[getRandomInt(1, 3)],
			backgroundBluesPalette[getRandomInt(1, 3)],
			backgroundBluesPalette[getRandomInt(1, 2)],
			backgroundBluesPalette[getRandomInt(1, 2)],
			backgroundBluesPalette[getRandomInt(1, 3)],
			backgroundBluesPalette[getRandomInt(2, 3)]
		];
		spikeColorChangeCounter = 0;
	}

	// spikes pointing towards the main character
	strokeWeight(3);
	fill(backgroundBlueSpikesColor[1]);
	stroke(backgroundGeneralPalette[6]);
	triangle(450, 1000, 920, 780, 600, 1000);
	strokeWeight(1);
	fill(backgroundBlueSpikesColor[9]);
	triangle(550, 1000, 920, 780, 600, 1000);

	strokeWeight(3);
	fill(backgroundBlueSpikesColor[2]);
	stroke(backgroundGeneralPalette[5]);
	triangle(340, 1000, 760, 760, 460, 1000);
	strokeWeight(1);
	fill(backgroundBlueSpikesColor[8]);
	triangle(440, 1000, 760, 760, 460, 1000);

	strokeWeight(3);
	fill(backgroundBlueSpikesColor[3]);
	stroke(backgroundGeneralPalette[4]);
	triangle(300, 1000, 740, 680, 420, 1000);
	strokeWeight(1);
	fill(backgroundBlueSpikesColor[7]);
	triangle(390, 1000, 740, 680, 420, 1000);

	strokeWeight(3);
	fill(backgroundBlueSpikesColor[4]);
	stroke(backgroundGeneralPalette[5]);
	triangle(1720, 1000, 1570, 775, 1790, 1000);
	strokeWeight(1);
	fill(backgroundBlueSpikesColor[6]);
	triangle(1720, 1000, 1570, 775, 1740, 1000);

	strokeWeight(3);
	fill(backgroundBlueSpikesColor[5]);
	stroke(backgroundGeneralPalette[4]);
	triangle(1650, 1000, 1380, 740, 1770, 1000);
	strokeWeight(1);
	fill(backgroundBlueSpikesColor[3]);
	triangle(1650, 1000, 1380, 740, 1690, 1000);

	noFill();
}

// multiplier for soundwave while music is playing
function getMusicAmplitudeMultiplierForXPosition(currentX) {
	let amplitudeMultiplier;

	if (currentX < 410) {
		amplitudeMultiplier = 0.25;
	} else if (currentX < 440) {
		amplitudeMultiplier = 1.25;
	} else if (currentX < 560) {
		amplitudeMultiplier = 0.5;
	} else if (currentX < 590) {
		amplitudeMultiplier = 0;
	} else if (currentX < 620) {
		amplitudeMultiplier = 1.25;
	} else if (currentX < 655) {
		amplitudeMultiplier = 4;
	} else if (currentX < 675) {
		amplitudeMultiplier = 2;
	} else if (currentX < 735) {
		amplitudeMultiplier = 0;
	} else if (currentX < 800) {
		amplitudeMultiplier = 1.5;
	} else if (currentX < 820) {
		amplitudeMultiplier = 3;
	} else if (currentX < 830) {
		amplitudeMultiplier = 4.2;
	} else if (currentX < 840) {
		amplitudeMultiplier = 2.8;
	} else if (currentX < 850) {
		amplitudeMultiplier = 1.75;
	} else if (currentX < 1250) { // 1050 is the point at which we are after the head
		amplitudeMultiplier = 0;
	} else if (currentX < 1350) {
		amplitudeMultiplier = 7;
	} else if (currentX < 1380) {
		amplitudeMultiplier = 5;
	} else if (currentX < 1410) {
		amplitudeMultiplier = 1.5;
	} else if (currentX < 1420) {
		amplitudeMultiplier = 0.5;
	} else if (currentX < 1440) {
		amplitudeMultiplier = 0.2;
	} else {
		amplitudeMultiplier = 0.1;
	}

	return amplitudeMultiplier;
}

// draw lines following music
function drawMusicLines() {
	// non-moving line parts
	stroke(redPalette[0]);
	strokeWeight(3);
	let xLeftEnd = 388;
	let xRightEnd = 1412;
	let yAltitude = 360;
	let headLimitPoint = 1050;

	// left (before head)
	line(0, yAltitude, xLeftEnd, yAltitude);

	// right (after head)
	stroke(backgroundBluesPalette[0]);
	line(xRightEnd, yAltitude, 1800, yAltitude);

	// moving line parts (variates with sound amplitude)
	let currentX = xLeftEnd + 1;
	let currentY = yAltitude;
	let previousX = xLeftEnd;
	let previousY = yAltitude;

	let soundWave = fft.waveform(1024);
	let counter = 0;
	let lerpProgress = 0;
	let afterHead = false;

	let colorList = [0, 1, 1, 2, 2, 3, 3, 2, 2, 1, 1, 0];
	let currentTargetColor = 1;
	let previousColor = redPalette[colorList[0]];
	let currentColor = redPalette[colorList[currentTargetColor]];

	while (currentX < xRightEnd) {
		if (mainMusicPlaying) {
			if (afterHead === false) {
				//lerp color handling
				let colorRegionLength = (headLimitPoint - xLeftEnd) / 6;
				let lerpProgressFactor = (100 / colorRegionLength) / 100;

				/*if (currentX <= xLeftEnd + colorRegionLength) {
					stroke(lerpColor(redPalette[0], redPalette[1], lerpProgress));
				} else if (currentX <= xLeftEnd + 2 * colorRegionLength) {
					stroke(lerpColor(redPalette[1], redPalette[2], lerpProgress));
				} else if (currentX <= xLeftEnd + 3 * colorRegionLength) {
					stroke(lerpColor(redPalette[2], redPalette[3], lerpProgress));
				} else if (currentX <= xLeftEnd + 4 * colorRegionLength) {
					stroke(lerpColor(redPalette[3], redPalette[2], lerpProgress));
				} else if (currentX <= xLeftEnd + 5 * colorRegionLength) {
					stroke(lerpColor(redPalette[2], redPalette[1], lerpProgress));
				} else if (currentX <= xLeftEnd + 6 * colorRegionLength) {
					stroke(lerpColor(redPalette[1], redPalette[0], lerpProgress));
				} else {
					afterHead = true;
					lerpProgress = 0;
				}*/

				lerpProgress += lerpProgressFactor;
				if (lerpProgress > 1) {
					lerpProgress = 0;
					currentTargetColor++;
					previousColor = currentColor;
					currentColor = redPalette[colorList[currentTargetColor]];
				} else {
					stroke(lerpColor(previousColor, currentColor, lerpProgress));
				}

				if (currentX > xLeftEnd + 6 * colorRegionLength){ // moving after head
					afterHead = true;
					lerpProgress = 0;
				}
			} else {
				let colorRegionLength = (xRightEnd - headLimitPoint) / 3;
				let lerpProgressFactor = (100 / colorRegionLength) / 100;
				if (currentX <= headLimitPoint + colorRegionLength) {
					stroke(lerpColor(redPalette[0], redPalette[1], lerpProgress));
				} else if (currentX < headLimitPoint + 2 * colorRegionLength) {
					stroke(lerpColor(redPalette[1], backgroundBluesPalette[1], lerpProgress));
				} else if (currentX < headLimitPoint + 3 * colorRegionLength) {
					stroke(lerpColor(backgroundBluesPalette[1], backgroundBluesPalette[0], lerpProgress));
				} else {
					stroke(backgroundBluesPalette[0]);
				}

				lerpProgress = lerpProgress + lerpProgressFactor;
				if (lerpProgress >= 1) {
					lerpProgress = 0;
				}
			}

			// music: use soundwave
			let amplitudeMultiplier = getMusicAmplitudeMultiplierForXPosition(currentX);
			let waveCoordinate = soundWave[counter];
			currentY = (Math.trunc(waveCoordinate * 100) * amplitudeMultiplier) + yAltitude;
			currentX++;
		} else {
			// no music: random noise
			if (currentX < 1050) {
				stroke(redPalette[0]);
			} else {
				stroke(backgroundBluesPalette[0]);
			}
			let noiseFactor = noise(getRandomInt(10, 210) + frameCount);
			currentY = Math.trunc(noiseFactor * 100) + (yAltitude - 50);
			currentX = currentX + 10;
		}

		line(previousX, previousY, currentX, currentY);

		previousX = currentX;
		previousY = currentY;
		counter++;
	}

	// close moving line
	stroke(backgroundBluesPalette[0]);
	line(previousX, previousY, Math.min(currentX, xRightEnd), yAltitude);
}

// get random integer in [min, max] range
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}