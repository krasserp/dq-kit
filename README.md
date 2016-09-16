# dq-kit
Tool-kit to create or copy existing DQs

## Goals

* Create new DQs with all needed files/tags etc. 
* Standardise name spacing set up
* Quick set up for new and copied DQs
* Automate documentaion


### Create new DQs with all needed files/tags etc.
**createDQ.sh** clones this repo and renames the dq-name folder to the new DQs name. Also goes through all files and replaces dq-name with the new DQs name (for name spacing).

The file names are kept generic as the namespacing happens on a location basis .js,.less etc . Hence (script.js, dq.less, docu.css, etc. ) in the static folder.

The addition of de-icon1.png, img-noise-200x200.png and docu.css have been added as default files to the static folder in order to generate a automated documentation html file.

**dqDocu.py** fetches the information available in meta.xml and the styles.xml to create a docu.html file in the static folder.

This can be set up as an alias and hopefully help reduce the time to create the documentation. Also will keep the documentation always in the same place as the DQ (```../lib/dqName/vNbr/docu.html```).


### Standardise name spacing set up
The aim is to keep all file names the same in the static folder and only change the name space pre-fixes within the files.

script.js --> ``` var dq-name = function (questionObject){ ...};....Survey.question.dq-name = {}```

For CSS namespacing a wrapper div is wrapped around the question div and all DQ specific css can be added as children of the dq-name selector 
```javascript
    Survey.question.dq-name = {
        setup: function(questionObject){
            // wrap the dq-name around the question DOM element to allow for the css name spacing
            var dq = new dq-name(questionObject);

            var nameSpaceWrapper = $('<div/>',{
                'id' : 'dq-name_'+dq.qLabel
            });

            // apply a div wrapper around the question to namespace all css via the dq.less 
            // pre-requisite is tha all css is kept within the namespace div #dq-name
            $(dq.applyCssTo).wrap(nameSpaceWrapper);
        }
    }
```
```less
div[id^=dq-name]{
    /*
    * pack all your css in here to name space it
     */
    margin:0;
    padding:0;
}
```
**createDQ.sh** when called, and a newDQ name is passed as argument will run through all files witin the dq-name folder and replace all dq-name instances witht the newly provided name


### Quick set up for new and copied DQs

``` createDQ.sh ``` can be set up as an alias in .bashrc
``` alias createDQ="/home/jaminb/v2/temp/pkrasser/scripts/dq-kit/createDQ.sh"```

```cd``` to the lib folder in which a new DQ shall be set up or an existing DQ shall be copied to.  

Run the script/comand (```createDQ```).

Options = newDQ|cpDQ

**newDQ** will create a new DQ based on this git repos files

**cpDQ** will copy a DQ from the specified path and change the name of the DQ and the namespace variables ie. stylevars etc.

### Automate documentaion


```dqDocu.py``` also usable via alias ```alias dqDocu="/home/jaminb/v2/temp/pkrasser/scripts/dq-kit/dqDocu.py"```
creates a docu.html file in the static directory of the DQ. The info of the Documentation is gathered from survey.xml and meta.xml
Some additional tags were added to the template and some extra files in the static folder of the template to accomodate this.

The template has been set up with the intend to minize the effort when creating and or copying DQs. The name-spacing should be taken care of.
meta.xml is taken from the kb + additional device support tags

Once a new DQ has been created via ```createDQ``` the meta.xml needs to be adjusted to only contain valid xml. Currently 
still multiple values are specified in some tag attributes ```<tag attr="<row|col|choices>" />```

Once the DQ is working and has its stylevars and info updated in the styles.xml run ```dqDocu``` and this will generate a docu.html file within the static folder of the DQ


