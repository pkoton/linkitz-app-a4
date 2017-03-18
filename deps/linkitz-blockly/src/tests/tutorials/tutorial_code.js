
/**
 * @fileoverview JavaScript for Linkitz tutorials setup.
 * @author lyssa@linkitz.com (Lyssa Neel)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var lkz = {};

/**
 * Main Blockly workspace.
 * @type {Blockly.WorkspaceSvg}
 */
lkz.workspace = null;

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
lkz.getStringParamFromUrl = function(name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Extracts a numeric parameter from the URL.
 * If the parameter is absent or less than min_value, min_value is
 * returned.  If it is greater than max_value, max_value is returned.
 * @param {string} name The name of the parameter.
 * @param {number} minValue The minimum legal value.
 * @param {number} maxValue The maximum legal value.
 * @return {number} A number in the range [min_value, max_value].
 */
lkz.getNumberParamFromUrl = function(name, minValue, maxValue) {
  var val = Number(lkz.getStringParamFromUrl(name, 'NaN'));
  return isNaN(val) ? minValue : Math.min(Math.max(minValue, val), maxValue);
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 * === just do english for now
 */
lkz.getLang = function() {
  //var lang = lkz.getStringParamFromUrl('lang', '');
  //if (lkz.LANGUAGE_NAME[lang] === undefined) {
  //   Default to English.
  //  lang = 'en';
  //}
  //return lang;
  return 'en';
};

/**
 * Load blocks saved in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
lkz.loadBlocks = function(defaultXml) {
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if (loadOnce) {
    // Language switching stores the blocks during the reload.
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(lkz.workspace, xml);
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(lkz.workspace, xml);
  }
};

/**
 * Initialize Blockly and the canvas Linkitz simulator
 */
lkz.init = function() {

  // Fixes viewport for small screens.
  var viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && screen.availWidth < 725) {
    viewport.setAttribute('content',
        'width=725, initial-scale=.35, user-scalable=no');
  }

  lkz.workspace = Blockly.inject('blockly',
      {media: '../../media/',
       toolbox: document.getElementById('toolbox')});

  var defaultXml =
      '<xml>' +
      '  <block type="on_regular_event" deletable="false" x="70" y="70">' +
      '  </block>' +
      '</xml>';
  lkz.loadBlocks(defaultXml);

  //lkz.workspace.addChangeListener(lkz.recalculate);
  lkz.workspace.addChangeListener(Blockly.Events.disableOrphans);

  // Initialize the simulator graphic
  lkz.draw();
};

lkz.MAX_LEVEL = 10;
lkz.LEVEL = lkz.getNumberParamFromUrl('level', 1, lkz.MAX_LEVEL);

 
lkz.draw = function() {
  var canvas = document.getElementById('canvas0');
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      
       // top petal
      var x = 175; // x coordinate
      var y = 98; // y coordinate
      var radius = 50; // Arc radius
      var startAngle = 0; // Starting point on circle
      var endAngle = Math.PI; // End point on circle
      var anticlockwise = true; // clockwise or anticlockwise    
      ctx.strokeStyle = 'rgb(135, 50, 153)';
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      ctx.stroke();
      // fill it in
      var radius = 48; // Arc radius
      ctx.fillStyle = '#adafb1';
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      ctx.fill();
       //right petal
      ctx.strokeStyle = '#FF6A13';
      var x = 202; // x coordinate
      var y = 145; // y coordinate
      var radius = 50; // Arc radius
      var startAngle = (2 *Math.PI)/3; // Starting point on circle
      var endAngle = (5 * Math.PI)/3; // End point on circle
      var anticlockwise = true; // clockwise or anticlockwise    
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      ctx.stroke();
      // fill it in
      var radius = 48; // Arc radius   
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      ctx.fill();
        // left petal
      ctx.strokeStyle = '#0083CC';
      var x = 148; // x coordinate
      var y = 145; // y coordinate
      var radius = 50; // Arc radius
      var startAngle = (4 *Math.PI)/3; // Starting point on circle
      var endAngle = Math.PI/3; // End point on circle
      var anticlockwise = true; // clockwise or anticlockwise    
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      ctx.stroke();
      // fill it in
      var radius = 48; // Arc radius   
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      ctx.fill();
      //ctx.closePath();
      // triangle
      ctx.strokeStyle = '#FFCE00';
      ctx.beginPath();
      ctx.moveTo(125, 100);
      ctx.lineTo(225, 100);
      ctx.lineTo(175, 187);
      ctx.lineTo(125, 100);
      ctx.stroke();
      // fill it in
      ctx.moveTo(127, 102);
      ctx.lineTo(223, 102);
      ctx.lineTo(173, 185);
      ctx.lineTo(127, 102);
      ctx.fill();
      //ctx.closePath();
    }
}


  
lkz.runJS = function() {
    // console.log("in RunJS");
    clearInterval(reg_event_interval);
    var blocks = lkz.workspace.getAllBlocks();
    Blockly.JavaScript.init(lkz.workspace);
  // If we are using the 'on_regular_event' block, it executes in time intervals.
  // have to figure out interrupts later. right now it runs 10 times then stops.
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'on_regular_event') {
      //Queue_move_to_front(QueueNextComponentToLightUp, hub_port); // set order (hub first)
      lkz.reg_event_loop(block); // start the loop
    }
    else { // not on_regular_event so only run once
      var code = Blockly.JavaScript.blockToCode(block); // this might have to be workspaceToCode, check interaction with getTopBlocks
      try {
        eval(code);
      } catch (e) {
        alert(e);
        }
      }
    }
  }

  lkz.reg_event_loop = function(block) {
    reg_event_interval = setInterval(function() {
	  lkz.do_on_reg_event(block);
	}, 1000);
  }

lkz.do_on_reg_event = function(block) {
    //// console.log("in do_on_reg_event");
    Queue_move_to_front(QueueNextComponentToLightUp, hub_port); // set order (hub first)
    var code = Blockly.JavaScript.statementToCode(block, 'DO_THIS');
    //Queue_move_first_to_last(QueueNextComponentToLightUp);
      try {
        eval(code);
        } catch (e) {
        alert(e);
        }
  }

  
  
  
      
    // Global variables.
var this_color, this_part;

var color_choices = ['#E81A4B', '#FF7245',  '#ffe600',
                         '#009245', '#00989a',  '#1329c3',
                         '#873299', '#c8c8c8', '#ff6aa2',
                         '#ffa31d', '#fff267', '#33cc66',
                         '#66d9ff','#0083CA','#9862e6','#c9c9c9'];

// the parts list current holds components in the order they are plugged in *in the simulator representation*
// led = port 1, usb = port 2, motion = port 3
var parts = ['hub','led','usb','motion'];
var flash_time = 500; // one second
var period = 1000;  // initial value - this can be reset by 'set_regular_event_speed'
var reg_event_interval;
     



window.addEventListener('load', lkz.init);