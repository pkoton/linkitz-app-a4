# This script updates the version number found in manifest-src/manifest-head.json

import sys
if sys.version_info[0] != 2:
  raise Exception("Blockly build only compatible with Python 2.x.\n"
                  "You are using: " + sys.version)

import errno, glob, httplib, json, os, re, subprocess, threading, urllib
import subprocess, fileinput

for line_number, line in enumerate(fileinput.input("manifest-src/manifest-head.json",inplace=1)):
  if re.search('''"version": ''',line):
    lineElements=line.split('''"''')[3].split('''.''')
    
    versionString = lineElements[0]+'.'+lineElements[1]+'.'+str(int(lineElements[2])+1)#support for symantic version numbers
    sys.stdout.write('''  "version": "'''+versionString+'''",\n''')
  else:
    sys.stdout.write(line)
      
