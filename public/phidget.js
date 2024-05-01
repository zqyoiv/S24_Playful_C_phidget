const PHIDGET_WAIT_SEC = 20500; // ms, after this time we go back to animetion_begin.

// phidgets variables
let phidgetsConnected = false;
let encoderPosition = 0;
let encoderTimeChange = 0;
let encoderIndexTriggered = false;

let fidgetInit0 = false;
let fidgetInit1 = false;
let fidgetInit2 = false;
let freq1 = 2;
let freq2 = 30;
let freq3 = 60;

// ##################################################
// ##############    connection    ##################
// ##################################################

function setupPhidgets() {
    var conn = new phidget22.Connection(8989, 'localhost');
    var ch1 = new phidget22.Encoder();
    ch1.setHubPort(0);
    ch1.channel = 0;
    var ch2 = new phidget22.Encoder();
    ch2.setHubPort(1);
    ch2.channel = 0;
    var ch3 = new phidget22.Encoder();
    ch3.setHubPort(2);
    ch3.channel = 0;

    ch1.onError = onError;
    ch1.onAttach = onAttach0;
    ch1.onPositionChange = posChange0;
    ch1.onDetach = onDetach;

    ch2.onError = onError;
    ch2.onAttach = onAttach1;
    ch2.onPositionChange = posChange1;
    ch2.onDetach = onDetach;

    ch3.onError = onError;
    ch3.onAttach = onAttach2;
    ch3.onPositionChange = posChange2;
    ch3.onDetach = onDetach;

    // Set Data Interval in; // Set to 100ms for example
    // Set Change Trigger (the minimum change in position to report)
    // ch1.setPositionChangeTrigger(600); // Set to 1 pulse for example
    // ch2.setPositionChangeTrigger(600);
    // ch3.setPositionChangeTrigger(600);

    conn.connect().then(function () {
      console.log('connected');
      ch1.open().then(function (ch) {
        console.log('channel open, deviceSerialNumber:', 
                    ch1.deviceSerialNumber);
      }).catch(function (err) {
        console.log('failed to open the channel:' + err);
      });

      ch2.open().then(function (ch) {
        console.log('channel open, deviceSerialNumber:', 
                    ch2.deviceSerialNumber);
      }).catch(function (err) {
        console.log('failed to open the channel:' + err);
      });

      ch3.open().then(function (ch) {
        console.log('channel open, deviceSerialNumber:', 
                    ch3.deviceSerialNumber);
      }).catch(function (err) {
        console.log('failed to open the channel:' + err);
      });
    }).catch(function (err) {
      alert('failed to connect to server:' + err);
    });
  }

  function onDetach(ch) {
    console.log(ch.hubPort + " detached");
  }

  function onAttach0(ch) {
    hubPort = 0;
    console.log(ch + ' attached');
    phid = ch;
    setLabel('attachLabel',ch.getDeviceClassName() + ' - ' + ch.getChannelClassName() + ' (Channel ' + ch.getChannel() + ')');
    setLabel('serialLabel',ch.getDeviceSerialNumber());
    setLabel('versionLabel',ch.getDeviceSKU() + ' ver.' + ch.getDeviceVersion());
    
    if(ch.getDeviceClass() == phidget22.DeviceClass.VINT) 
      setLabel('hubPortLabel',ch.getHubPort());
    else
      setLabel('hubPortLabel','N/A');

    // $('#encField').show();
    $('#noAttach').hide();
    // $('#Attach').show();

    console.log("============= hub port:", ch.getHubPort());
    phid.data.elapsedTime = 0;
    phid.onError = onError;
  }

  function onAttach1(ch) {
    hubPort = 1;
    console.log(ch + ' attached');
    phid1 = ch;
    setLabel('attachLabel',ch.getDeviceClassName() + ' - ' + ch.getChannelClassName() + ' (Channel ' + ch.getChannel() + ')');
    setLabel('serialLabel',ch.getDeviceSerialNumber());
    setLabel('versionLabel',ch.getDeviceSKU() + ' ver.' + ch.getDeviceVersion());
    
    if(ch.getDeviceClass() == phidget22.DeviceClass.VINT) 
      setLabel('hubPortLabel',ch.getHubPort());
    else
      setLabel('hubPortLabel','N/A');

    // $('#encField').show();
    $('#noAttach').hide();
    // $('#Attach').show();

    console.log("============= hub port:", ch.getHubPort());
    phid1.data.elapsedTime = 0;
    phid1.onError = onError;
  }

  function onAttach2(ch) {
    hubPort = 2;
    console.log(ch + ' attached');
    phid2 = ch;
    setLabel('attachLabel',ch.getDeviceClassName() + ' - ' + ch.getChannelClassName() + ' (Channel ' + ch.getChannel() + ')');
    setLabel('serialLabel',ch.getDeviceSerialNumber());
    setLabel('versionLabel',ch.getDeviceSKU() + ' ver.' + ch.getDeviceVersion());
    
    if(ch.getDeviceClass() == phidget22.DeviceClass.VINT) 
      setLabel('hubPortLabel',ch.getHubPort());
    else
      setLabel('hubPortLabel','N/A');

    // $('#encField').show();
    $('#noAttach').hide();
    // $('#Attach').show();

    console.log("============= hub port:", ch.getHubPort());
    phid2.data.elapsedTime = 0;
    phid2.onError = onError;
  }

