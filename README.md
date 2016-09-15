# dq-kit
Tool-kit to create or copy existing DQs

``` createDQ.sh ``` can be set up as an alias in .bashrc
``` alias createDQ="/home/jaminb/v2/temp/pkrasser/scripts/dq-kit/createDQ.sh"```
```cd``` to the lib folder in whihc a new DQ shall be set up or an existing DQ shall be copied to and run the script/comand.
**newDQ** will create a new DQ based on this git repos files **cpDQ** will copy a DQ from the specified path and change the name of the DQ and the namespace variables ie. stylevars etc.

```dqDocu.py``` also usable via alias ```alias dqDocu="/home/jaminb/v2/temp/pkrasser/scripts/dq-kit/dqDocu.py"```
creates a docu.html file in the static directory of the DQ. The info of the Documentation is gathered from survey.xml and meta.xml
Some additional tags were added to the template and some extra files in the static folder of the template to accomodate this.

The template has been set up with the intend to minize the effort when creating and or copying DQs. The name-spacing should be taken care of.
meta.xml is taken from the kb + additional device support tags

Once a new DQ has been created via ```createDQ``` the meta.xml needs to be adjusted to only contain valid xml. Currently 
still multiple values are specified in some tag attributes ```<tag attr="<row|col|choices>" />```

Once the DQ is working and has its stylevars and info updated in the styles.xml run ```dqDocu``` and this will generate a docu.html file within the static folder of the DQ


