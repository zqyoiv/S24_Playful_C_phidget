function setupPhidgets(hubPort) {
    var conn = new phidget22.Connection(8989, 'localhost');
    var ch = new phidget22.Encoder();
    ch.hubPort = hubPort;

    ch.onError = onError;
    // ch.onPropertyChange = propChange;
    ch.onAttach = onAttach;

   // Set Data Interval in; // Set to 100ms for example
   // Set Change Trigger (the minimum change in position to report)
   ch.setPositionChangeTrigger(600); // Set to 1 pulse for example

    conn.connect().then(function () {
      console.log('connected');
      ch.open().then(function (ch) {
        console.log('channel open');
      }).catch(function (err) {
        console.log('failed to open the channel:' + err);
      });
    }).catch(function (err) {
      alert('failed to connect to server:' + err);
    });
  }

  function onAttach(ch) {
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

    hubPort = ch.getHubPort();
    if (hubPort === 0) {
      phid.onPositionChange = posChange0;
    } else if (hubPort === 1) {
      phid.onPositionChange = posChange1;
    } else if (hubPort === 2) {
      phid.onPositionChange = posChange2;
    }
    phid.data.elapsedTime = 0;
    phid.onError = onError;
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
let phidget_rest_timer = 0;
function posChange0(posChange, timeChange, indexTriggered) {
  let absolutePosition = encoderPosition + posChange;
  // Make min and max stop value for the phidget, no infinite scroll.
  if (absolutePosition > STEPS_PER_REVOLUTION ||
      absolutePosition < 0) {
    return;
  }
  encoderPosition = absolutePosition;

  let new_freq1 = map(encoderPosition, 0, STEPS_PER_REVOLUTION, 0.5, 4);

  if (new_freq1 != freq1 && fidgetInit) {
    console.log("0 Frequency updated to: " + new_freq1);
    sendPhidgetNumberToOsc(hubPort, encoderPosition);
    reset_color0 = false;
    if (timerId) {
      clearTimeout(timerId);
    }
    handleSliderPress(1, [], true);

    if (playStartAnimation) {
        playTransitAnimation = true;
        playAnimeTransit();
    }

    freq1 = new_freq1;
    phidget_rest_timer = millis();
  } else if (new_freq1 == freq1 && fidgetInit) {
    if (!reset_color0) {
      timerId = setTimeout(() => {
        mouseReleased();
        reset_color0 = true;
        // console.log("------ reset color ------", reset_color);
      }, 1000);
    }
  } else if (!fidgetInit) {
    fidgetInit = true;
    freq1 = new_freq1;
  }
  // positionChange(0, posChange, timeChange, indexTriggered);
  $('#relChange').val(posChange);
  $('#timeChange').val(timeChange / 1000000);
  $('#position').val(encoderPosition);
  $('#time').val(this.data.elapsedTime / 1000000);
  $('#speed').val(this.data.position / (this.data.elapsedTime / 1000000));

  if (phid.getDeviceID() == phidget22.DeviceID.PN_1047) {
    $('#index').val(this.data.indexPosition);
  }
}

let reset_color1 = false;
function posChange1(posChange, timeChange, indexTriggered) {
  let absolutePosition = encoderPosition + posChange;
  // Make min and max stop value for the phidget, no infinite scroll.
  if (absolutePosition > STEPS_PER_REVOLUTION ||
      absolutePosition < 0) {
    return;
  }
  encoderPosition = absolutePosition;

  let new_freq2 = map(encoderPosition, 0, STEPS_PER_REVOLUTION, 0.5, 4);
  if (new_freq2 != freq2 && fidgetInit) {
    console.log("1 Frequency updated to: " + new_freq2);
    sendPhidgetNumberToOsc(hubPort, encoderPosition);
    reset_color1 = false;
    if (timerId) {
      clearTimeout(timerId);
    }
    handleSliderPress(1, [], true);

    if (playStartAnimation) {
        playTransitAnimation = true;
        playAnimeTransit();
    }

    freq2 = new_freq2;
    phidget_rest_timer = millis();
  } else if (new_freq2 == freq2 && fidgetInit) {
    if (!reset_color1) {
      timerId = setTimeout(() => {
        mouseReleased();
        reset_color1 = true;
        // console.log("------ reset color ------", reset_color);
      }, 1000);
    }
  } else if (!fidgetInit) {
    fidgetInit = true;
    freq2 = new_freq2;
  }
  // positionChange(1, posChange, timeChange, indexTriggered);
  $('#relChange').val(posChange);
  $('#timeChange').val(timeChange / 1000000);
  $('#position').val(encoderPosition);
  $('#time').val(this.data.elapsedTime / 1000000);
  $('#speed').val(this.data.position / (this.data.elapsedTime / 1000000));

  if (phid.getDeviceID() == phidget22.DeviceID.PN_1047) {
    $('#index').val(this.data.indexPosition);
  }
}

let reset_color2 = false;
function posChange2(posChange, timeChange, indexTriggered) {
  let absolutePosition = encoderPosition + posChange;
  // Make min and max stop value for the phidget, no infinite scroll.
  if (absolutePosition > STEPS_PER_REVOLUTION ||
      absolutePosition < 0) {
    return;
  }
  encoderPosition = absolutePosition;

  let new_freq3 = map(encoderPosition, 0, STEPS_PER_REVOLUTION, 0.5, 4);

  if (new_freq3 != freq3 && fidgetInit) {
    console.log("2 Frequency updated to: " + new_freq3);
    sendPhidgetNumberToOsc(hubPort, encoderPosition);
    reset_color2 = false;
    if (timerId) {
      clearTimeout(timerId);
    }
    handleSliderPress(1, [], true);

    if (playStartAnimation) {
        playTransitAnimation = true;
        playAnimeTransit();
    }

    freq3 = new_freq3;
    phidget_rest_timer = millis();
  } else if (new_freq3 == freq3 && fidgetInit) {
    if (!reset_color2) {
      timerId = setTimeout(() => {
        mouseReleased();
        reset_color2 = true;
        // console.log("------ reset color ------", reset_color);
      }, 1000);
    }
  } else if (!fidgetInit) {
    fidgetInit = true;
    freq3 = new_freq3;
  }
  $('#relChange').val(posChange);
  $('#timeChange').val(timeChange / 1000000);
  $('#position').val(encoderPosition);
  $('#time').val(this.data.elapsedTime / 1000000);
  $('#speed').val(this.data.position / (this.data.elapsedTime / 1000000));

  if (phid.getDeviceID() == phidget22.DeviceID.PN_1047) {
    $('#index').val(this.data.indexPosition);
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