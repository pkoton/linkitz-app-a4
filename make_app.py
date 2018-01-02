# This script runs an install for an extension based version of the Linkitz Blockly app

import sys, platform
if sys.version_info[0] != 2:
  raise Exception("Blockly build only compatible with Python 2.x.\n"
                  "You are using: " + sys.version)

import errno, glob, httplib, json, os, re, subprocess, threading, urllib
import subprocess

  #Open the build directory in Linkitz-app-a4...
  #Edit the file manifest.json
  #The one in the build directory
  #Remove the key and increment the version number to 0.9.6.0
  #Save the manifest.json file

subprocess.call("python install_extension.py",shell=True)

print("Updating manifest with a new version number")
subprocess.call("python update_versionNumber.py",shell=True)


#The in google docs there is a shared file called how to update the chrome app or something like that
#It has a link to the developer dashboard and the password
#You have to log into the sahniard as linkitzdev@google.com
#Into the dashboard

print("Done using install_extension.py to build cross platform app in release directory")

if platform.system()=="Windows":
  #To build for Windows, use this script to update the release directory.
  #Rename release/manifest.json to release/package.json
  print("Starting process to make exe for Windows")
  subprocess.call("copy release\manifest.json release\package.json",shell=True)
  #Use nwbuild to make a portable application
  subprocess.call("nwbuild -p win32 --winIco icons/windows.ico -o prepackaged release",shell=True)
  #Then use winrar to make a SFX archive.
  #I end up only getting the following to work intermittently, just do this last step by hand if you need a downloadable version... sorry :(
  #subprocess.call("WinRAR a prepackaged/Linkitz/win32 -cpSFX6",shell=True)
  #CLI hasn't worked well...
    #let me try the GUI

#;The comment below contains SFX script commands

#Setup=Linkitz.exe
#TempMode
#Silent=1


#Open the build directory in Linkitz-app-a4...
#Edit the file manifest.json
#The one in the build directory
#Remove the key and increment the version number to 0.9.6.0
#Save the manifest.json file
