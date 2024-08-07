sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "vwks/nlp/s2p/mm/pmaterial/manage/utils/Constants",
    "vwks/nlp/s2p/mm/pmaterial/manage/ext/reuse/ReuseMessageBox",
    "sap/m/Token",
    "sap/m/library"
    
   
], 
    /* eslint-disable max-params */
    function (JSONModel, Fragment, MessageBox, Filter, FilterOperator, Constants, ReuseMessageBox,Token,library) {
    "use strict";

    var ListReportSmartTable = {
        /**
         * @param {object} oView - Parent View
         * @param {object} oi18nModel - i18n model
         */
        init: function (oView, oi18nModel) {
            this._oView = oView;
            this.oi18nModel = oi18nModel;
            this.sKeyLink = null;
            this.sNotifyDevelopmentToAddress = "";
            this.bFiltersReadonly = false;
            this.aFilters = [];
            this.aStatusTexts = [];
            this.aMaterial = [];
            this.oListReportModel = new JSONModel({
                "notifyDevelopment": false,
                "enableNotifyDevelopment": false,
                "copyContractBundle": false,
                "enableCopyContractBundle": false
            });
        },

        /**
         * Set or unset Dialog busy state.
         * @param {boolean} bBusy true - set busy state, false - remove busy state
         * @public
         */
        setBusy: function (bBusy) {
            this.oListReportSmartTableDialog.setBusy(bBusy);
        },

        /**
         * Load and open Dialog.
         * @param {array} aSelectedDistributionLines - selected distribution lines
         * @param {string} sNotifyDevelopmentToAddress - notify development receipient email address
         * @param {boolean} bNotifyDevelopment - notify development button's visibility
         * @param {boolean} bCopyContractBundle - copy contract bundle button's visibility
         * @param {boolean} bFiltersReadonly - readonly property for smartFilter bar
         * @param {array} aFilters - filters passed for smartFilter bar initialization
         * @param {string} sHdrKeyLink - header key link
         * @param {Integer} iRowCountForProcessMultipleItem - row count 
         * @public
         */
        loadDialog: function (aSelectedDistributionLines, sNotifyDevelopmentToAddress, bNotifyDevelopment, bCopyContractBundle, bFiltersReadonly, aFilters, sHdrKeyLink, iRowCountForProcessMultipleItem) {
            this._sHdrKeyLink = sHdrKeyLink;
            this._iRowCountForProcessMultipleItem = iRowCountForProcessMultipleItem;
            this.bFiltersReadonly = bFiltersReadonly;
            this.sNotifyDevelopmentToAddress = sNotifyDevelopmentToAddress;
            this.oListReportModel.setProperty("/notifyDevelopment", bNotifyDevelopment);
            this.oListReportModel.setProperty("/copyContractBundle", bCopyContractBundle);
            this.aFilters = aFilters;
            this.sKeyLink = this._oView.getBindingContext().getProperty("KeyLink");
            this.aSelectedDistributionLines = aSelectedDistributionLines;
            Fragment.load({
                id: "idListReportSmartTableDialog",
                name: "vwks.nlp.s2p.mm.pmaterial.manage.ext.reuse.fragment.listReportSmartTableDialog",
                controller: this
            }).then(function (oDialog) {
                this.oListReportSmartTableDialog = oDialog;
                this.oListReportSmartTableDialog.setModel(this.oi18nModel, "i18n");
                this.oListReportSmartTableDialog.setModel(this.oListReportModel, "listReportModel");
                this._oListReportSmartTable = Fragment.byId("idListReportSmartTableDialog", "idListReportSmartTable");
                this._oListReportSmartTable.attachDataReceived(this.onListReportSmartTableDataReceived.bind(this));
                this._oListReportTable = this._oListReportSmartTable.getTable();
                this._oListReportTable.setMode("MultiSelect");
                this._oListReportTable.setGrowingThreshold(this._iRowCountForProcessMultipleItem);
                this._oListReportTable.attachSelectionChange(this.onListReportTableSelectionChange.bind(this));
                this._oListReportSmartFilterBar = Fragment.byId("idListReportSmartTableDialog", "idListReportSmartFilterBar");
                this._oListReportSmartTable.setSmartFilterId(this._oListReportSmartFilterBar.getId());
                this._oView.addDependent(this.oListReportSmartTableDialog);
                this.oListReportSmartTableDialog.open();
                this.setBusy(true);
            }.bind(this));
        },

        /**
         * beforeRebindTable event for ListReport smartTable
         * @param {sap.ui.base.Event} oEvent - event triggered
         */
        onListReportSmartTableBeforeRebind: function (oEvent) {  
            var aListReportSmartTableFilter = this._getBindingParamsFilters();
            var aFilter = new Filter({
                filters: aListReportSmartTableFilter,
                and: true
            });
            var oListReportSmartTableBindingParameters = oEvent.getParameter("bindingParams");
            if (aFilter && aFilter.aFilters && aFilter.aFilters.length) {
                if (oListReportSmartTableBindingParameters) {
                    oListReportSmartTableBindingParameters.filters.push(aFilter);
                }
            }
        },

        /**
        * Method to create filters to apply on ListReport smartTable
        * @return {sap.ui.model.Filter[]}} aFilter - array of generated filters
        */
        _getBindingParamsFilters: function () {
            var aFilter = [];
            var oListReportSmartTableFilter = new Filter({
                path: "IsActiveEntity",
                operator: FilterOperator.EQ,
                value1: true
            });
            aFilter.push(oListReportSmartTableFilter);
            return aFilter;
        },

        /**
         * dataReceived event for ListReport smartTable 
         */
        onListReportSmartTableDataReceived: function () {
            this.setBusy(false);
            var aRows = this._oListReportTable.getItems();
            aRows.forEach(function (oRow) {
                if (this.sKeyLink === oRow.getBindingContext().getProperty("KeyLink")) {
                    this._oListReportTable.setSelectedItem(oRow);
                    if (this.oListReportModel.getProperty("/notifyDevelopment")) {
                        this.oListReportModel.setProperty("/enableNotifyDevelopment", true);
                    }
                    if (this.oListReportModel.getProperty("/copyContractBundle")) {
                        this.oListReportModel.setProperty("/enableCopyContractBundle", true);
                    }
                }
            }.bind(this));
        },

        /**
         * selection change event of List Report Table
         * @param {sap.ui.base.Event} oEvent - event triggered
         */
        onListReportTableSelectionChange: function (oEvent) {
            var bRowSelected = oEvent.getParameter("selected");
            var aModifiedRows = oEvent.getParameter("listItems");
            if (!bRowSelected) {
                aModifiedRows.forEach(function (oModifiedRow) {
                    if (this.sKeyLink === oModifiedRow.getBindingContext().getProperty("KeyLink")) {
                        MessageBox.error(this.oi18nModel.getResourceBundle().getText("DeselctionError"));
                        this._oListReportTable.setSelectedItem(oModifiedRow);
                    }
                }.bind(this));
            } 
        },

        /**
         * initialization method for smartFilter bar
         * @param {sap.ui.base.Event} oEvent - event triggered
         */
        onListReportSmartFilterBarInitialise: function (oEvent) {
            var oSmartFilterBar = oEvent.getSource();
            if (this.bFiltersReadonly) {
                var aFilterGroups = oSmartFilterBar.getFilterGroupItems();
                aFilterGroups.forEach(function (oFilter) {
                    oFilter.getControl().setEnabled(false);
                });
                oSmartFilterBar.setShowGoButton(false);
            }
            this.aFilters.forEach(function (oFilter) {
                var sFilterKey = oFilter.filterKey;
                var vFilterValue = oFilter.filterValue;
                if (sFilterKey === "StatusText") {
                    this.aStatusTexts = vFilterValue;
                    var oStatusTextFilter = oSmartFilterBar.getControlByKey("StatusText");
                    oStatusTextFilter.addEventDelegate({
                        onAfterRendering: function () {
                            if (this.aStatusTexts.length) {
                                if (oStatusTextFilter.getItems() && oStatusTextFilter.getItems().length > 0) {
                                    oStatusTextFilter.setSelectedKeys(this.aStatusTexts);
                                    oStatusTextFilter.fireSelectionChange();
                                    this._oListReportSmartFilterBar.search();
                                    //set this back to initial to avoid re-rendering issue for filterbar
                                    this.aStatusTexts = [];
                                }
                            }
                        }.bind(this)
                    });
                } else if (sFilterKey === "Material" ) {
                    this.aMaterial = vFilterValue;
                    var oMaterialFilter = oSmartFilterBar.getControlByKey("Material");
                    oMaterialFilter.addEventDelegate({
                        onAfterRendering: function () {
                            if (this.aMaterial.length) {
                                for (var i = 0; i < this.aMaterial.length; i++) {
                                    var aToken = new Token({ text: this.aMaterial[i], key: this.aMaterial[i] });
                                    oMaterialFilter.addToken(aToken);
                                }
                               oMaterialFilter.fireTokenUpdate();
                               this._oListReportSmartFilterBar.search();
                                this.aMaterial = [];
                            }
                        }.bind(this)
                    });
                } else {
                    oSmartFilterBar.getControlByKey(sFilterKey).setValue(vFilterValue);
                }
            }.bind(this));
        },

        /**
         * Click handler for Notify Development button
         */
        onNotifyDevelopment: function () {
            this.setBusy(true);
            var oModel = this._oView.getModel();
            var oPayload = {
                HdrKeyLink: this._sHdrKeyLink,
                KeyLink: this._getSelectedWorkItems(),
                ToAddr: this.sNotifyDevelopmentToAddress
            };
            oModel.callFunction(Constants.FunctionImports.SendEmail, {
                method: "POST",
                urlParameters: oPayload,
                success: function (oResponse) {
                    this._oView.getController().extensionAPI.refresh();
                    this.setBusy(false);
                    if (oResponse.results && oResponse.results.length > 0) {
                        ReuseMessageBox.loadDialog(oResponse);
                    } else {
                        this.onCloseDialog();
                    }
                }.bind(this),
                error: function (oError) {
                    this.setBusy(false);
                }.bind(this)
            });
        },

        /**
         * Click handler for Copy Contract Bundle button
         */
        onCopyContractBundle: function () {
            var URLHelper = library.URLHelper;
            this.setBusy(true);
            var oModel = this._oView.getModel();
            var oPayload = {
                Edit: 0,
                HdrKeyLink: this._sHdrKeyLink,
                KeyLink: this._getSelectedWorkItems(),
                Bundling: 1,
                DLRecID: this.aSelectedDistributionLines
            };
            oModel.callFunction(Constants.FunctionImports.CopyCCTRandEdit, {
                method: "POST",
                urlParameters: oPayload,
                success: function (oParam) {
                    this.setBusy(false);
                    this.onCloseDialog();
                    var aContract = oParam.results;
                    if (aContract.length > 0 && !aContract[0].URL) {
                        ReuseMessageBox.loadDialog(oParam);
                    } else {
                        $(aContract).each(function (index, result) {
                          URLHelper.redirect(result.URL, true);
                        });
                    }
                }.bind(this),
                error: function () {
                    this.setBusy(false);
                    this.onCloseDialog();
                }.bind(this)
            });
        },

        /**
         * Method to get selected workitems in the ListReport smartTable
         * @return {array} aSelectedKeyLinks
         */
        _getSelectedWorkItems: function () {
            var aSelectedWorkItems = this._oListReportTable.getSelectedItems();
            var aSelectedKeyLinks = aSelectedWorkItems.map(function (oWorkItem) {
                return oWorkItem.getBindingContext().getProperty("KeyLink");
            });
            return aSelectedKeyLinks;
        },

        /**
         * Click handler for dialog close button
         */
        onCloseDialog: function () {
            this.oListReportSmartTableDialog.close();
            this.oListReportSmartTableDialog.destroy();
            this.oListReportSmartTableDialog = null;
            this.oListReportModel.setProperty("/notifyDevelopment", false);
            this.oListReportModel.setProperty("/copyContractBundle", false);
            this.oListReportModel.setProperty("/enableNotifyDevelopment", false);
            this.oListReportModel.setProperty("/enableCopyContractBundle", false);
        }
    };
    return ListReportSmartTable;
}, true);