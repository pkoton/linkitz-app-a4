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
  var arg0 = block.getInputTargetBlock('A');
  if (!arg0) {
    var argument0 = 'set R1 0\n'; // treat as zero
  } else //arg0 exists
  {
    if (is_scalar(arg0) || (get_list_desc (arg0, [])[1].length == 0)) { // and arg1 is scalar
    var argument0 = Blockly.Assembly.valueToCode(block, 'A', order);
    }
    else { //it's not scalar
    throw 'input1 to math_arithmetic block can\'t be list';
    }
  }
  var arg1 = block.getInputTargetBlock('B');
  if (!arg1) { //blank input
    var argument1 = 'set R1 0\n'; // treat as zero
  } else  //arg1 exists
  {
    if (is_scalar(arg1) || (get_list_desc (arg1, [])[1].length == 0)) { // and arg1 is scalar
    var argument1 = Blockly.Assembly.valueToCode(block, 'B', order);  
    } else { //it's not scalar
      throw 'input2 to math_arithmetic block can\'t be list';
      }
  }
  var code = argument0 + 'push R1 \n' + argument1 + 'pop R2 \n' + operator + ' R2 R1 R1\n';
  return [code,Blockly.Assembly.ORDER_ATOMIC];
};

Blockly.Assembly['math_binary'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'BITWISEAND': ['band3', Blockly.Assembly.ORDER_ATOMIC],
    'BITWISEOR': ['bor3', Blockly.Assembly.ORDER_ATOMIC]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var defaultArgument = (operator == 'band3') ? '127\n' : 'R0\n';
  var arg0 = block.getInputTargetBlock('A');
  var arg1 = block.getInputTargetBlock('B');
  if ((!arg0) && (!arg1)) { // no args returns false
    return ['set R1 R0\n',Blockly.Assembly.ORDER_ATOMIC];
  }
  if (!arg0) {
    argument0 = 'set R1 ' + defaultArgument;
  } else //arg0 exists
  {
    if (is_scalar(arg0) || (get_list_desc (arg0, [])[1].length == 0)) { // and arg1 is scalar
    var argument0 = Blockly.Assembly.valueToCode(block, 'A', order);
    }
    else { //it's not scalar
    throw 'input1 to math_binary block can\'t be list';
    }
  }
  if (!arg1) { //blank input
    argument1 = 'set R1 ' + defaultArgument;
  } else  //arg1 exists
  {
    if (is_scalar(arg1) || (get_list_desc (arg1, [])[1].length == 0)) { // and arg1 is scalar
    var argument1 = Blockly.Assembly.valueToCode(block, 'B', order);  
    } else { //it's not scalar
      throw 'input2 to math_binary block can\'t be list';
      }
  }
    var code = argument0 + 'push R1 \n' + argument1 + 'pop R2 \n' + operator + ' R2 R1 R1\n';
  return [code,Blockly.Assembly.ORDER_ATOMIC];
};

Blockly.Assembly['math_magnitude'] = function(block) {
  // Magnitude is absolute value for scalars, square root of sum of squares for lists.
  var code;
  var targetBlock = block.getInputTargetBlock('NUM');
  if (!targetBlock) {
    code = 'set R1 R0\n';
    return [code, Blockly.Assembly.ORDER_UNARY_PREFIX];
  }
  if (is_scalar(targetBlock) || (get_list_desc (targetBlock, [])[1].length == 0)) { // and arg1 is scalar
    var argument0 = Blockly.Assembly.valueToCode(block, 'NUM', Blockly.Assembly.ORDER_ATOMIC);
    code = argument0 + 'ABS R1 R1\n';
    return [code, Blockly.Assembly.ORDER_UNARY_PREFIX];
  }
//it's a list
  console.log("in math_magnitude of list");
  var code = '';
  var list = Blockly.Assembly.valueToCode(block, 'LIST', Blockly.Assembly.ORDER_ATOMIC); // list on stack, length is TOS
  code += list + "syscall MAGR1\n"; // finds its argument on stack, leaves result in R1
  return [code, Blockly.Assembly.ORDER_UNARY_PREFIX];
}

