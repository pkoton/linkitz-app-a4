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
 * @fileoverview Generating Dart for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Assembly.texts');

goog.require('Blockly.Assembly');


Blockly.Assembly.addReservedWords('Html,Math');

Blockly.Assembly['text'] = function(block) {
  // Text value.
  var code = Blockly.Assembly.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  var code;
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.Assembly.ORDER_NONE];
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.Assembly.valueToCode(block, 'ADD0',
        Blockly.Assembly.ORDER_NONE) || '\'\'';
    code = argument0 + '.toString()';
    return [code, Blockly.Assembly.ORDER_NONE];
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.Assembly.valueToCode(block, 'ADD' + n,
          Blockly.Assembly.ORDER_NONE) || '\'\'';
    }
    code = '[' + code.join(',') + '].join()';
    return [code, Blockly.Assembly.ORDER_NONE];
  }
};

Blockly.Assembly['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Assembly.valueToCode(block, 'TEXT',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  return varName + ' = [' + varName + ', ' + argument0 + '].join();\n';
};

Blockly.Assembly['text_length'] = function(block) {
  // String or array length.
  var argument0 = Blockly.Assembly.valueToCode(block, 'VALUE',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  return [argument0 + '.length', Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.Assembly.valueToCode(block, 'VALUE',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  return [argument0 + '.isEmpty', Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var argument0 = Blockly.Assembly.valueToCode(block, 'FIND',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.Assembly.valueToCode(block, 'VALUE',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  var code = argument1 + '.' + operator + '(' + argument0 + ') + 1';
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Assembly.valueToCode(block, 'AT',
      Blockly.Assembly.ORDER_NONE) || '1';
  var text = Blockly.Assembly.valueToCode(block, 'VALUE',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.Assembly.ORDER_NONE];
    case 'FROM_START':
      // Blockly uses one-based indicies.
      if (at.match(/^-?\d+$/)) {
        // If the index is a naked number, decrement it right now.
        at = parseInt(at, 10) - 1;
      } else {
        // If the index is dynamic, decrement it in code.
        at += ' - 1';
      }
      var code = text + '[' + at + ']';
      return [code, Blockly.Assembly.ORDER_NONE];
    case 'LAST':
      at = 1;
      // Fall through.
    case 'FROM_END':
      var functionName = Blockly.Assembly.provideFunction_(
          'text_get_from_end',
          [ 'String ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ +
              '(String text, num x) {',
            '  return text[text.length - x];',
            '}']);
      code = functionName + '(' + text + ', ' + at + ')';
      return [code, Blockly.Assembly.ORDER_NONE];
    case 'RANDOM':
      Blockly.Assembly.definitions_['import_dart_math'] =
          'import \'dart:math\' as Math;';
      var functionName = Blockly.Assembly.provideFunction_(
          'text_random_letter',
          [ 'String ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ +
              '(String text) {',
            '  int x = new Math.Random().nextInt(text.length);',
            '  return text[x];',
            '}']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.Assembly.ORDER_NONE];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.Assembly['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.Assembly.valueToCode(block, 'STRING',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Assembly.valueToCode(block, 'AT1',
      Blockly.Assembly.ORDER_NONE) || '1';
  var at2 = Blockly.Assembly.valueToCode(block, 'AT2',
      Blockly.Assembly.ORDER_NONE) || '1';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else {
    var functionName = Blockly.Assembly.provideFunction_(
        'text_get_substring',
        [ 'function ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ +
            '(text, where1, at1, where2, at2) {',
          '  function getAt(where, at) {',
          '    if (where == \'FROM_START\') {',
          '      at--;',
          '    } else if (where == \'FROM_END\') {',
          '      at = text.length - at;',
          '    } else if (where == \'FIRST\') {',
          '      at = 0;',
          '    } else if (where == \'LAST\') {',
          '      at = text.length - 1;',
          '    } else {',
          '      throw \'Unhandled option (text_getSubstring).\';',
          '    }',
          '    return at;',
          '  }',
          '  at1 = getAt(where1, at1);',
          '  at2 = getAt(where2, at2) + 1;',
          '  return text.substring(at1, at2);',
          '}']);
    var code = functionName + '(' + text + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var code;
  if (operator) {
    // Upper and lower case are functions built into Dart.
    var argument0 = Blockly.Assembly.valueToCode(block, 'TEXT',
        Blockly.Assembly.ORDER_NONE) || '\'\'';
    code = argument0 + operator;
  } else {
    // Title case is not a native Dart function.  Define one.
    var functionName = Blockly.Assembly.provideFunction_(
        'text_toTitleCase',
        [ 'String ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ +
            '(String str) {',
          '  RegExp exp = new RegExp(r\'\\b\');',
          '  List<String> list = str.split(exp);',
          '  final title = new StringBuffer();',
          '  for (String part in list) {',
          '    if (part.length > 0) {',
          '      title.write(part[0].toUpperCase());',
          '      if (part.length > 0) {',
          '        title.write(part.substring(1).toLowerCase());',
          '      }',
          '    }',
          '  }',
          '  return title.toString();',
          '}']);
    var argument0 = Blockly.Assembly.valueToCode(block, 'TEXT',
        Blockly.Assembly.ORDER_NONE) || '\'\'';
    code = functionName + '(' + argument0 + ')';
  }
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': '.replaceFirst(new RegExp(r\'^\\s+\'), \'\')',
    'RIGHT': '.replaceFirst(new RegExp(r\'\\s+$\'), \'\')',
    'BOTH': '.trim()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.Assembly.valueToCode(block, 'TEXT',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  return [argument0 + operator, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.Assembly.valueToCode(block, 'TEXT',
      Blockly.Assembly.ORDER_NONE) || '\'\'';
  return 'print(' + argument0 + ');\n';
};

Blockly.Assembly['text_prompt_ext'] = function(block) {
  // Prompt function.
  Blockly.Assembly.definitions_['import_dart_html'] =
      'import \'dart:html\' as Html;';
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.Assembly.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.Assembly.valueToCode(block, 'TEXT',
        Blockly.Assembly.ORDER_NONE) || '\'\'';
  }
  var code = 'Html.window.prompt(' + msg + ', \'\')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    Blockly.Assembly.definitions_['import_dart_math'] =
        'import \'dart:math\' as Math;';
    code = 'Math.parseDouble(' + code + ')';
  }
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['text_prompt'] = Blockly.Assembly['text_prompt_ext'];
