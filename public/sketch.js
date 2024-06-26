let speed1 = 1;
let speed2 = 1;
let speed3 = 4;

let angle;
let ampMultiplier1 = 60;
let ampMultiplier2 = 30;
let ampMultiplier3 = 40;

let freqSlider1, freqSlider2, freqSlider3;

// 假设编码器每圈的步数
const STEPS_PER_REVOLUTION = 1024; // 替换为你的编码器的实际步数
let timerId = null; // 定时器ID


// Set HSB color mode for the three waveforms
let activeStroke1, activeStroke2, activeStroke3, normalStroke;

let strokeColor1, strokeColor2, strokeColor3;

let sound1, sound2, sound3;

// Play starter animation then set playStartAnimation = false.
let playStartAnimation = true; 
let playTransitAnimation = false;
let animeBegin, animeTransit;

const socket = io();
socket.on('connect', function () {
  console.log('Connected to Socket server');
});
socket.on('end_game', () => {
  console.log('end_game received'); 
  playEndGameVideo();
});



function preload() {
  // Preload sound files
  soundFormats('mp3');
  sound1 = loadSound('sound/1.mp3');
  sound2 = loadSound('sound/2.mp3');
  sound3 = loadSound('sound/3.mp3');
  animeBegin = createVideo('asset/begin_p.mp4');
  animeTransit = createVideo('asset/transit_p.mp4');
}

function playAnimeTransit() {
  playStartAnimation = false;
  playTransitAnimation = true;
  animeBegin.stop();
  animeBegin.hide();
  animeTransit.play();
}

function endAnimation() {
  playStartAnimation = false;
  playTransitAnimation = false;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360); // Set HSB color mode with maximum value of 360

  // Initialize colors
  activeStroke1 = color(220, 360, 360); // Blueish-green
  activeStroke2 = color(220, 360, 360); // Turquoise
  activeStroke3 = color(220, 360, 360); // 
  normalStroke = color(200, 150, 360); // Normal blue
  
  strokeColor1 = normalStroke;
  strokeColor2 = normalStroke;
  strokeColor3 = normalStroke;

  setupPhidgets();

  animeTransit.onended(endAnimation);
}

function keyPressed() {
  if (key === 'q' || key === 'Q') {
    playStartAnimation = true;
    animeBegin.loop();
  }

  // debug mode: go back to beginning
  if (key === 'w' || key === 'W') {
    playStartAnimation = true;
    playTransitAnimation = false;
  }

  // test mode: mimic phidget move
  if (key === 'a' || key === 'A') {
    positionChange_test(0, millis() % 1000, 0, 0);
  }  
}

function draw() {
  if (playStartAnimation) {
    image(animeBegin, 0, 0, windowWidth, windowHeight);
    return;
  } else if (playTransitAnimation) {
    image(animeTransit, 0, 0, windowWidth, windowHeight);
    return;
  } 

  // If phidget rest for more than 20s: play start animation again.
  if ((millis() - phidget_rest_timer > PHIDGET_WAIT_SEC) 
      && (playStartAnimation == false)) {
    playStartAnimation = true;
    animeBegin.loop();
    return;
  }

  drawBrainWave();
}

function drawBrainWave() {
  background(0,0,0,20); 
  fill(0, 0, 0, 0);    // 设置半透明的白色填充
  timeParam = millis() / 1000 % 60;

  // Level 1 wave
  beginShape();
  stroke(strokeColor1);
  strokeWeight(strokeColor1 === activeStroke1 ? 4 : 2);
  for (let x = 0; x < width; x++) {
    angle = map(x, 0, width, 0, TWO_PI);
    let y = ampMultiplier1 * sin(angle * freq1 + timeParam * speed1);
    vertex(x, height / 3 + y-20);
  }
  endShape();

  // Level 2 wave
  beginShape();
  stroke(strokeColor2);
  strokeWeight(strokeColor2 === activeStroke1 ? 4 : 2);
  for (let x = 0; x < width; x++) {
    angle = map(x, 0, width, 0, TWO_PI);
    maxY = abs(sin(angle * freq1 + timeParam * speed1) - 1);
    y = ampMultiplier2 * maxY * sin(angle * freq2 + timeParam * speed2);
    vertex(x, height / 3 + 80 + y);
  }
  endShape();

  // Level 3 wave
  beginShape();
  stroke(strokeColor3);
  strokeWeight(strokeColor3 === activeStroke1 ? 4 : 2);
  for (let x = 0; x < width; x++) {
    angle = map(x, 0, width, 0, TWO_PI);
    maxY = max(abs(sin(angle * freq1 + timeParam * speed1) - 1),
      abs(sin(angle * freq2 + timeParam * speed2) - 1.5));
    y = ampMultiplier3 * maxY * sin(angle * freq3 + timeParam * speed3);
    vertex(x, height / 3 + 230 + y);
  }
  endShape();
}

// Utility Functions

function setUpFrequencySliders() {
  freqSlider1 = createSlider(1, 2.5, 1.5, 0.5);
  freqSlider1.position(10, 100);
  freqSlider1.mousePressed(() => handleFreqChange(1, [sound1], true));

  freqSlider2 = createSlider(20, 40, 30, 5);
  freqSlider2.position(10, 120);
  freqSlider2.mousePressed(() => handleFreqChange(2, [sound2], false));

  freqSlider3 = createSlider(50, 80, 60, 5);
  freqSlider3.position(10, 140);
  freqSlider3.mousePressed(() => handleFreqChange(3, [sound3], false));
}

