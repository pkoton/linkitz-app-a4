/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Helper functions for generating Python for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Assembly');

goog.require('Blockly.Generator');


/**
 * Python code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Assembly = new Blockly.Generator('Assembly');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Assembly.addReservedWords(
    'syscall,exit,set_reg_event_speed,flashhue,getmotiondata,flashrgb,set,goto,push,pop,band3,bor3,add,sub,mul,div,pow,'+
    //FIXME When we;re done we can remove the following which applies to dart and not to Linkitz assembly

    // import keyword
    // print ','.join(keyword.kwlist)
    // http://docs.python.org/reference/lexical_analysis.html#keywords
    'and,as,assert,break,class,continue,def,del,elif,else,except,exec,finally,for,from,global,if,import,in,is,lambda,not,or,pass,print,raise,return,try,while,with,yield,' +
    //http://docs.python.org/library/constants.html
    'True,False,None,NotImplemented,Ellipsis,__debug__,quit,exit,copyright,license,credits,' +
    // http://docs.python.org/library/functions.html
    'abs,divmod,input,open,staticmethod,all,enumerate,int,ord,str,any,eval,isinstance,pow,sum,basestring,execfile,issubclass,print,super,bin,file,iter,property,tuple,bool,filter,len,range,type,bytearray,float,list,raw_input,unichr,callable,format,locals,reduce,unicode,chr,frozenset,long,reload,vars,classmethod,getattr,map,repr,xrange,cmp,globals,max,reversed,zip,compile,hasattr,memoryview,round,__import__,complex,hash,min,set,apply,delattr,help,next,setattr,buffer,dict,hex,object,slice,coerce,dir,id,oct,sorted,intern' +

 // https://www.dartlang.org/docs/spec/latest/dart-language-specification.pdf
    // Section 16.1.1
    'assert,break,case,catch,class,const,continue,default,do,else,enum,extends,false,final,finally,for,if,in,is,new,null,rethrow,return,super,switch,this,throw,true,try,var,void,while,with,' +
    // https://api.dartlang.org/dart_core.html
    'print,identityHashCode,identical,BidirectionalIterator,Comparable,double,Function,int,Invocation,Iterable,Iterator,List,Map,Match,num,Pattern,RegExp,Set,StackTrace,String,StringSink,Type,bool,DateTime,Deprecated,Duration,Expando,Null,Object,RuneIterator,Runes,Stopwatch,StringBuffer,Symbol,Uri,Comparator,AbstractClassInstantiationError,ArgumentError,AssertionError,CastError,ConcurrentModificationError,CyclicInitializationError,Error,Exception,FallThroughError,FormatException,IntegerDivisionByZeroException,NoSuchMethodError,NullThrownError,OutOfMemoryError,RangeError,StackOverflowError,StateError,TypeError,UnimplementedError,UnsupportedError');

/**
 * Order of operation ENUMs.
 * https://www.dartlang.org/docs/dart-up-and-running/ch02.html#operator_table
 */
Blockly.Assembly.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Assembly.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] .
Blockly.Assembly.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Blockly.Assembly.ORDER_EXPONENTIATION = 3;
Blockly.Assembly.ORDER_MULTIPLICATIVE = 4; // * / % ~/
Blockly.Assembly.ORDER_ADDITIVE = 5;       // + -
Blockly.Assembly.ORDER_SHIFT = 6;          // << >>
Blockly.Assembly.ORDER_BITWISE_AND = 7;    // &
Blockly.Assembly.ORDER_BITWISE_XOR = 8;    // ^
Blockly.Assembly.ORDER_BITWISE_OR = 9;     // |
Blockly.Assembly.ORDER_RELATIONAL = 10;     // >= > <= < as is is!
Blockly.Assembly.ORDER_EQUALITY = 11;      // == !=
Blockly.Assembly.ORDER_LOGICAL_AND = 12;   // &&
Blockly.Assembly.ORDER_LOGICAL_OR = 13;    // ||
Blockly.Assembly.ORDER_CONDITIONAL = 14;   // expr ? expr : expr
Blockly.Assembly.ORDER_CASCADE = 15;       // ..
Blockly.Assembly.ORDER_ASSIGNMENT = 16;    // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.Assembly.ORDER_NONE = 99;          // (...)

Blockly.Assembly.INDENT = '   ';
Blockly.Assembly.STATEMENT_PREFIX = null;

