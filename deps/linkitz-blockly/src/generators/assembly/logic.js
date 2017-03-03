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
 * @fileoverview Generating Dart for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Assembly.logic');

goog.require('Blockly.Assembly');

Blockly.Assembly['controls_if'] = function(block) {
  // If/elseif/else condition.
  var code = '; starting controls_if\n';
  var n = 0;
  var this_if = ifCount++; // ifCount is global for generating unique labels across multiple conditional statements
  console.log("1: this_if = " + this_if);
  var elseCount = block.elseCount_;
  var elseifcount = block.elseifCount_;
  console.log("in controls_if n="+n+", this_if="+this_if+", elseCount="+elseCount+", elseifcount="+elseifcount);
  var argument = Blockly.Assembly.valueToCode(block, 'IF' + n, Blockly.Assembly.ORDER_NONE) || 'Set R1 0\n';      //argument is in R1
  code += argument;
  var branch = Blockly.Assembly.statementToCode(block, 'DO' + n); // branch = statements to be executed if argument is true/non-zero
      if ((elseCount == 0) && (elseifcount == 0)) { // this is simple if-then
        console.log("2: this_if = " + this_if);
        code += 'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
        code += 'GOTO endif_label_' + this_if + '\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
        console.log("3: this_if = " + this_if);
        code += branch + 'GOTO endif_label_' + this_if + '\n';   // do the then clause and go to end
      }
      else if ((elseCount > 0 ) && (elseifcount == 0)) { // this is a simple if-then-else
        console.log("4: this_if = " + this_if);
        code += 'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
        code += ' GOTO else_label_' + this_if + '\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
        console.log("5: this_if = " + this_if);
        code += branch + 'GOTO endif_label_' + this_if + '\n';
      } else {                                           // there are nested if statements with out without an else
          console.log("6: this_if = " + this_if);
          code += 'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
          code += ' GOTO elseif_label_' + this_if + '_1\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
          code += branch + 'GOTO endif_label_' + this_if + '\n';
     
          for (n = 1; n <= elseifcount; n++) {
            argument = Blockly.Assembly.valueToCode(block, 'IF' + n, Blockly.Assembly.ORDER_NONE) || 'Set R1 0\n';
            branch = Blockly.Assembly.statementToCode(block, 'DO' + n);
            console.log("7: this_if = " + this_if);
            code += 'elseif_label_' + this_if + '_' + n + ':\n' + argument +  'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
            var z = n + 1;
            if (z  > elseifcount) { 
              if (elseCount > 0) {
                console.log("8: this_if = " + this_if);
                code += 'GOTO else_label_' + this_if + '\n' + branch + 'GOTO endif_label_' + this_if + '\n'; }
                else {
                  console.log("9: this_if = " + this_if);
                  code += 'GOTO endif_label_' + this_if + '\n' + branch + 'GOTO endif_label_' + this_if + '\n';
                  }
              } else {
                 console.log("10: this_if = " + this_if);
                 code += 'GOTO elseif_label_' + this_if + '_' + z +'\n' + branch+ 'GOTO endif_label_' + this_if + '\n';
            }
          }
      }
  if (elseCount > 0) {
    branch = Blockly.Assembly.statementToCode(block, 'ELSE') || ' ';
    console.log("1: this_if = " + this_if);
    code += ' else_label_' + this_if + ':\n' + branch + 'GOTO endif_label_' + this_if + '\n'
  }
  console.log("12: this_if = " + this_if);
  code  += '; ending controls_if\n';
  return code + 'endif_label_' + this_if + ':\n';
};

Blockly.Assembly['logic_compare'] = function(block) {
  // Comparison operators
  var code = '; starting logic_compare\n';
  var OPERATORS = {
    'EQ': 'cmpeq',
    'NEQ': 'cmpneq',
    'LT': 'cmplt',
    'LTE': 'cmple',
    'GT': 'cmpgt',
    'GTE': 'cmpge'
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = Blockly.Assembly.ORDER_ATOMIC;
  var arg0 = block.getInputTargetBlock('A');
  var arg1 = block.getInputTargetBlock('B');
  if (!arg0 || !arg1) { // return false if missing either or both arguments - args are NOT ON STACK OR IN R1 YET
    var code = "set R1 R0\n";
    return [code, order];
  }
  if (is_scalar(arg0) || (get_list_desc (arg0, [])[1].length == 0)) {
    var argument0 = Blockly.Assembly.valueToCode(block, 'A', order);  
  } else
  {
    throw 'input1 to logic_compare block can\'t be a list';
  }
  if (is_scalar(arg1) || (get_list_desc (arg1, [])[1].length == 0)) {
  var argument1 = Blockly.Assembly.valueToCode(block, 'B', order);
  } else
  {
    throw 'input2 to logic_compare block can\'t be a list';
  }
  code += argument0 + 'push R1 \n' + argument1 + 'pop R2 \n' + operator + ' R2 R1 R1\n';
  code += '; ending logic_compare\n';
  return [code, order];
};

Blockly.Assembly['logic_operation'] = function(block) {
    // Operations 'and', 'or'.
    var code = '; starting logic_operation\n';
    var operator = (block.getFieldValue('OP') == 'AND') ? 'land' : 'lor';
    var order = Blockly.Assembly.ORDER_NONE;
    var arg0 = block.getInputTargetBlock('A');
    var arg1 = block.getInputTargetBlock('B');
    console.log("in logic_operation");
    if (!arg0 || !arg1) { // return false if missing either or both arguments - args are NOT ON STACK OR IN R1 YET
    code += "set R1 R0\n";
      return [code, order];
    }
    if (is_scalar(arg0) || (get_list_desc (arg0, [])[1].length == 0)) {
      var argument0 = Blockly.Assembly.valueToCode(block, 'A', order);  
    } else
    {
      throw 'input1 to logic_operation block can\'t be a list';
    }
    if (is_scalar(arg1) || (get_list_desc (arg1, [])[1].length == 0)) {
    var argument1 = Blockly.Assembly.valueToCode(block, 'B', order);
    } else
    {
      throw 'input2 to logic_operation block can\'t be a list';
    }
      // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'land') ? '1' : 'R0';
    if (!argument0) {
      argument0 = 'set R1 ' + defaultArgument;
    }
    if (!argument1) {
      argument1 = 'set R1 ' + defaultArgument;
    }
    code += argument0 + '\npush R1 \n' + argument1 + '\npop R2 \n' + operator + ' R2 R1 R1\n';
    code += '; ending logic_operation\n';
    return [code, order];
  };
  
Blockly.Assembly['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Assembly.ORDER_UNARY_PREFIX;
  var argument0 = Blockly.Assembly.valueToCode(block, 'BOOL', order) || 'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Assembly['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

Blockly.Assembly['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Assembly.ORDER_ATOMIC];
};

