/*
 * jQuery UI 'HybrisGridTable
 *
 * Author: Alberto Cole
 * 
 * jQuery UI Widget that shows JSON Data in a lightweight Grid, using jQuery UI CSS Framework.
 *
 * Features:
 *		- jQuery UI ThemeRoller Ready
 *		- Ajax Ready
 *		- Custom Header Fields
 *		- Custom Column width
 *		- Pagination 
 *
 *	TODO:
 *		- Add Samples
 *		- Documentation
 *		- Find and Fix minor UI bugs.
 *		- Apply chainings and some other code improvements to make it more efficient.
 *		
 *		Wishlist:
 *		- Sorting.
 *		- Implement Templating.
 */
var HybrisGridTable = {
    options: {
        source: "JSON/PATH",
        title: "Table Title",
        colModel:
			[
				{
				    "name": "ID",
				    "property": "idArticulo",
				    "width": "30px",
                    "align": "left"
				}
			],
        tableId: "hybrisTable",
        rowsPerPage: 10,
        //private vars
        _totalRows: 0,
        _currentPage: 0,
        _dataList: [],
        _rowObjects: [],
        _nextPage: 0,
        _previousPage: 0,
        _start: 0,
        _end: 0

    },
    getDataList: function () {
        return this.options._dataList;
    },
    refresh: function (newSource, newColModel, rowSelected, dataList) {
        if (newSource != undefined) {
            this.options.source = newSource;
        }
        if (newColModel != undefined) {
            this.options.colModel = newColModel;
        }
        if (rowSelected != undefined) {
            this.options.rowSelected = rowSelected;
        }
        if (dataList == undefined) {
            this._requestData();
        } else {
            $('#' + this.options.tableId).remove();
            this.options._dataList = dataList;
            this.options._totalRows = dataList.length;
            this.element.find('.ui-grid-footer').remove();
            this._buildTableContent();
            this._buildFooter();

            //setting private fields to default
            this.options._start = 0;
            this.options._end = this.options.rowsPerPage;
            this.options._previousPage = -1;
            this.options._nextPage = 1;
            this.options._currentPage = 0;
            this.options._end = this.options.rowsPerPage;
            this._goToPage(this.options._currentPage, true);
        }
    },
    _requestData: function () {
        var grid = this;
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: 'application/json',
            url: grid.options.source,
            success: function (dataList) {
                $('#' + grid.options.tableId).remove();
                grid.options._dataList = dataList;
                grid.options._totalRows = dataList.length;
                grid.element.find('.ui-grid-footer').remove();
                grid._buildTableContent();
                grid._buildFooter();

                //setting private fields to default
                grid.options._start = 0;
                grid.options._end = grid.options.rowsPerPage;
                grid.options._previousPage = -1;
                grid.options._nextPage = 1;
                grid.options._currentPage = 0;
                grid.options._end = grid.options.rowsPerPage;
                grid._goToPage(grid.options._currentPage, true);
            },
            error: function () {

            }
        });
    },
    _create: function () {
        this._buildTable();
        this._trigger('complete', 0,$(this));
    },
    _buildTable: function () {
        var grid = this;
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: 'application/json',
            url: grid.options.source,
            success: jsonpCallback,
            error: function (jqXHR, textStatus, errorThrown) {
                grid.options._totalRows = 0;
                grid.element.addClass("ui-grid ui-widget ui-widget-content ui-corner-all");
                grid._buildTitle();
                grid._buildTableContent();
                grid._buildFooter();
            }
        });

        function jsonpCallback(dataList) {
            grid.options._dataList = dataList;
            grid.options._totalRows = dataList.length;
            grid.element.addClass("ui-grid ui-widget ui-widget-content ui-corner-all");
            grid._buildTitle();
            grid._buildTableContent();
            grid._buildFooter();
        }
    },

    _buildTitle: function () {
        var title = '<div id="header' + this.options.tableId + '" class="ui-grid-header ui-widget-header ui-corner-top">';
        title += this.options.title;
        title += '</div>';
        $(title).appendTo(this.element);
    },
    _buildTableContent: function () {
        var table_content = '<table id="' + this.options.tableId + '" class="ui-grid-content ui-widget-content">';

        table_content += this._buildHeader();
        table_content += this._buildData();
        table_content += '</table>';

        $(table_content).appendTo(this.element);

        this._setUpTableMouseBehavior();
    },

    _buildHeader: function () {
        var header = '<thead><tr>';
        $(this.options.colModel).each(function (index, model) {
            header += '<th class="ui-state-default">';
            header += model.name;
            header += '</th>';
        });
        header += '</tr></thead>';


        return header;
    },
    _buildData: function () {
        var grid = this;
        var body = '<tbody id="dataBody' + grid.options.tableId + '">';
        body += grid._buildTableBody(true);
        body += '</tbody>';
        return body;
    },

    _buildTableBody: function (isForward) {
        var grid = this;
        var start = grid.options._currentPage * grid.options.rowsPerPage;
        var end = start + grid.options.rowsPerPage - 1;
        var body = '';
        var counter = start;
        var printedRows = 0;
        var currentObject = undefined;

        if (grid.options._dataList != undefined) {
            while (counter <= end) {
                currentObject = grid.options._dataList[counter];
                if (currentObject != undefined) {
                    grid.options._rowObjects[printedRows] = currentObject;
                    body += '<tr class="hybrisDataRow" data-row="data" title="Data Row">';
                    $(grid.options.colModel).each(function (index, model) {
                        if (currentObject != undefined)
                            body += '<td class="ui-widget-content ' + model.property + ' '+model.align+' ">';
                        body += currentObject[model.property];
                        body += '</td>';
                    });
                    body += '</tr>';
                    printedRows += 1;
                }
                counter += 1;
            }
        }

        var total = start + printedRows;

        if (isForward) {
            grid.options._previousPage = (start == 0) ? -1 : (grid.options._previousPage += 1);
            grid.options._nextPage = (total == grid.options._totalRows) ? -1 : (grid.options._nextPage += 1);
        } else {
            grid.options._previousPage = (start == 0) ? -1 : (grid.options._previousPage -= 1);
            if (grid.options._nextPage != -1) {
                grid.options._nextPage = (total == grid.options._totalRows) ? -1 : (grid.options._nextPage -= 1);
            } else {
                grid.options._nextPage = grid.options._currentPage + 1;
            }
        }
        grid.options._start = start + 1;
        if (counter <= grid.options._totalRows) {
            grid.options._end = counter;
        } else {
            grid.options._end = grid.options._totalRows;
        }
        return body;

    },

    _goToPage: function (pageNumber, isForward) {
        this.options._currentPage = pageNumber;
        $('#dataBody' + this.options.tableId).empty().append(this._buildTableBody(isForward));
        this._setUpTableMouseBehavior();

        var showingResults = 'Showing results ' + this.options._start + '-' + this.options._end + ' of ' + this.options._totalRows;
        $('.ui-grid-results').html(showingResults);
    },

    _buildFooter: function () {

        var showingResults = 'Showing results ' + this.options._start + '-' + this.options._end + ' of ' + this.options._totalRows;

        var footer = '<div class="ui-grid-footer ui-widget-header ui-corner-bottom ui-helper-clearfix">';
        footer += '<div class="ui-grid-paging ui-helper-clearfix">';
        footer += '<a class="ui-grid-paging-prev ui-state-default ui-corner-left"><span class="ui-icon ui-icon-triangle-1-w"></span></a>';
        footer += '<a class="ui-grid-paging-next ui-state-default ui-corner-right"><span class="ui-icon ui-icon-triangle-1-e"></span></a>';
        footer += '</div>';
        footer += '<div class="ui-grid-results">' + showingResults + '</div>';
        footer += '</div>';
        $(footer).appendTo(this.element);
        this._setUpFooterMouseBehavior();
    },

    _setUpTableMouseBehavior: function () {
        var grid = this;
        var table = grid.element.find('#' + this.options.tableId);
        var tbodyTR = table.find('tbody#dataBody' + grid.options.tableId + ' tr');

        tbodyTR.hover(
			function () {
			    $(this).find('td').addClass('ui-state-hover');

			},
			function () {
			    $(this).find('td').removeClass('ui-state-hover');
			});

        tbodyTR.click(function () {
            tbodyTR.find('td').removeClass('ui-state-active');
            $(this).find('td').addClass('ui-state-active');
            grid._trigger('rowSelected', 0, $(this));
        });

        var i = 0;
        var lenght = tbodyTR.length;

        while (i < lenght) {
            $(tbodyTR[i]).data('object', this.options._rowObjects[i]);
            i++;
        }
    },

    _setUpFooterMouseBehavior: function () {
        var grid = this;
        $('.ui-grid-paging-prev').click(
			function () {
			    $(this).effect('highlight', {}, 500);
			    if (grid.options._previousPage != -1) {
			        grid._goToPage(grid.options._previousPage, false);
			    }
			}
		);
        $('.ui-grid-paging-next').click(
			function () {
			    $(this).effect('highlight', {}, 500);
			    if (grid.options._nextPage != -1) {
			        grid._goToPage(grid.options._nextPage, true);
			    }
			}
		);
    }
};
$.widget("ui.hybrisGridTable", HybrisGridTable);
