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

/*
Blockly.Assembly['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.Assembly.valueToCode(block, 'IF' + n,
      Blockly.Assembly.ORDER_NONE) || 'false';
  var branch = Blockly.Assembly.statementToCode(block, 'DO' + n);
  var code = 'if (' + argument + ') {\n' + branch + '}';
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = Blockly.Assembly.valueToCode(block, 'IF' + n,
      Blockly.Assembly.ORDER_NONE) || 'false';
    branch = Blockly.Assembly.statementToCode(block, 'DO' + n);
    code += ' else if (' + argument + ') {\n' + branch + '}';
  }
  if (block.elseCount_) {
    branch = Blockly.Assembly.statementToCode(block, 'ELSE');
    code += ' else {\n' + branch + '}';
  }
  return code + '\n';
};
*/

Blockly.Assembly['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  ifCount++; // ifCount is global for generating unique labels across multiple conditional statements
  var elseCount = block.elseCount_;
  var elseifcount = block.elseifCount_;
  var argument = Blockly.Assembly.valueToCode(block, 'IF' + n, Blockly.Assembly.ORDER_NONE) || 'Set R1 0\n';      //argument is in R1
  var code = argument;
  var branch = Blockly.Assembly.statementToCode(block, 'DO' + n); // branch = statements to be executed if argument is true/non-zero
      if ((elseCount == 0) && (elseifcount == 0)) { // this is simple if-then
        code += 'BTR1SNZ \n GOTO endif_label_' + ifCount + '\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
        code += branch + 'GOTO endif_label_' + ifCount + '\n';   // do the then clause and go to end
      }
      else if ((elseCount > 0 ) && (elseifcount == 0)) { // this is a simple if-then-else
        code += 'BTR1SNZ \n GOTO else_label_' + ifCount + '\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
        code += branch + 'GOTO endif_label_' + ifCount + '\n';
      } else {                                           // there are nested if statements with out without an else
          code += 'BTR1SNZ \n GOTO elseif_label_' + ifCount + '_1\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
          code += branch + 'GOTO endif_label_' + ifCount + '\n';
     
          for (n = 1; n <= elseifcount; n++) {
            argument = Blockly.Assembly.valueToCode(block, 'IF' + n, Blockly.Assembly.ORDER_NONE) || 'Set R1 0\n';
            branch = Blockly.Assembly.statementToCode(block, 'DO' + n);
            code += 'elseif_label_' + ifCount + '_' + n + ':\n' + argument +  'BTR1SNZ \n';
            var z = n + 1;
            if (z  > elseifcount) { 
              if (elseCount > 0) {code += 'GOTO else_label_' + ifCount + '\n' + branch + 'GOTO endif_label_' + ifCount + '\n'; }
                else {
                  code += 'GOTO endif_label_' + ifCount + '\n' + branch + 'GOTO endif_label_' + ifCount + '\n';
                  }
              } else {
                 code += 'GOTO elseif_label_' + ifCount + '_' + z +'\n' + branch+ 'GOTO endif_label_' + ifCount + '\n';
            }
          }
      }
  if (elseCount > 0) {
    branch = Blockly.Assembly.statementToCode(block, 'ELSE') || ' ';
    code += ' else_label_' + ifCount + ':\n' + branch + 'GOTO endif_label_' + ifCount + '\n'
  }
  return code + 'endif_label_' + ifCount + ':\n';
};

Blockly.Assembly['logic_compare'] = function(block) {
  // Comparison operator.HAVE TO PUT IN ASSEMBY EQUIVALENTS
  var OPERATORS = {
    'EQ': 'cmpeq',
    'NEQ': 'cmpneq',
    'LT': 'cmplt',
    'LTE': 'cmple',
    'GT': 'cmpgt',
    'GTE': 'cmpge'
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      Blockly.Assembly.ORDER_EQUALITY : Blockly.Assembly.ORDER_RELATIONAL;
  var argument0 = Blockly.Assembly.valueToCode(block, 'A', order);
  var argument1 = Blockly.Assembly.valueToCode(block, 'B', order);
  if (!argument0) {
    if (!argument1) {
      var code = operator + ' R0 R0\n';
    }
    else {
    var code = argument1 + '\n' + operator + ' R0 R1 R1\n';
    }
  }
  else if (!argument1) {
    var code = argument0 + '\n' + operator + ' R1 R0 R1\n';
  }
  else {
  var code = argument0 + '\npush R1 \n' + argument1 + '\npop R2 \n' + operator + ' R2 R1 R1\n';
  }
  return [code, order];
};

Blockly.Assembly['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'land' : 'lor';
  var order = (operator == 'land') ? Blockly.Assembly.ORDER_LOGICAL_AND :
      Blockly.Assembly.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Assembly.valueToCode(block, 'A', order);
  var argument1 = Blockly.Assembly.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'R0';
    argument1 = 'R0';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'land') ? 'true' : 'R0';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + '\npush R1 \n' + argument1 + '\npop R2 \n' + operator + ' R2 R1 R1\n';
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

Blockly.Assembly['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Assembly.valueToCode(block, 'IF',
      Blockly.Assembly.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Assembly.valueToCode(block, 'THEN',
      Blockly.Assembly.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Assembly.valueToCode(block, 'ELSE',
      Blockly.Assembly.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Assembly.ORDER_CONDITIONAL];
};
