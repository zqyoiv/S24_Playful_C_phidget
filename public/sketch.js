let SLIDER_MODE = true;

let speed1 = 1;
let speed2 = 1;
let speed3 = 4;

let angle;
let ampMultiplier1 = 60;
let ampMultiplier2 = 30;
let ampMultiplier3 = 40;

let freqSlider1, freqSlider2, freqSlider3;
let oldFreq1Value, oldFreq2Value, oldFreq3Value;

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

  if (SLIDER_MODE) {
    setUpFrequencySliders();
  } else {
    setupPhidgets();
  }

  animeTransit.onended(endAnimation);
}

function keyPressed() {
  if (key === 'q' || key === 'Q') {
    playStartAnimation = true;
    playTransitAnimation = false;
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

  if (SLIDER_MODE) {
    detectSliderValueChange();
    displaySliders();
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
  oldFreq1Value = 1.5;
  oldFreq2Value = 30;
  oldFreq3Value = 60;

  freqSlider1 = createSlider(0.5, 4, 1.5, 0.1);

  let sliderX = (width - freqSlider1.width) / 2;
  let sliderY = height - freqSlider1.height * 3 - 40; 

  freqSlider1.position(sliderX, sliderY);

  freqSlider2 = createSlider(20, 40, 30, 5);
  freqSlider2.position(sliderX, sliderY + 20);

  freqSlider3 = createSlider(50, 80, 60, 5);
  freqSlider3.position(sliderX, sliderY + 40);

  displaySliders();
}

function detectSliderValueChange() {
  if (freqSlider1.value() != oldFreq1Value) {
    handleFreqChangeSldier(0, [], false);
    oldFreq1Value = freqSlider1.value();
  }
  if (freqSlider2.value() != oldFreq2Value) {
    handleFreqChangeSldier(1, [], false);
    oldFreq2Value = freqSlider2.value();
  }
  if (freqSlider3.value() != oldFreq3Value) {
    handleFreqChangeSldier(2, [], false);
    oldFreq3Value = freqSlider3.value();
  }
}

function displaySliders() {
  if (playTransitAnimation || playStartAnimation) {
    freqSlider1.hide();
    freqSlider2.hide();
    freqSlider3.hide();
  } else {
    freqSlider1.show();
    freqSlider2.show();
    freqSlider3.show();
  }
}

function handleFreqChangeSldier(sliderNum, sounds, affectAll) {
  switch (sliderNum) {
    case 0:
      freq1 = map(freqSlider1.value(), 1, 2.5, 0.5, 4);
      break;
    case 1:
      freq2 = map(freqSlider2.value(), 20, 40, 30, 40);
      break;
    case 2:
      freq3 = map(freqSlider3.value(), 50, 80, 50, 70);
      break;
  }
  handleFreqChange(sliderNum, sounds, affectAll);
}
