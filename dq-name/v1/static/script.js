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
    };

    /**
     * [dq-name description]
     * @type {Object}
     */
    Survey.question.dq-name = {
        setup: function(questionObject){
            // wrap the dq-name around the question DOM element to allow for the css name spacing
            var dq = new dq-name(questionObject);

            var nameSpaceWrapper = $('<div/>',{
                'id' : 'dq-name'
            });

            $(dq.applyCssTo).wrap(nameSpaceWrapper);
        }
    }


}());