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

goog.provide('Blockly.Dart.logic');

goog.require('Blockly.Dart');

/*
Blockly.Dart['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.Dart.valueToCode(block, 'IF' + n,
      Blockly.Dart.ORDER_NONE) || 'false';
  var branch = Blockly.Dart.statementToCode(block, 'DO' + n);
  var code = 'if (' + argument + ') {\n' + branch + '}';
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = Blockly.Dart.valueToCode(block, 'IF' + n,
      Blockly.Dart.ORDER_NONE) || 'false';
    branch = Blockly.Dart.statementToCode(block, 'DO' + n);
    code += ' else if (' + argument + ') {\n' + branch + '}';
  }
  if (block.elseCount_) {
    branch = Blockly.Dart.statementToCode(block, 'ELSE');
    code += ' else {\n' + branch + '}';
  }
  return code + '\n';
};
*/

Blockly.Dart['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  ifCount++; // ifCount is global for generating unique labels across multiple conditional statements
  var elseCount = block.elseCount_;
  var elseifcount = block.elseifCount_;
  var argument = Blockly.Dart.valueToCode(block, 'IF' + n, Blockly.Dart.ORDER_NONE) || 'false';      //argument is in R1
  var code = argument;
  var branch = Blockly.Dart.statementToCode(block, 'DO' + n); // branch = statements to be executed if argument is true/non-zero
      if ((elseCount == 0) && (elseifcount == 0)) {
        code += 'BTR1SNZ \n GOTO endif_label_' + ifCount + '\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
        code += branch + 'GOTO endif_label_' + ifCount + '\n';
      }
      else if ((elseCount > 0 ) && (elseifcount == 0)) { // if this is a simple if-then-else
        code += 'BTR1SNZ \n GOTO else_label_' + ifCount + '\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
        code += branch + 'GOTO endif_label_' + ifCount + '\n';
      } else { // if there are nested if statements with out without an else
          code += 'BTR1SNZ \n GOTO elseif_label_' + ifCount + '_1\n'; // test value in R1, skip the instuction 'GOTO else_label' if non-zero
          code += branch + 'GOTO endif_label_' + ifCount + '\n';
     
          for (n = 1; n <= elseifcount; n++) {
            argument = Blockly.Dart.valueToCode(block, 'IF' + n, Blockly.Dart.ORDER_NONE) || 'false';
            branch = Blockly.Dart.statementToCode(block, 'DO' + n);
            code += 'elseif_label_' + ifCount + '_' + n + ':\n' + argument +  'BTR1SNZ \n';
            var z = n + 1;
            if (z  > elseifcount) { 
              if (elseCount > 0) {code += 'GOTO else_label_' + ifCount + '\n' + branch; }
                else {
                  code += 'GOTO endif_label_' + ifCount + '\n' + branch;
                  }
              } else {
                 code += 'GOTO elseif_label_' + ifCount + '_' + z +'\n' + branch;
            }
          }
      }
  if (elseCount > 0) {
    branch = Blockly.Dart.statementToCode(block, 'ELSE') || ' ';
    code += ' else_label_' + ifCount + ':\n' + branch + '\n';
  }
  return code + 'endif_label_' + ifCount + ':\n';
};

Blockly.Dart['logic_compare'] = function(block) {
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
      Blockly.Dart.ORDER_EQUALITY : Blockly.Dart.ORDER_RELATIONAL;
  var argument0 = Blockly.Dart.valueToCode(block, 'A', order);
  var argument1 = Blockly.Dart.valueToCode(block, 'B', order);
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

Blockly.Dart['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'land' : 'lor';
  var order = (operator == 'land') ? Blockly.Dart.ORDER_LOGICAL_AND :
      Blockly.Dart.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Dart.valueToCode(block, 'A', order);
  var argument1 = Blockly.Dart.valueToCode(block, 'B', order);
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

Blockly.Dart['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Dart.ORDER_UNARY_PREFIX;
  var argument0 = Blockly.Dart.valueToCode(block, 'BOOL', order) || 'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Dart['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Dart.valueToCode(block, 'IF',
      Blockly.Dart.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Dart.valueToCode(block, 'THEN',
      Blockly.Dart.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Dart.valueToCode(block, 'ELSE',
      Blockly.Dart.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Dart.ORDER_CONDITIONAL];
};
