
/*This is a file for the Linkitz API blocks.*/

'use strict';

// ************************************************************************************************** 
// **************************************************************************************************


// **************************************************************************************************
// LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED
// **************************************************************************************************

// led_attached returns 0 if the LED link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc 
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#oogcwh

Blockly.Blocks['led_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("LED Attached?");
    this.setOutput(true, "Number");
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// usb_attached returns 0 if the usb link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc

Blockly.Blocks['usb_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("USB Attached?");
    this.setOutput(true, "Number");
    this.setColour("#FF6A13");
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Flash LEDs takes a one color or a list of 1 or more colors and flashes the attached LEDs using the
// pseudo-LRU algorithm
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#4vqrqb

Blockly.Blocks['flash_leds'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "Flash color"));
  //  this.appendDummyInput()
  //      .appendField("Flash LEDs")
  //      .appendField("color");
    this.appendValueInput("COLOR")
        .setCheck(['Colour', "Array", "Number"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // this.setColour(290,0.674,0.75);
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


// Light the LED connected to lowest number port in specified color
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#4zjhai flor Flash LED 1

Blockly.Blocks['ledoutput1'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Flash LED 1")
        .appendField("color")
        .appendField(new Blockly.FieldColour("#cc0000"), "NAME");
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "LEDLink"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('Light the LED connected to lowest number port in specified color');
    this.setHelpUrl('http://www.example.com/');
  }
};



Blockly.Blocks['ledoutput2'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Flash LED 2")
        .appendField("color")
        .appendField(new Blockly.FieldColour("#00cc00"), "NAME");
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "LEDLink"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('Light the LED connected to next highest number port in specified color');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Light the LED connected to highest number port in specified color

Blockly.Blocks['ledoutput3'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Flash LED 3")
        .appendField("color")
        .appendField(new Blockly.FieldColour("#0000cc"), "NAME");
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "LEDLink"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('Light the LED connected to highest number port in specified color');
    this.setHelpUrl('http://www.example.com/');
  }
};

// lights up a random series of LEDs anywhere on the Linkitz - not used

Blockly.Blocks['sparkle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "Sparkle LEDs"));
    this.appendDummyInput()
        .appendField("Sparkle");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('Lights up a random series of LEDs anywhere on the Linkitz');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#9wxp3p
// Passing in a single color lights up a random LED somewhere on the Linkitz that color
// Passing a list of colors will light a set of lights indexed by petal type (in terms of recentness of use) and then by priority. 

Blockly.Blocks['ledoutput'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("LED Output");
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "Light LED"));
    this.appendValueInput("NAME")
        .setCheck(['Colour', "Array"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// **************************************************************************************************
// MOTION  MOTION  MOTION  MOTION  MOTION  MOTION  MOTION MOTION  MOTION  MOTION  MOTION
// **************************************************************************************************

Blockly.Blocks['onmotiontrigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("When");
    this.appendDummyInput()
		.appendField(new Blockly.FieldImage("../../images/LZ_Icons_07012015_1_Motion.png", 50, 50, "On Motion Trigger"));
    this.appendStatementInput("NAME")
        .setCheck(null);
    this.setColour('#0083CC');
    this.setTooltip('Use this to define response to motion input');
    this.setHelpUrl('http://www.example.com/');
  }
};

// motion_attached returns 0 if the motion link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc

Blockly.Blocks['motion_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Motion Attached?");
    this.setOutput(true, "Number");
    this.setColour('#0083CC');
    this.setTooltip('Returns 0 if motion link is not attached, else 2,4,8 indicating which port(s) motion link(s) are on');
    this.setHelpUrl('http://www.example.com/');
  }
};

/* Blockly.Blocks['onmotiontrigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("When");
    this.appendDummyInput()
		.appendField(new Blockly.FieldImage("../../images/LZ_Icons_07012015_1_Motion.png", 50, 50, "On Motion Trigger"));
    //this.appendDummyInput()
    //    .appendField("On Motion Trigger");
    //this.appendDummyInput()
	//	.appendField(new Blockly.FieldDropdown([["tap","tap"],["click","click"],["donemoving","done moving"]]),"interruptModes");	
    this.appendStatementInput("NAME");
    this.setColour('#0083CA');
    this.setTooltip('Use this to define response to motion input');
    this.setHelpUrl('http://www.example.com/');
  }
};
*/

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#6tyi6z (change setColour value)
// Reads motion sensor and reurns a list (magnitude, x,y,z)
// If no motion link is present, returns an empty list
// If more then one motion sensor is present

Blockly.Blocks['getmotiondata'] = {
  init: function() {
    this.appendDummyInput()
		.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_15.1_DataMove.png", 40, 40, "Get Motion Data"));
    this.appendDummyInput()
        .appendField(" Get Motion Data");
    this.setOutput(true, "Array");
    this.setColour('#0083CC');
    this.setTooltip('Reads motion sensor and returns the list (X, Y, Z)');
    this.setHelpUrl('http://www.example.com/');
  }
};



// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#2mndvz (change setCoulour value)


Blockly.Blocks['setmotiontrigger'] = {
  init: function() {
    this.appendDummyInput()
		.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_1_Motion.png", 50, 50, "GetMotionData"));
    this.appendDummyInput()
        .appendField("Set Motion Trigger");
    this.appendValueInput("NAME")
        .setCheck(["Number", "Array"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#0083CA');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.Blocks['math_binary'] = {
  /**
   * Block for basic binary operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [['&','BITWISEAND'],
         ['|','BITWISEOR']];
    this.appendDummyInput()
      .appendField(new Blockly.FieldImage("../../images/LZ_Icons_binary.png",50,50,"*"));
    this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'BITWISEAND':Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_BITWISEAND,
        'BITWISEOR':Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_BITWISEOR
      };
      return TOOLTIPS[mode];
    });
  }
};

// **************************************************************************************************
// MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE
// **************************************************************************************************

Blockly.Blocks['on_mic_event'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour('#E81A4B');
    this.appendDummyInput()
        .appendField("On Mic Trigger");
    this.appendValueInput("event typye")
        .setCheck("Number")
        .appendField("When")
        .appendField(new Blockly.FieldDropdown([["Amplitude", "Amplitude"], ["Pitch", "Pitch"], ["Frequency", "Frequency"]]), "NAME")
        .appendField(" is above:");
    this.appendStatementInput("Do")
        .setCheck("null")
        .appendField("Do:");
    this.setTooltip('');
  }
};

Blockly.Blocks['read_sound_levels'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(LinkitzHue,LinkitzSaturation,LinkitzValue);
    this.appendDummyInput()
        .appendField("Read Sound Levels");
    this.setOutput(true, "Array");
    this.setTooltip('');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#56jkef

Blockly.Blocks['getmicdata'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_15.3_DataMic.png", 40, 40, "GetMicData"));
    this.appendDummyInput()
        .appendField("Get Mic Data");
    this.setOutput(true, "Array");
    this.setColour('#E81A4B');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['set_mic_threshold'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_3_Mic.png", 50, 50, "GetMicData"));
    this.appendDummyInput()
        .appendField("Set Mic Threshold");
    this.appendValueInput("NAME")
        .setCheck(["Number", "Array"]);	
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#E81A4B');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// **************************************************************************************************
// SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER
// **************************************************************************************************



// Play a list of samples as it is being received or recorded. 

Blockly.Blocks['playdatastream'] = {
  init: function() {
    this.appendDummyInput()
	.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_2_Speaker.png", 50, 50, "GetSpeakerData"));
    this.appendDummyInput()
        .appendField("Play data stream");
    this.appendValueInput("NAME")
        .setCheck("Array");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Call for speaker to play a sound file
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#g7vr8s

Blockly.Blocks['speaker_play_sound'] = {
  init: function() {
    this.appendDummyInput()
	.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_2_Speaker.png", 50, 50, "GetSpeakerData"));
    this.appendDummyInput()
        .appendField("Play sound");
    this.appendValueInput("NAME")
        .setCheck("Valid_sound_block");
    this.setInputsInline(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


// **************************************************************************************************
// RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO
// **************************************************************************************************


Blockly.Blocks['radio_onreceive'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Radio On Receive");
    this.appendStatementInput("NAME");
    this.setNextStatement(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


// getidfromradio returns the ID stored in the attached radio petal as an integer. If not radio petal is attached, returns -1

Blockly.Blocks['getidfromradio'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Get ID from radio");
    this.setOutput(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['getidfromradioatport'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Get ID from radio");
    this.appendValueInput("port");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#xvonmp

Blockly.Blocks['transmit2'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.3_RadioTransmit.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Transmit");
    this.appendValueInput("Target")
        .setCheck(["String", "Array"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("To");
    this.appendValueInput("Message")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Message");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#zsxq2k

Blockly.Blocks['createmessage'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.2_CreateAMessage.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Create a message");
    this.appendValueInput("MessageName")
        .setCheck("String")
        .appendField("Name this message");
    this.appendStatementInput("NAME");
    this.setOutput(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['check_type'] = {
  init: function() {
    this.appendValueInput("message")
        .setCheck("String")
        .appendField("Check if inputted message is")
        .appendField(new Blockly.FieldDropdown([["Output a microphone signal", "requestForMicrophone"], ["Output a motion signal", "requestForMotion"], ["Motion signal", "motion signal"], ["Microphone signal", "microphone signal"], ["LED signal", "LED signal"], ["Speaker signal", "speaker signal"], ["Secret message", "secret message"], ["Nothing", "Nothing"]]), "different messages");
    this.setOutput(true, "Boolean");
    this.setColour(LinkitzHue,LinkitzSaturation,LinkitzValue);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#uqwvsv
// Returns the most recently received radio message as a list with the sender,  message and range
// If no radio is present, it returns the empty list

Blockly.Blocks['getradiodata'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_15.2_DataFriend.png", 40, 40, "Get Radio Data"));
    this.appendDummyInput()
        .appendField("Get Radio Data");
    this.setInputsInline(true);
    this.setOutput(true, "Array");
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#rzpveq

Blockly.Blocks['setradioeventtrigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Set Radio Event Trigger");
    this.appendValueInput("NAME")
        .setCheck("Array");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Read and return range estimate from radio
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#avt2iz

Blockly.Blocks['radiogetrange'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Get Radio Range");
    this.setOutput(true, "Number");
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// **************************************************************************************************
// HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  
// **************************************************************************************************

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#v4hgbw

Blockly.Blocks['RegularEventSpeed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Set Regular Event Speed");
    this.appendValueInput("PERIOD")
        .setCheck("Number");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};



Blockly.Blocks['on_regular_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("On Regular Event");
    this.appendStatementInput("NAME");
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['initialize'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Initialize");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['on_initialization'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("On Initialization");
    this.appendStatementInput("NAME");
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// This block returns a reading from the ambient light sensor in the hub
Blockly.Blocks['getambientlight'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Get ambient light");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
// return the battery "life" or "health" -- however that is defined -- as an integer from 1= very bad to 10 = very good

Blockly.Blocks['getbatterylevel'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Get battery level");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// the ROSTER is a list of links connected to the hub. it is represented by a 3-tuple where position in the list
// corrresponds to port number and the link type is repsented by an integer
// 1=LED, 2=Motion, 3=Mic, 4=Spkr, 5=Radio, 0=no link connected at this position
// example: hub with LED at port2 and motion at port3 returns (0,1,2)

Blockly.Blocks['getroster'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField(" Get roster");
    this.setOutput(true, "Array");
    this.setColour('#FFCE00');
    this.setTooltip('return a list of link types connected to the hub, by position');
    this.setHelpUrl('http://www.example.com/');
  }
};

// getmyid returns a number that is the ID of this hub

Blockly.Blocks['getmyid'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Get my ID ");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// writeidtoradio writes this hub's ID to the radio petal. see below for alternate version write_this_idtoradio

Blockly.Blocks['writeidtoradio'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Write my ID to radio petal");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// alternate version write_this_idtoradio takes a number as input and writes that number to the attached radio petal
// dangerous because it allows user to spoof being a different user, but might be useful for forwarding  in a mesh network

Blockly.Blocks['write_this_idtoradio'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Write this ID to radio petal");
    this.appendValueInput("ID")
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


/*
Here are my blocks to handle connection and/or 'roster' events.  What I'm calling the 'Roster' is a list of links that the hub creates.  
When a link is connected/detatched, it is added to/removed from the roster.  
*/

/*Roster Event-- input will be a custom list that only accepts names of links
currently set up to accept the list of event handlers as a statement input, can easily be changed to a block that accepts connections at the bottom.
Creates a hidden variable called "priority"
The idea is this, users will want to have scripts tied to every possible roster permutation.  
Some of those will involve only 1 or two links.  That means that any toy comprised of three links will be colliding with two other possible toys. 
eg. speaker=siren, speaker+mic=voice distortion, speaker+mic+radio=walkie talkie
With priority, we can end that collision.  Only the highest priority script is triggered
*/


Blockly.Blocks['roster_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.setHelpUrl('http://www.example.com/');
    this.setColour(LinkitzHue,LinkitzSaturation,LinkitzValue);
    this.appendDummyInput()
        .appendField("Roster Event Hander: ");
    this.appendDummyInput()
        .appendField("I go off when These Links Are Connected");
    this.appendValueInput("LinkRoster")
        .setCheck("Array");  //I wonder if I can just create my own type and use it here?
    this.appendStatementInput("Script");
  }
};



//Special list to be the roster
//will try to give it a unique type, and make the inputs unique types-- might be smarter to get around this with a dropdown menu?
Blockly.Blocks['roster_list'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.setHelpUrl('http://www.example.com/');
    this.setColour(LinkitzHue,LinkitzSaturation,LinkitzValue);
    this.appendDummyInput()
        .appendField("Roster:");
    this.appendValueInput("Link1")
        .setCheck("Array");
    this.appendValueInput("Link2")
        .setCheck("Array");
    this.appendValueInput("Link3")
        .setCheck("Array");
    this.appendStatementInput("Rostercode");
    this.setInputsInline(true);
    this.setTooltip('');
  }
};

//tidier in some ways, but it seems less fun to use

Blockly.Blocks['roster_event_two'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.setHelpUrl('http://www.example.com/');
    this.setColour(LinkitzHue,LinkitzSaturation,LinkitzValue);
    this.appendDummyInput()
        .appendField("Roster:");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["none", "None"], ["Motion", "Motion"], ["LED", "LED"], ["Friend", "Friend"], ["Mic", "Mic"], ["Speaker", "Speaker"]]), "Link1");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["none", "None"], ["Motion", "Motion"], ["LED", "LED"], ["Friend", "Friend"], ["Mic", "Mic"], ["Speaker", "Speaker"]]), "Link2");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["none", "None"], ["Motion", "Motion"], ["LED", "LED"], ["Friend", "Friend"], ["Mic", "Mic"], ["Speaker", "Speaker"]]), "Link3");
    this.appendStatementInput("Script");
    this.setInputsInline(true);
    this.setTooltip('');
  }
};
//Single connection event-- I imagine these being ONE TIME executions-- for continual execution, use the roster

