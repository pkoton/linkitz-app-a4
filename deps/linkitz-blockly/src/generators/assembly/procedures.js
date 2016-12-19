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
 * @fileoverview Generating Dart for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Assembly.procedures');

goog.require('Blockly.Assembly');

Blockly.Assembly['procedures_defreturn'] = function(block) {
  if (debug) {alert('in procedures def [no] return')};
  // Define a procedure with a return value.
  var funcName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Assembly.statementToCode(block, 'STACK');
  if (Blockly.Assembly.STATEMENT_PREFIX) {
    branch = Blockly.Assembly.prefixLines(
        Blockly.Assembly.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Assembly.INDENT) + branch;
  }
  if (Blockly.Assembly.INFINITE_LOOP_TRAP) {
    branch = Blockly.Assembly.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Assembly.valueToCode(block, 'RETURN',
      Blockly.Assembly.ORDER_NONE) || '';
  if (returnValue) {
    // add proc name and return type to procs[funcName]
    //var type;
    //var item = this.getInputTargetBlock('VALUE');
    //  if (item) {
    //    type = item.getOutput();
    //    }
    returnValue = Blockly.Assembly.INDENT +  returnValue + ';\nsyscall return R1\n'; // value in R1
  }
    else {
    returnValue = Blockly.Assembly.INDENT + 'syscall return R0\n';  // no returned value, just return R0
    }
  var returnType = returnValue ? 'dynamic' : 'void'; // we don't use this ATM
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Assembly.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code =  funcName + //'(' + args.join(', ') + ') {\n'
   ':\n' + branch + returnValue ;
if (debug) {alert('procedure code is ' + code)};
  code = Blockly.Assembly.scrub_(block, code);
  Blockly.Assembly.definitions_[funcName] = code;
  return code;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Assembly['procedures_defnoreturn'] = Blockly.Assembly['procedures_defreturn'];

Blockly.Assembly['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  if (block.arguments_.length==0) {
    // called with no args
    var code = 'fcall ' + funcName + '\n';
  }
  else {
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Assembly.valueToCode(block, 'ARG' + x,
        Blockly.Assembly.ORDER_NONE) || 'null';
  }
  // if there are args they have to be pushed on the stack - to be written!
  var code = funcName + '(' + args.join(', ') + ')';
  }
  return [code, Blockly.Assembly.ORDER_UNARY_POSTFIX];
};

Blockly.Assembly['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  if (block.arguments_.length==0) {
    // called with no args
    var code = 'syscall fcall ' + funcName + '\n';
  }
  else {
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Assembly.valueToCode(block, 'ARG' + x,
        Blockly.Assembly.ORDER_NONE) || 'null';
    }
  // if there are args they have to be pushed on the stack - to be written!
    var code = 'syscall fcall ' + funcName + '(' + args.join(', ') + ');\n';
  }
  return code;
};

Blockly.Assembly['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Assembly.valueToCode(block, 'CONDITION',
      Blockly.Assembly.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Assembly.valueToCode(block, 'VALUE',
        Blockly.Assembly.ORDER_NONE) || 'null';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