//******************* LINKITZ STUFF *******************

var debug = 0;

// Linkitz SPECIAL REGISTERS R0 - R127 ARE SET HERE

// We maintain a dictionary of all global_list_variables
// each element is a list of [head_address,list_length,item_length]
// global_list_variables builds DOWN from R127 to R0
// e.g. (118,10,3) starts at R118 and has three items each of which takes up 3 registers, plus the first element that stores the length

var glv_next = 127; // glv_next points to the empty register at the bottom of list register space
var global_list_variables = new Object();
//console.log("new glv");

// We maintain an array of all global_scalar_variables.
// The variable_name's index in the array indicates the register number which holds the value
// e.g. the variable_name in global_scalar_variables[5] has its value stored in R5
// the first three registers are special.
// R0 is null/zero.
// R1 and R2 are used as scratch registers.
// global_scalar_variables builds UP from R0 to R127

var global_scalar_variables = [];
//console.log("new gsv");
global_scalar_variables[0] = 'zero'; // R0
global_scalar_variables[1] = 'scratch1'; // R1
global_scalar_variables[2] = 'scratch2'; // R2
global_scalar_variables[3] = 'led_attached'; // R3
global_scalar_variables[4] = 'usb_attached'; // R4
global_scalar_variables[5] = 'motion_attached'; // R5
global_scalar_variables[6] = 'batterylevel'; // R6
global_scalar_variables[7] = 'ambientlight'; // R7

var gsv_next = 8 // gsv_next points to the next empty register index
var global_scalar_variables_pp =''; // string for pretty printing the GSV list

// proc_types indexed by name of each user-defined function that returns a value
// proc_types[procName][0] = 0 if proc returns scalar, = 1 if proc returns a list
// proc_types[procName][1] = length of register space taken by list values (0 if proc returns a scalar)
var proc_types = new Object(); 
var pnext = 0;

var mask = 14; // 00001110 corresponding to ports 1,2,3 for checking if a specific type link is attached

// undef_vars list holds the names of variables that are used before generator has seen their value
// once value is set, variable name is moved to correct global variable list (scalar or list)
var undef_vars = [];
var undef_vars_next = 0;

var ifCount = 0; //global var for generating unique labels for conditionals

 /* Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Assembly.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Assembly.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Assembly.functionNames_ = Object.create(null);
  
  if (!Blockly.Assembly.variableDB_) {
    Blockly.Assembly.variableDB_ =
        new Blockly.Names(Blockly.Assembly.RESERVED_WORDS_);
  } else {
    Blockly.Assembly.variableDB_.reset();
  }

  var defvars = [];
  var variables = Blockly.Variables.allVariables(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars[i] = 'var ' +
        Blockly.Assembly.variableDB_.getName(variables[i],
        Blockly.Variables.NAME_TYPE) + ';';
  }
  Blockly.Assembly.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Assembly.finish = function(code) {
  // Indent every line.
  
  if (code) {
    global_scalar_variables_pp = global_scalar_variables.join(',');
    code = 'global_scalar_variables=['+ global_scalar_variables_pp + ']\n' + code;
    // code = Blockly.Assembly.prefixLines(code, Blockly.Assembly.INDENT);
    // var global_list_variables_pp = global_list_variables.join('\n');
     var global_list_variables_pp = JSON.stringify(global_list_variables);
    code = 'global_list_variables=['+ global_list_variables_pp + ']\n' + code;
  }

  // Convert the definitions dictionary into a list.
  var imports = [];
  var definitions = [];
  for (var name in Blockly.Assembly.definitions_) {
    var def = Blockly.Assembly.definitions_[name];
    if (def.match(/^import\s/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }
  // Clean up temporary data.
  delete Blockly.Assembly.definitions_;
  delete Blockly.Assembly.functionNames_;
  Blockly.Assembly.variableDB_.reset();
  // var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  var allDefs = imports.join('\n');
  return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Assembly.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Dart string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Dart string.
 * @private
 */
Blockly.Assembly.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\$/g, '\\$')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating Dart from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Dart code created for this block.
 * @return {string} Dart code with comments and subsequent blocks added.
 * @private
 */
Blockly.Assembly.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Assembly.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Assembly.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Assembly.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  // alert("blockToCode called");
  var nextCode = Blockly.Assembly.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
