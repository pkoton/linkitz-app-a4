/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Dart for loop blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Assembly.loops');

goog.require('Blockly.Assembly');

// not used
//Blockly.Assembly['controls_repeat_ext'] = function(block) {
//  // Repeat n times.
//  if (block.getField('TIMES')) {
//    // Internal number.
//    var repeats = String(Number(block.getFieldValue('TIMES')));
//  } else {
//    // External number.
//    var repeats = Blockly.Assembly.valueToCode(block, 'TIMES',
//        Blockly.Assembly.ORDER_NONE) || '0';
//  }
//  var branch = Blockly.Assembly.statementToCode(block, 'DO');
//  branch = Blockly.Assembly.addLoopTrap(branch, block.id);
//  var code = '';
//  var loopVar = Blockly.Assembly.variableDB_.getDistinctName(
//      'count', Blockly.Variables.NAME_TYPE);
//  var endVar = repeats;
//  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
//    var endVar = Blockly.Assembly.variableDB_.getDistinctName(
//        'repeat_end', Blockly.Variables.NAME_TYPE);
//    code += 'var ' + endVar + ' = ' + repeats + ';\n';
//  }
//  code += 'for (int ' + loopVar + ' = 0; ' +
//      loopVar + ' < ' + endVar + '; ' +
//      loopVar + '++) {\n' +
//      branch + '}\n';
//  return code;
//};

Blockly.Assembly['controls_repeat'] = function(block) {
  // Repeat loop.
  var code = "; starting controls_repeat\n";
  var this_count = ifCount++;
  var minus1 = gsv_next; // used to decrement repeats 
    if (minus1 > glv_next) {
    throw 'out of register space in controls_repeat';
    }
    gsv_next++;
    var temp = gsv_next; // Rtemp holds counter
    if (temp > glv_next) {
    throw 'out of register space in controls_repeat';
    }
    gsv_next++;
    if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
    code += 'set R1 ' + repeats + '\n';
  } 
  code += 'set R' + minus1 + ' -1\n';
  code += 'REPEAT_label_' + this_count + ': BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
  code += 'GOTO end_REPEAT_label_' + this_count + '\n';
  code += 'LoadR1to R' + temp + '\n';
  var branch = Blockly.Assembly.statementToCode(block, 'DO');
  console.log("DO statement is *" + branch + "*\n");
  code += branch + '\n';
  code += 'LoadR1from R' + temp + '\n';
  code += 'SUB R1 R' + minus1 + ' R1\n';
  code += '\nGOTO ' + 'REPEAT_label_' + this_count + '\n end_REPEAT_label_' + this_count + ':\n';
  code += "; ending controls_repeat\n";
  gsv_next = gsv_next - 2; // release registers back to free space
  if(gsv_next!=minus1){throw("gsv_next was decremented to: "+gsv_next+" when seeking to repeat code n times")}
  return code;
};


Blockly.Assembly['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Assembly.valueToCode(block, 'TEST',
      until ? Blockly.Assembly.ORDER_NONE :
      Blockly.Assembly.ORDER_NONE) || 'false';
  var branch = Blockly.Assembly.statementToCode(block, 'DO');
  branch = Blockly.Assembly.addLoopTrap(branch, block.id);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.Assembly['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Assembly.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Assembly.valueToCode(block, 'FROM',
      Blockly.Assembly.ORDER_NONE) || '0';
  var argument1 = Blockly.Assembly.valueToCode(block, 'TO',
      Blockly.Assembly.ORDER_NONE) || '0';
  var increment = Blockly.Assembly.valueToCode(block, 'BY',
      Blockly.Assembly.ORDER_NONE) || '1';
  var branch = Blockly.Assembly.statementToCode(block, 'DO');
  branch = Blockly.Assembly.addLoopTrap(branch, block.id);
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = 'for (' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
        variable0;
    var step = Math.abs(parseFloat(increment));
    if (step == 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
    code += ') {\n' + branch + '}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      var startVar = Blockly.Assembly.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Blockly.Assembly.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.Assembly.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += 'num ' + incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += '(' + increment + ').abs();\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.Assembly.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + ';\n' +
        '     ' + incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + ';\n' +
        '     ' + variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

Blockly.Assembly['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Assembly.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Assembly.valueToCode(block, 'LIST',
      Blockly.Assembly.ORDER_NONE) || '[]';
  var branch = Blockly.Assembly.statementToCode(block, 'DO');
  branch = Blockly.Assembly.addLoopTrap(branch, block.id);
  var code = 'for (var ' + variable0 + ' in ' + argument0 + ') {\n' +
      branch + '}\n';
  return code;
};

Blockly.Assembly['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'GOTO ;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw 'Unknown flow statement.';
};