// For test use only
function positionChange_test(hubPort, posChange, timeChange, indexTriggered) {
  sendPhidgetNumberToOsc(hubPort, posChange);
  if (playStartAnimation) {
    playTransitAnimation = true;
    playAnimeTransit();
  }
  phidget_rest_timer = millis();
}

let reset_color0 = false;
let encoderPosition0 = 0;
let phidget_rest_timer = 0;
function posChange0(posChange, timeChange, indexTriggered) {
  if (Math.abs(posChange) < 0.1) return;
  let absolutePosition = (encoderPosition0 + posChange);
  // Make min and max stop value for the phidget, no infinite scroll.
  if (absolutePosition > STEPS_PER_REVOLUTION ||
      absolutePosition < 0) {
    return;
  }
  encoderPosition0 = absolutePosition;

  let new_freq1 = map(encoderPosition0, 0, STEPS_PER_REVOLUTION, 0.5, 4);

  if (new_freq1 != freq1 && fidgetInit0) {
    sendPhidgetNumberToOsc(0, encoderPosition0);
    reset_color0 = false;
    if (timerId) {
      clearTimeout(timerId);
    }
    handleFreqChange(0, [], false);

    if (playStartAnimation) {
        playTransitAnimation = true;
        playAnimeTransit();
    }

    freq1 = new_freq1;
    phidget_rest_timer = millis();
  } else if (new_freq1 == freq1 && fidgetInit0) {
    if (!reset_color0) {
      timerId = setTimeout(() => {
        freqChangePaused(0);
        reset_color0 = true;
        // console.log("------ reset color ------", reset_color);
      }, 1000);
    }
  } else if (!fidgetInit0) {
    fidgetInit0 = true;
    freq1 = new_freq1;
  }
}

let reset_color1 = false;
let encoderPosition1 = 0;
function posChange1(posChange, timeChange, indexTriggered) {
  if (Math.abs(posChange) < 0.1) return;
  let absolutePosition = encoderPosition1 + posChange;
  // Make min and max stop value for the phidget, no infinite scroll.
  if (absolutePosition > STEPS_PER_REVOLUTION ||
      absolutePosition < 0) {
    return;
  }
  encoderPosition1 = absolutePosition;
  let new_freq2 = map(encoderPosition1, 0, STEPS_PER_REVOLUTION, 30, 40);
  if (new_freq2 != freq2 && fidgetInit1) {
    sendPhidgetNumberToOsc(1, encoderPosition1);
    reset_color1 = false;
    if (timerId) {
      clearTimeout(timerId);
    }
    handleFreqChange(1, [], false);

    if (playStartAnimation) {
        playTransitAnimation = true;
        playAnimeTransit();
    }

    freq2 = new_freq2;
    phidget_rest_timer = millis();
  } else if (new_freq2 == freq2 && fidgetInit1) {
    if (!reset_color1) {
      timerId = setTimeout(() => {
        freqChangePaused(1);
        reset_color1 = true;
      }, 1000);
    }
  } else if (!fidgetInit1) {
    fidgetInit1 = true;
    freq2 = new_freq2;
  }
}

