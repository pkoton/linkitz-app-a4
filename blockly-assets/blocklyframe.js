// blocklyframe.js

blocklyMessageHandlers = {
    setBlocklyXML: function setBlocklyXML(arg) {
        var xml = Blockly.Xml.textToDom(arg);
        Blockly.mainWorkspace.clear();
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    },
    setBlocklyHighlight: function setBlocklyHighlight (arg) {
        var blockId = arg;
        Blockly.mainWorkspace.traceOn(true);
        Blockly.mainWorkspace.highlightBlock(blockId);
    },
    clearBlocklyHighlight: function clearBlocklyHighlight (arg) {
        Blockly.mainWorkspace.traceOn(true);
        Blockly.mainWorkspace.highlightBlock(null);
    },
    generateBlocklyCode: function generateBlocklyCode (arg) {
        onBlocklyGenerate();
    }
}

function receiveMessage(event) {
    var eventData = event.data;
    var handlerMethod = blocklyMessageHandlers[eventData.method];
    var arg = eventData.arg;

    if (handlerMethod) {
        handlerMethod(arg);
    }
}

function onBlocklyChanged() {
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xmlDump = Blockly.Xml.domToPrettyText(xml);
    window.parent.postMessage({method: 'onBlocklyChanged', arg: xmlDump}, '*');
}

function onBlocklyLoaded() {
    window.parent.postMessage({method: 'onBlocklyLoaded'}, '*');
}

function onBlocklyGenerate() {
    var code = Blockly.Dart.workspaceToCode(Blockly.mainWorkspace);
//    var code = "  On_motion_trigger:\n    Syscall Flash ([3, 255,0,0])\n\n  Syscall Return Null\n";
    window.parent.postMessage({method: 'onBlocklyGenerate', arg: code}, '*');
}

function injectLanguage() {
  // Inject language strings.
  document.title += ' ' + MSG['title'];

  var categories = ['Motion','LED','Hub','catLogic', 'catLists', 'catVariables', 'catFunctions'];
  for (var i = 0, cat; (cat = categories[i]); i++) {
    document.getElementById(cat).setAttribute('name', MSG[cat]);
  }
  var textVars = document.getElementsByClassName('textVar');
  for (var i = 0, textVar; (textVar = textVars[i]); i++) {
    textVar.textContent = MSG['textVariable'];
  }
  var listVars = document.getElementsByClassName('listVar');
  for (var i = 0, listVar; (listVar = listVars[i]); i++) {
    listVar.textContent = MSG['listVariable'];
  }
}

function init() {
    injectLanguage();
    Blockly.inject(document.body, {path: 'blockly/', toolbox: document.getElementById('toolbox')});

    Blockly.mainWorkspace.addChangeListener(onBlocklyChanged);
//    Blockly.addChangeListener();
    window.addEventListener("message", receiveMessage, false);
    onBlocklyLoaded();
}
