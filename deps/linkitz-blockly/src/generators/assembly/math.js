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
 * @fileoverview Generating Dart for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Assembly.math');

goog.require('Blockly.Assembly');


Blockly.Assembly.addReservedWords('Math');

Blockly.Assembly['math_number'] = function(block) {
  // Numeric value.
  var number_arg = parseFloat(block.getFieldValue('NUM'));
  var order;
  if (number_arg == Infinity) {
    code = 'double.INFINITY';
    order = Blockly.Assembly.ORDER_UNARY_POSTFIX;
  } else if (number_arg == -Infinity) {
    code = '-double.INFINITY';
    order = Blockly.Assembly.ORDER_UNARY_PREFIX;
  } 
  var code = 'set R1 '+ number_arg + '\n';
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

Blockly.Assembly['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': ['ADD', Blockly.Assembly.ORDER_ATOMIC],
    'MINUS': ['SUB', Blockly.Assembly.ORDER_ATOMIC],
    'MULTIPLY': ['MUL', Blockly.Assembly.ORDER_ATOMIC],
    'DIVIDE': ['DIV', Blockly.Assembly.ORDER_ATOMIC],
    'POWER': ['POW', Blockly.Assembly.ORDER_EXPONENTIATION]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Assembly.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Assembly.valueToCode(block, 'B', order) || '0';
  var code;
 
  code = argument0 + 'push R1 \n' + argument1 + 'pop R2 \n' + operator + ' R2 R1 R1\n';
  return [code, order];
};

Blockly.Assembly['math_binary'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'BITWISEAND': ['band3', Blockly.Assembly.ORDER_ADDITIVE],
    'BITWISEOR': ['bor3', Blockly.Assembly.ORDER_ADDITIVE]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Assembly.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Assembly.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in Assembly requires a special case since it has no operator.
  code = argument0 + 'push R1 \n' + argument1 + 'pop R2 \n' + operator + ' R2 R1 R1\n';
  return [code, order];
};

Blockly.Assembly['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Assembly.valueToCode(block, 'NUM',
        Blockly.Assembly.ORDER_UNARY_PREFIX) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in assembly.
      arg = ' ' + arg;
    }
    code = arg + 'Set R2 -1\nMUL R1 R2 R1\n';
    return [code, Blockly.Assembly.ORDER_UNARY_PREFIX];
  }
  if (operator == 'ABS') {
    arg = Blockly.Assembly.valueToCode(block, 'NUM',
        Blockly.Assembly.ORDER_UNARY_POSTFIX) || '0';
    code = arg + 'ABS R1 R1\n';
  } 
  
  if (code) {
    return [code, Blockly.Assembly.ORDER_UNARY_POSTFIX];
  }
}
Blockly.Assembly['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Math.PI', Blockly.Assembly.ORDER_UNARY_POSTFIX],
    'E': ['Math.E', Blockly.Assembly.ORDER_UNARY_POSTFIX],
    'GOLDEN_RATIO':
        ['(1 + Math.sqrt(5)) / 2', Blockly.Assembly.ORDER_MULTIPLICATIVE],
    'SQRT2': ['Math.SQRT2', Blockly.Assembly.ORDER_UNARY_POSTFIX],
    'SQRT1_2': ['Math.SQRT1_2', Blockly.Assembly.ORDER_UNARY_POSTFIX],
    'INFINITY': ['double.INFINITY', Blockly.Assembly.ORDER_ATOMIC]
  };
  var constant = block.getFieldValue('CONSTANT');
  if (constant != 'INFINITY') {
    Blockly.Assembly.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
  }
  return CONSTANTS[constant];
};

Blockly.Assembly['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Assembly.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Assembly.ORDER_MULTIPLICATIVE);
  if (!number_to_check) {
    return ['false', Blockly.Python.ORDER_ATOMIC];
  }
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    Blockly.Assembly.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
    var functionName = Blockly.Assembly.provideFunction_(
        'math_isPrime',
        [ 'bool ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
          '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
          '  if (n == 2 || n == 3) {',
          '    return true;',
          '  }',
          '  // False if n is null, negative, is 1, or not whole.',
          '  // And false if n is divisible by 2 or 3.',
          '  if (n == null || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
            ' n % 3 == 0) {',
          '    return false;',
          '  }',
          '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
          '  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {',
          '    if (n % (x - 1) == 0 || n % (x + 1) == 0) {',
          '      return false;',
          '    }',
          '  }',
          '  return true;',
          '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Assembly.ORDER_UNARY_POSTFIX];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Assembly.valueToCode(block, 'DIVISOR',
          Blockly.Assembly.ORDER_MULTIPLICATIVE);
      if (!divisor) {
        return ['false', Blockly.Python.ORDER_ATOMIC];
      }
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Assembly.ORDER_EQUALITY];
};