Blockly.Blocks['connection_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.setHelpUrl('http://www.example.com/');
    this.setColour(LinkitzHue,LinkitzSaturation,LinkitzValue);
    this.appendDummyInput()
        .appendField("Connect Event")
        .appendField(new Blockly.FieldDropdown([["none", "None"], ["Motion", "Motion"], ["LED", "LED"], ["Friend", "Friend"], ["Mic", "Mic"], ["Speaker", "Speaker"]]), "Link");
    this.appendStatementInput("script");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setTooltip('');
  }
};

// MISCELLANEOUS

Blockly.Blocks['delay'] = {
  init: function() {
    //this.appendDummyInput()
    //    .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Delay ");
    this.appendValueInput("delay_in_ms")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("ms");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('Delay by the specified number of ms (1000 ms = 1 sec)');
    this.setHelpUrl('http://www.example.com/');
  }
};




//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//Lyssa's sound and radio blocks
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// radio event
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#evprcb

Blockly.Blocks['radio_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("On Radio Event");
    this.appendDummyInput()
    .appendField(new Blockly.FieldImage("../../images/radio_icon2.png", 22, 18, "GetMicData"));
    this.setColour(LinkitzHue,LinkitzSaturation,LinkitzValue);
    this.appendValueInput("NAME")
        .appendField(new Blockly.FieldDropdown([["Msg_Color", "MSG_COLOR"], ["Msg_Sound", "MSG_SOUND"], ["Msg_Blank", "MSG_BLANK"]]), "NAME");
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Create your own sound. Could be combined or put in a loop to make more complex sounds
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#jg6c8w

Blockly.Blocks['sound_fdv'] = {
  init: function() {
    this.appendDummyInput()
	.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_2.2_SoundBlock.png", 50, 50, "GetSpeakerData"));
    this.appendDummyInput()
        .appendField("Sound with");
    this.appendValueInput("Frequency")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Frequency");
    this.appendValueInput("Duration")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Duration");
    this.appendValueInput("Volume")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Volume");
    this.setOutput(true);
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Use a pre-defined sound
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#yzekjn

Blockly.Blocks['sound_from_file'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["beep", "BEEP"], ["whoohoo", "WOOHOO"], ["uhoh", "UHOH"], ["hi", "HI"]]), "NAME");
    this.setOutput(true, null);
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Use sound in from mic, out through speaker (requires and intermediate cache of sound_in to a file)
// Link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#2ixsvm

Blockly.Blocks['sound_from_mic'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Sound from microphone");
    this.appendValueInput("Volume")
        .setCheck("Number")
        .appendField("Volume");
    this.appendDummyInput()
        .appendField("With filter");
    this.appendValueInput("NAME")
        .appendField(new Blockly.FieldDropdown([["None", "FILTER_NONE"], ["Like_a_duck", "FILTER_ADD_NOISE"], ["Squeaky", "FILTER_HIGH_SHIFT"], ["Scary", "FILTER_LOW_SHIFT"]]), "FILTER_OPTIONS");
    this.setInputsInline(false);
    this.setOutput(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/mic_icon2.png", 22, 18, "GetMicData"));
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Play a user defined sound that a user records from the mic. It gets saved in a file. requires filename.
// this example shows three options. not sure if we want more.
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#z4xtfp


Blockly.Blocks['sound_user_defined_from_mic'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("My_sound");
    this.appendValueInput("Sound__userdefined_filename")
        .setCheck("Array")
        .appendField(new Blockly.FieldDropdown([["myfile1", "USER_DEFINED_SOUND1"], ["myfile2", "USER_DEFINED_SOUND2"], ["myfile3", "USER_DEFINED_SOUND3"]]), "My sound files");
    this.appendValueInput("Volume")
        .setCheck("Number")
        .appendField("Volume");
    this.setInputsInline(false);
    this.setOutput(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/mic_icon2.png", 22, 18, "GetMicData"));
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// on microphone trigger
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#sogot8
Blockly.Blocks['on_microphone_trigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_3.1_OnMicTrigger.png", 50, 50, "On Mic Trigger"));
    this.appendDummyInput()
        .appendField("On Microphone Trigger");
    this.appendStatementInput("NAME");
    this.setInputsInline(false);
    this.setColour('#E81A4B');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// On microphone trigger, user may convert sound (PITCH) to color (HUE) with POWER (brightness)=VOLUME.
// 20150727 LN: I envision that incoming sound is stored in a LIFO buffer.
// 20150727 LN: I'm unclear on the role of bandwidth in this caluclation (as a user visible paramenter)
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#mf254a

Blockly.Blocks['sound_convert_pitch_to_hue'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Sound_to_Colored_Light");
    this.appendValueInput("Pitch")
        .setCheck("Number")
        .appendField("Pitch");
    this.appendValueInput("Bandwidth")
        .setCheck("Number")
        .appendField("Bandwidth ???");
    this.appendValueInput("Volume")
        .setCheck("Number")
        .appendField("Volume");
    this.appendValueInput("Audio_buffer")
        .setCheck("Valid_sound_block")
        .appendField("Filename");
    this.setInputsInline(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/mic_icon2.png", 22, 18, "GetMicData"));
    this.setColour('#E81A4B');;
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

//---------------------------------------------------



