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
  var code = '';
  var number_arg = parseFloat(block.getFieldValue('NUM'));
  var order;
  if (number_arg == Infinity) {
    code = 'double.INFINITY';
    order = Blockly.Assembly.ORDER_NONE;
  } else if (number_arg == -Infinity) {
    code = '-double.INFINITY';
    order = Blockly.Assembly.ORDER_NONE;
  } 
  code += 'set R1 '+ number_arg + '\n';
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var code = '; starting math_arithmetic\n';
  var OPERATORS = {
    'ADD': ['ADD', Blockly.Assembly.ORDER_NONE],
    'MINUS': ['SUB', Blockly.Assembly.ORDER_NONE],
    'MULTIPLY': ['MUL', Blockly.Assembly.ORDER_NONE],
    'DIVIDE': ['DIV', Blockly.Assembly.ORDER_NONE],
    'POWER': ['POW', Blockly.Assembly.ORDER_NONE]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var defaultArgument = ((operator == 'ADD')||(operator == 'MINUS')) ? 'R0' : '1';
  var arg1usesR1, arg2usesR1 = 0;
  var arg1 = block.getInputTargetBlock('A');
  var arg2 = block.getInputTargetBlock('B');
  if ((!arg1) && (!arg2)){
    return ['',Blockly.Assembly.ORDER_NONE]; // no-op
  }
  // begin special case to save user code space by using additive and multiplicative identity
  if (arg1.type == 'math_number'){
    // console.log("x1");
    var number_arg1 = parseFloat(arg1.getFieldValue('NUM'));
    // console.log("number_arg = " + number_arg1);
    if (((number_arg1 == 0) && (operator == 'ADD')) || ((number_arg1 == 1) && (operator == 'MUL'))) { // additive/multiplicative identity
        if (is_scalar(arg2) || (get_list_desc (arg2, [])[1].length == 0)) { // and arg2 is scalar
          if (arg2.type == 'variables_get') {
            var varName2 = Blockly.Assembly.variableDB_.getName(arg2.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
            var in_GSV2 = global_scalar_variables.indexOf(varName2); // if in global_scalar_variable
            if (in_GSV2 >= 0) {
              code += "LoadR1from R" + in_GSV2 +"\n"; // Rsrc2 is R + in_GSV, put it in R1
              return [code,Blockly.Assembly.ORDER_NONE];
            } else {
                throw("Error 1 in math_arithmetic");
                }
          }
          else {
            var argument2 = Blockly.Assembly.valueToCode(block, 'B', order); // Rsrc2 is in R1
            code += argument2 + "\n";
            return [code,Blockly.Assembly.ORDER_NONE];
          }
      } else { //it's not scalar
        throw 'input2 to math_arithmetic block can\'t be a list';
        }
    }
    else if ((number_arg1 == 0)  && (operator == 'MUL')) { // mult by zero = 0
      code += "Set R1 0\n"
      code += '; ending math_arithmetic\n';
      return [code,Blockly.Assembly.ORDER_NONE];
    }
  } // end if (arg1_type == 'math_number')
  if (arg2.type == 'math_number'){
    var number_arg2 = parseFloat(arg2.getFieldValue('NUM'));
    if ((number_arg2 == 0) && (operator == 'DIV')) {
      throw("Divide by zero error in math_arithmetic");
    } 
    else if (((number_arg2 == 0) && (operator == 'ADD')) || ((number_arg2 == 1) && ((operator == 'MUL') || (operator == 'DIV')))) { // additive/multiplicative identity
      if (is_scalar(arg1) || (get_list_desc (arg1, [])[1].length == 0)) { // and arg1 is scalar
        if (arg1.type == 'variables_get') {
          var varName1 = Blockly.Assembly.variableDB_.getName(arg1.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
          var in_GSV2 = global_scalar_variables.indexOf(varName1); // if in global_scalar_variable
          if (in_GSV2 >= 0) {
            code += "LoadR1from R" + in_GSV2 +"\n"; // Rsrc2 is R + in_GSV, put it in R1
            return [code,Blockly.Assembly.ORDER_NONE];
          } else {
              throw("Error 1 in math_arithmetic");
              }
        }
        else {
          var argument1 = Blockly.Assembly.valueToCode(block, 'A', order); // Rsrc2 is in R1
          code += argument1 + "\n";
          return [code,Blockly.Assembly.ORDER_NONE];
        }
    } else { //it's not scalar
      throw 'input2 to math_arithmetic block can\'t be a list';
      }
    }
    else if ((number_arg2 == 0)  && (operator == 'MUL')) { // mult by zero = 0
      code += "Set R1 0\n"
      code += '; ending math_arithmetic\n';
      return [code,Blockly.Assembly.ORDER_NONE];
    }
  } 
  // end of special case
  if (!arg1) {
    var argument1 = 'set R1 '+ defaultArgument + '\n'; // treat as identity
    arg1usesR1 = 1;
  } else //arg1 exists
  {
    if (is_scalar(arg1) || (get_list_desc (arg1, [])[1].length == 0)) { // and arg1 is scalar
      // if arg2 is in GSV just us that register
      if (arg1.type == 'variables_get') {
        console.log("here0");
        var varName1 = Blockly.Assembly.variableDB_.getName(arg1.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        var in_GSV1 = global_scalar_variables.indexOf(varName1); // if in global_scalar_variable
          if (in_GSV1 >= 0) {
            var argument1 = "R" + in_GSV1; // Rsrc1 is in R+in_GSV
          } else {
              throw("Error 2 in math_arithmetic");
            }
      }
        else {
          console.log("here1");
          var argument1 = Blockly.Assembly.valueToCode(block, 'A', order); // Rsrc1 is in R1
          console.log("argument1 = " +argument1);
          arg1usesR1 = 1;
        }
    }
    else { //it's not scalar
    throw 'input1 to math_arithmetic block can\'t be a list';
    }
  }
  if (!arg2) { //blank input
    var argument2 = 'set R1 '+ defaultArgument + '\n'; // treat as identity
    arg2usesR1 = 1;
  } else  //arg2 exists
  {
    if (is_scalar(arg2) || (get_list_desc (arg2, [])[1].length == 0)) { // and arg2 is scalar
    if (arg2.type == 'variables_get') {
      console.log("here2");
      var varName2 = Blockly.Assembly.variableDB_.getName(arg2.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
      var in_GSV2 = global_scalar_variables.indexOf(varName2); // if in global_scalar_variable
        if (in_GSV2 >= 0) {
          var argument2 = "R" + in_GSV2; // Rsrc2 is R + in_GSV
        }
    }
        else {
          console.log("here2a");
          var argument2 = Blockly.Assembly.valueToCode(block, 'B', order); // Rsrc2 is in R1
          console.log("argument2 = " +argument2);
          arg2usesR1=1;
        }
    } else { //it's not scalar
      throw 'input2 to math_arithmetic block can\'t be a list';
      }
  }
  if ((arg1usesR1==1) && (arg2usesR1==1)) {
    console.log("here3");
    code += argument1 + 'push R1 \n' + argument2 + 'pop R2 \n' + operator + ' R2 R1 R1\n'; //  note: Rsrc1 is in R2
    code += '; ending math_arithmetic\n';
    return [code,Blockly.Assembly.ORDER_NONE];
  }
  if (arg1usesR1==1) {
    var code = argument1 + operator + ' R1 R' +  in_GSV2 + ' R1\n'; // Rsrc1 is in R1
    code += '; ending math_arithmetic\n';
    return [code,Blockly.Assembly.ORDER_NONE];
  }
  if (arg2usesR1==1) {
    var code = argument2 + operator + ' R' +  in_GSV1 + ' R1 R1\n'; // note: Rscr2 is in R1
    code += '; ending math_arithmetic\n';
    return [code,Blockly.Assembly.ORDER_NONE];
  }
  var code =operator + ' R' +  in_GSV1 + ' R' +  in_GSV2 + ' R1\n'; // => oper Rsrc1 Rsrc2 R1
  code += '; ending math_arithmetic\n';
  return [code,Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['math_binary'] = function(block) {
  // Bitwise AND and Bitwise OR
  var code = '; starting math_binary\n';
  var OPERATORS = {
    'BITWISEAND': ['band3', Blockly.Assembly.ORDER_NONE],
    'BITWISEOR': ['bor3', Blockly.Assembly.ORDER_NONE]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var defaultArgument = (operator == 'band3') ? '127\n' : 'R0\n';
  var arg0 = block.getInputTargetBlock('A');
  var arg1 = block.getInputTargetBlock('B');
  if ((!arg0) && (!arg1)) { // no args returns false
    code += 'set R1 R0\n';
    code += '; ending math_binary\n';
    return [code,Blockly.Assembly.ORDER_NONE];
  }
  if (!arg0) {
    argument0 = 'set R1 ' + defaultArgument;
  } else //arg0 exists
  {
    if (is_scalar(arg0) || (get_list_desc (arg0, [])[1].length == 0)) { // and arg1 is scalar
    var argument0 = Blockly.Assembly.valueToCode(block, 'A', order);
    }
    else { //it's not scalar
    throw 'input1 to math_binary block can\'t be a list';
    }
  }
  if (!arg1) { //blank input
    argument1 = 'set R1 ' + defaultArgument;
  } else  //arg1 exists
  {
    if (is_scalar(arg1) || (get_list_desc (arg1, [])[1].length == 0)) { // and arg1 is scalar
    var argument1 = Blockly.Assembly.valueToCode(block, 'B', order);  
    } else { //it's not scalar
      throw 'input2 to math_binary block can\'t be alist';
      }
  }
    code += argument0 + 'loadR1to R2\n' + argument1 + '\n' + operator + ' R2 R1 R1\n';
    code += '; ending math_binary\n';
    return [code,Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['math_magnitude'] = function(block) {
  // Magnitude is absolute value for scalars, square root of sum of squares for lists.
  var code = '; starting math_magnitude\n';
  var targetBlock = block.getInputTargetBlock('NUM');
  if (!targetBlock) {
    code += 'set R1 R0\n';
    code += '; ending math_magnitude\n';
    return [code, Blockly.Assembly.ORDER_NONE];
  }
  if (is_scalar(targetBlock) || (get_list_desc (targetBlock, [])[1].length == 0)) { // and arg1 is scalar
    var argument0 = Blockly.Assembly.valueToCode(block, 'NUM', Blockly.Assembly.ORDER_NONE);
    code += argument0 + 'ABS R1 R1\n';
    code += '; ending math_magnitude\n';
    return [code, Blockly.Assembly.ORDER_NONE];
  }
//it's a list
  console.log("in math_magnitude of list");
  var list = Blockly.Assembly.valueToCode(block, 'LIST', Blockly.Assembly.ORDER_NONE); // list on stack, length is TOS
  code += list + "syscall MAGR1\n"; // finds its argument on stack, leaves result in R1
  code += '; ending math_magnitude\n';
  return [code, Blockly.Assembly.ORDER_NONE];
}

Blockly.Assembly['math_on_list'] = function(block) { // if list elements are themselves lists, they are flattened
  // Math functions for lists.
  var code = '; starting math_on_list\n';
  var targetBlock = block.getInputTargetBlock('LIST');
  // handle null input - return 0
  if (!targetBlock) {
    console.log("here: math_on_list 1");
    code += 'set R1 R0\n';
  }
  else
  // handle scalar input. Just return the scalar (makes sense for all our math list operations)
  if (is_scalar(targetBlock)){
    var val = Blockly.Assembly.valueToCode(block, 'LIST', Blockly.Assembly.ORDER_NONE);
    console.log("in math_on_list: input is a scalar, value is " + val);
    code += val + "\n"; 
  }
  else {
  var func = block.getFieldValue('OP');
  var inputType = targetBlock.type;
  console.log("in math_on_list: targetBlock.type " + inputType);
  ifCount++;
  
    var minus1 = gsv_next; // used to decrement list index - everyone uses this
    if (minus1 > glv_next) {
    throw 'out of register space in math_on_list';
    }
    gsv_next += 1;
    var list = Blockly.Assembly.valueToCode(block, 'LIST', Blockly.Assembly.ORDER_NONE) || '[]'; 
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
        code += "SUM_label_" + ifCount + ":\n ADD R1 R" + minus1 + " R1\n"; //decrement R1
        code += 'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
        code += " GOTO endSUM_label_" + ifCount + "\n";
        code += "pop R" + next_stack_item + "\n";
        code += "ADD R2 R" + next_stack_item + " R2\n";
        code += "GOTO SUM_label_" + ifCount + "\n";
        code += "endSUM_label_" + ifCount + ":\n LOADR1FROM R2\n"; //result of sum is now in R1
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
      code += "min_label_" + ifCount + ":\n ADD R1 R" + minus1 + " R1\n"; //decrement R1 
      code += 'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
      code += " GOTO endMin_label_" + ifCount + "\n"; // if no more elements, go to end
      code += 'LOADR1TO R' + save + "\n"; // save counter
      code += "pop R2\n"; //get next item from stack
      code += "cmplt R2 R" + min + " R1 \n"; // R1 = 1 if Rmin must be replaced by value in R2
      code += 'BTR1SNZ\n; skip next instruction if R1 is non-zero\n'; 
      code += ' GOTO skip_label_' + ifCount + '\n'; // if Rmin must be replaced skip goto
      code += "push R2\npop R" + min + "\n"; // R2 is new Rmin
      code += "skip_label_"  + ifCount + ":\n loadR1from R" + save + "\n"; // restore counter
      code += "GOTO min_label_" + ifCount + "\n";
      code += "endMin_label_" + ifCount + ":\n loadR1from R"+ min + "\n"; // result of MIN is now in R1
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
      code += "max_label_" + ifCount + ":\n ADD R1 R" + minus1 + " R1\n"; //decrement R1 
      code += 'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
      code += " GOTO endmax_label_" + ifCount + "\n"; // if no more elements, go to end
      code += "LoadR1to R" + save + "\n"; // save counter
      code += "pop R2\n"; //get next item from stack
      code += "cmpgt R2 R" + max + " R1 \n"; // R1 = 1 if Rmax must be replaced by value in R2
      code += 'BTR1SNZ\n; skip next instruction if R1 is non-zero\n'; 
      code += ' GOTO skip_label_' + ifCount + '\n'; // if Rmax must be replaced skip goto
      code += "push R2\npop R" + max + "\n"; // R2 is new Rmax
      code += "skip_label_"  + ifCount + ":\n push R" + save + "\npop R1\n"; // restore counter
      code += "GOTO max_label_" + ifCount + "\n";
      code += "endmax_label_" + ifCount + ":\n LoadR1from R"+ max + "\npop R1\n"; // result of max is now in R1
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
        code += "loadR1to R"+ sav +"\n"; //list length is used twice, sav saves it for denominator
        code += "pop R2\n"; // R2 will accumulate sum
        code += "set R" + minus1 + " -1\n";
        code += "AVG_label_" + ifCount + ":\n ADD R1 R" + minus1 + " R1\n"; //decrement R1
        code += 'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
        code += ' GOTO endAVG_label_' + ifCount + '\n';
        code += "pop R" + next_stack_item + "\n";
        code += "ADD R2 R" + next_stack_item + " R2\n";
        code += "GOTO AVG_label_" + ifCount + "\n";
        code += "endAVG_label_" + ifCount + ":\n DIV R2 R" + sav + " R1\n";
        gsv_next-= 2; // release next_stack_item and sav registers
      break;
    default:
      throw 'Unknown operator: ' + func;
    }
  }
  gsv_next--; // release the minus1 register
  code += '; ending math_on_list\n';
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['math_random_int'] = function(block) {
  // Random integer between -127 and 127.
  var code = 'Syscall RANDOM R1\n'; // TBD
  return [code, Blockly.Assembly.ORDER_NONE];
};