Blockly.Assembly['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Assembly.valueToCode(block, 'DELTA',
      Blockly.Assembly.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return varName + ' = (' + varName + ' is num ? ' + varName + ' : 0) + ' +
      argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.Assembly['math_round'] = Blockly.Assembly['math_single'];
// Trigonometry functions have a single operand.
Blockly.Assembly['math_trig'] = Blockly.Assembly['math_single'];

Blockly.Assembly['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var targetBlock = block.getInputTargetBlock('LIST');
  var inputType = targetBlock.type;
  console.log("in math_on_list: targetBlock.type " + inputType);
  var code = '';
  ifCount++;
  // some error checking: make sure input is a list, if it's a variable, it could be a scalar
  // in which case, just return R0
  if (is_scalar(inputType)){ 
    code += "set R1 0\npush R1\npset R1 1\nush R1\n"; // pretend its a list of length 1 
  }
  else {
    var next_stack_item = gsv_next + 1 ; //*** ******check to make sure this is not hitting glv_next
    if (next_stack_item > glv_next) {
    throw 'out of register space in math_on_list';
    }
    var list = Blockly.Assembly.valueToCode(block, 'LIST', Blockly.Assembly.ORDER_NONE) || '[]'; 
    console.log("in math_on_list: valueToCode LIST is " + list); // input list is on stack, length is TOS
    switch (func) {
      case 'SUM':
        console.log("in math_on_list: SUM");
        code += list + "pop R1\n"; // length is in R1
        code += "set R2 0\n"; // R2 will accumulate sum
        code += "set R" + gsv_next + " -1\n";
        code += "SUM_label_" + ifCount + ": ADD R1 R" + gsv_next + " R1\n"; //decrement R1
        code += "BTR1SNZ \n GOTO endSUM_label_" + ifCount + "\n";
        code += "pop R" + next_stack_item + "\n";
        code += "ADD R2 R" + next_stack_item + " R2\n";
        code += "GOTO SUM_label_" + ifCount + "\n";
        code += "endSUM_label_: push R2 \npop R1\n"; //result of sum is now in R1
      break;
    case 'MIN': // get min element, leave in R1
      // because R1 is a "special register" due to BTR1SNZ, it has to be used for double duty
      // 1. to hold result of compare; 2. to hold interation counter
      console.log("in math_on_list: MIN");
      var min = next_stack_item; //*** ******check to make sure this is not hitting glv_next
      var save = min + 1;
      console.log("min = " + min + ", save = " +save);
      if (min > glv_next) {
        throw 'out of register space in math_on_list';
      }
      code += list + "pop R1\n"; // length is in R1
      code += "set R" + gsv_next + " -1\n";
      code += "pop R" + min + "\n";
      code += "min_label_" + ifCount + ": ADD R1 R" + gsv_next + " R1\n"; //decrement R1 
      code += "BTR1SNZ \n GOTO endMin_label_" + ifCount + "\n"; // if no more elements, go to end
      code += "push R1 R" + save + "\n"; // save counter
      code += "pop R2\n"; //get next item from stack
      code += "cmplt R2 R" + min + " R1 \n"; // R1 = 1 if Rmin must be replaced by value in R2
      code += "BTR1SNZ\n GOTO skip_label_" + ifCount + "\n"; // if Rmin must be replaced skip goto
      code += "push R2\npop R" + min + "\n"; // R2 is new Rmin
      code += "skip_label_"  + ifCount + ": push R" + save + "\npop R1\n"; // restore counter
      code += "GOTO min_label_" + ifCount + "\n";
      code += "endMin_label_: push R"+ min + "\npop R1\n"; // result of MIN is now in R1
      break;
    case 'MAX': // get max element, leave in R1
      // because R1 is a "special register" due to BTR1SNZ, it has to be used for double duty
      // 1. to hold result of compare; 2. to hold interation counter
      console.log("in math_on_list: MAX");
      var max = next_stack_item; //*** ******check to make sure this is not hitting glv_next
      var save = max + 1;
      console.log("max = " + max + ", save = " +save);
      if (max > glv_next) {
        throw 'out of register space in math_on_list';
      }
      code += list + "pop R1\n"; // length is in R1
      code += "set R" + gsv_next + " -1\n";
      code += "pop R" + max + "\n";
      code += "max_label_" + ifCount + ": ADD R1 R" + gsv_next + " R1\n"; //decrement R1 
      code += "BTR1SNZ \n GOTO endmax_label_" + ifCount + "\n"; // if no more elements, go to end
      code += "push R1 R" + save + "\n"; // save counter
      code += "pop R2\n"; //get next item from stack
      code += "cmplt R2 R" + max + " R1 \n"; // R1 = 1 if Rmax must be replaced by value in R2
      code += "BTR1SNZ\n GOTO skip_label_" + ifCount + "\n"; // if Rmax must be replaced skip goto
      code += "push R2\npop R" + max + "\n"; // R2 is new Rmax
      code += "skip_label_"  + ifCount + ": push R" + save + "\npop R1\n"; // restore counter
      code += "GOTO max_label_" + ifCount + "\n";
      code += "endmax_label_: push R"+ max + "\npop R1\n"; // result of max is now in R1
    break;
      case 'AVERAGE': // calculate AVERAGE, leave in R1
        console.log("in math_on_list: AVERAGE");
        code += list + "pop R1\n"; // length is in R1
        code += "set R2 0\n"; // R2 will accumulate sum
        code += "set R" + gsv_next + " -1\n";
        code += "AVG_label_" + ifCount + ": ADD R1 R" + gsv_next + " R1\n"; //decrement R1
        code += "BTR1SNZ \n GOTO endAVG_label_" + ifCount + "\n";
        code += "pop R" + next_stack_item + "\n";
        code += "ADD R2 R" + next_stack_item + " R2\n";
        code += "GOTO AVG_label_" + ifCount + "\n";
        code += "endAVG_label_: DIV R2 R1 R1\n";
      break;
    //   // RANDOM could return a scalar or a list, we can't tell a compile time, so not implemented at this time.
    //   // you can get the same functionality by using random number + list_getIndex
    ////case 'RANDOM':
    ////  Blockly.Assembly.definitions_['import_dart_math'] =
    ////      'import \'dart:math\' as Math;';
    ////  var functionName = Blockly.Assembly.provideFunction_(
    ////      'math_random_item',
    ////      [ 'dynamic ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ +
    ////          '(List myList) {',
    ////        '  int x = new Math.Random().nextInt(myList.length);',
    ////        '  return myList[x];',
    ////        '}']);
    ////  code = functionName + '(' + list + ')';
    break;
    default:
      throw 'Unknown operator: ' + func;
    }
  }
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

Blockly.Assembly['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Assembly.valueToCode(block, 'DIVIDEND',
      Blockly.Assembly.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Assembly.valueToCode(block, 'DIVISOR',
      Blockly.Assembly.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Assembly.ORDER_MULTIPLICATIVE];
};

Blockly.Assembly['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  Blockly.Assembly.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var argument0 = Blockly.Assembly.valueToCode(block, 'VALUE',
      Blockly.Assembly.ORDER_NONE) || '0';
  var argument1 = Blockly.Assembly.valueToCode(block, 'LOW',
      Blockly.Assembly.ORDER_NONE) || '0';
  var argument2 = Blockly.Assembly.valueToCode(block, 'HIGH',
      Blockly.Assembly.ORDER_NONE) || 'double.INFINITY';
  var code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Assembly.ORDER_UNARY_POSTFIX];
};

Blockly.Assembly['math_random_int'] = function(block) {
  // Random integer between -127 and 127.
  var code = 'Syscall RANDOM R1\n'; // TBD
  return [code, Blockly.Assembly.ORDER_UNARY_POSTFIX];
};

Blockly.Assembly['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  Blockly.Assembly.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  return ['new Math.Random().nextDouble()', Blockly.Assembly.ORDER_UNARY_POSTFIX];
};