Blockly.Assembly['math_on_list'] = function(block) {
  // Math functions for lists.
  var targetBlock = block.getInputTargetBlock('LIST');
  // first make sure input is a list. if it's a variable, it could be a scalar
  // in which case, just return the scalar (makes sense for all our math list operations)
  if (!targetBlock) {
    code = 'set R1 R0\n';
  }
  else if (is_scalar(targetBlock)){
    var val = Blockly.Assembly.valueToCode(block, 'LIST', Blockly.Assembly.ORDER_ATOMIC);
    console.log("in math_on_list: input is a scalar, value is " + val);
    code = val + "\n"; 
  }
  else {
  var func = block.getFieldValue('OP');
  var inputType = targetBlock.type;
  console.log("in math_on_list: targetBlock.type " + inputType);
  var code = '';
  ifCount++;
  
    var minus1 = gsv_next; // used to decrement list index - everyone uses this
    if (minus1 > glv_next) {
    throw 'out of register space in math_on_list';
    }
    gsv_next += 1;
    var list = Blockly.Assembly.valueToCode(block, 'LIST', Blockly.Assembly.ORDER_ATOMIC) || '[]'; 
    console.log("in math_on_list: valueToCode LIST is " + list); // input list is on stack, length is TOS
    switch (func) {
      case 'SUM':
        console.log("in math_on_list: SUM");
        var next_stack_item = gsv_next; //*** ******check to make sure this is not hitting glv_next
        if (next_stack_item > glv_next) {
          throw 'out of register space in math_on_list';
        }
        gsv_next += 1;
        code += list + "pop R1\n"; // length is in R1
        code += "pop R2\n"; // R2 will accumulate sum, initial value is first list item
        code += "set R" + minus1 + " -1\n";
        code += "SUM_label_" + ifCount + ": ADD R1 R" + minus1 + " R1\n"; //decrement R1
        code += "BTR1SNZ \n GOTO endSUM_label_" + ifCount + "\n";
        code += "pop R" + next_stack_item + "\n";
        code += "ADD R2 R" + next_stack_item + " R2\n";
        code += "GOTO SUM_label_" + ifCount + "\n";
        code += "endSUM_label_: push R2 \npop R1\n"; //result of sum is now in R1
        gsv_next--; // release next_stack_item regsiter
      break;
    case 'MIN': // get min element, leave in R1
      // because R1 is a "special register" due to BTR1SNZ, it has to be used for double duty
      // 1. to hold result of compare; 2. to hold interation counter
      console.log("in math_on_list: MIN");
      var min = gsv_next; //*** ******check to make sure this is not hitting glv_next
      if (min > glv_next) {
          throw 'out of register space in math_on_list';
        }
      gsv_next++;
      var save = gsv_next;
      if (save > glv_next) {
        throw 'out of register space in math_on_list';
      }
      gsv_next++;
      code += list + "pop R1\n"; // length is in R1
      code += "set R" + minus1 + " -1\n";
      code += "pop R" + min + "\n";
      code += "min_label_" + ifCount + ": ADD R1 R" + minus1 + " R1\n"; //decrement R1 
      code += "BTR1SNZ \n GOTO endMin_label_" + ifCount + "\n"; // if no more elements, go to end
      code += "push R1\npop R" + save + "\n"; // save counter
      code += "pop R2\n"; //get next item from stack
      code += "cmplt R2 R" + min + " R1 \n"; // R1 = 1 if Rmin must be replaced by value in R2
      code += "BTR1SNZ\n GOTO skip_label_" + ifCount + "\n"; // if Rmin must be replaced skip goto
      code += "push R2\npop R" + min + "\n"; // R2 is new Rmin
      code += "skip_label_"  + ifCount + ": push R" + save + "\npop R1\n"; // restore counter
      code += "GOTO min_label_" + ifCount + "\n";
      code += "endMin_label_: push R"+ min + "\npop R1\n"; // result of MIN is now in R1
      gsv_next -= 2; // release min and save registers
      break;
    case 'MAX': // get max element, leave in R1
      // because R1 is a "special register" due to BTR1SNZ, it has to be used for double duty
      // 1. to hold result of compare; 2. to hold interation counter
      console.log("in math_on_list: MAX");
      var max = gsv_next; //*** ******check to make sure this is not hitting glv_next
      if (max > glv_next) {
          throw 'out of register space in math_on_list';
        }
      gsv_next++;
      var save = gsv_next;
      if (save > glv_next) {
        throw 'out of register space in math_on_list';
      }
      gsv_next++;
      code += list + "pop R1\n"; // length is in R1
      code += "set R" + minus1 + " -1\n";
      code += "pop R" + max + "\n";
      code += "max_label_" + ifCount + ": ADD R1 R" + minus1 + " R1\n"; //decrement R1 
      code += "BTR1SNZ \n GOTO endmax_label_" + ifCount + "\n"; // if no more elements, go to end
      code += "push R1\npop R" + save + "\n"; // save counter
      code += "pop R2\n"; //get next item from stack
      code += "cmpgt R2 R" + max + " R1 \n"; // R1 = 1 if Rmax must be replaced by value in R2
      code += "BTR1SNZ\n GOTO skip_label_" + ifCount + "\n"; // if Rmax must be replaced skip goto
      code += "push R2\npop R" + max + "\n"; // R2 is new Rmax
      code += "skip_label_"  + ifCount + ": push R" + save + "\npop R1\n"; // restore counter
      code += "GOTO max_label_" + ifCount + "\n";
      code += "endmax_label_: push R"+ max + "\npop R1\n"; // result of max is now in R1
      gsv_next -= 2; // release max and save registers
    break;
      case 'AVERAGE': // calculate AVERAGE, leave in R1
        var next_stack_item = gsv_next; //*** ******check to make sure this is not hitting glv_next
        if (next_stack_item > glv_next) {
          throw 'out of register space in math_on_list';
        }
        gsv_next += 1;
        var  sav = gsv_next;
        if (sav > glv_next) {
          throw 'out of register space in math_on_list';
        }
        gsv_next++;
        console.log("in math_on_list: AVERAGE");
        code += list + "pop R1\n"; // length is in R1
        code += "push R1\npop R"+ sav +"\n"; //list length is used twice, sav saves it for denominator
        code += "pop R2\n"; // R2 will accumulate sum
        code += "set R" + minus1 + " -1\n";
        code += "AVG_label_" + ifCount + ": ADD R1 R" + minus1 + " R1\n"; //decrement R1
        code += "BTR1SNZ \n GOTO endAVG_label_" + ifCount + "\n";
        code += "pop R" + next_stack_item + "\n";
        code += "ADD R2 R" + next_stack_item + " R2\n";
        code += "GOTO AVG_label_" + ifCount + "\n";
        code += "endAVG_label_: DIV R2 R" + sav + " R1\n";
        gsv_next-= 2; // release next_stack_item and sav registers
      break;
    default:
      throw 'Unknown operator: ' + func;
    }
  }
  gsv_next--; // release the minus1 register
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

Blockly.Assembly['math_random_int'] = function(block) {
  // Random integer between -127 and 127.
  var code = 'Syscall RANDOM R1\n'; // TBD
  return [code, Blockly.Assembly.ORDER_UNARY_POSTFIX];
};


