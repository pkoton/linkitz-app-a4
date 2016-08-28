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
 * @fileoverview Generating Linkitz assembly code for variable blocks.
 * This is based on the Dart generator
 * written by @author fraser@google.com (Neil Fraser)
 * Modified by lyssa@linkitz.com (Lyssa Neel)
 */
'use strict';

goog.provide('Blockly.Dart.variables');

goog.require('Blockly.Dart');


Blockly.Dart['variables_get'] = function(block) {
  // Variable getter.
  var varName = Blockly.Dart.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  alert("in variables_get: name is " + varName);
  var varName_undef = 1;
  var is_scalar = global_scalar_variables.indexOf(varName); // is it in global_scalar_variables
  if (is_scalar >= 0) {
    varName_undef = 0;
    var code = 'push R' + is_scalar + '\npop R1\n';  
  } else 
    for (var i=0; i < global_list_variables.length; i++) {
      if (global_list_variables[i] && Array.isArray(global_list_variables[i])) {
        var is_list = global_list_variables[i].indexOf(varName); // is it in global_list_variables
        if (is_list >= 0) {
          varName_undef = 0;
          var code = 'push R' + i + '\npop R1\n';
        }
     }
    }
  if (varName_undef) {                                                // variable value has not been set yet
    alert('in variables_get: ' + varName + ' is undefined');
    var code = varName  + ' UNDEFINED\n';
  }
  return [code, Blockly.Dart.ORDER_ATOMIC];
}

Blockly.Dart['variables_set'] = function(block) {
  // Variable setter
  var argument0 = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  var targetBlock = block.getInputTargetBlock('VALUE');
  var inputType = targetBlock.type;
  var varName = Blockly.Dart.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  alert("in variables_set: input is of type " + inputType + ", varName is " + varName + ", value is " + argument0);
  
  if (inputType == 'colour_picker') { // color RGB is in scratch color registers, R: R16, G: R17, B: R18
    var found = find_in_GLV(varName);
    if (found >= 0) { // variable already defined
      alert("in variables_set, list variable " + varName + " already defined at R" + found);
      var code = argument0 + list_copy(16, (found + 1), 3);
    } else {
      var new_current = list_current - 4; // we know color list length is 3 registers but
      var code = argument0 + list_copy(16, new_current + 1,3); // for colors you only have to copy the RGB not the size 
      global_list_variables[new_current] = [varName,4];
      list_current = new_current;
      alert("in variables_set: GLV pointer at " + list_current + ", global_list_variables now contains " + global_list_variables[new_current]);
      }
    }
  else if (inputType == 'math_number') { // value is in R1
    var found = global_scalar_variables.indexOf(varName);
    alert(global_scalar_variables.indexOf(varName));
    if (found >= 0) { // variable already defined
      alert("in variables_set, scalar variable " + varName + " already defined at R" + found);
      var code = 'Push R1\nPop R' + found + '\n';
      } else {
        global_scalar_variables[gsv_next] = varName;
        alert("in variables_set: GSV pointer now is " + global_scalar_variables[gsv_next]);
        var code = argument0 + 'Push R1\nPop R' + gsv_next + '\n';  //TODO what if it is a list but not a color? *********
        gsv_next++;
    }  
  } else { // variable is set to another variable v
    // look for v in GSV list, index >=0 will tell you which register the value is in,
    // put value in R gsv_next and varName in GSV list
    // else call find_in_GLV, if present, list_copy the values to R list_current-3 and [varname, length]in GLV list
    // other wise its undefined (or its set to yet another variable...how to keep going?)
  }
  return code; 
};
 
 // copy a list of length l from one set of l registers to another set of l registers using push/pop
 function list_copy(old_ptr, new_ptr, l) {
    var local_code = '';
    // you don't need to copy the address pointer (lowest register)
    // it will already have been set in and is non-mutable
    for (var i = 0; i < l; i++) {
     local_code = local_code + "Push R" + old_ptr + "\n Pop R" + new_ptr + "\n";
     global_list_variables[new_ptr] = global_list_variables[old_ptr];
     old_ptr++;
     new_ptr++;
    }
    return local_code;
 }
 
 // copy a list of length l from one set of l registers to another set of l registers using rcopy
 function list_rcopy(old_ptr, new_ptr, l) {
    var local_code = '';
    for (var i = 0; i < l; i++) {
     local_code = local_code + "rcopy R" + new_ptr + " R" + old_ptr + "\n";
     global_list_variables[new_ptr] = global_list_variables[old_ptr];
     old_ptr++;
     new_ptr++;
    }
    return local_code;
 }
 
 // pretty print the contents of a multidimensional array
 function mdarray_pp(a){
  var contents = '';
  for (var i=0; i < a.length; i++) {
    if (a[i] && Array.isArray(a[i])) {
      contents = contents + "[" + a[i].join(",") + "] ";
      }
    else if (typeof a[i] != 'undefined') {
      contents = contents + a[i] + ",";
      }
      else {
      contents += "."
     }
  }
  return(contents);
 }
 
 // generate the assembly code to set headdr and maxsize of each global list variable
 // (to be printed at initialization )
 function initialize_lists(){
  var contents = '';
  for (var i=0; i < global_list_variables.length; i++) {
    if (global_list_variables[i] && Array.isArray(global_list_variables[i])) {
      contents = contents + "Set R" + i + " " + (global_list_variables[i][1] -1) + "\n"; 
      }   
  }
  return(contents);
 }
 
 
 //for memory management purposes, print all Linkitz variables and the # of registers each uses
 function print_linkitz_vars(){
  alert("list_current "+ list_current + ", gsv_next "+ gsv_next);
  var linkitz_vars = '';
  var gsv_length = global_scalar_variables.length
    for (var i=0; i < gsv_length; i++) {
    linkitz_vars += 'R'+ i + ' [' + global_scalar_variables[i] + ',1]\n'; 
    }
    for (var j = gsv_next; j < list_current; j++) {
    linkitz_vars += 'R'+ j + ' .\n';  
    }
    for (var k = list_current; k < global_list_variables.length; k++) {
    if (Array.isArray(global_list_variables[k])) {
     linkitz_vars +=  'R' + k + ' [' + global_list_variables[k] + ']\n';
    }
      else linkitz_vars += 'R'+ k + ' .\n';
    }
    return linkitz_vars;
 }
 
 // search global_list_variables for varName, if found return the index of the item
 function find_in_GLV(varName){
  var varName_undef = -1;
  alert("list_current = " + list_current)
  for (var i=list_current; i < (scratchColor +3); i++) {
      if (global_list_variables[i] && Array.isArray(global_list_variables[i])) {
        alert("in find_in_GLV i = " + i);
        var found = global_list_variables[i].indexOf(varName); // is it in global_list_variables
        alert("global_list_variables[i].indexOf(varName) = " + global_list_variables[i].indexOf(varName));
        if (found > - 1) {
          alert("in find_in_GLV found at " + i);
          return i;
        }
      }
  }
  return varName_undef;
 }
