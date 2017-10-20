# This script runs an install for an extension based version of the Linkitz Blockly app

import sys
if sys.version_info[0] != 2:
  raise Exception("Blockly build only compatible with Python 2.x.\n"
                  "You are using: " + sys.version)

import errno, glob, httplib, json, os, re, subprocess, threading, urllib
import subprocess

subprocess.call("python update_versionNumber.py",shell=True)
  #Open the build directory in Linkitz-app-a4...
  #Edit the file manifest.json
  #The one in the build directory
  #Remove the key and increment the version number to 0.9.6.0
  #Save the manifest.json file

subprocess.call("python install_extension.py",shell=True)

#The in google docs there is a shared file called how to update the chrome app or something like that
#It has a link to the developer dashboard and the password
#You have to log into the sahniard as linkitzdev@google.com
#Into the dashboard

#To build for Windows, use this script to update the release directory.
#Rename release/manifest.json to release/package.json
# subprocess.call("copy release\manifest.json release\package.json",shell=True)
#Use nwbuild to make a portable application
# subprocess.call("nwbuild -p win32 --winIco icons/windows.ico -o prepackaged release",shell=True)
#Then use winrar to make a SFX archive.
#I end up only getting the following to work intermittently, just do this last step by hand if you need a downloadable version... sorry :(
#subprocess.call("WinRAR a prepackaged/Linkitz/win32 -cpSFX6",shell=True)
