# This script runs an install for an extension based version of the Linkitz Blockly app

import sys
if sys.version_info[0] != 2:
  raise Exception("Blockly build only compatible with Python 2.x.\n"
                  "You are using: " + sys.version)

import errno, glob, httplib, json, os, re, subprocess, threading, urllib
import subprocess

subprocess.call("npm update",shell=True)
#I should copy over firmware files here, but Drew will fix that when he gets back to work on firmware
subprocess.call("npm install",shell=True)
subprocess.call("grunt shell",shell=True)
subprocess.call("grunt concat",shell=True)
subprocess.call("grunt copy",shell=True)
subprocess.call("grunt compress",shell=True)#sorry this is the unsecure way that windows demands. 
