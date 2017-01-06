(function () {
    "use strict";
    /**
     * [dq-name description]
     * @param  {[type]} questionObject [description]
     * @return {[type]}                [description]
     */
    var dq-name = function (questionObject){
        this.qO        = questionObject;
        this.qLabel    = this.qO.label;
        this.applyCssTo= '#question_'+this.qLabel;
        // grid easy data input fields update mini lib by Michael Hardy
        this.grid = Survey.question.grid.setup(questionObject);
        console.log(this.qO);

        /**
         * [returnItemDivs set up of div items representing row or colum itesm, all attributes are added as data points/items for easy use/manipulation]
         * @param  {[obj]} rowColChoices [pass in either the rows or the columns of a question object]
         * @param  {[string]} name       [string for css handling]
         * @return {[arr]}               [returns an array containing all row or col items as div items]
         */
        this.returnItemDivs = function(rowColChoices, name){

            var returnArr = [];

            var rowColChoices = rowColChoices;

            for (var i = 0; i < rowColChoices.length; i++ ){
                var item = $('<div/>',{
                    //'id': rowColChoices[i].label,
                    'html': rowColChoices[i].text,
                    'class' : 'dq-'+name
                });
                for (var k in rowColChoices[i]){

                    if(typeof rowColChoices[i][k] !='object'){
                        item.attr('data-'+k, rowColChoices[i][k]);
                    }

                    if(typeof rowColChoices[i][k] =='object'){
                        var obj = rowColChoices[i][k];
                        for(var key1 in obj){
                            item.attr('data-'+key1, obj[key1]);
                        }
                    }

                }

                returnArr.push(item);
            }

            return returnArr;
        }


    };

    /**
     * [dq-name description]
     * @type {Object}
     */
    Survey.question.dq-name = {
        setup: function(questionObject){
            // here you go add your magic
            var dq = new dq-name(questionObject);

        }
    }


}());