sap.ui.define([
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "vwks/nlp/s2p/mm/reuse/lib/util/NavigationHelper",
    "sap/ui/core/Fragment",
    "sap/m/Label",
    "sap/m/ColumnListItem",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/m/SearchField",
    "sap/ui/core/ValueState"
],
    /* eslint-disable max-params */
    function (
        ValueHelpDialog,
        MessageBox,
        JSONModel,
        NavigationHelper,
        Fragment,
        Label,
        ColumnListItem,
        FilterBar,
        SearchField,
        ValueState
    ) {
        "use strict";
        sap.ui.controller("vwks.nlp.s2p.mm.pmaterial.manage.ext.controller.ListReportExt", {
            /**
             * onInit lifecycle method                                             
             * @public                                                                                                                                                                       
             */
            onInit: function () {
                //i18n Resource model for translation
                var oi18nModel = this.getOwnerComponent().getAppComponent().getModel("i18n");
                if (oi18nModel) {
                    this._oResourceBundle = oi18nModel.getResourceBundle();
                }
                this.oPmatTable = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ListReport.view.ListReport::xVWKSxNLP_C_PMAT_COMMON_HDR--responsiveTable"
                );

                if (this.oPmatTable) {
                    this.oPmatTable.attachEvent("selectionChange", this.onSelectionChangeTable.bind(this));
                }

                this._oPmatSmartTable = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ListReport.view.ListReport::xVWKSxNLP_C_PMAT_COMMON_HDR--listReport"
                );
                if (this._oPmatSmartTable) {
                    var aNewRequestedFields = ["PCFActiveKey", "PCFDraftKey"];
                    var sRequestedFields = this._oPmatSmartTable.getRequestAtLeastFields();
                    var aUpdatedRequestedFields = sRequestedFields ? [sRequestedFields].concat(aNewRequestedFields).join(",") : aNewRequestedFields.join(
                        ",");
                    this._oPmatSmartTable.setRequestAtLeastFields(aUpdatedRequestedFields);
                }

                var oViewModel = new JSONModel({
                    enableApplyStatusButton: false,
                    purchasingGroupValueState: "None",
                    enableApplyForwardButton: false
                });
                this.getView().setModel(oViewModel, "settingsModel");
            },
            /**
             * onBeforeRendering lifecycle method                                             
             * @public                                                                                                                                                                       
             */
            onBeforeRendering: function () {
                this.getActionActivationStatus();
            },

            /**
             * Getter method for activation status of actions  
             * @public                                                                                                                                                                       
             */
            getActionActivationStatus: function () {
                var oModel = this.getView().getModel();
                var mParameters = {};
                mParameters.success = this.storeActionActivationStatus.bind(this);
                oModel.read("/xVWKSxNLP_I_ACTION_TYPE_UI", mParameters);
            },

            /*
             * Read entity and populate local model with action activation status  
             * @param {object} oData - entity data from backend
             * @public                                                                                                                                                                       
             */
            storeActionActivationStatus: function (oData) {
                var oActionModel = new JSONModel(oData);
                this.getView().setModel(oActionModel, "PmatActionModel");
            },
            /**
             * On selection of p-material from table 
             * @public                                                                                                                                                                       
             */
            onSelectionChangeTable: function () {
                var oActionModel = this.getView().getModel("PmatActionModel");
                var aResults = oActionModel.getData().results;
                var aSelectedItems = this.oPmatTable.getSelectedContexts();
                if (aSelectedItems.length === 0) {
                    this.forwardActive = false;
                }
                if (aSelectedItems && aSelectedItems.length > 0) {
                    for (var i = 0; i < aSelectedItems.length; i++) {
                        var sActionType = aSelectedItems[i].getProperty("ActionType");
                        // for forward action
                        var isForwardEnabled = "";
                        for (var j = 0; j < aResults.length; j++) {
                            if (aResults[j].UiActionName === "FORWARD" && aResults[j].ActionType === sActionType) {
                                isForwardEnabled = aResults[j].IsEnabled;
                                break;
                            }
                        }
                        if (isForwardEnabled === "X") {
                            this.forwardActive = true;
                        } else {
                            this.forwardActive = false;
                            break;
                        }
                    }
                }
                this.byId("idForwardAction").setEnabled(this.forwardActive);
            },

            /**
             * Handler for opening set status dialog on triggering Set Status action                                                                                           
             * @public                                                                                                                                                                       
             */
            onClickSetStatusAction: function () {
                if (!this._oSetStatusDialog) {
                    this._oSetStatusDialog = sap.ui.xmlfragment(this.getView().getId(),
                        "vwks.nlp.s2p.mm.pmaterial.manage.ext.fragment.SetStatusAction", this);
                    this.getView().addDependent(this._oSetStatusDialog);
                }
                this._oSetStatusDialog.open();
            },

            /**
             * Function to get value of selected status radio button
             * @param {object} oEvent - the event object                                                                                                
             * @public                                                                                                                                                                       
             */
            onSelectStatus: function (oEvent) {
                var oSelectedRadioButton = oEvent.getSource().getSelectedButton();
                var oSelectedRadioButtonContext = oSelectedRadioButton.getBindingContext().getObject();
                this.sSelectedStatus = oSelectedRadioButtonContext.Status;
                this.checkAndEnableStatusApply();
            },

            /*
             * Function to check value of result longtext 
             * @public                                                                                                                                                                       
             */
            onChangeResultLongtext: function () {
                this.checkAndEnableStatusApply();
            },
            /**
             * Function to handle enabling of Apply selected status button
             * @public                                                                                                                                                                       
             */
            checkAndEnableStatusApply: function () {
                this.sResultLongtext = Fragment.byId(this.getView().getId(), "idResultLongText").getValue();
                if (this.sResultLongtext !== "" && this.sSelectedStatus) {
                    this.getView().getModel("settingsModel").setProperty("/enableApplyStatusButton", true);
                } else {
                    this.getView().getModel("settingsModel").setProperty("/enableApplyStatusButton", false);
                }
            },
            /**
             * Function to handle Apply selected status 
             * @public                                                                                                                                                                       
             */
            onChangeStatus: function () {
                // Initialize the variable storing the number of requests and responses
                var oModel = this.getView().getModel();
                oModel.setDeferredGroups(["ChangeStatusDeferredGroup"]);
                // Get the table of selected PRs that the user selects on the PR list page
                var aSelectedItems = this.oPmatTable.getSelectedContexts();
                if (this.sResultLongtext === "" || aSelectedItems.length === 0) {
                    Fragment.byId(this.getView().getId(), "idResultLongText").setValueState(ValueState.Error);
                } else {
                    this._oSetStatusDialog.setBusy(true);
                    var oPayload = [];

                    for (var iSelectedPRCount = 0; iSelectedPRCount < aSelectedItems.length; iSelectedPRCount++) {

                        // Get the Context data of the selected item
                        var oContextData = aSelectedItems[iSelectedPRCount].getProperty(aSelectedItems[iSelectedPRCount].getPath());
                        // Prepare the Payload to be used to fire the GW call
                        oPayload = {
                            ResultLongtext: this.sResultLongtext,
                            KeyLink: oContextData.KeyLink,
                            Status: this.sSelectedStatus

                        };

                        //Call function import to reassign the purchase requisition
                        oModel.callFunction("/SetStatus", {
                            method: "POST",
                            urlParameters: oPayload,
                            batchGroupId: "ChangeStatusDeferredGroup"
                        });
                    }
                    oModel.submitChanges({
                        batchGroupId: "ChangeStatusDeferredGroup",
                        success: this.successSetStatus.bind(this),
                        error: this.errorSetStatus.bind(this)
                    });

                }
            },
            /**
             * Success handler for set status function import call
             * @param {object} oResponse - response from backend                                                                                                
             * @public                                                                                                                                                                       
             */
            successSetStatus: function (oResponse) {
                var aFICallResponse = oResponse.__batchResponses[0].__changeResponses;
                var oResponseMessage = {};
                if (aFICallResponse.length > 1) {
                    oResponseMessage = aFICallResponse.reduce(function (response) {
                        if (response.data) {
                            return response.data.SetStatus;
                        } else {
                            return response;
                        }
                    });
                } else {
                    oResponseMessage = aFICallResponse[0].data.SetStatus;
                }
                this._oSetStatusDialog.setBusy(false);
                this.onCancelChangeStatus();

                if (oResponseMessage.Type === "S") {
                    MessageBox.success(oResponseMessage.Message, {
                        onClose: this.refreshAfterSetStatus.bind(this)
                    });
                } else if (oResponseMessage.Type === "E") {
                    MessageBox.error(oResponseMessage.Message);
                    this.refreshAfterSetStatus();
                }
            },
            /**
             * Error handler for set status function import call                                                                                      
             * @param {object} oResponse - response from backend                                                                                               
             * @public                                                                                                                                                                       
             */
            errorSetStatus: function (oResponse) {
                try {
                    MessageBox.error(JSON.parse(oResponse.responseText).error.message.value);
                } catch (e) {
                    MessageBox.error(this._oResourceBundle.getText("SetStatusError"));
                }
            },

            /**
             * Function to handle Cancel operation on set status dialog                                                                                      
             * @public                                                                                                                                                                       
             */
            onCancelChangeStatus: function () {
                this._oSetStatusDialog.close();
                this._oSetStatusDialog.destroy();
                this._oSetStatusDialog = null;
                this.sSelectedStatus = "";
            },
            /**
             * Function to refresh p material table after updating status                                                                                     
             * @public                                                                                                                                                                       
             */
            refreshAfterSetStatus: function () {
                this.oPmatTable.removeSelections();
                this.extensionAPI.refreshTable();
            },

            /**
             * Handler for opening Forward dialog on triggering Forward action
             * @param {object} oEvent - the event object                                                                                                
             * @public                                                                                                                                                                       
             */
            onClickForwardAction: function () {
                if (!this._oForwardActionDialog) {
                    this._oForwardActionDialog = sap.ui.xmlfragment(this.getView().getId(),
                        "vwks.nlp.s2p.mm.pmaterial.manage.ext.fragment.ForwardAction", this);
                    this.getView().addDependent(this._oForwardActionDialog);
                    this._oForwardActionDialog.open();
                }
            },
            /*
             * Handler for live change of purchasing group                                                               
             * @public                                                                                                                                                                       
             */
            onTargetPurGrpChange: function () {
                var sPurgGrp = Fragment.byId(this.getView().getId(), "idPurchasingGrp").getValue();
                if (sPurgGrp === "") {
                    this.getView().getModel("settingsModel").setProperty("/purchasingGroupValueState", ValueState.Error);
                    this.getView().getModel("settingsModel").setProperty("/enableApplyForwardButton", false);
                } else {
                    this.getView().getModel("settingsModel").setProperty("/purchasingGroupValueState", ValueState.None);
                    this.getView().getModel("settingsModel").setProperty("/enableApplyForwardButton", true);
                }
            },

            /**
             * Function to handle Apply forwarding
             * @public                                                                                                                                                                       
             */
            onClickApplyForwardAction: function () {
                var oModel = this.getView().getModel();
                oModel.setDeferredGroups(["ForwardActionDeferredGroup"]);

                var sForwardComment = Fragment.byId(this.getView().getId(), "idForwardComment").getValue();
                var sPurchasingGrp = Fragment.byId(this.getView().getId(), "idPurchasingGrp").getValue();
                // Get the table of selected PRs that the user selects on the PR list page
                var aSelectedItems = this.oPmatTable.getSelectedContexts();
                if (sPurchasingGrp === "" || aSelectedItems.length === 0) {
                    this.getView().getModel("settingsModel").setProperty("/purchasingGroupValueState", ValueState.Error);
                } else {
                    this._oForwardActionDialog.setBusy(true);
                    var oPayload = [];

                    for (var iSelectedPRCount = 0; iSelectedPRCount < aSelectedItems.length; iSelectedPRCount++) {

                        // Get the Context data of the selected item
                        var oContextData = aSelectedItems[iSelectedPRCount].getProperty(aSelectedItems[iSelectedPRCount].getPath());
                        // Prepare the Payload to be used to fire the GW call
                        oPayload = {
                            PurchaseGrp: sPurchasingGrp,
                            KeyLink: oContextData.KeyLink,
                            ForwardComment: sForwardComment
                        };
                        //Call function import to reassign the purchase requisition
                        this.getView().getModel().callFunction("/Forward", {
                            batchGroupId: "ForwardActionDeferredGroup",
                            method: "POST",
                            urlParameters: oPayload
                        });
                    }

                    oModel.submitChanges({
                        batchGroupId: "ForwardActionDeferredGroup",
                        success: this.successForwardAction.bind(this),
                        error: this.errorForwardAction.bind(this)
                    });
                }
            },
            /**
             * Success handler for Forward Action function import call
             * @param {object} oResponse - response from backend                                                                                                
             * @public                                                                                                                                                                       
             */
            successForwardAction: function (oResponse) {
                var aFICallResponse = oResponse.__batchResponses[0].__changeResponses;
                var oResponseMessage = {};
                if (aFICallResponse.length > 1) {
                    oResponseMessage = aFICallResponse.reduce(function (response) {
                        if (response.data) {
                            return response.data.Forward;
                        } else {
                            return response;
                        }
                    });
                } else {
                    oResponseMessage = aFICallResponse[0].data.Forward;
                }
                this._oForwardActionDialog.setBusy(false);
                this.onClickForwardActionCancel();

                if (oResponseMessage.Type === "S") {
                    MessageBox.success(oResponseMessage.Message, {
                        onClose: this.refreshAfterForwardAction.bind(this)
                    });
                } else if (oResponseMessage.Type === "E") {
                    MessageBox.error(oResponseMessage.Message);
                    this.refreshAfterForwardAction();
                }
            },

            /**
             * Error handler for Forward Action function import call                                                                                      
             * @param {object} oResponse - response from backend                                                                                               
             * @public                                                                                                                                                                       
             */
            errorForwardAction: function (oResponse) {
                this._oForwardActionDialog.setBusy(false);
                try {
                    MessageBox.error(JSON.parse(oResponse.responseText).error.message.value);
                } catch (e) {
                    MessageBox.error(this._oResourceBundle.getText("ForwardActionError"));
                }
            },
            /**
             * Function to refresh p material table after forwarding action                                                                                   
             * @public                                                                                                                                                                       
             */
            refreshAfterForwardAction: function () {
                this.oPmatTable.removeSelections();
                this.extensionAPI.refreshTable();
            },

            /**
             * Function to handle close forward action popup
             * @public                                                                                                                                                                       
             */
            onClickForwardActionCancel: function () {
                this._oForwardActionDialog.close();
                this._oForwardActionDialog.destroy();
                this._oForwardActionDialog = null;
            },
            /**
             * Purchasing group value help
             * @public                                                                                                                                                                       
             */
            onValueHelpRequest: function () {
                this.ValueHelpDialog = new ValueHelpDialog({
                    title: "{i18n>PurchasingGroup}",
                    basicSearchText: "",
                    supportRanges: false,
                    supportRangesOnly: false,
                    supportMultiselect: false,
                    cancel: this.onVHClose.bind(this),
                    filterMode: true
                });
                var oModel = this.getView().getModel();
                var mParameters = {};
                mParameters.success = this.onSuccessValueHelp.bind(this);
                mParameters.error = this.onErrorValueHelp.bind(this);
                oModel.read("/I_PurchasingGroup", mParameters);
            },
            /*
             * Success handler for purg grp  value help                                           
             * @param {object} oData
             * @public                                                                                                                                                                       
             */
            onSuccessValueHelp: function (oData) {
                this.getView().addDependent(this.ValueHelpDialog);
                var oResourceModel = this.getOwnerComponent().getAppComponent().getModel("i18n").getResourceBundle();
                var oColModel = new JSONModel();
                var sGroupCol = oResourceModel.getText("ColPurchasingGroup");
                var sGroupNameCol = oResourceModel.getText("ColPurchasingGroupName");
                var sSearchGroup = oResourceModel.getText("SearchGroup");
                oColModel.setData({
                    cols: [{
                        label: sGroupCol,
                        template: "PurchasingGroup"
                    }, {
                        label: sGroupNameCol,
                        template: "PurchasingGroupName"
                    }]
                });
                this.aResults = oData.results;
                this.ValueHelpDialog.getTable().setModel(oColModel, "columns");
                this.oRowsModel = new JSONModel();
                this.oRowsModel.setData(oData.results);
                this.ValueHelpDialog.getTable().setModel(this.oRowsModel);
                var oTable = this.ValueHelpDialog.getTable();
                oTable.bindAggregation("rows", "/", function () {
                    var aCols = oTable.getModel("columns").getData().cols;

                    return new ColumnListItem({
                        cells: aCols.map(function (column) {
                            var sColname = column.template;
                            return new Label({
                                text: "{" + sColname + "}"
                            });
                        })
                    });
                });
                var oFilterBar = new FilterBar({
                    advancedMode: true,
                    filterBarExpanded: false,
                    showGoOnFB: !sap.ui.Device.system.phone

                });
                if (oFilterBar.setBasicSearch) {
                    oFilterBar.setBasicSearch(new SearchField({
                        showSearchButton: sap.ui.Device.system.phone,
                        placeholder: sSearchGroup

                    }));
                }
                this.ValueHelpDialog.setFilterBar(oFilterBar);
                var oFilter = this.ValueHelpDialog.getFilterBar();
                oFilter.attachSearch(this.onSearchPurchasingGroup, this);
                oFilter.attachFilterChange(this.onSearchPurchasingGroup, this);
                oTable.attachRowSelectionChange(oData, this.onRowSelectionChange, this);
                this.ValueHelpDialog.open();
            },

            /*
             * Error handler for purg group value help                                           
             * @param {object} oError Error object
             * @public                                                                                                                                                                       
             */
            onErrorValueHelp: function (oError) {
                try {
                    MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                } catch (e) {
                    MessageBox.error(this._oResourceBundle.getText("PurgGroupError"));
                }
            },
            /*
             * Handler for search feature in purchasing group value help                                                                                                                                
             * @param {object} oEvent - event when user enters some search value
             * @public                                                                                                                                                                       
             */
            onSearchPurchasingGroup: function (oEvent) {
                this.oRowsModel.setData(this.aResults);
                var sSearchVal;
                var oFilterBar = oEvent.getSource();
                var sSearchValAct = sap.ui.getCore().byId(oFilterBar.getBasicSearch()).getValue();
                sSearchVal = sSearchValAct.toUpperCase();
                var aValueHelpTableModelData = this.oRowsModel.getData();

                if (sSearchVal === "") {
                    this.oRowsModel.setData(this.aResults);
                    return;
                }
                aValueHelpTableModelData = aValueHelpTableModelData.filter(function (obj) {
                    return obj.PurchasingGroup.includes(sSearchVal) || obj.PurchasingGroupName.toUpperCase().includes(sSearchVal);
                });
                this.oRowsModel.setData(aValueHelpTableModelData);
            },

            /*
             * Handler for selecting purchasing group from value help table                                                                 
             * @param {object} oEvent - event when user selects value from value help
             * @public                                                                                                                                                                       
             */
            onRowSelectionChange: function (oEvent) {
                var oValue = oEvent.getParameter("rowContext").getObject().PurchasingGroup;
                var oPurchasingGroup = Fragment.byId(this.getView().getId(), "idPurchasingGrp");
                oPurchasingGroup.setValue(oValue);
                oPurchasingGroup.fireLiveChange();
                this.onVHClose();
            },
            /**
             * On closing purchasing group value help    
             * @public                                                                                                                                                                       
             */
            onVHClose: function () {
                this.ValueHelpDialog.close();
                this.ValueHelpDialog.destroy();
                this.ValueHelpDialog = null;
            },
            /**
             * On click of list report identify the action type and 
             * navigate to Purchaser Communication Form
             * @param {oEvent} oEvent press event
             * @return {boolean} flag for default navigation
             **/
            onListNavigationExtension: function (oEvent) {

                var oListItemBindingContext = oEvent.getSource().getBindingContext();
                var oListItemObject = oListItemBindingContext.getObject();

                if (oListItemObject.ActionType === "PCF") {

                    var oPcfDetail = this._getPcfNavDetails(oListItemObject.PCFActiveKey, oListItemObject.PCFDraftKey);

                    var oParams = {
                        PcfKey: oPcfDetail.PcfKey,
                        IsActiveEntity: oPcfDetail.isActiveEntity,
                        source: "PMAT"
                    };

                    //Navigate to PCF
                    NavigationHelper.navigateToOutboundTarget(this, "PCF", oParams);

                } else {
                    // return false to trigger the default internal navigation
                    return false;
                }
                // return true is necessary to prevent further default navigation
                return true;
            },
            /**
             * The identify the guid to pass for PcfKey and if it is active entity
             * @param {sActiveUUID} sActiveUUID is the active guid
             * @param {sDraftUUID} sDraftUUID is the draft guid
             * @return {Object} sObjectKey is the combination of guid and is active flag
             */
            _getPcfNavDetails: function (sActiveUUID, sDraftUUID) {
                var sObjectKey = {};
                if (sActiveUUID !== undefined && sActiveUUID !== null && sActiveUUID !== "" &&
                    sActiveUUID !== "00000000-0000-0000-0000-000000000000" && typeof sActiveUUID === "string") {
                    sObjectKey.PcfKey = sActiveUUID;
                    sObjectKey.isActiveEntity = true;
                } else if (sDraftUUID !== undefined && sDraftUUID !== null && sDraftUUID !== "" &&
                    sDraftUUID !== "00000000-0000-0000-0000-000000000000" && typeof sDraftUUID === "string") {
                    sObjectKey.PcfKey = sDraftUUID;
                    sObjectKey.isActiveEntity = true;
                }
                return sObjectKey;
            }
        });
    });