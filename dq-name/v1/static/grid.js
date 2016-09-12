/*global Survey:true, $:false*/
(function() {
    'use strict';

    // Copies selected properties from one object into another.
    function copyp(obfrom, props) {
        var obj = {};
        $.each(props, function(i,v) { obj[v] = obfrom[v]; });
        return obj;
    }

    // Takes :-delimited property names and converts them into object trees to avoid needing to use jse['omegacard:property'],
    // instead using the more intuitive jse.omegacard.property.
    function foldp(obj) {
        for (var prp in obj) {
            if (/:/.test(prp)) {
                var skeys = prp.split(':'); 
                var ptr = obj;

                $.each(skeys, function(sdx, key) {
                    if (sdx === skeys.length - 1) {
                        ptr[key] = obj[prp];
                    } else if (typeof(ptr[key]) === 'undefined') {
                        ptr[key] = {};
                    }

                    ptr = ptr[key];
                });

                delete obj[prp];
            }
        }
    }


    function Grid(jse) {
        var self = this;
        foldp(jse);
        self.question = copyp(jse, $.merge(['uid','label','title','comment','device','grouping','haveLeftLegend','haveRightLegend','type','debug','atleast','atmost'], jse.uses));

        // The rows and columns objects represent things attached to a specific row.
        self.rows = {
            byIndex:[],
            byOrder:[],
            length:0,
        };
        self.cols = {
            byIndex:[],
            byOrder:[],
            length:0,
        };
        self.cells = {
            length:0,
        };
        self.choices = {
            length:0,
        };
        self.noanswers = {
            length:0,
        };

        // Open-ends will probably be attached to whatever row/col/choice that OE happens to be a part of.

        // INITIALIZATION - Gathering selectors and data from each grid dimension.
        $.each(jse.rows, function(rdo,row) {
            var rdx = row.index;
            foldp(row);
            var rbj = copyp(row, $.merge(['amount','exclusive','label','open','openOptional','optional','text','uid'], jse.uses));
            //rbj.any = function () { return any('row',rdx) };
            if (row.openName !== 'undefined') {
                rbj.open =  { 
                    selector    : $('[name="' + row.openName + '"]'),
                };
            }
            rbj.errors = [];
            // Populate with all 'row' or 'row-legend' errors after cell collection.

            self.rows.length++;
            self.rows.byIndex[rdx] = rbj;
            self.rows.byOrder[rdo] = rbj;

            // Get row errors
            $.each(jse.cols, function(cdo,col) {
                var cdx = col.index;
                foldp(col);
                var cbj = copyp(col, $.merge(['amount','exclusive','label','open','openOptional','optional','text','uid'], jse.uses));
                if (col.openName !== 'undefined') {
                    cbj.open = $('[id="' + row.openName + '"]');
                } else {
                    cbj.open = undefined;
                }
                cbj.errors = [];

                if (rdo == 0) { self.cols.length++; }
                self.cells.length++;
                self.cols.byIndex[cdx] = cbj;
                self.cols.byOrder[cdo] = cbj;

                // Gather data for cells, stored in a separate object from question dimensions.
                switch (self.question.type) {
                    case 'radio':
                        // Picks name by the grouping; the naming scheme changes if it's grouped by columns.
                        if (self.question.grouping === 'rows') {
                            self.cells[rdx + ':' + cdx] = $('[name="ans' + self.question.uid + '.0.' + rdx + '"][value='+cdx+']');
                        } else if (self.question.grouping === 'cols') {
                            self.cells[rdx + ':' + cdx] = $('[name="ans' + self.question.uid + '.' + cdx + '.0"][value='+rdx+']');
                        }
                        break;
                    case 'checkbox':
                    case 'text':
                    case 'textarea':
                    case 'number':
                    case 'float':
                    case 'select':
                        self.cells[rdx + ':' + cdx] = $('[name="ans' + self.question.uid + '.' + cdx + '.' + rdx + '"]');
                        break;
                    default:
                        break;
                }
            });
        });

        // Reads through error messages in jsexport and decides where the put them in the Grid construct.
        $.each(jse.errors, function(edx,err) {
            var error_index = err[2];
            var error_message = err[0];
            var error_type = err[1];

            // The error indices in jsexport are based on their order of appearance instead of their row
            // index, so this is accounted for when deciding which row to associate with each error.
            switch (error_type) {
                case 'row':
                case 'row-legend':
                    self.rows.byOrder[error_index].errors.push({
                        type: error_type,
                        message: error_message,
                    });
                    break;
                case 'col':
                case 'col-legend':
                    self.cols.byOrder[error_index].errors.push({
                        type: error_type,
                        message: error_message,
                    });
                    break;
                default:
                    break;
            }
        });

        // Gather choices
        // Since Grid.js assigns choices by index instead of using the objects directly, this collection is mostly used for
        // the properties assigned to it in jsexport, special DQ properties in particular.
        $.each(jse.choices, function(odx,chc) {
            odx = chc.index;
            foldp(chc);
            var obj = copyp(chc, $.merge(['amount','exclusive','label','open','openOptional','optional','text','uid'], jse.uses));
            // Open-ends aren't allowed in choices, or at least they don't render correctly.
            self.choices[odx] = obj;
            self.choices.length++;
        });

        // Gather noanswers
        $.each(jse.noanswers, function(ndx,na) {
            var nbj = copyp(na, ['label','open','text','uid']);
            nbj.selector = $('[name="_v2_na_' + self.question.label + '.' + nbj.label + '"]');
            self.noanswers[ndx] = nbj;
            self.noanswers.length++;
        });

        // This function ensures that when attempting to assign a value to the grid, that the proposed value is of the data type
        // Grid.js is expecting to recieve.
        self.validate = function(val, type) {
            if (typeof(type) === 'undefined') { type = self.type; }
            switch (type) {
                case 'radio':
                case 'checkbox':
                    return (typeof(val) === 'number' && (val >= 0 && val <= 1)) || typeof(val) === 'boolean';
                case 'select':
                    return (typeof(val) === 'number' && (val >= -1 && val < self.$table.find('[name^="ans"]:eq(0) option').length - 1));
                case 'text':
                    return (typeof(val) === 'string' && val.search(/(\r|\n)/) === -1);
                case 'textarea':
                    return (typeof(val) === 'string');
                case 'number':
                    return (typeof(val) === 'number' && val % 1 === 0);
                case 'float':
                    return (typeof(val) === 'number');
                default:
                    return true;
            }
        };

        // Function for reading a cell. This function can be used directly, or to assist in the vector logic functions defined below.
        self.getCell = function(row,col) {
            var $cell = self.cells[row + ':' + col];
            switch (self.question.type) {
                case 'radio':
                case 'checkbox':
                    return $cell[0].checked;
                case 'select':
                    return $cell.find('option:selected').index() - 1;
                case 'text':
                case 'textarea':
                    return $cell.val();
                case 'number':
                    return parseInt($cell.val());
                case 'float':
                    return parseFloat($cell.val());
                default:
                    return undefined;
            }
        };

        // Function for assigning a cell.
        self.setCell = function(row,col,val) {
            var $cell = self.cells[row + ':' + col];
            if ($cell.length && self.validate(val, self.type) && $cell.is(':enabled') && !self.anyNA()) {
                switch (self.question.type) {
                    case 'radio':
                    case 'checkbox':
                        $cell[0].checked = val;
                        break;
                    case 'select':
                        $cell.find('option:eq(' + (val + 1) + ')').attr('selected','selected');
                        break;
                    case 'text':
                    case 'textarea':
                    case 'number':
                    case 'float':
                        $cell.val(val);
                        break;
                    default:
                        break;
                }
                return true;
            } else {
                return false;
            }
        };

        self.clearCell = function(row,col) {
            switch (self.question.type) {
                case 'radio':
                case 'checkbox':
                    return self.setCell(row,col,false);
                    break;
                case 'select':
                    return self.setCell(row,col,0);
                    break;
                case 'text':
                case 'textarea':
                case 'number':
                case 'float':
                    return self.setCell(row,col,'');
                    break;
                default:
                    break;
            }
        }

        // This function is primarily meant to be sued in internal vector logic functions. It
        // decides if a particular cell has been left "blank", depending on what the input
        // type is.
        self.isBlank = function(row,col) {
            switch (self.question.type) {
                case 'radio':
                case 'checkbox':
                    return self.getCell(row,col) === false;
                    break;
                case 'select':
                    return self.getCell(row,col) === 0;
                    break;
                case 'text':
                case 'textarea':
                case 'number':
                case 'float':
                    return self.getCell(row,col) === '';
                    break;
                default:
                    break;
            }
        }

        self.clearGrid = function() {
            for (var rdx = 0; rdx < self.rows.length; rdx++) {
                for (var cdx = 0; cdx < self.cols.length; cdx++) {
                    self.clearCell(rdx,cdx);
                }
            }
        }

        self.getNA = function(idx) {
            return self.noanswers[idx].selector[0].checked;
        }

        self.anyNA = function() {
            for (var ndx = 0; ndx < self.noanswers.length; ndx++) {
                if (self.getNA(ndx)) { return true; }
            }
            return false;
        }

        self.setNA = function(idx, val) {
            var $cell = self.noanswers[idx].selector;
            if (self.validate(val, 'checkbox') && $cell.is(':enabled')) {
                if (val === true) {
                    if (!self.anyNA()) {
                        self.clearGrid();
                        $cell[0].checked = val;
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    $cell[0].checked = val;
                }
            } else {
                return false;
            }
        }

        // Variant of getCell that checks if a cell has been filled. Used in some of the vector logic below.
        self.isFilled = function(row,col) {
            var $cell = self.cells[row + ':' + col];
            switch (self.question.type) {
                case 'radio':
                case 'checkbox':
                    return $cell[0].checked;
                case 'select':
                    return ($cell.find('option:selected').index() - 1) !== -1;
                case 'text':
                case 'textarea':
                case 'number':
                case 'float':
                    return ($cell.val() !== '' && self.validate($cell.val()));
                default:
                    return false;
            }
        }

        // ADD GET/SETOPEN, WHICH IS ATTACHED TO ROW AND COLUMN CONSTRUCTS.

        // Vector Logic functions

        // "Any" logic for rows and columns
        self.rows.any = function(rdx) {
            for (var cdx in self.cols.byIndex) {
                if (self.isBlank(rdx,cdx) === false) { return true; }
            }
            return false;
        }

        self.cols.any = function(cdx) {
            for (var rdx in self.rows.byIndex) {
                if (!self.isBlank(rdx,cdx)) { return true; }
            }
            return false;
        }


        // "All" logic for rows and columns
        self.rows.all = function(rdx) {
            for (var cdx in self.cols.byIndex) {
                if (self.isBlank(rdx,cdx)) { return false; }
            }
            return true;
        }

        self.cols.all = function(cdx) {
            for (var rdx in self.rows.byIndex) {
                if (self.isBlank(rdx,cdx)) { return false; }
            }
            return true;
        }


        // "Count" logic for rows and columns, returns number
        // of nonempty cells.
        self.rows.count = function(rdx) {
            var ct = 0;
            for (var cdx in self.cols.byIndex) {
                if (!self.isBlank(rdx,cdx)) { ct++; }
            }
            return ct;
        }

        self.cols.count = function(cdx) {
            var ct = 0;
            for (var rdx in self.rows.byIndex) {
                if (!self.isBlank(rdx,cdx)) { ct++; }
            }
            return ct;
        }


        // Filtering function, takes anonymous function
        // that returns true or false, then creates a
        // subset of rows/cols that match this criteria.
        self.rows.filter = function(fun) {
            var obj = {};
            for (var rdx in self.rows.byIndex) {
                if (fun(self.rows.byIndex[rdx])) { obj[rdx] = self.rows.byIndex[rdx]; }
            }
            return obj;
        }

        self.cols.filter = function(fun) {
            var obj = {};
            for (var cdx in self.cols.byIndex) {
                if (fun(self.cols.byIndex[cdx])) { obj[cdx] = self.cols.byIndex[cdx]; }
            }
            return obj;
        }
    }

    Survey.question.grid = {
        setup: function(jsexport) {
            return new Grid(jsexport);
        }
    };
}());

