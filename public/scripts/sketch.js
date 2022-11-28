/*
Kaleidoscope adopted from https://p5js.org/examples/interaction-kaleidoscope.html
*/


let clr;
let socket;


let particles;
let vol2 = 0 ;

let symmetry = 6;
let step = 50;
let angle = 360 / symmetry
var textfield;
let names = [];
let table;
let myColor;
let mySaturation = 100;
let myHue;
let myLight = 50;

let mySaturation2 = 100;
let myHue2;
let myLight2= 50;


let dx;
let dy;
let dx1
let dy1



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

	particles = [];
	myHue = 200;
	myHue2 = 0;

	myColor = 0;
	table = new p5.Table();


	table.addColumn('mx');
	table.addColumn('my');
	table.addColumn('pmx');
	table.addColumn('pmy');
	table.addColumn('hue');
	table.addColumn('saturation');
	table.addColumn('lightness');
	table.addColumn("strokeWeight");
	table.addColumn('mx2');
	table.addColumn('my2');
	table.addColumn('pmx2');
	table.addColumn('pmy2');
	table.addColumn('hue2');
	table.addColumn('saturation2');
	table.addColumn('lightness2');
	table.addColumn("strokeWeight2");


	button = createButton('SAVE');
	button.position(80, 8);
	button.mousePressed(createFile);

	createCanvas(windowWidth, windowHeight);

	audioContext = getAudioContext();
	getAudioContext().resume();
	mic = new p5.AudioIn();
	mic.start();

	angleMode(DEGREES);


	colorMode(HSB);



	xOff = random(10);
	yOff = random(10);

	socket = io.connect();
	socket.on("mouse", newDrawing);




}

function createFile() {
	let randomName = random(100, 1000000)
	saveTable(table, int(randomName) + '.csv');
}

function startPitch() {
	pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
	select('#status').html
	getPitch();
}

// function displayDot(x, y, color, color2 = 100) {
// 	colorMode(HSB);
// 	fill(color, 100, color2);
// 	ellipse(x, y, 10);
// 	// colorMode(RGB);
// }

function draw() {
	background(0);

	// console.log(particles.length);
	// console.log(vol);
	translate(windowWidth/2,windowHeight/2)
	// scale(0.3,0.3)

	for (let i = 0; i < particles.length; i++) {

		for (let j = 0; j < symmetry; j++) {

			rotate(angle);
			particles[i].drawMe();

		}
		particles[i].removeParticle(particles);

	}

	if (getAudioContext().state == "suspended") {
		getAudioContext().resume();
	}

	xOff += constrain(vol / 5, 0, 0.01);
	yOff += constrain(vol / 5, 0, 0.01);

	vol = mic.getLevel();

	let mx = noise(xOff) * width - width / 2;
	let my = noise(yOff) * height - height / 2;

	let pmx = noise(xOff - inc) * width - width / 2;
	let pmy = noise(yOff - inc) * height - height / 2;
	let myStrokeWeight = vol * 10;


	// let mx2 = noise(xOff) * width - width / 2;
	// let my2 = noise(yOff) * height - height / 2;

	// let pmx2 = noise(xOff - inc) * width - width / 2;
	// let pmy2 = noise(yOff - inc) * height - height / 2;


	// let myStrokeWeight2 = vol * 10;

	// let data = {
	// 	x: mx,
	// 	y: my,
	// 	x1: pmx,
	// 	y1:pmy,
	// 	hue2: myHue,
	// 	sat2: mySaturation,
	// 	light2: myLight,
	// 	strokeWeight2: myStrokeWeight
	// };

	let mx2 = noise(xOff) * width - width / 2;
	let my2 = noise(yOff) * height - height / 2;

	let pmx2 = noise(xOff - inc) * width - width / 2;
	let pmy2 = noise(yOff - inc) * height - height / 2;


	let myStrokeWeight2 = vol * 10;

	data = {
		x: mx2,
		y: my2,
		x1: pmx2,
		y1:pmy2,
		hue2: myHue2,
		sat2: mySaturation2,
		light2: myLight2,
		strokeWeight2: myStrokeWeight2,
		vol2 : vol
	};


	//recording all the data
	let newRow = table.addRow();
	newRow.setNum('mx', mx);
	newRow.setNum('my', my);
	newRow.setNum('pmx', pmx);
	newRow.setNum('pmy', pmy);
	newRow.setNum('hue', myHue);
	newRow.setNum('saturation', mySaturation);
	newRow.setNum('lightness', myLight);
	newRow.setNum("strokeWeight", myStrokeWeight);

	newRow.setNum('mx2', dx);
	newRow.setNum('my2', dy);
	newRow.setNum('pmx2', dx1);
	newRow.setNum('pmy2', dy1);
	newRow.setNum('hue2', myHue2);
	newRow.setNum('saturation2', mySaturation2);
	newRow.setNum('lightness2', myLight2);
	newRow.setNum("strokeWeight2", myStrokeWeight2);



	if (vol > 0.05) {

		particles.push(new Particle(mx, my, pmx, pmy, myHue, mySaturation, myLight, 1, myStrokeWeight))
		scale(0.9, 0.9)
	}


	socket.emit("mouse", data);
	//   console.log("sending:", vol * w + ",", vol * h + ",", clr);
	// noStroke();
	// displayDot(vol * w, vol * h, clr);
}

function getPitch() {
	pitch.getPitch(function (err, frequency) {
		if (frequency) {
			let midiNum = freqToMidi(frequency);
			currentNote = noteScale[midiNum % 12];

			// myColor = colors[midiNum % 12];  //midinum% 12 is index
			// stroke(colors[midiNum % 12]);
			if (step > colors[midiNum % 12]) {
				step -= 0.5;
			}
			else step += 0.5;

			mySaturation = step;



			select('#noteAndVolume').html;
		}
		getPitch();
	})
}

function newDrawing(data) {
	// xOff += constrain(vol / 5, 0, 0.01);
	// yOff += constrain(vol / 5, 0, 0.01);
	console.log("working")

	dx = data.x;
	dy = data.y;
	dx1 = data.x1
	dy1 = data.y1
	myHue2 = data.hue2
	mySaturation2 = data.sat2
	myLight2 = data.light2
	myStrokeWeight2 = data.strokeWeight2

	// newRow.setNum('mx2', data.x);
	// newRow.setNum('my2', data.y);
	// newRow.setNum('pmx2', data.x1);
	// newRow.setNum('pmy2', data.y1);
	// newRow.setNum('hue2', data.hue2);
	// newRow.setNum('saturation2', data.sat2);
	// newRow.setNum('lightness2', data.light2);
	// newRow.setNum("strokeWeight2", data.strokeWeight2);



	if (data.vol2 > 0.03) {
	particles.push(new Particle(data.x,data.y,data.x1,data.y1,data.hue2,data.sat2,data.light2,1,data.strokeWeight2))
	}
	// data.color = upgradeColor(data.color);
	// displayDot(data.x, data.y, data.color, 30);
}


// function touchStarted() {
// 	getAudioContext().resume();
// }
