/*
Kaleidoscope adopted from https://p5js.org/examples/interaction-kaleidoscope.html
*/


let clr;
let socket;

let particles;

let symmetry = 6;
let step = 50;
let angle = 360/symmetry
var textfield;
let names = [];
let table;
let myColor;
let mySaturation = 0;
let myHue = 0;
let myLight = 50;


let rotAngle = 0
let clearButton;
let sizeSlider;

let xOff;
let yOff;

let inc = 0.01;

let vol = 0.0;
let mic;
let pitch;
let audioContext;
let model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

let keyRatio = 0.58;
let noteScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
let currentNote = '';

let colors = [];
let art;

function setup() {
	audioContext = getAudioContext();
	getAudioContext().resume();
	mic = new p5.AudioIn();
	mic.start();

	socket = io.connect("http://localhost:3000");
	socket.on("mouse", newDrawing);
	createCanvas(windowWidth, windowHeight);
	background(51);
	clr = random(360);
	noStroke();
}

function displayDot(x, y, color, color2 = 100) {
	colorMode(HSB);
	fill(color, 100, color2);
	ellipse(x, y, 10);
	// colorMode(RGB);
}

function draw() {


	if (getAudioContext().state == "suspended") {
		getAudioContext().resume();
	}

	vol = mic.getLevel();
	console.log(vol);
	// clr += 1;
	clr = upgradeColor(clr);
	let data = {
		x: vol * windowWidth,
		y: vol * windowHeight,
		color: clr,
	};

	particle = new Particle(0, 0, 800 * vol, 300, 0, 100, 100, 20, 20);
	particle.drawMe();
	socket.emit("mouse", data);
	//   console.log("sending:", vol * w + ",", vol * h + ",", clr);
	// noStroke();
	// displayDot(vol * w, vol * h, clr);
}

function newDrawing(data) {
	data.color = upgradeColor(data.color);
	// displayDot(data.x, data.y, data.color, 30);
}
function upgradeColor(c) {
	if (c < 0) {
		c = 360 - c;
	} else if (c > 360) {
		c = c % 360;
	}
	return c;
}

function touchStarted() {
	getAudioContext().resume();
}
