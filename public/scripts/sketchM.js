/*
Kaleidoscope adopted from https://p5js.org/examples/interaction-kaleidoscope.html
*/

// Symmetry corresponding to the number of reflections

//hi Joel


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
  particles = [];


  particle = new Particle(10,10,10,10);

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
  

  button = createButton('SAVE');
  button.position(80, 8);
  button.mousePressed(createFile);

  createCanvas(windowWidth, windowHeight);

  
  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(startPitch);

  //Change the colorMode to HSB
  colorMode(HSB); //360,100,100,1.0

  //Define the color pallet
  for (let i = 0; i < noteScale.length; i++) {
    let newColor = color(i * 360 / noteScale.length, 50, 100, 0.8);
    let satValue = 100/noteScale.length * i; //minues 100 to reverse
    colors.push(satValue);
    // colors.push(newColor);
  }

  angleMode(DEGREES);

  xOff = random(10);
  yOff = random(10);

  createDiv();

  // Creating the clear screen button



// background(0);
  
  textAlign(CENTER);
  let squareWidth = width/colors.length
  
}


// let noteScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function createFile() {
  let randomName = random(100,1000000)
  saveTable(table, int (randomName)+'.csv');
}

function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

//Load the model and get the pitch
function modelLoaded() {
  select('#status').html
  getPitch();
}


//Draw on the canvas
function draw() {
  background(0);

// console.log(vol)
if(vol > 0.1){
  symmetry+=0.01;
}
else{
  if(symmetry> 6){
    symmetry-=0.008;
  } 
}

console.log(symmetry)

  textSize(40)
  text(currentNote,200,200)

  // symmetry+=0.0001;
  angle = 360 / symmetry;        //PLAY WITH SETTING / PARAMETERS THIS WAY TOO
  translate(windowWidth/2,windowHeight/2)
  // scale(0.3,0.3)
for(let i = 0; i<particles.length; i++){


    for(let j = 0; j<symmetry; j++){

    rotate(angle);
    particles[i].drawMe(mySaturation);
  
  }
  particles[i].removeParticle(particles);
  
}


  if(getAudioContext().state == "suspended"){
    getAudioContext().resume();
  }
  xOff += constrain(vol / 5,0,0.01);
  yOff += constrain(vol / 5,0,0.01);
 

  vol = mic.getLevel();

  let mx = noise(xOff) * width - width / 2;
  let my = noise(yOff) * height - height / 2;

  let pmx = noise(xOff - inc) * width - width / 2;
  let pmy = noise(yOff - inc) * height - height / 2; //xoff and y off control the randomness of it



  let myStrokeWeight = vol*10;

  
  let newRow = table.addRow();
  newRow.setNum('mx', mx);
  newRow.setNum('my', my);
  newRow.setNum('pmx', pmx);
  newRow.setNum('pmy', pmy);
  newRow.setNum('hue', myHue);
  newRow.setNum('saturation', mySaturation);
  newRow.setNum('lightness', myLight);
  newRow.setNum("strokeWeight", myStrokeWeight);
  

  
  
  push();


  //Only start drawing if there is a bit of noise
   if (vol > 0.03) {
    particles.push(new Particle(mx,my, pmx, pmy,myHue,100,mySaturation ,1,myStrokeWeight))
    scale(0.9,0.9)
    for (let i = 0; i < symmetry; i++) {      //SYMMETRY IS 6
      

      // rotate(angle);  // andgle = 360/symmetry 
      // strokeWeight(10);
      // line(mx, my, pmx, pmy);

      // art.ellipse(mx, my, 10, pmy);
      // art.ellipse(0,0,200,200);
      push();
      // scale(1, -1);
      // particles.push(new Particle(mx, my, pmx, pmy,angle))
      // line(mx, my, pmx, pmy);

      pop();
      
      // point(mx, my )
     // beginShape();
     //    vertex(mx, my, 0);
     //    vertex(pmx, pmy, 0);
     //  endShape();
       }
      }

    // }
  pop();
      // xOff += constrain(vol / 5,0,0.01);
      // yOff += constrain(vol / 5,0,0.01);
  
  push();
  // texture(art);
  // rotateX(rotAngle);
  // rotateY(rotAngle);
  // rotateZ(rotAngle);
  // stroke(0)
  // box(400);
  pop();
}

//Get the pitch, find the closest note and set the fill color
function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      let midiNum = freqToMidi(frequency);
      currentNote = noteScale[midiNum % 12];

      // myColor = colors[midiNum % 12];  //midinum% 12 is index
      // stroke(colors[midiNum % 12]);
      if(step > colors[midiNum % 12]){
        step -= 0.5;
      }
      else step+= 0.5;
    
      mySaturation =  step;
 


      select('#noteAndVolume').html;
    }
    getPitch();
  })
}

// Clear Screen function
function reset() {
  background(0);
  particles.splice(0,particles.length)
}