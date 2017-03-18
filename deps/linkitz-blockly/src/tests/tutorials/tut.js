// This file was automatically generated from tutorial.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Linkitz.tutorial.
 */

if (typeof Linkitz == 'undefined') { var Linkitz = {}; }
if (typeof Linkitz.tutorial == 'undefined') { Linkitz.tutorial = {}; }


Linkitz.tutorial.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = '<script src="../../blockly_compressed.js"><\/script><script src="../../blocks_compressed.js"><\/script><script src="../../javascript_compressed.js"><\/script><script src="../../blocks/linkitzBlocks.js"><\/script><script type="text/javascript" src="simulator.js"><\/script><table width =100%><tr><td><h1><span id="title">Learn to Code Your Linkitz</span> &nbsp; ';
  var iLimit4 = opt_ijData.maxLevel + 1;
  for (var i4 = 1; i4 < iLimit4; i4++) {
    output += ' ' + ((i4 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i4) + '</span>' : (i4 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i4) + '">' + soy.$$escapeHtml(i4) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i4) + '">' + soy.$$escapeHtml(i4) + '</a>');
  }
  output += '</h1></td><td>lang selection goes here</td></tr><tr><td colspan=2>';
  switch (opt_ijData.level) {
    case 1:
      output += 'Hello, World! Your first Linkitz program!';
      break;
    case 2:
      output += 'Flash a color';
      break;
    case 3:
      output += 'Flash two or three colors at the same time';
      break;
    case 4:
      output += 'The motion trigger';
      break;
    default:
      output += 'Another lesson';
  }
  output += '</td></tr></table><p>';
  switch (opt_ijData.level) {
    case 1:
      output += 'Lets see how the Flash block works.<br>Drag the flash block to the workspace and drop it into the timing block.';
      break;
    case 2:
      output += 'Make the flash block flash a specific color using the color_picker blocks.<br>Drag the flash block to the workspace. <br>Then drag a color_picker block to the workspace. <br>Connect it to the flash block.';
      break;
    case 3:
      output += 'Can you make Linkitz flash three colors at the same time? Try red, white, and blue! (optional hint)<br>What happens when you use four colors?<br>What happens if you try to flash five colors?';
      break;
    case 4:
      output += 'The <i> motion trigger</i> block makes your Linkitz do something when it senses motion.<br>Try making your Linkitz light up a different color when it sense motion.<br>Press the *put shake img here* shake button to test it.';
      break;
    default:
      output += 'Try something new!';
  }
  output += '</p><table width =100%><tr><td>' + Linkitz.tutorial.toolbox(null, null, opt_ijData) + '<div id="blockly" style="height: 480px; width: 600px;"></div></td><td><div id="simDiv" style="height: 480px; width: 400px;background-color: #515c5c; font-family: sans-serif; font-size: larger;"><canvas id="canvas0" width="400" height="450"><img src="../../images/linkitz_outline.png" alt="Linkitz outline" height="220" width="250"></canvas><br><button id="tryit_button" onclick="lkz.runJS()">Try it!</button> <button id="to_t2" onclick="location.href=\'t2.html\'"> Next</button></div></td></tr></table>';
  return output;
};
if (goog.DEBUG) {
  Linkitz.tutorial.start.soyTemplateName = 'Linkitz.tutorial.start';
}


Linkitz.tutorial.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  var output = '<xml id="toolbox" style="display: none">';
  switch (opt_ijData.level) {
    case 1:
      output += '<block type="flash_leds"></block>';
      break;
    case 2:
    case 3:
      output += '<block type="flash_leds"></block><block type="colour_picker"></block><block type="colour_picker"><field name="COLOUR">#FF7245</field></block><block type="colour_picker"><field name="COLOUR">#ff6aa2</field></block><block type="colour_picker"><field name="COLOUR">#ffe600</field></block><block type="colour_picker"><field name="COLOUR">#009245</field></block><block type="colour_picker"><field name="COLOUR">#66d9ff</field></block><block type="colour_picker"><field name="COLOUR">#1329c3</field></block><block type="colour_picker"><field name="COLOUR">#9862e6</field></block><block type="colour_picker"><field name="COLOUR">#c9c9c9</field></block>';
      break;
    default:
      output += '<category id="LED" colour="#873299" name="LED"><block type="flash_leds"></block><block type="colour_picker"></block><block type="colour_picker"><field name="COLOUR">#FF7245</field></block><block type="colour_picker"><field name="COLOUR">#ff6aa2</field></block><block type="colour_picker"><field name="COLOUR">#ffe600</field></block><block type="colour_picker"><field name="COLOUR">#009245</field></block><block type="colour_picker"><field name="COLOUR">#66d9ff</field></block><block type="colour_picker"><field name="COLOUR">#1329c3</field></block><block type="colour_picker"><field name="COLOUR">#9862e6</field></block><block type="colour_picker"><field name="COLOUR">#FFFFFF</field></block><block type="led_attached"></block><block type="usb_attached"></block></category><category id="Motion" colour="#0083CC" name="Motion"><block type="on_motion_trigger"></block></category>';
  }
  output += '</xml>';
  return output;
};
if (goog.DEBUG) {
  Linkitz.tutorial.toolbox.soyTemplateName = 'Linkitz.tutorial.toolbox';
}
