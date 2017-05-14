# This script runs an install for an extension based version of the Linkitz Blockly app

import sys
if sys.version_info[0] != 2:
  raise Exception("Blockly build only compatible with Python 2.x.\n"
                  "You are using: " + sys.version)

import errno, glob, httplib, json, os, re, subprocess, threading, urllib
import subprocess

#subprocess.call(...,shell=True) isn't best practice, but other methods weren't working on my windows machine in a way that would translate to apple machines.
print("Running NPM update...")
subprocess.call("npm update",shell=True)

print("Copying firmware...")
subprocess.call("python js/services/hexfirmware2js.py",shell=True)

print("Running NPM install...")
subprocess.call("npm install",shell=True)

print("Running grunt shell...")
subprocess.call("grunt shell",shell=True)

print("Running grunt concat...")
subprocess.call("grunt concat",shell=True)

print("Running grunt copy...")
subprocess.call("grunt copy",shell=True)

print("Running grunt compress...")
subprocess.call("grunt compress",shell=True)

