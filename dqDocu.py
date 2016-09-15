#!/usr/bin/python2.7
import xml.etree.ElementTree as ET
import os
import sys
# need to get the docu info from a couple of places
# styles.xml meta.xml file system as well

currentPath = os.getcwd()
#allowed directories to run the dqDocu from
allowedDirs = ['lib','steam','local','phil']  # phil local testing
# only on server 
if currentPath.split('/')[-3] not in allowedDirs:
    print 'You can only use the dqDocu script from within a DQ versioned folder eg. lib/dqName/v?'
    sys.exit()

dqName = currentPath.split('/')[-2]
dqVersion = currentPath.split('/')[-1][-1]

print dqName, dqVersion


styles = ET.parse('styles.xml')
sRoot = styles.getroot()

styleItems = {}
stylevars = []

for child in sRoot:
    if child.tag == 'intro':
        styleItems['intro'] = child.text
    if child.tag == 'technicalConsiderations':
        styleItems['technicalConsiderations'] = child.text
    if child.tag == 'limitations':
        styleItems['limitations'] = child.text
    if child.tag == 'stylevar':
        currentStyle = child.attrib
        currentStyle['default'] = child.text
        stylevars.append(currentStyle)

styleItems['stylevars'] = stylevars


meta = ET.parse('meta.xml')
mRoot = meta.getroot()

devices = []
metaItems = {}

for child in mRoot:
    #print child.tag, child.attrib
    #print child.text
    if child.tag == 'title':
        metaItems['title'] = child.text
    if child.tag == 'compat':
        metaItems['compat']= child.text
    if child.tag == 'device':
        devices.append(child.attrib)
    if child.tag == 'scope':
        metaItems['scope'] = child.text
    if child.tag == 'supports':
        metaItems['supports'] = child.text

metaItems['devices'] = devices
#print ' all in all ', metaItems, styleItems


if 'intro' in styleItems and len(styleItems['intro']) > 2 :
    intro = styleItems['intro'] 
else:
    intro = ''

headline = "<h1>" + metaItems['title'] + "</h1>"


compatli = "<li>compat: "+metaItems['compat']+"</li>"

deviceli = ''
for i in metaItems['devices']:
    deviceli +="<li>%s: %s</li>\n"  % (i['name'], i['compat'])


mainInfo = """
<ul>
    <li>DQ: %s</li>
    <li>Version: %s</li>
    %s
    %s
</ul>
""" % (dqName, dqVersion, deviceli,compatli)

demo = '<h2><a href="../v%s">Demo</a></h2>' % (dqVersion)

techcons = "<h2>Technical Considerations:</h2>"+styleItems['technicalConsiderations']

baseType = "<h3>Base question type:</h3>\n <p>"+metaItems['scope']+"</p>\n"

baseOptions = "<h3>Base question options:</h3>\n <p>"+metaItems['supports']+"</p>\n"

limits = "<h3>Limitations</h3>\n <p>"+styleItems['limitations']+"</p>\n"


customUl = "<ul>"

for i in styleItems['stylevars']:
    item = """
    <li>
    <ul>
        <li class="bold">Tag name: %s</li>
        <li>Title: %s</li>
        <li>Description: %s</li>
        <li>Default: %s</li>
    </ul>
    </li>
    """ % (i['name'], i['title'],i['desc'], i['default'])
    customUl += item


customisableItems = "<h3>Customisable items:</h3>"+customUl+"</ul>"


combined = headline +  mainInfo + demo + intro + techcons + baseType + baseOptions + limits + customisableItems

htmlWrapper ="""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
    <title>Documentation %s</title>
    <link rel="stylesheet" type="text/css" href="docu.css" />
</head>
<body>
    <div class="page-wrapper">
        <div class="header">
        </div>
       %s 
    </div>

</body>
</html>
""" % (dqName, combined)


htmlFile = open('static/docu.html','w');
htmlFile.write(htmlWrapper)
htmlFile.close()

print 'file generated in static/docu.html contents = ', htmlWrapper