let reset_color2 = false;
let encoderPosition2 = 0;
function posChange2(posChange, timeChange, indexTriggered) {
  if (Math.abs(posChange) < 0.1) return;
  let absolutePosition = (encoderPosition2 + posChange);
  // Make min and max stop value for the phidget, no infinite scroll.
  if (absolutePosition > STEPS_PER_REVOLUTION ||
      absolutePosition < 0) {
    return;
  }
  encoderPosition2 = absolutePosition;

  let new_freq3 = map(encoderPosition2, 0, STEPS_PER_REVOLUTION, 50, 70);

  if (new_freq3 != freq3 && fidgetInit2) {
    // console.log("2 Frequency updated to: " + new_freq3);
    sendPhidgetNumberToOsc(2, encoderPosition2);
    reset_color2 = false;
    if (timerId) {
      clearTimeout(timerId);
    }
    handleFreqChange(2, [], false);

    if (playStartAnimation) {
        playTransitAnimation = true;
        playAnimeTransit();
    }

    freq3 = new_freq3;
    phidget_rest_timer = millis();
  } else if (new_freq3 == freq3 && fidgetInit2) {
    if (!reset_color2) {
      timerId = setTimeout(() => {
        freqChangePaused(2);
        reset_color2 = true;
        // console.log("------ reset color ------", reset_color);
      }, 1000);
    }
  } else if (!fidgetInit2) {
    fidgetInit2 = true;
    freq3 = new_freq3;
  }
}

function sendPhidgetNumberToOsc(hubPort, phidgetNumber) {
  fetch('/send-phidget-number', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hubPort, phidgetNumber })
  })
}


// ##################################################
// ##############   color change   ##################
// ##################################################


function handleFreqChange(sliderNum, sounds, affectAll) {
  // Play the corresponding sound
  if (sounds[0] && !sounds[0].isPlaying()) {
    sounds[0].loop();
  }

  // Only change the stroke color of the current slider number
  setStrokeColor(sliderNum, activeStroke1, false);

  // Set up sounds and delay for activating strokes
  sounds.forEach((sound, index) => {
    if (index > 0) {
      setTimeout(() => {
        if (!sounds[index].isPlaying()) {
          sounds[index].loop();
        }
        if (!affectAll) {
          setStrokeColor(sliderNum, activeStroke1, false);
        }
      }, index * 200); // 200ms delay between activating strokes
    }
  });
}

function freqChangePaused(rowNumber) {
  // Stop all sounds and reset stroke colors when mouse is released
  [sound1, sound2, sound3].forEach((sound, index) => {
    if (sound.isPlaying()) {
      sound.stop();
    }
    setStrokeColor(rowNumber, normalStroke, true);
  });
}

function setStrokeColor(rowNumber, color, affectAll) {
  if (affectAll) {
    strokeColor1 = color;
    strokeColor2 = color;
    strokeColor3 = color;
  } else {
    strokeColor1 = normalStroke;
    strokeColor2 = normalStroke;
    strokeColor3 = normalStroke;
    switch (rowNumber) {
      case 0:
        strokeColor1 = color;
        break;
      case 1:
        strokeColor2 = color;
        break;
      case 2:
        strokeColor3 = color;
        break;
    }
  }
}

function getActiveStroke(sliderNum) {
  switch (sliderNum) {
    case 0:
      return activeStroke1;
    case 1:
      return activeStroke2;
    case 2:
      return activeStroke3;
    default:
      return normalStroke;
  }
}


// ##################################################
// ##############    misc code     ##################
// ##################################################


function resetCount() {
  phid.data.elapsedTime = 0;
  $('#time').val(0);
  phid.data.position = 0;
  $('#position').val(0);
}

function enableChange() {

  phid.setEnabled($('#enableBox')[0].checked);
}

function setLabel(name, value) {

  $('#' + name).text(value);
}

function onError(arg0, arg1) {

  var d = new Date();
  $('#errorTable').append('<tr><td> ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + '</td><td> 0x' + arg0.toString(16) + '</td><td>' + arg1 + '</td>');
  $("#errorField").show();
}

function ioChange() {
  phid.setIOMode($('#ioCombo').val());
}

function setCT() {

  var ct = parseFloat($('#ct').val());
  if (ct === NaN)
    return (false);

  phid.setPositionChangeTrigger(ct);
  return (false);
}

function setDI() {

  var di = parseInt($('#di').val());
  if (di === NaN)
    return (false);

  if (di < phid.getMinDataInterval()) {
    di = phid.getMinDataInterval();
    $('#di').val(di);
  }

  if (di > phid.getMaxDataInterval()) {
    di = phid.getMaxDataInterval();
    $('#di').val(di);
  }

  phid.setDataInterval(di);
  return (false);
}