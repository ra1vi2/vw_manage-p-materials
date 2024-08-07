/*
 * Copyright (C) 2009-2020 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "vwks/nlp/s2p/mm/pmaterial/manage/utils/Formatter",
    "sap/ui/core/Fragment",
    "vwks/nlp/s2p/mm/pmaterial/manage/utils/Constants",
    "sap/ui/model/json/JSONModel",
    "vwks/nlp/s2p/mm/pmaterial/manage/ext/reuse/listReportSmartTable",
    "vwks/nlp/s2p/mm/reuse/lib/util/Constants",
    "vwks/nlp/s2p/mm/reuse/lib/util/NavigationHelper",
    "vwks/nlp/s2p/mm/pmaterial/manage/ext/reuse/ReuseMessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "vwks/nlp/s2p/mm/reuse/lib/util/MessageViewHelper",
    "sap/m/Button",
    "sap/ui/core/ValueState",
    "sap/m/ButtonType",
    "sap/ui/core/MessageType"
],
    /* eslint-disable max-params */
    function (
        MessageBox,
        MessageToast,
        LocalFormatter,
        Fragment,
        Constants,
        JSONModel,
        ReuseListReportSmartTable,
        ReuseConstants,
        NavigationHelper,
        ReuseMessageBox,
        Filter,
        FilterOperator,
        MessageViewHelper,
        Button,
        ValueState,
        ButtonType,
        MessageType
    ) {
        "use strict";
        sap.ui.controller("vwks.nlp.s2p.mm.pmaterial.manage.ext.controller.ObjectPageExt", {
            formatter: LocalFormatter,
            /**
             * onInit lifecycle method                                             
             * @public                                                                                                                                                                       
             */
            /*eslint max-statements: ["error", 100]*/
            onInit: function () {
                //Set default visibility false for Update sourcing button
                sap.ui.getCore().byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idUpdateSourcingProjectButton"
                ).setVisible(false);
                var sENTIPageId =
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_ENTI_ITEM";
                //i18n Resource model for translation
                this.oi18nModel = this.getOwnerComponent().getAppComponent().getModel("i18n");
                if (this.oi18nModel) {
                    this._oResourceBundle = this.oi18nModel.getResourceBundle();
                    ReuseListReportSmartTable.init(this.getView(), this.oi18nModel);
                    ReuseMessageBox.init(this.getView(), this.oi18nModel);
                }
                if (this.getView().getId() !== sENTIPageId) {
                    this._bCopyContractButtonPressed = false;
                    this.oContractsTable = this.byId("idContractsSmartTable");
                    this.oContractsTableCOAU = this.byId("idContractSmartTableCA");
                    this.oPlantsTable = this.byId("idPlantsSmartTable");
                    if (this.oPlantsTable) {
                        this.oPlantsTable.getTable().attachSelectionChange(this.onPlantsRowSelection.bind(this));
                    }
                    this.oExistingDistLinesTable = this.byId("idExistingDistLinesSmartTable");
                    if (this.oContractsTable) {
                        this.oContractsTable.attachDataReceived(this.getExistingDistLinesOnLoad.bind(this));
                    }
                    this.extensionAPI.attachPageDataLoaded(this.getKeyLink.bind(this));
                    this.extensionAPI.attachPageDataLoaded(this.checkEnableDistribution.bind(this));
                    this.extensionAPI.getTransactionController().attachAfterActivate(this._onSave.bind(this));

                    this._oDistributionLineSmartTable = sap.ui.getCore().byId(
                        "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--Dist_No::Table"
                    );
                    this.oCopyContractBtn = this.byId(
                        "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idCopyContractButton"
                    );
                    this.oCopyContractEditBtn = this.byId(
                        "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idCopyContractAndEditButton"
                    );
                    this.oCopyContractBundleBtn = this.byId(
                        "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idProcessMultipleWorkItemsButton"
                    );

                    if (this.oExistingDistLinesTable) {
                        this.oExistingDistLinesTable.attachDataReceived(this._oExistingDistLinesTableDataReceived.bind(this));
                    }

                    if (this._oDistributionLineSmartTable) {
                        this._oDistributionLineSmartTable.getTable().attachSelectionChange(this.onDistributionLineRowSelection.bind(this));
                        this._oDistributionLineSmartTable.attachDataReceived(this._oDistributionLineSmartTableDataReceived.bind(this));
                        // if there is any additional field requested from standard then put ","
                        // add more custom fields as comma separated without space in between
                        var sRequestedFields = "NewIndicator";
                        if (this._oDistributionLineSmartTable.getRequestAtLeastFields() !== "") {
                            sRequestedFields = "," + sRequestedFields;
                            // Concatenate with existing requested fields
                            this._oDistributionLineSmartTable.setRequestAtLeastFields(this._oDistributionLineSmartTable.getRequestAtLeastFields() +
                                sRequestedFields);
                        } else {
                            this._oDistributionLineSmartTable.setRequestAtLeastFields(sRequestedFields);
                        }
                    }
                }
                // get reference of framework Save button
                this._sStandardSaveButton = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--activate"
                );
                this._oComponentTable = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--Compn::treeTable"
                );
                var oPropertyModel = this._createPropertyModel();
                this.getView().setModel(oPropertyModel, "propertyModel");
                if (this.byId("ActionDeleteTechnicalChange")) {
                    this.byId("ActionDeleteTechnicalChange").bindProperty("enabled", {
                        path: "propertyModel>/bDeleteButtonEnable"
                    });
                }
                if (this.byId("ActionCopyTechnicalChange")) {
                    this.byId("ActionCopyTechnicalChange").bindProperty("enabled", {
                        path: "propertyModel>/bCopyButtonEnable"
                    });
                }
                var oMaterialJson = new JSONModel();
                this.getView().setModel(oMaterialJson, "ExistingColorModel");
                this._setDistLineDeferredGroup();
                this.getOwnerComponent().getModel().attachRequestCompleted(this.onODataRequestCompleted.bind(this));
            },

            /**
             * This method will be called when ever request completed
             * @public
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onODataRequestCompleted: function (oEvent) {
                var oRequest = oEvent.getParameters();

                if (oRequest && oRequest.url.includes("to_RFCDEXIDL")) {
                    var sActionType = this.getView().getBindingContext().getProperty("ActionType");
                    var oCustomButtonsEnableModel = this.getModel("oCustomButtonsEnableModel");
                    var bSaveDLButtonsEnabling = false;
                    if (sActionType === Constants.ActionTypes.RFCD && this.getModel("ui").getProperty("/editable")) {
                        bSaveDLButtonsEnabling = !!(oRequest.response.headers.enablesavedl);
                        oCustomButtonsEnableModel.setProperty("/enableCreateDistributionLines", bSaveDLButtonsEnabling);
                        oCustomButtonsEnableModel.setProperty("/enableCreateDistributionLinesAndEdit", bSaveDLButtonsEnabling);
                    }
                }              
            },

            /**
             * Sets deffered group for Distribution Line creation
             */
            _setDistLineDeferredGroup: function () {
                var aDeferredGroups = this.getOwnerComponent().getModel().getDeferredGroups();
                aDeferredGroups = aDeferredGroups.concat(["createDistLine"]);
                this.getOwnerComponent().getModel().setDeferredGroups(aDeferredGroups);
            },

            /**
             * Method to fetch Existing Color Material and set in local model
             */
            getExistingColorMaterial: function () {
                var oModel = this.getModel();
                var sUrl = this.getView().getBindingContext().getPath() + "/to_EXISTINGCOLOR";
                var that = this;
                oModel.read(sUrl, {
                    urlParameters: {
                        $select: "material"
                    },
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            that.getView().getModel("ExistingColorModel").setData(oData.results);
                        }
                    },
                    error: function () {
                        that.getView().getModel("ExistingColorModel").setData({});
                    }
                });
            },
            /**
             * Method for handling functionality of Validity Status dropdown in Distribution Request facet.
             * @private
             */

            _setDistributionRequestData: function () {
                var oValidityStatus = new JSONModel({
                    statusList: [{ status: Constants.ValidityStatus.All, text: this._oResourceBundle.getText("All") },
                    { status: Constants.ValidityStatus.Valid, text: this._oResourceBundle.getText("Valid") },
                    { status: Constants.ValidityStatus.Expired, text: this._oResourceBundle.getText("Expired") }], defaultStatusKey: Constants.ValidityStatus.Valid
                });
                var oValidityStatusComboBox = this.getView().byId("idValidityStatusDropdown");
                oValidityStatusComboBox.setModel(oValidityStatus, "ValidityStatusModel");
                this.changeValidityStatus();

            },

            /**
             * rename Labels of purchase group column and local purchaser.
             * @private
             */
            _renamePurchaseGroupLabel: function () {

                this._oPurchasingGroup = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--HeaderDetails::PurchaseGrp::Field-label"
                );
                this._oLocalPurchaser = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--RequesterData::PurchaseGrp::Field-label"
                );
                var oView = this.getView();
                var sActionType = oView.getBindingContext().getProperty("ActionType");
                if (sActionType) {
                    if (sActionType === Constants.ActionTypes.COAU || sActionType === Constants.ActionTypes.RFCD) {
                        this._oPurchasingGroup.setText(this._oResourceBundle.getText("LeadPurchasingGroup"));
                    } else {
                        this._oPurchasingGroup.setText(this._oResourceBundle.getText("PurchasingGroup"));
                    }
                    if (sActionType === Constants.ActionTypes.RFCD) {
                        this._oLocalPurchaser.setText(this._oResourceBundle.getText("RequesterPurchasingGroup"));
                    }
                }
            },

            /**
             * Get current key link 
             * @public                                                                                                                                                                       
             */
            getKeyLink: function () {
                this.sKeyLink = this.getView().getBindingContext().getProperty("KeyLink");
                this._handleCustomButtons();
                this._renamePurchaseGroupLabel();
                this._handleRFCDAutobinding();
                this._setDistributionRequestData();

            },
            /**
             * Method to handle bindings of RFCD smart tables
             */
            _handleRFCDAutobinding: function(){
                var sActionType = this.getView().getBindingContext().getProperty("ActionType");
                if (sActionType === Constants.ActionTypes.RFCD) {
                    this.oContractsTable.rebindTable();
                    this.oPlantsTable.rebindTable();
                    this.oExistingDistLinesTable.rebindTable();
                } else if (sActionType === Constants.ActionTypes.COAU) {
                    this.oContractsTableCOAU.rebindTable();
                }
            },

            /**
             * Method get Model Object for provided model name 
             * @param {string} sModelName - Name of the model
             * @return {sap.ui.Model} Model Object
             */
            getModel: function (sModelName) {
                return this.getView().getModel(sModelName);
            },

            /**
             * Handler for navigation on contract link press
             * @param {object} oEvent - contract press event
             * @public                                                                                                                                                                       
             */
            handleContractPress: function (oEvent) {
                var sSeletedContract = oEvent.getSource().getProperty("text");
                var sRequiredUrl = this.getModel("MCPC").createKey("C_CntrlPurContrHierHdrTP", {
                    CentralPurchaseContract: sSeletedContract,
                    DraftUUID: ReuseConstants.INITIAL_GUID,
                    IsActiveEntity: true
                });
                //Open the contract in a new window
                NavigationHelper.navigateToExternalApp(this, "MCPC", sRequiredUrl, null, true);
            },

            /**
             * Method to get existing distribution lines for preselected contracts
             * @public                                                                                                                                                                       
             */
            getExistingDistLinesOnLoad: function () {
                var aContracts = this.oContractsTable.getTable().getItems();
                var bContractSelected = true;
                if (aContracts.length !== 0) {
                    for (var i = 0; i < aContracts.length; i++) {
                        var oContractContext = aContracts[i].getBindingContext();
                        if (oContractContext.getProperty("Selected")) {
                            var sContract = oContractContext.getProperty("CentralPurchaseContract");
                            this.getExistingDistributionLines(sContract, bContractSelected);
                        }
                    }
                }
            },

            /**
             * Call to function import to get existing distribution lines                                                                         
             * @param {string} sContract - contract number
             * @param {boolean} bContractSelected - is contract selected/deselected 
             * @public                                                                                                                                                                       
             */
            getExistingDistributionLines: function (sContract, bContractSelected) {
                var aPayload = {
                    KeyLink: this.sKeyLink,
                    ContractNum: sContract,
                    Selected: bContractSelected
                };
                //Call function import to update existing dl 
                this.getModel().callFunction("/GetExDL", {
                    method: "POST",
                    urlParameters: aPayload,
                    success: this.successCRUDOnDistributionLines.bind(this),
                    error: this.errorCRUDOnDistributionLines.bind(this)
                });
            },

            /**
             * BeforeSaveExtension is triggered just before starting the save operations
             * @return {Promise} Save operation promise
             */
            beforeSaveExtension: function () {
                var fnResolve, fnReject;
                var oView = this.getView();
                var sActionType = oView.getBindingContext().getProperty("ActionType");
                var oPromise = new Promise(function (resolve, reject) {
                    fnResolve = resolve;
                    fnReject = reject;
                });
                if (sActionType === Constants.ActionTypes.COAU && this._pausibilityCheck) {
                    this.setBusy(true);
                    this._validateSupplierFIPromise().then(function (oSuccess) {
                        this.setBusy(false);
                        if (oSuccess.ValidateSupplier.Type === Constants.MessageTypes.Error) {
                            MessageBox.error(oSuccess.ValidateSupplier.Message);
                            fnReject();
                        } else {
                            fnResolve();
                        }
                    }.bind(this)).catch(function () {
                        this.setBusy(false);
                        fnReject();
                    }.bind(this));
                } else {
                    fnResolve();
                }
                return oPromise;
            },

            /**
             * This method is fired, once save action is done.
             * It calls suitable FIs depending upon ActionTypes.
             * @param {sap.ui.base.Event} oEvent The event  object
             * @private
             */
            _onSave: function (oEvent) {
                var oView = this.getView();
                var sActionType = oView.getBindingContext().getProperty("ActionType");
                if (this._oPayload && (sActionType === Constants.ActionTypes.RFCD || sActionType === Constants.ActionTypes.COAU)) {
                    var sFunctionImport;
                    if (sActionType === Constants.ActionTypes.RFCD) {
                        sFunctionImport = Constants.FunctionImports.CreateCCTRDLandEdit;
                    } else {
                        sFunctionImport = Constants.FunctionImports.CopyCCTRandEdit;
                    }
                    oEvent.activationPromise
                        .then(function () {
                            this.setBusy(true);
                            oView.getModel().callFunction(sFunctionImport, {
                                method: "POST",
                                urlParameters: this._oPayload,
                                success: this._successPostCCTR.bind(this),
                                error: this._errorPostCCTR.bind(this)
                            });
                        }.bind(this)).catch(function () {
                            //catch to avoid rejection error
                        });
                } else if (this._oTechChangePayload && sActionType === Constants.ActionTypes.TECH && this._functionImportName) {
                    oEvent.activationPromise.then(function () {
                        this._callTechChangeFI();
                    }.bind(this)).catch(function () {
                        //catch to avoid rejection error
                    });
                } else if (this.copyContractContractBundle && sActionType === Constants.ActionTypes.COAU) {
                    oEvent.activationPromise.then(function () {
                        this._openCopyContractBundleDialog();
                    }.bind(this)).catch(function () {
                        //catch to avoid rejection error
                    });
                }
            },

            /**
             * Handler for selection change on contracts table in distribution request facet  
             * @param {object} oEvent - event object
             * @public                                                                                                                                                                       
             */
            onContractsSelection: function (oEvent) {
                var bContractSelected = oEvent.getParameter("selected");
                var aModifiedContracts = oEvent.getParameter("listItems");
                var sActionType = this.getView().getBindingContext().getObject().ActionType;
                for (var i = 0; i < aModifiedContracts.length; i++) {
                    var sContract = aModifiedContracts[i].getBindingContext().getProperty("CentralPurchaseContract");
                    if (!bContractSelected && sActionType === Constants.ActionTypes.RFCD) {
                        this._resetLocalChanges(sContract);
                    }
                    this.getExistingDistributionLines(sContract, bContractSelected);
                }
                if (sActionType === Constants.ActionTypes.RFCD) {
                    this._controlAddDistributionLines();
                }
            },

            /**
             * Handler for row selection of Plants smart table
             */
            onPlantsRowSelection: function () {
                this._controlAddDistributionLines();
            },

            /**
             * Method to enable/disable Add distribution lines button based upon contracts and plants combination
             */
            _controlAddDistributionLines: function () {
                var oCustomButtonsEnableModel = this.getModel("oCustomButtonsEnableModel");
                var iSelectedContracts = this.oContractsTable.getTable().getSelectedContexts().length;
                var iSelectedPlants = this.oPlantsTable.getTable().getSelectedContexts().length;
                var iProduct = iSelectedContracts * iSelectedPlants;
                if (iProduct) {
                    oCustomButtonsEnableModel.setProperty("/enableAddDistribution", true);
                    if (iProduct === 1) {
                        this.oAddDistributionLinesButton.setText(this._oResourceBundle.getText("AddDistributionLine"));
                    } else {
                        this.oAddDistributionLinesButton.setText(this._oResourceBundle.getText("AddDistributionLines", [iProduct]));
                    }
                } else {
                    this.oAddDistributionLinesButton.setText(this._oResourceBundle.getText("AddLinesDefaultText"));
                    oCustomButtonsEnableModel.setProperty("/enableAddDistribution", false);
                }
            },

            /**
             * Method to clear local changes on deselection of contract(s)  
             * @param {String} sContract - Contract number
             * @public                                                                                                                                                                       
             */
            _resetLocalChanges: function (sContract) {
                var aExistingDistributionLines = this.oExistingDistLinesTable.getTable().getItems();
                var sNewIndicator = "";
                var aRecID = [];
                aExistingDistributionLines.map(function (item) {
                    sNewIndicator = item.getBindingContext().getProperty("NewIndicator");
                    if (sContract === item.getBindingContext().getProperty("ContractNum") && sNewIndicator === "x") {
                        aRecID.push(item.getBindingContext().getProperty("RecID"));
                    }
                });
                var oModel = this.getModel();
                var aPendingChanges = Object.keys(oModel.getPendingChanges());
                var aPendingChangesData = aPendingChanges.map(function (sPath) {
                    return oModel.getProperty("/" + sPath);
                });
                var aPaths = [];
                for (var i = 0; i < aPendingChangesData.length; i++) {
                    if (aRecID.includes(aPendingChangesData[i].RecID)) {
                        aPaths.push("/" + aPendingChanges[i]);
                    }
                }
                if (aPaths.length) {
                    oModel.resetChanges(aPaths);
                }
            },

            /**
             * Handler for row selection of distribution line smart table
             * @public                                                                                                                                                                       
             */
            onDistributionLineRowSelection: function () {
                var aSelectedDistributionLines = this._oDistributionLineSmartTable.getTable().getSelectedItems();
                var oCustomButtonsEnableModel = this.getModel("oCustomButtonsEnableModel");
                if (this.oCopyContractBtn && this.oCopyContractEditBtn && this.oCopyContractBundleBtn && this.oDistributionLineDeleteButton) {
                    if (!aSelectedDistributionLines.length) {
                        oCustomButtonsEnableModel.setProperty("/enableCopyContract", false);
                        oCustomButtonsEnableModel.setProperty("/enableCopyContractandEdit", false);
                        oCustomButtonsEnableModel.setProperty("/enableCopyContractBundle", false);
                        oCustomButtonsEnableModel.setProperty("/enableDelete", false);
                    } else {
                        oCustomButtonsEnableModel.setProperty("/enableCopyContract", true);
                        oCustomButtonsEnableModel.setProperty("/enableCopyContractandEdit", true);
                        oCustomButtonsEnableModel.setProperty("/enableCopyContractBundle", true);
                        var bEnableDelete = true;
                        var sNewIndicator = "";
                        for (var i = 0; i < aSelectedDistributionLines.length; i++) {
                            sNewIndicator = aSelectedDistributionLines[i].getBindingContext().getProperty("NewIndicator");
                            if (!sNewIndicator) {
                                bEnableDelete = false;
                                break;
                            }
                        }
                        oCustomButtonsEnableModel.setProperty("/enableDelete", bEnableDelete);
                    }
                }
            },

            /**
             * Success handler for create/get distribution lines function import call
             * @param {object} oResponse - response from backend                                                                                                
             * @public                                                                                                                                                                       
             */
            successCRUDOnDistributionLines: function (oResponse) {
                var oResults;
                if (oResponse.GetExDL) {
                    oResults = oResponse.GetExDL;
                } else if (oResponse.CreateNewDLs) {
                    oResults = oResponse.CreateNewDLs;
                    this._oAddLinesDialog.setBusy(false);
                    this.onAddLinesDialogClose();
                    if (oResults.Type === Constants.MessageTypes.Success) {
                        this._initiliaseExistingDistLinesTableNewIndicator = true;
                    }
                } else if (oResponse.DeleteDL) {
                    oResults = oResponse.DeleteDL;
                }
                var sMessage = oResults.Message;
                if (oResults.Type === Constants.MessageTypes.Success || oResults.Type === Constants.MessageTypes.Info) {
                    MessageToast.show(sMessage);
                } else if (oResults.Type === Constants.MessageTypes.Error) {
                    MessageBox.error(sMessage);
                }
                this.refreshExistingDistributionLines();
            },

            /**
             * Error handler for create/get distribution lines function import call
             * @param {object} oResponse - response from backend                                                                                                
             * @public                                                                                                                                                                       
             */
            errorCRUDOnDistributionLines: function (oResponse) {
                try {
                    if (this._oAddLinesDialog) {
                        this._oAddLinesDialog.setBusy(false);
                    }
                    MessageBox.error(oResponse.message);
                } catch (e) {
                    MessageBox.error(this._oResourceBundle.getText("ActionError"));
                }
            },

            /**
             * Handler for Add Lines button Click
             */
            onAddDistributionLines: function () {
                if (!this._oAddLinesDialog) {
                    this.setBusy(true);
                    Fragment.load({
                        id: "idAddLinesDialog",
                        name: "vwks.nlp.s2p.mm.pmaterial.manage.ext.fragment.AddDistributionLinesDialog",
                        controller: this
                    }).then(function (oDialog) {
                        this._oAddLinesDialog = oDialog;
                        this._oAddDistLinesSmartTable = Fragment.byId("idAddLinesDialog", "idAddDistLinesDialogSmartTable");
                        this._oSelectButton = Fragment.byId("idAddLinesDialog", "idSelect");
                        this.getView().addDependent(this._oAddLinesDialog);
                        this._oAddLinesDialog.open();
                        this.setBusy(false);
                    }.bind(this));
                } else {
                    this._oAddLinesDialog.open();
                    this._oAddDistLinesSmartTable.rebindTable();
                }
            },

            /**
             * Method to set busy status on UI
             * @param {boolean} bBusyView - value to set busy or not
             */
            setBusy: function (bBusyView) {
                this.getView().setBusy(bBusyView);
            },

            /**
             * Handler for Row Selection of Add Distribution Lines Dialog Smart table
             * @param {sap.ui.base.Event} oEvent The event  object
             */
            onTemplateContractSelection: function (oEvent) {
                this._oSelectButton.setEnabled(true);
                this._oSelectedTemplateContext = oEvent.getSource().getSelectedItem().getBindingContext();
            },

            /**
             * Handler for create distribution lines button in distribution request facet
             * @public                                                                                                                                                                       
             */
            onAddLinesDialogSelect: function () {
                var aSelectedContractsContexts = this.oContractsTable.getTable().getSelectedContexts();
                var aSelectedPlantsContexts = this.oPlantsTable.getTable().getSelectedContexts();
                var oSelectedTemplateObject = this._oSelectedTemplateContext.getObject();
                var aSelectedContracts = [];
                var aSelectedPlants = [];
                var sTemplateId = oSelectedTemplateObject.RecID;
                for (var iSelectedContractCount = 0; iSelectedContractCount < aSelectedContractsContexts.length; iSelectedContractCount++) {
                    var sContractNumber = aSelectedContractsContexts[iSelectedContractCount].getProperty("CentralPurchaseContract");
                    aSelectedContracts.push(sContractNumber);
                }
                for (var iSelectedPlantsCount = 0; iSelectedPlantsCount < aSelectedPlantsContexts.length; iSelectedPlantsCount++) {
                    var sPlant = aSelectedPlantsContexts[iSelectedPlantsCount].getProperty("Plant");
                    aSelectedPlants.push(sPlant);
                }
                var oPayload = {
                    KeyLink: this.sKeyLink,
                    Contract: aSelectedContracts,
                    Plant: aSelectedPlants,
                    RefTempID: sTemplateId
                };
                this._oAddLinesDialog.setBusy(true);
                //Call function import to create distribution lines
                this.getModel().callFunction("/CreateNewDLs", {
                    method: "POST",
                    urlParameters: oPayload,
                    success: this.successCRUDOnDistributionLines.bind(this),
                    error: this.errorCRUDOnDistributionLines.bind(this)
                });
            },

            /**
             * Handler for Add Distribution Lines Dialog Close button
             */
            onAddLinesDialogClose: function () {
                this._oAddDistLinesSmartTable.getTable().removeSelections();
                this._oSelectButton.setEnabled(false);
                this._oAddLinesDialog.close();
            },

            /**
             * Method to handle Data Received event for Distribution Line Smart Table
             * @param {sap.ui.base.Event} oEvent is the event object
             **/
            _oExistingDistLinesTableDataReceived: function (oEvent) {
                if (this._initiliaseExistingDistLinesTableNewIndicator) {
                    this._initiliaseExistingDistLinesTableNewIndicator = false;
                    this._setNewIndicator(oEvent, "x");
                }
                this.onDistributionLineSelection();
            },

            /**
             * Method to set new indicator
             * @param {sap.ui.base.Event} oEvent is the event object
             * @param {String} sNextNewIndicator - new indicator value to be set
             **/
            _setNewIndicator: function (oEvent, sNextNewIndicator) {
                var aRows = oEvent.getSource().getTable().getItems();
                if (aRows.length) {
                    var oRowBindingContext = aRows[aRows.length - 1].getBindingContext();
                    var sNewIndicator = oRowBindingContext.getProperty("NewIndicator");
                    sNewIndicator = (sNewIndicator === "X" || sNewIndicator === "N" || sNewIndicator === "x") ? sNextNewIndicator : "_";
                    var oModel = this.getModel();
                    oModel.setProperty("NewIndicator", sNewIndicator, oRowBindingContext);
                }
            },

            /**
             * Handler for row delete of distribution line smart table for COAU Action Type                                                                  
             * @public                                                                                                                                                                       
             */
            onClickDeleteDistributionLine: function () {
                var aSelectedDistributionLines = this._oDistributionLineSmartTable.getTable().getSelectedItems();
                this._showDeleteWarningMessage(aSelectedDistributionLines);
            },

            /**
             * Function to refresh existing distribution lines table                                                                      
             * @public                                                                                                                                                                       
             */
            refreshExistingDistributionLines: function () {
                this.oExistingDistLinesTable.rebindTable();
                this._oDistributionLineSmartTable.rebindTable();
            },

            /**
             * Handler for selection on existing distribution lines table  
             * @public                                                                                                                                                                       
             */
            onDistributionLineSelection: function () {
                var oCustomButtonsEnableModel = this.getModel("oCustomButtonsEnableModel");
                var aSelectedDistributionLines = this.oExistingDistLinesTable.getTable().getSelectedItems();
                if (this.oDistributionLineDeleteButton) {
                    if (!aSelectedDistributionLines.length) {
                        oCustomButtonsEnableModel.setProperty("/enableDelete", false);
                    } else {
                        var bEnableDelete = true;
                        var sNewIndicator = "";
                        for (var i = 0; i < aSelectedDistributionLines.length; i++) {
                            sNewIndicator = aSelectedDistributionLines[i].getBindingContext().getProperty("NewIndicator");
                            if (!sNewIndicator) {
                                bEnableDelete = false;
                                break;
                            }
                        }
                        oCustomButtonsEnableModel.setProperty("/enableDelete", bEnableDelete);
                    }
                }
            },

            /**
             * Handler for row delete of distribution line smart table for RFCD Action Type                                                                      
             * @public                                                                                                                                                                       
             */
            onDeleteOfDistributionLine: function () {
                var aSelectedDistributionLines = this.oExistingDistLinesTable.getTable().getSelectedItems();
                this._showDeleteWarningMessage(aSelectedDistributionLines);
            },

            /**
             * Method to display delete warning message on click of delete distribution line
             * @param {array} aSelectedDistributionLines - Distribution Lines to be deleted 
             */
            _showDeleteWarningMessage: function (aSelectedDistributionLines) {
                var sWarningMessage;
                if (aSelectedDistributionLines.length === 1) {
                    sWarningMessage = this._oResourceBundle.getText("DeleteDistLineConfirmationMessage");
                } else {
                    sWarningMessage = this._oResourceBundle.getText("DeleteDistLinesConfirmationMessage", [aSelectedDistributionLines.length]);
                }
                MessageBox.warning(sWarningMessage, {
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    onClose: this._deleteDistributionLines.bind(this, aSelectedDistributionLines)
                });
            },

            /**
             * Function import to delete existing distribution lines table
             * @param {array} aSelectedDistributionLines - Distribution Lines to be deleted 
             * @param {object} oAction - Popup close action Object with button press values
             */
            _deleteDistributionLines: function (aSelectedDistributionLines, oAction) {
                if (oAction === MessageBox.Action.DELETE) {
                    var oPayload = {
                        RecId: [],
                        KeyLink: this.sKeyLink
                    };
                    aSelectedDistributionLines.map(function (item) {
                        oPayload.RecId.push(item.getBindingContext().getProperty("RecID"));
                    });
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var aPendingChanges = Object.keys(oModel.getPendingChanges());
                    var aPendingChangesData = aPendingChanges.map(function (sPath) {
                        return oModel.getProperty("/" + sPath);
                    });
                    var aPaths = [];
                    for (var i = 0; i < aPendingChangesData.length; i++) {
                        if (oPayload.RecId.includes(aPendingChangesData[i].RecID)) {
                            aPaths.push("/" + aPendingChanges[i]);
                        }
                    }
                    if (aPaths.length) {
                        oModel.resetChanges(aPaths);
                    }
                    oView.getModel().callFunction("/DeleteDL", {
                        method: "POST",
                        urlParameters: oPayload,
                        success: this.successCRUDOnDistributionLines.bind(this),
                        error: this.errorCRUDOnDistributionLines.bind(this)
                    });
                    var oCustomButtonsEnableModel = this.getModel("oCustomButtonsEnableModel");
                    oCustomButtonsEnableModel.setProperty("/enableDelete", false);
                }
            },

            /*
             * Function to control the visibility of Requested Distribution Section
             * @param {Object} oContext
             */
            checkEnableDistribution: function (oContext) {
                var oDistributedLineSection = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--AfterFacet::xVWKSxNLP_C_PMAT_COMMON_HDR::OrgData::Section"
                );
                oDistributedLineSection.setVisible(!oContext.context.getProperty("RFCDHeader"));
                if (this._oComponentTable) {
                    if (this.getModel("ui").getData().editable) {
                        this._oComponentTable.getPlugins()[0].setSelectionMode("MultiToggle");
                        this._oComponentTable.getPlugins()[0].attachSelectionChange(this.onComponentTableRowSelection.bind(this));
                        var bShowCopyDelete = this.getView().getBindingContext().getProperty("ShowCopyDelete");
                        if (this.byId("ActionDeleteTechnicalChange") && this.byId("ActionCopyTechnicalChange")) {
                            this.byId("ActionDeleteTechnicalChange").bindProperty("visible", {
                                path: "propertyModel>/bShowCopyDelete"
                            });
                            this.byId("ActionCopyTechnicalChange").bindProperty("visible", {
                                path: "propertyModel>/bShowCopyDelete"
                            });
                        }
                        if (bShowCopyDelete !== "X") {
                            this.getView().getModel("propertyModel").setProperty("/bShowCopyDelete", false);
                        } else {
                            this.getView().getModel("propertyModel").setProperty("/bShowCopyDelete", true);
                        }
                    } else {
                        this._oComponentTable.getPlugins()[0].setSelectionMode("None");
                        this.getView().getModel("propertyModel").setProperty("/bShowCopyDelete", false);
                    }
                }
                this._oComponentTable.attachRowsUpdated(this.onCompTableRowsUpdated, this);
            },
            /**
             * Event to expand parent node of copied row in components table
             */
            onCompTableRowsUpdated: function () {
                if (this.iParentNodeIndex !== undefined) {
                    this._oComponentTable.expand(this.iParentNodeIndex);
                    this.iParentNodeIndex = undefined;
                }
            },
            /**
             * Method to handle Visibility of Custom Buttons
             * @public
             **/
            _handleCustomButtons: function () {
                var oCustomButtonsEnableModel = new JSONModel({
                    enableCopyContract: false,
                    enableCopyContractandEdit: false,
                    enableCopyContractBundle: false,
                    enableDelete: false,
                    enableAddDistribution: false,
                    enableCreateDistributionLinesAndEdit: false,
                    enableCreateDistributionLines: false
                    
                });
                this.getView().setModel(oCustomButtonsEnableModel, "oCustomButtonsEnableModel");
                var oContextObject = this.getView().getBindingContext().getObject();
                var sActionType = oContextObject.ActionType;
                var sStatus = oContextObject.Status;
                var oCreateSourcingProjetBtn = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idCreateSourcingProjectButton"
                );
                this._handleCoauButtonsVisibility(sActionType, sStatus);
                this._handleRfcdButtonVisibility(sActionType, sStatus);
                this._handleTechButtonsVisibility(sActionType, sStatus);

                if (oCreateSourcingProjetBtn) {
                    oCreateSourcingProjetBtn.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ShowCreateSrcgProjButton",
                            "Status"
                        ],
                        formatter: LocalFormatter.changeSourcingProjectButtonVisibility
                    });
                }

            },
            /**
             * handles visibility of COAU buttons
             * @param {string} sActionType is action type
             * @param {string} sStatus is Item Status 
             **/
            _handleCoauButtonsVisibility: function (sActionType, sStatus) {
                var oDistributionLineCreateButton = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--ActionxVWKSxNLP_C_PMAT_COMMON_HDRSections1createbutton"
                );

                var oUpdateSourcingProjectButton = sap.ui.getCore().byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idUpdateSourcingProjectButton"
                );

                var oNotifyDevelopmentButton = sap.ui.getCore().byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idNotifyDevelopement"
                );

                this.oDistributionLineDeleteButton = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--ActionxVWKSxNLP_C_PMAT_COMMON_HDRSections1deletebutton"
                );
                var oDistributionLineFragment = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--AfterFacet::xVWKSxNLP_C_PMAT_COMMON_HDR::EXT_COLOR::Section"
                );
                oDistributionLineFragment.setVisible(sActionType === Constants.ActionTypes.COAU);
                oNotifyDevelopmentButton.bindProperty("visible", {
                    parts: [
                        "ActionType",
                        "Status"
                    ],
                    formatter: LocalFormatter.notifyDevButtonVisibility
                });
                if (sActionType === Constants.ActionTypes.COAU && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete || sStatus === Constants.Status.WaitingForExternal)) {
                    oDistributionLineCreateButton.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ActionType",
                            "Status"
                        ],
                        formatter: LocalFormatter.coauButtonsVisibility
                    });
                    this.oDistributionLineDeleteButton.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ActionType",
                            "Status"
                        ],
                        formatter: LocalFormatter.coauButtonsVisibility
                    });
                    this.oDistributionLineDeleteButton.bindProperty("enabled", {
                        path: "oCustomButtonsEnableModel>/enableDelete"
                    });
                    this.oCopyContractBtn.bindProperty("enabled", {
                        path: "oCustomButtonsEnableModel>/enableCopyContract"
                    });
                    this.oCopyContractEditBtn.bindProperty("enabled", {
                        path: "oCustomButtonsEnableModel>/enableCopyContractandEdit"
                    });
                    this.oCopyContractBundleBtn.bindProperty("enabled", {
                        path: "oCustomButtonsEnableModel>/enableCopyContractBundle"
                    });
                } else {
                    oDistributionLineCreateButton.setVisible(false);
                    this.oCopyContractBtn.setVisible(false);
                    this.oCopyContractEditBtn.setVisible(false);
                    this.oCopyContractBundleBtn.setVisible(false);
                    this.oDistributionLineDeleteButton.setVisible(false);

                }
                if (sActionType === Constants.ActionTypes.ENTI && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete)) {
                    oUpdateSourcingProjectButton.setVisible(true);
                } else {
                    oUpdateSourcingProjectButton.setVisible(false);
                }
            },
            /**
             * handles visibility of RFCD buttons
             * @param {string} sActionType is action type
             * @param {string} sStatus is Item Status
             **/
            _handleRfcdButtonVisibility: function (sActionType, sStatus) {
                var oCreateDistributionLines = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idCCTRDLAction"
                );

                var oCreateDistributionLinesAndEdit = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idCCTRDLAndEditAction"
                );
                oCreateDistributionLines.bindProperty("enabled", {
                    path: "oCustomButtonsEnableModel>/enableCreateDistributionLines"
                });
                oCreateDistributionLinesAndEdit.bindProperty("enabled", {
                    path: "oCustomButtonsEnableModel>/enableCreateDistributionLinesAndEdit"
                });
                if (sActionType === Constants.ActionTypes.RFCD && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete)) {
                    this.oDistributionLineDeleteButton = this.byId(
                        "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idDeleteDistributionLineButton"
                    );
                    this.oAddDistributionLinesButton = this.byId(
                        "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idAddDistributionLines"
                    );
                    this.oAddDistributionLinesButton.setText(this._oResourceBundle.getText("AddLinesDefaultText"));
                    this.oAddDistributionLinesButton.bindProperty("enabled", {
                        path: "oCustomButtonsEnableModel>/enableAddDistribution"
                    });
                    oCreateDistributionLines.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ActionType",
                            "Status"
                        ],
                        formatter: LocalFormatter.rfcdButtonsVisibility
                    });
                    oCreateDistributionLinesAndEdit.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ActionType",
                            "Status"
                        ],
                        formatter: LocalFormatter.rfcdButtonsVisibility
                    });
                    this.oDistributionLineDeleteButton.bindProperty("enabled", {
                        path: "oCustomButtonsEnableModel>/enableDelete"
                    });
                } else {
                    oCreateDistributionLines.setVisible(false);
                    oCreateDistributionLinesAndEdit.setVisible(false);
                }
            },
            /**
             * handles visibility of TECH buttons
             * @param {string} sActionType is action type
             * @param {string} sStatus is Item Status
             **/
            _handleTechButtonsVisibility: function (sActionType, sStatus) {
                var oReleaseforevaluationButton = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idReleaseforevaluation"
                );
                var oCompleteEvaluationButton = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idCompleteEvaluation"
                );
                var oSendforapprovalButton = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idSendforapproval"
                );
                var oSendtoSupplierButton = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idSendtoSupplier"
                );
                var oUpdateContractButton = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idUpdateContracts"
                );
                if (sActionType === Constants.ActionTypes.TECH && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete)) {
                    oReleaseforevaluationButton.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ActionType",
                            "ShowReleaseForEvaluation",
                            "Status"
                        ],
                        formatter: LocalFormatter.techChangeButtonsVisibility
                    });
                    oCompleteEvaluationButton.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ActionType",
                            "ShowCompleteEvaluation",
                            "Status"
                        ],
                        formatter: LocalFormatter.techChangeButtonsVisibility
                    });
                    oCompleteEvaluationButton.bindProperty("enabled", {
                        parts: [
                            "ActivateCompleteEvaluation",
                            "ActionType",
                            "Status"
                        ],
                        formatter: LocalFormatter.techChangeButtonsFormatter
                    });
                    oSendforapprovalButton.bindProperty("visible", {
                        parts: [
                            "ShowSendForApproval",
                            "ActionType",
                            "Status"
                        ],
                        formatter: LocalFormatter.techChangeButtonsFormatter
                    });
                    oSendtoSupplierButton.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ActionType",
                            "ShowSendtoSupplier",
                            "Status"
                        ],
                        formatter: LocalFormatter.techChangeButtonsVisibility
                    });
                    oUpdateContractButton.bindProperty("visible", {
                        parts: [
                            "ui>/editable",
                            "ActionType",
                            "Status"
                        ],
                        formatter: LocalFormatter.techButtonUpdateContractFormatter
                    });
                } else {
                    oReleaseforevaluationButton.bindProperty("visible", {
                        value: false
                    });
                    oCompleteEvaluationButton.bindProperty("visible", {
                        value: false
                    });
                    oSendforapprovalButton.bindProperty("visible", {
                        value: false
                    });
                    oSendtoSupplierButton.bindProperty("visible", {
                        value: false
                    });
                    oUpdateContractButton.bindProperty("visible", {
                        value: false
                    });
                }
            },
            
            /**
             * The function is the copy contract
             * @public
             **/
            onPressCopyContract: function () {
                //Pass 0 to method _copyContract in order to perform action Copy Contract
                this._copyContract(0);
                this._bCopyContractButtonPressed = true;
            },

            /**
             * The function is the copy contract and edit
             * @public
             **/
            onPressCopyContractAndEdit: function () {
                //Pass 1 to method _copyContract in order to perform action Copy Contract and Edit
                this._copyContract(1);
                this._bCopyContractButtonPressed = true;
            },

            /**
             * Method to call function import for copy contract
             * @param {number} iEditEnabled - contract should be opened in edit(1) mode or not(0)
             * @private
             **/
            _copyContract: function (iEditEnabled) {
                this._pausibilityCheck = true;
                var aSelectedDistributionLineRows = this._oDistributionLineSmartTable.getTable().getSelectedItems();
                this.aSelectedDistributionLines = [];
                this.aSelectedDistributionLines = aSelectedDistributionLineRows.map(function (item) {
                    return item.getBindingContext().getProperty("RecID");
                });
                this._oPayload = {
                    Edit: iEditEnabled,
                    HdrKeyLink: this.sKeyLink,
                    KeyLink: [this.sKeyLink],
                    Bundling: 0,
                    DLRecID: this.aSelectedDistributionLines
                };
                var oDialogPromise = this._openConfirmationDialog();
                oDialogPromise.then(function () {
                    //trigger Save action using framework's Save button
                    this._sStandardSaveButton.firePress();
                }.bind(this)).catch(function () {
                    //catch to avoid promise rejection error
                });
            },

            /**
             * Method to generate validate supplier FI promise
             * @returns {Promise} validateSupplierPromise
             */
            _validateSupplierFIPromise: function () {
                var oModel = this.getModel();
                var oPayload = {
                    KeyLink: this.sKeyLink,
                    DLRecID: this.aSelectedDistributionLines
                };
                var validateSupplierPromise = new Promise(function (resolve, reject) {
                    oModel.callFunction(Constants.FunctionImports.ValidateSupplier, {
                        method: "POST",
                        urlParameters: oPayload,
                        success: function (oSuccess) {
                            resolve(oSuccess);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
                return validateSupplierPromise;
            },

            /**
             * Click handler for Process Multiple Work Items Button
             * @public
             **/
            onPressProcessMultipleWorkItems: function () {
                this._pausibilityCheck = true;
                this.getView().getModel("ExistingColorModel").setData({});
                this.getExistingColorMaterial();
                var aSelectedDistributionLineRows = this._oDistributionLineSmartTable.getTable().getSelectedItems();
                this.aSelectedDistributionLines = [];
                this.aSelectedDistributionLines = aSelectedDistributionLineRows.map(function (item) {
                    return item.getBindingContext().getProperty("RecID");
                });
                this.copyContractContractBundle = true;
                var oDialogPromise = this._openConfirmationDialog();
                oDialogPromise.then(function () {
                    //trigger Save action using framework's Save button
                    this._sStandardSaveButton.firePress();
                }.bind(this)).catch(function () {
                    //catch to avoid promise rejection error
                });
            },
            /**
             * Method to open ListReport smartTable Reusable component in case of copyContract bundle
             */
            _openCopyContractBundleDialog: function () {
                var aFilterKeys = Constants.contractBundleFilters;
                var aFilters = this._getListReportSmartTableFilters(aFilterKeys);
                //if StatusText filter need to be set than push it always at the end
                aFilters.push({
                    "filterKey": "StatusText",
                    "filterValue": Constants.contractBundleStatusTexts
                });
                var aFiltersForRowcount = this._FilterForRowCount(aFilters, false);
                this._getCount(aFilters, aFiltersForRowcount, false);   
            },
            /**
             * Mehtod to fetch filter array for row count call
             * @param {array} aFilters array of filter keys
             * @param {boolean} bNotifyDevelopmentForCount Notify Developement Indicator
             * @returns {array} aFiltersForRowcount Generated Array
             */

            _FilterForRowCount: function (aFilters, bNotifyDevelopmentForCount) {
                var aFiltersForRowcount = [];
                var aMaterilFilterValue = aFilters[1].filterValue;
                aMaterilFilterValue.forEach(function(sMaterilFilterValue){
                    var oMaterilFilter = new Filter({               
                        path: aFilters[1].filterKey,               
                        operator: FilterOperator.EQ,                
                        value1: sMaterilFilterValue                 
                        });
                    aFiltersForRowcount.push(oMaterilFilter);
                });

                var oActiontypeFilter = new Filter({
                    path: aFilters[0].filterKey,               
                    operator: FilterOperator.EQ,                
                    value1: aFilters[0].filterValue               
                });
                aFiltersForRowcount.push(oActiontypeFilter);

                var oListReportSmartTableFilter = new Filter({
                    path: "IsActiveEntity",
                    operator: FilterOperator.EQ,
                    value1: true
                });
                aFiltersForRowcount.push(oListReportSmartTableFilter);
                if (!bNotifyDevelopmentForCount) {
                    Constants.contractBundleStatusTexts.forEach(function(scontractBundleStatusTexts){
                        var oContractBundleStatusTextsFilter = new Filter({               
                            path: "StatusText",               
                            operator: FilterOperator.EQ,                
                            value1: scontractBundleStatusTexts                 
                            });
                        aFiltersForRowcount.push(oContractBundleStatusTextsFilter);
                    });
                } else {
                    Constants.notifyDevelopmentStatusTexts.forEach(function(snotifyDevelopmentStatusTexts){
                        var oNotifyDevelopmentStatusTextsFilter = new Filter({               
                            path: "StatusText",               
                            operator: FilterOperator.EQ,                
                            value1: snotifyDevelopmentStatusTexts                 
                            });
                        aFiltersForRowcount.push(oNotifyDevelopmentStatusTextsFilter);
                    });
                }
                return aFiltersForRowcount;
            },

            /**
             * Load and open Dialog.
             * @param {array} aSelectedDistributionLines - selected distribution lines
             * @param {string} sNotifyDevelopmentToAddress - notify development receipient email address
             * @param {boolean} bNotifyDevelopment - notify development button's visibility
             * @param {boolean} bCopyContractBundle - copy contract bundle button's visibility
             * @param {boolean} bFiltersReadonly - readonly property for smartFilter bar
             * @param {array} aFilters - filters passed for smartFilter bar initialization
             * @param {Integer} iRowCountForProcessMultipleItem - Row count for Process multiple work item table
             * @private
             */
            _loadReuseListReportSmartTableDialog: function (aSelectedDistributionLines, sNotifyDevelopmentToAddress, bNotifyDevelopment, bCopyContractBundle, bFiltersReadonly, aFilters, iRowCountForProcessMultipleItem) {
                ReuseListReportSmartTable.loadDialog(aSelectedDistributionLines, sNotifyDevelopmentToAddress, bNotifyDevelopment, bCopyContractBundle, bFiltersReadonly, aFilters, this.sKeyLink,iRowCountForProcessMultipleItem);
            },

            /**
             * Method to generate filters for List Report Smart Table
             * @param {array} aFilterKeys - array of filter keys
             * @returns {array} aFilters - generated filters
             * @private
             **/
            _getListReportSmartTableFilters: function (aFilterKeys) {
                var aFilters = [];
                var oView = this.getView();
                this.getExistingColorMaterial();
                var that = this;
                aFilterKeys.forEach(function (sFilterKey) {
                    var sFilterValue = oView.getBindingContext().getProperty(sFilterKey);
                    aFilters.push({
                        "filterKey": sFilterKey,
                        "filterValue": sFilterValue
                    });
                    if (Object.keys(that.getView().getModel("ExistingColorModel").getData()).length > 0) {
                        var aMaterialForColors = [];
                        that.getView().getModel("ExistingColorModel").getData().forEach(function (oData1) {
                            aMaterialForColors.push(oData1.material);
                        });

                        aFilters.push({
                            "filterKey": "Material",
                            "filterValue": aMaterialForColors
                        });
                    }
                });
                return aFilters;
            },
            /**
             * Change Validity Status ComboBox event handler
             * 
             */
            changeValidityStatus: function () {
                var sActionType = this.getView().getBindingContext().getProperty("ActionType");
                if (sActionType === Constants.ActionTypes.RFCD) {
                    this.oContractsTable.rebindTable(true);
                }
            },

            /**
             * Available contracts table beforeRebind event handler
             * @param {sap.ui.base.Event} oEvent BeforeRebindTable Event
             */
            onBeforeRebindContractsTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                var sValidityKey = this.getView().byId("idValidityStatusDropdown").getSelectedKey();
                if (sValidityKey !== Constants.ValidityStatus.All) {
                    var ValidityStatusFilter = new Filter("ValidityStatus", FilterOperator.EQ, sValidityKey);
                    mBindingParams.filters.push(ValidityStatusFilter);
                }
            },

            /**
             * Click handler for Notify Development button
             */
            onPressNotifyDevelopement: function () {
                this.setBusy(true);
                this.getView().getModel("ExistingColorModel").setData({});
                this.getExistingColorMaterial();
                var oModel = this.getModel();
                var oPayload = {
                    KeyLink: this.sKeyLink
                };
                oModel.callFunction(Constants.FunctionImports.EmailPopup, {
                    method: "POST",
                    urlParameters: oPayload,
                    success: function (oSuccess) {
                        this.setBusy(false);
                        this._openNotifyDevelopmentPopup(oSuccess);
                    }.bind(this),
                    error: function () {
                        this.setBusy(false);
                    }.bind(this)
                });
            },

            /**
             * Method to open Notify Development Dialog
             * @param {object} oSuccess - response of EmailPopup FI 
             */
            _openNotifyDevelopmentPopup: function (oSuccess) {
                this.oNotifyDevelopmentModel = new JSONModel({
                    "enableSendEmail": false,
                    "enableProcessMultipleWorkItems": false,
                    "EmailSubject": oSuccess.EmailPopup.EmailSubject,
                    "EmailBody": oSuccess.EmailPopup.EmailBody
                });
              
                    Fragment.load({
                        id: "idNotifyDevelopmentDialog",
                        name: "vwks.nlp.s2p.mm.pmaterial.manage.ext.fragment.notifyDevelopmentEmailDialog",
                        controller: this
                    }).then(function (oDialog) {
                        this.oNotifyDevelopmentDialog = oDialog;
                        this.oNotifyDevelopmentDialog.setModel(this.oi18nModel, "i18n");
                        this.oNotifyDevelopmentDialog.setModel(this.oNotifyDevelopmentModel, "notifyDevelopmentModel");
                        this.oView.addDependent(this.oNotifyDevelopmentDialog);
                        this.oNotifyDevelopmentDialog.open();
                    }.bind(this));
              
            },

            /**
             * Method to set busy state in the Notify Development Dialog
             * @param {boolean} bBusy - busy state of dialog
             */
            setNotifyDevelopmentDialogBusy: function (bBusy) {
                this.oNotifyDevelopmentDialog.setBusy(bBusy);
            },
            /**
             * Method  attach to afterClose event to destroy notifyDevelopmentEmailDialog             * 
             */
            onAfterCloseNotifyDialog: function() {
                this.oNotifyDevelopmentDialog.destroy();
                this.oNotifyDevelopmentDialog = null;
            },

            /**
             * Method to validate receipient's email address
             * @param {object} oEvent - Event triggered 
             */
            onToEmailChanged: function (oEvent) {
                this.sToEmail = oEvent.getSource().getValue();
                var sMailRegex = /^.+@.+$/;
                var bEnableButtons = false;
                if (!sMailRegex.test(this.sToEmail)) {
                    oEvent.getSource().setValueState(ValueState.Error);
                } else {
                    bEnableButtons = true;
                    oEvent.getSource().setValueState(ValueState.None);
                }
                this.oNotifyDevelopmentModel.setProperty("/enableSendEmail", bEnableButtons);
                this.oNotifyDevelopmentModel.setProperty("/enableProcessMultipleWorkItems", bEnableButtons);
            },

            /**
             * Method to trigger Notify Development SendEmail FI
             */
            onNotifyDevelopmentSendEmail: function () {
                this.setNotifyDevelopmentDialogBusy(true);
                var oModel = this.getModel();
                var oPayload = {
                    HdrKeyLink: this.sKeyLink,
                    KeyLink: [this.sKeyLink],
                    ToAddr: this.sToEmail
                };
                oModel.callFunction(Constants.FunctionImports.SendEmail, {
                    method: "POST",
                    urlParameters: oPayload,
                    success: function (oResponse) {
                        this.getView().getController().extensionAPI.refresh();
                        this.setNotifyDevelopmentDialogBusy(false);
                        this.onCloseNotifyDevelopmentPopup();
                        if (oResponse.results && oResponse.results.length > 0) {
                            this.loadReuseMessageBox(oResponse);
                        }
                    }.bind(this),
                    error: function () {
                        this.setNotifyDevelopmentDialogBusy(false);
                    }.bind(this)
                });
            },

            /**
             * Method to open ListReport smartTable Reuseable Component within Notify Development
             */
            onNotifyDevelopmentProcessMultipleWorkItems: function () {
                this.onCloseNotifyDevelopmentPopup();
                var aFilterKeys = Constants.notifyDevelopmentFilters;
                var aFilters = this._getListReportSmartTableFilters(aFilterKeys);
                //if StatusText filter need to be set than push it always at the end
                aFilters.push({
                    "filterKey": "StatusText",
                    "filterValue": Constants.notifyDevelopmentStatusTexts
                });

                var aFiltersForRowcount = this._FilterForRowCount(aFilters, true);
                this._getCount(aFilters, aFiltersForRowcount, true);
            },
            /**
             * Read Method for P material List report Dialog box
             * @param {Array} aFilters 
             * @param {Array} aFiltersForRowcount 
             * @param {Boolean} bNotifyDevelopmentForReadCall 
             */

            _getCount: function(aFilters, aFiltersForRowcount, bNotifyDevelopmentForReadCall) {
                var oModel = this.getModel();
                var that = this;
				oModel.read("/xVWKSxNLP_C_PMAT_COMMON_HDR/$count", {
					filters: aFiltersForRowcount,
					success: function (oData) {
                        var iRowCountForProcessMultipleItem = parseInt(oData, 10);
                        if (bNotifyDevelopmentForReadCall) {
                            that._loadReuseListReportSmartTableDialog([], that.sToEmail, true, false, false, aFilters,iRowCountForProcessMultipleItem);
                        } else {
                            that._loadReuseListReportSmartTableDialog(that.aSelectedDistributionLines, "", false, true, true, aFilters,iRowCountForProcessMultipleItem);
                        }
					},
					error: function (oError) {
						if (oError.responseText) {
                            var oMessage = JSON.parse(oError.responseText);
                            MessageBox.error(oMessage.error.message.value);
                        }
					}
				});  

            },

            /**
             * Method to close Notify Development Dialog
             */
            onCloseNotifyDevelopmentPopup: function () {
                this.oNotifyDevelopmentDialog.close();
                this.oNotifyDevelopmentDialog.destroy();
                this.oNotifyDevelopmentDialog = null;
            },

            /**
             * The function is the create distribution line
             * @public
             **/
            onClickCreateDLAction: function () {
                //Pass 0 to method _createDL in order to perform action Create Distribution Line
                this._createDL(0);
            },

            /**
             * The function is the create distribution line and Edit
             * @public
             **/
            onClickCreateDLActionAndEdit: function () {
                //Pass 1 to method _copyContract in order to perform action  Create Distribution Line and Edit
                this._createDL(1);
            },

            /**
             * Method to call function import for create DL
             * @param {number} iEditEnabled - DL should be opened in edit(1) mode or not(0)
             * @private
             **/
            _createDL: function (iEditEnabled) {
                this._oPayload = {
                    Edit: iEditEnabled,
                    HdrKeyLink: this.sKeyLink,
                    KeyLink: this.sKeyLink
                };
                var oDialogPromise = this._openConfirmationDialog();
                oDialogPromise.then(function () {
                    //trigger Save action using framework's Save button
                    this._sStandardSaveButton.firePress();
                }.bind(this)).catch(function () {
                    //catch to avoid promise rejection error
                });
            },

            /**
             * The success handler for the create distribution line/copy contract  action
             * @param {Object} oParam is the oData response object
             * @private
             **/
            _successPostCCTR: function (oParam) {
                this._oPayload = undefined;
                //to hide Notify developement for completed status on save and copy contract - forcing refresh to change the status of workitem
                var oView = this.getView();
                var sActionType = oView.getBindingContext().getProperty("ActionType");
                if (sActionType === Constants.ActionTypes.COAU && this._bCopyContractButtonPressed) {
                    this.getView().getController().extensionAPI.refresh();
                    var oNotifyDevelopmentButton = sap.ui.getCore().byId(
                        "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--idNotifyDevelopement"
                    );
                        oNotifyDevelopmentButton.setVisible(false);
                }
                var aContract = oParam.results;
                if (aContract.length > 0 && !aContract[0].URL) {
                    this.loadReuseMessageBox(oParam);
                } else {
                    aContract.forEach(function (result) {
                        sap.m.URLHelper.redirect(result.URL, true);
                    });
                }
                this.setBusy(false);
                this._bCopyContractButtonPressed = false;
            },

            /**
             * The error handler for create distribution line action
             * @private
             **/
            _errorPostCCTR: function () {
                this.setBusy(false);
                this._oPayload = undefined;
            },

            /**
             * Handler for Create Distribution Button Click
             * @param {sap.ui.base.Event} oEvent is the event object
             **/
            onClickCreateNewDistributionLine: function (oEvent) {
                this.setBusy(true);
                var oModel = this.getModel();
                var oParentContext = oEvent.getSource().getBindingContext();
                oModel.createEntry("to_RFCDEXIDL", {
                    context: oParentContext,
                    properties: {
                        "KeyLink": this.sKeyLink
                    },
                    groupId: "createDistLine"
                });
                oModel.submitChanges({
                    groupId: "createDistLine",
                    success: function () {
                        this.setBusy(false);
                        this._initiliaseNewIndicator = true;
                        this._oDistributionLineSmartTable.rebindTable();
                    }.bind(this),
                    error: function () { 
                        this.setBusy(false);
                    }.bind(this)
                });
                
            },

            /**
             * Method to handle Data Received event for Distribution Line Smart Table
             * @param {sap.ui.base.Event} oEvent is the event object
             **/
            _oDistributionLineSmartTableDataReceived: function (oEvent) {
                if (this._initiliaseNewIndicator) {
                    this._initiliaseNewIndicator = false;
                    this._setNewIndicator(oEvent, "N");
                }
                this.onDistributionLineRowSelection();
            },

            /**
             * Promise to create/open Save Confirmation Dialog 
             * @return {Object} oDialogPromise
             **/
            _openConfirmationDialog: function () {
                var oDialogPromise = new Promise(function (resolve, reject) {
                    var oModel = this.getModel();
                    if (oModel.hasPendingChanges()) {
                        MessageBox.confirm(this._oResourceBundle.getText("SaveChangeConfirmationMessage"), {
                            title: this._oResourceBundle.getText("Confirm"),
                            actions: [this._oResourceBundle.getText("Confirm"), this._oResourceBundle.getText("Cancel")],
                            emphasizedAction: this._oResourceBundle.getText("Confirm"),
                            onClose: function (sAction) {
                                if (sAction === this._oResourceBundle.getText("Confirm")) {
                                    //trigger Save action using framework's Save button
                                    this._sStandardSaveButton.firePress();                                
                                }
                            }.bind(this)
                        });
                        reject();
                    } else {
                        resolve();
                    }
                }.bind(this));
                return oDialogPromise;
            },

            /*
             * Supplier navigation event handler.
             * @param {sap.ui.base.Event} oEvent- event object
             */
            handleSupplierPress: function (oEvent) {
                var oObject = oEvent.getSource().getParent().getBindingContext().getObject();
                var sSupplier = oObject.Supplier;

                var oParams = {
                    Supplier: sSupplier
                };
                // Navigate to Supplier
                NavigationHelper.navigateToExternalApp(this, "Supplier", null, oParams, true);
            },

            /*
             * Document Number press event handler.
             * @param {sap.ui.base.Event} oEvent event object
             */
            handleDocumentNumberPress: function (oEvent) {
                var oObject = oEvent.getSource().getParent().getBindingContext().getObject();
                //Hierarchy Contract Item
                var sOriginDocumentNumber = oObject.DocumentNumber.split("/")[0];
                var sDocNumberItem = oObject.DocumentNumber.split("/")[1];
                this._getActualDocNumber(sOriginDocumentNumber).then(function (sDocumentNumber) {
                    this._navigateToDocumentNumber(sDocumentNumber, sDocNumberItem);
                }.bind(this));
            },

            /**
             * Navigation to MCPC
             * @param {string} sDocumentNumber 
             * @param {string} sDocNumberItem 
             */
            _navigateToDocumentNumber: function(sDocumentNumber, sDocNumberItem) {
                var sContractHeader = this.getModel("MCPC").createKey("C_CntrlPurContrHierHdrTP", {
                    CentralPurchaseContract: sDocumentNumber,
                    DraftUUID: ReuseConstants.INITIAL_GUID,
                    IsActiveEntity: true
                });
                var sContractItem = this.getModel("MCPC").createKey("C_CntrlPurContrHierItemTP", {
                    CentralPurchaseContractItem: sDocNumberItem,
                    CentralPurchaseContract: sDocumentNumber,
                    DraftUUID: ReuseConstants.INITIAL_GUID,
                    IsActiveEntity: true
                });
                var sRequiredUrl = sContractHeader + "/to_CntrlPurchaseContractItemTP(" + sContractItem.split("(")[1];
                //Open contract in new window
                NavigationHelper.navigateToExternalApp(this, "MCPC", sRequiredUrl, null, true);
            },

            /**
             * Getting actual document number based on original
             * @param {string} sOriginDocumentNumber 
             * @returns {string} actual document number
             */
            _getActualDocNumber: function(sOriginDocumentNumber) {
                var sActualDocNumber = "";
                var oFilter = new Filter({
                    filters: [
                        new Filter("TargetApplication", FilterOperator.EQ, "MCPC"),
                        new Filter("Value1", FilterOperator.EQ, sOriginDocumentNumber)
                    ],
                    and: true
                });
                return new Promise(function (fnResolve, fnReject) {
                    this.getModel().read("/xVWKSxNLP_INTG_C_NAVIG_PARAM", {
                        filters: [oFilter],
                        success: function (oData) {
                            if (oData.results && oData.results[0].Value1){
                                sActualDocNumber =  oData.results[0].Value1;
                            } 
                            fnResolve(sActualDocNumber);               
                        },
                        error: function (oError) {
                            fnReject(oError);
                        }
                    });
                }.bind(this));
            },

            /**
             * private method to initialize payload for Techical Change action type function imports
             */
            _getTechChangePayload: function () {
                this._oTechChangePayload = {
                    KeyLink: this.sKeyLink
                };
            },

            /**
             * Method to show Confirmation Popup Dialog for Technical Change actions
             * @param {string} sMessage - Confirmation message to be displayed
             * @param {string} sTitle - Confirmation popup title
             */
            _showConfirmationMessage: function (sMessage, sTitle) {
                this._getTechChangePayload();
                MessageBox.confirm(sMessage, {
                    title: sTitle,
                    onClose: this._onCloseConfirmationMessage.bind(this)
                });
            },

            /**
             * On close handler for _showConfirmationMessage method
             * @param {object} oAction - Popup close action Object with button press values
             */
            _onCloseConfirmationMessage: function (oAction) {
                if (oAction === MessageBox.Action.OK) {
                    if (this._functionImportName === Constants.FunctionImports.SendForApproval) {
                        this._callTechChangeFI();
                    } else {
                        //trigger Save action using framework's Save button
                        this._sStandardSaveButton.firePress();
                    }
                } else {
                    this._oTechChangePayload = undefined;
                    this._functionImportName = undefined;
                }
            },

            /**
             * Handler method for Release for evaluation button click
             */
            onClickReleaseforevaluation: function () {
                this._functionImportName = Constants.FunctionImports.ReleaseForEvaluation;
                this._showConfirmationMessage(this._oResourceBundle.getText("Releaseforevaluationmessage"), this._oResourceBundle.getText(
                    "Releaseforevaluationtitle"));
            },

            /**
             * Handler method for Complete Evaluation button click
             */
            onClickCompleteEvaluation: function () {
                this._functionImportName = Constants.FunctionImports.CompleteEvaluation;
                this._showConfirmationMessage(this._oResourceBundle.getText("CompleteEvaluationmessage"), this._oResourceBundle.getText(
                    "CompleteEvaluationtitle"));
            },

            /**
             * Handler method for Send for approval button click
             */
            onClickSendforapproval: function () {
                this._functionImportName = Constants.FunctionImports.SendForApproval;
                this._showConfirmationMessage(this._oResourceBundle.getText("Sendforapprovalmessage"), this._oResourceBundle.getText(
                    "Sendforapproval"));
            },

            /**
             * Handler method for Send to Supplier button click
             */
            onClickSendtoSupplier: function () {
                this._functionImportName = Constants.FunctionImports.SendToSupplier;
                this._showConfirmationMessage(this._oResourceBundle.getText("SendtoSuppliermessage"), this._oResourceBundle.getText(
                    "SendtoSuppliertitle"));
            },

            /**
             * Driver method that triggers function import call for Techinal Change actions
             */
            _callTechChangeFI: function () {
                this.setBusy(true);
                this.getModel().callFunction(this._functionImportName, {
                    method: "POST",
                    urlParameters: this._oTechChangePayload,
                    success: this.onSuccessTechChangeFI.bind(this),
                    error: this.onErrorTechChangeFI.bind(this)
                });
            },

            /**
             * Success handler for function import call for Techinal Change actions
             * @param {object} oResponse - response from backend   
             */
            onSuccessTechChangeFI: function (oResponse) {
                // eslint-disable-next-line default-case
                switch (this._functionImportName) {
                    case Constants.FunctionImports.ReleaseForEvaluation:
                        this._showSuccessResponse(oResponse.ReleaseForEvaluation);
                        break;
                    case Constants.FunctionImports.CompleteEvaluation:
                        this.setBusy(false);
                        this.loadReuseMessageBox(oResponse);
                        break;
                    case Constants.FunctionImports.SendForApproval:
                        this._showSuccessResponse(oResponse.SendForApproval);
                        break;
                    case Constants.FunctionImports.SendToSupplier:
                        this.setBusy(false);
                        this.loadReuseMessageBox(oResponse);
                        break;
                    default:
                        this.setBusy(false);
                        this.loadReuseMessageBox(oResponse);
                        break;
                }
                this.getModel().refresh();
                this.setBusy(false);
                this._oTechChangePayload = undefined;
                this._functionImportName = undefined;
            },

            /**
             * Error handler for function import call for Techinal Change actions
             */
            onErrorTechChangeFI: function () {
                this.setBusy(false);
                this._oTechChangePayload = undefined;
                this._functionImportName = undefined;
            },

            /**
             * Method to display success/error response message post function import call
             * @param {object} oSuccessResponse - response from backend
             */
            _showSuccessResponse: function (oSuccessResponse) {
                if (oSuccessResponse.Type === Constants.MessageTypes.Success) {
                    MessageBox.success(oSuccessResponse.Message);
                } else if (oSuccessResponse.Type === Constants.MessageTypes.Error) {
                    MessageBox.error(oSuccessResponse.Message);
                }
            },

            /**
             * Method to load Message Box fragment to display messages from BE
             * @param {Object} oError response of CompleteEvaluation function import
             */
            loadReuseMessageBox: function (oError) {
                ReuseMessageBox.loadDialog(oError);
            },

            /**
             * Handler method for Create Sourcing Project button click
             * Triggers function import CreateSourcingProject
             * @public
             **/
            onPressCreateSourcingProject: function () {
                var oPayLoad = {
                    "KeyLink": this.sKeyLink
                };
                this.setBusy(true);
                this.getModel().callFunction(Constants.FunctionImports.CreateSourcingProject, {
                    method: "POST",
                    urlParameters: oPayLoad,
                    success: this.onSuccessCreateSourcingProject.bind(this),
                    error: this.onErrorCreateSourcingProject.bind(this)
                });
            },

            /**
             * Success handler for create Sourcing Project action
             * @param {Object} oResponse is the  Response Object
             * @public
             **/
            onSuccessCreateSourcingProject: function (oResponse) {
                this.getModel().refresh();
                this.setBusy(false);
                var oResults = oResponse.CreateSourcingProject;
                var sMessage = oResults.MsgText;
                if (oResults.Status === Constants.MessageTypes.Success) {
                    MessageToast.show(sMessage);
                } else if (oResults.Status === Constants.MessageTypes.Error) {
                    MessageBox.error(sMessage);
                }
            },

            /**
             * Error handler for create Sourcing Project action
             * @param {Object} oError is the error reference
             * @public
             **/
            onErrorCreateSourcingProject: function (oError) {
                this.setBusy(false);
                if (oError.responseText) {
                    var oMessage = JSON.parse(oError.responseText);
                    MessageBox.error(oMessage.error.message.value);
                }
            },

            /**
             * on click on add button in the procurement facet an function import will trigger
             * @public
             * */
            onClickAddProcLine: function () {
                var oView = this.getView();
                this.oProcTable = this.byId(
                    "vwks.nlp.s2p.mm.pmaterial.manage::sap.suite.ui.generic.template.ObjectPage.view.Details::xVWKSxNLP_C_PMAT_COMMON_HDR--EntiProc::Table"
                );
                var sFunctionImport = Constants.FunctionImports.AddProcurementLine;
                var sPayload = {
                    KeyLink: oView.getBindingContext().getProperty("KeyLink")
                };
                this.setBusy(true);
                this.getModel().callFunction(sFunctionImport, {
                    method: "POST",
                    urlParameters: sPayload,
                    success: this.successOnAddProcLine.bind(this),
                    error: this.errorOnAddProcLine.bind(this)
                });
            },
            /**
             *success handler for Procrurement add line
             * @public
             */
            successOnAddProcLine: function () {
                this.setBusy(false);
                if (this.oProcTable) {
                    this.oProcTable.rebindTable();
                }
            },
            /**
             *Error handler for Procrurement add line
             * @param {Object} oResponse is the object reference for error handling
             * @public
             */
            errorOnAddProcLine: function (oResponse) {
                this.setBusy(false);
                if (oResponse) {
                    MessageBox.error(oResponse.message);
                }
            },    
            /**
             * On click on Documnet Link in the attachemnt Section should open the link
             * @param {Event} oEvent is the event trigger on link press
             * @public
             */
            handleDocumentLinkPress: function (oEvent) {
                open(oEvent.getSource().getText());
            },
            /**
             * The function is to create property model
             * @returns {sap.ui.model.json.JSONModel} JSONModel object
             **/
            _createPropertyModel: function () {
                return new JSONModel({
                    bCopyButtonEnable: false,
                    bDeleteButtonEnable: false,
                    bShowCopyDelete: true
                });
            },
            /**
             * Handler for selection change on components table
             * @param {sap.ui.base.Event} oEvent selectionChange event
             * @public                                                                                                                                                                       
             */
            onComponentTableRowSelection: function (oEvent) {
                var aSelectedIndex = oEvent.getParameter("rowIndices");
                var aSelectedIndices = this._oComponentTable.getPlugins()[0].getSelectedIndices();

                var bDeletedRowSelected = this._checkIfDeletedCompRowSelected(aSelectedIndices, aSelectedIndex);
                if (bDeletedRowSelected) {
                    return;
                }

                var oSelectedTreeNode;
                if (this._aSelectedComponentsRow === undefined) {
                    this._aSelectedComponentsRow = [];
                }
                if (aSelectedIndices.length === 0) {
                    this._aSelectedComponentsRow = [];
                    this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", false);
                    this.getView().getModel("propertyModel").setProperty("/bDeleteButtonEnable", false);
                } else {
                    for (var iIndex = 0; iIndex < aSelectedIndices.length; iIndex++) {
                        oSelectedTreeNode = this._getSelectedTreeNode(aSelectedIndices, iIndex);
                        if (aSelectedIndices.length === 1) {
                            if (oSelectedTreeNode.DrillDownState === "leaf" && oSelectedTreeNode.critical_ind !== 2 && !this._bIsDeletedRowSelected) {
                                this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", true);
                                this.getView().getModel("propertyModel").setProperty("/bDeleteButtonEnable", true);
                            } else {
                                this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", false);
                            }
                        } else if (aSelectedIndices.length > 1) {
                            this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", false);
                            if (oSelectedTreeNode.DrillDownState === "expanded" || oSelectedTreeNode.critical_ind === 2) {
                                this.getView().getModel("propertyModel").setProperty("/bDeleteButtonEnable", false);
                                break;
                            } else {
                                this.getView().getModel("propertyModel").setProperty("/bDeleteButtonEnable", true);
                            }
                        } else {
                            this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", false);
                            this.getView().getModel("propertyModel").setProperty("/bDeleteButtonEnable", false);
                        }
                    }

                }
            },

            /**
             * Check if Deleted Component row is selected.
             * If yes - revert selection and show Error message.
             * @param {Integer} aSelectedIndices - selected row index  
             * @param {Integer[]} aSelectedIndex selected indexes from event
             * @returns {boolean} value of deleted component selected
             */
            _checkIfDeletedCompRowSelected: function (aSelectedIndices, aSelectedIndex) {
                var bFoundDeletedRow = false;
                aSelectedIndex.forEach(function (iSelectedInd) {
                    var iRowIndInSelectedIndxs = aSelectedIndices.indexOf(iSelectedInd);
                    var bItWasSelected = !~iRowIndInSelectedIndxs;
                    if (bItWasSelected) {
                        return;
                    }
                    var oSelectedRow = this._getSelectedTreeNode(aSelectedIndices, iRowIndInSelectedIndxs);
                    if (oSelectedRow.Delete_Ind) {
                        this._showSelectedDeletedRowErrorMsg();
                        this._oComponentTable.getPlugins()[0].removeSelectionInterval(iSelectedInd, iSelectedInd + 1);
                        bFoundDeletedRow = true;
                    }
                }, this);
                return bFoundDeletedRow;
            },

            /**
             * Show Error message in case of Deleted row is selected.
             */
            _showSelectedDeletedRowErrorMsg: function () {
                if (!this._bIsDeletedRowErrorMsgShown) {
                    this._bIsDeletedRowErrorMsgShown = true;
                    MessageBox.error(this._oResourceBundle.getText("componentDeletedRowSelectedError"), {
                        onClose: function () {
                            this._bIsDeletedRowErrorMsgShown = false;
                        }.bind(this)
                    });
                }
            },

            /**
             * Event to get selected row in components table
             * @param {Integer} aSelectedIndices - selected row index     
             * @param {Integer} iIndex - index of array
             * @returns {String} context of selected row
             */
            _getSelectedTreeNode: function (aSelectedIndices, iIndex) {
                var tableIndex = aSelectedIndices[iIndex];
                var oTreetableContext = this._oComponentTable.getContextByIndex(tableIndex);
                var oSelectedTreeNode = this._oComponentTable.getModel().getProperty(oTreetableContext.getPath());
                return oSelectedTreeNode;
            },
            /**
             * Handler method for copy button press
             * @public
             **/
            onCopyTechnicalChangePress: function () {
                var iSelectedIndex = this._oComponentTable.getPlugins()[0].getSelectedIndex();
                this.iParentNodeIndex = this._oComponentTable.getBinding("rows").getNodeByIndex(iSelectedIndex).parent.positionInParent;
                var oTreetableContext = this._oComponentTable.getContextByIndex(iSelectedIndex);
                var oSelectedTreeNode = this._oComponentTable.getModel().getProperty(oTreetableContext.getPath());
                var oPayLoad = {
                    "RecId": oSelectedTreeNode.RecId,
                    "HeaderKeyLink": this.sKeyLink
                };
                this.setBusy(true);
                this.getModel().callFunction(Constants.FunctionImports.CopyComponent, {
                    method: "POST",
                    urlParameters: oPayLoad,
                    success: this.onSuccessCopyTechnicalChange.bind(this),
                    error: this.onErrorCopyTechnicalChange.bind(this)
                });
            },
            /**
             * Success handler for copy action
             * @param {Object} oResponse is the success reference
             * @public
             **/
            onSuccessCopyTechnicalChange: function (oResponse) {
                this.setBusy(false);
                var sMessage = oResponse.CopyComp.Message;
                MessageToast.show(sMessage);
                this._oComponentTable.getBinding("rows").refresh();
                this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", false);
                this.getView().getModel("propertyModel").setProperty("/bDeleteButtonEnable", false);
            },
            /**
             * Error handler for copy action
             * @param {Object} oError is the error reference
             * @public
             **/
            onErrorCopyTechnicalChange: function (oError) {
                this.setBusy(false);
                if (oError.responseText) {
                    var oMessage = JSON.parse(oError.responseText);
                    MessageBox.error(oMessage.error.message.value);
                }
            },

            /**
             * Handler method for delete button press
             * @public
             **/
            onDeleteTechnicalChangePress: function () {
                var aSelectedIndices = this._oComponentTable.getPlugins()[0].getSelectedIndices(),
                    sDeleteConfirmationMessage = "";
                if (aSelectedIndices.length === 1) {
                    sDeleteConfirmationMessage = this._oResourceBundle.getText("DeleteLineConfirmationMessage");
                } else {
                    sDeleteConfirmationMessage = this._oResourceBundle.getText("DeleteLinesConfirmationMessage");
                }
                MessageBox.warning(sDeleteConfirmationMessage, {
                    title: this._oResourceBundle.getText("Delete"),
                    actions: [this._oResourceBundle.getText("Delete"), MessageBox.Action.CANCEL],
                    onClose: this.onCloseDelCompRowPopup.bind(this)
                });
            },
            /**
             * Method for onClose action of component table delete row popup.
             * @param {sap.m.MessageBox.Action} oAction - provides selected action parameter
             */
            onCloseDelCompRowPopup: function (oAction) {
                if (oAction === this._oResourceBundle.getText("Delete")) {
                    var aSelectedIndices = this._oComponentTable.getPlugins()[0].getSelectedIndices();
                    var aSelectedEntries = [];
                    this.setBusy(true);
                    this.getModel().setDeferredGroups(["deleteBatchFunctionImport"]);
                    for (var iIndex = 0; iIndex < aSelectedIndices.length; iIndex++) {
                        aSelectedEntries = this._getSelectedTreeNode(aSelectedIndices, iIndex);
                        this.getModel().callFunction(Constants.FunctionImports.DeleteComponent, {
                            method: "POST",
                            batchGroupId: "deleteBatchFunctionImport",
                            urlParameters: {
                                "HeaderKeyLink": this.sKeyLink,
                                "RecId": aSelectedEntries.RecId
                            }
                        });
                    }
                    this.getModel().submitChanges({
                        batchGroupId: "deleteBatchFunctionImport",
                        success: this.onSuccessDeleteTechnicalChange.bind(this),
                        error: this.onErrorDeleteTechnicalChange.bind(this)
                    });
                }
            },
            /**
             * Success handler for delete action
             * @param {event} oData - success result
             * @public
             **/
            onSuccessDeleteTechnicalChange: function (oData) {
                this.setBusy(false);
                var oBatchResponse = oData.__batchResponses[0].__changeResponses[0].data.DeleteComp.Message;
                MessageToast.show(oBatchResponse);
                this._oComponentTable.getBinding("rows").refresh();
                this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", false);
                this.getView().getModel("propertyModel").setProperty("/bDeleteButtonEnable", false);

            },
            /**
             * Error handler for delete action
             * @param {Object} oError is the error reference
             * @public
             **/
            onErrorDeleteTechnicalChange: function (oError) {
                this.setBusy(false);
                if (oError.responseText) {
                    var oMessage = JSON.parse(oError.responseText);
                    MessageBox.error(oMessage.error.message.value);
                }
            },
            /**
             * Handler method for Update Sourcing Project button click
             * Triggers function import CreateSourcingProject
             * @public
             **/
            onPressUpdateSourcingProject: function () {
                var oPayLoad = {
                    "KeyLink": this.sKeyLink
                };
                this.setBusy(true);
                this.getModel().callFunction(Constants.FunctionImports.UpdateSourcingProject, {
                    method: "POST",
                    urlParameters: oPayLoad,
                    success: this.onSuccessUpdateSourcingProject.bind(this),
                    error: this.onErrorUpdateSourcingProject.bind(this)
                });
            },

            /**
             * Success handler for Update Sourcing Project action
             * @param {Object} oResponse is the  Response Object
             * @public
             **/
            onSuccessUpdateSourcingProject: function (oResponse) {
                this.getModel().refresh();
                this.setBusy(false);
                var aResults = oResponse.results;
                var aMessageHandlingData = [];
                aMessageHandlingData = aResults.map(function (oResult) {
                    var aFormattedMessage =  MessageViewHelper.formatMessageDataStructure(oResult, aMessageHandlingData);
                    return aFormattedMessage[0];
                });

                var sMessageDialogTitle = this._oResourceBundle.getText("UpdateSrcProjMessagesPopUpTitle");
                MessageViewHelper.openMessageViewDialog(this, aMessageHandlingData, null, sMessageDialogTitle);
            },

            /**
             * Error handler for Update Sourcing Project action
             * @param {Object} oError is the error reference
             * @public
             **/
            onErrorUpdateSourcingProject: function (oError) {
                this.setBusy(false);
                if (oError.responseText) {
                    var oMessage = JSON.parse(oError.responseText);
                    MessageBox.error(oMessage.error.message.value);
                }
            },

            // Add/Update eNTI Item Dialog - 4625
            /** This method will be called once the Create Sourcing Project button is pressed 
             * on the Object Page
             **/
            onPressCreateSrcgProject: function () {
                if (!this.oSelectEntiItemDialog) {
                    this.oSelectEntiItemDialogFragment = Fragment.load({
                        id: this.getView().getController().createId("selectEntiItemDialog"),
                        name: "vwks.nlp.s2p.mm.pmaterial.manage.ext.fragment.SelectEntiItems",
                        controller: this
                    }).then(function (oDialog) {
                        this.oSelectEntiItemDialog = oDialog;
                        this.getView().addDependent(this.oSelectEntiItemDialog);
                    }.bind(this));
                }
                this.oSelectEntiItemDialogFragment.then(function () {
                    var oSelecteNTIItemSmartTable = this.getView().byId("selectEntiItemDialog--idSelectEntiItemSmartTable");
                    var oSelecteNTIItemSmartFilterBar = this.getView().byId("selectEntiItemDialog--idSelectEntiItemSmartFilterBar");
                    var oSelecteNTIItemTable = this.getView().byId("selectEntiItemDialog--idSelectEntiItemTable");

                    if (oSelecteNTIItemSmartFilterBar && oSelecteNTIItemSmartFilterBar.isInitialised()) {
                        oSelecteNTIItemSmartFilterBar.clear();
                    }

                    if (oSelecteNTIItemSmartTable && oSelecteNTIItemSmartTable.isInitialised()) {
                        oSelecteNTIItemSmartTable.rebindTable(true);
                    }

                    if (oSelecteNTIItemTable) {
                        oSelecteNTIItemTable.attachUpdateFinished(this._selectAndDisableRow.bind(this));
                        oSelecteNTIItemTable.attachSelectionChange(this._selectAndDisableRow.bind(this));
                    }

                    this.oSelectEntiItemDialog.open();
                }.bind(this));
            },

            /**
             *This method called when user click on cancel button for the Select ENTI Items dialog box
             **/
            onCancelSelectEntiItemDialog: function () {
                this.oSelectEntiItemDialog.close();
            },

            //NLS-4627
            createProjectBtnVisibilityHandler: function (oArray) {
                return oArray.every(function (oMessage) {
                    return oMessage.type !== MessageType.Error;
                });
            },

            initMessageViewDialog: function (aMessageData, bIsWithoutErrors) {                
                var that = this;
                var oSuccessMessage = aMessageData.find(function (oMessage) {
                    return oMessage.type === MessageType.Success;
                });

                var bIsNoErrorExist = this.createProjectBtnVisibilityHandler(aMessageData);

                var oExtraMessageViewDetailsModelData = {
                    createdSourcingProject: oSuccessMessage ? oSuccessMessage.sourcingProject : "",
                    okBtnVisibility: bIsWithoutErrors,
                    successMessageText: oSuccessMessage ? oSuccessMessage.title : ""
                };
                this.getView().setModel(new JSONModel(oExtraMessageViewDetailsModelData), "extraMessageViewDetailsModel");

                var oExtraButton;
                var oCreateProjectButton = new Button({
                    text: that._oResourceBundle.getText("CreateSrcProjBtn"),
                    press: that.handleCreateSrcProjPress.bind(that),
                    type: ButtonType.Emphasized,
                    visible: true,
                    enabled: bIsNoErrorExist
                });
                var oOkButton = new Button({
                    text: that._oResourceBundle.getText("OkBtn"),
                    press: that.handleOkBtnMessageDialog.bind(that),
                    type: ButtonType.Emphasized,
                    visible: this.getView().getModel("extraMessageViewDetailsModel").getProperty("/okBtnVisibility")
                });

                if (bIsWithoutErrors) {
                    oExtraButton = oOkButton;
                } else {
                    oExtraButton = oCreateProjectButton;
                }
                var sMessageDialogTitle = this._oResourceBundle.getText("CreateSrcProjMessagesPopUpTitle");
                MessageViewHelper.openMessageViewDialog(this, aMessageData, oExtraButton, sMessageDialogTitle);
            },

            handleOpenCreateSrcProjMessagePopup: function () {
                var oWorkItemsTableContext = this.getView().byId("selectEntiItemDialog--idSelectEntiItemTable").getSelectedItems();
                var aKeyLinks = oWorkItemsTableContext.map(function (oWorkItem) {
                    var sWorkitemId = oWorkItem.getBindingContext().getObject().WorkItemID;
                    return sWorkitemId;
                });

                if (!aKeyLinks.includes(this.sKeyLink)) {
                    aKeyLinks.push(this.sKeyLink);
                }

                var mParameters = {
                    MainKeyLink: this.sKeyLink,
                    KeyLinks: aKeyLinks.join(","),
                    SkipValidations: false
                };
                this.oSelectEntiItemDialog.setBusy(true);
                this.getView().getModel().callFunction(
                    Constants.FunctionImports.CreateSourcingProject, {
                    method: "POST",
                    urlParameters: mParameters,
                    success: function (oData) {                        
                        this.oSelectEntiItemDialog.setBusy(false);
                        this.getModel().refresh();
                        this.setBusy(false);
                        var aResults = oData.results;

                        var aMessageHandlingData = [];
                        aResults.forEach(function (oResult) {
                            aMessageHandlingData = MessageViewHelper.formatMessageDataStructure(oResult, aMessageHandlingData);
                        });

                        var aCopyMessageHandlingData = aMessageHandlingData.filter(function (oMessage) {
                            return oMessage.type !== MessageType.Success;
                        });

                        if (aCopyMessageHandlingData.length !== 0) {
                            var bIsWithoutErrors = aMessageHandlingData.every(function (oMessage) {
                                return oMessage.type !== MessageType.Error && oMessage.type !== MessageType.Warning;
                            });

                            this.initMessageViewDialog(aMessageHandlingData, bIsWithoutErrors);
                        } else {
                            this.getView().getModel().refresh();
                            var oParams = {
                                "SourcingProjectUUID": aResults[0].SourcingProject,
                                "IsActiveEntity": true
                            };
                            var sMessageText = aResults[0].MsgText;

                            var oMessageDialogView = this.byId("messageViewDialog--idMessageView");
                            if (oMessageDialogView) {
                                this.onMessageViewCancel();
                            }
                            this.oSelectEntiItemDialog.close();
                            MessageToast.show(sMessageText);

                            NavigationHelper.navigateToExternalApp(this.getView().getController(), "SourcingProject", null, oParams, true);
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.oSelectEntiItemDialog.setBusy(false);
                        if (!oError.responseText) {
                            return;
                        }
                        var oResponseText = JSON.parse(oError.responseText);
                        var aMessageHandlingData = [];
                        var oMessage = oResponseText.error.innererror;
                        oMessage.errordetails.forEach(function (oResult) {
                            aMessageHandlingData = MessageViewHelper.formatMessageDataStructure(oResult, aMessageHandlingData);
                        });

                        this.initMessageViewDialog(aMessageHandlingData, false);

                    }.bind(this)
                });
            },

            onMessageViewCancel: function () {
                MessageViewHelper.onMessageViewCancel();
            },

            onMessageViewNavigateBack: function () {
                MessageViewHelper.onMessageViewNavigateBack();
            },

            onMessageViewItemSelect: function () {
                MessageViewHelper.onMessageViewItemSelect();
            },

            handleCreateSrcProjPress: function () {
                this.onMessageViewCancel();
                this.createSrcProjMessagePopupBtnHandler();
            },

            createSrcProjMessagePopupBtnHandler: function () {
                var oWorkItemsTableContext = this.getView().byId("selectEntiItemDialog--idSelectEntiItemTable").getSelectedItems();
                var aKeyLinks = oWorkItemsTableContext.map(function (oWorkItem) {
                    var sWorkitemId = oWorkItem.getBindingContext().getObject().WorkItemID;
                    return sWorkitemId;
                });

                if (!aKeyLinks.includes(this.sKeyLink)) {
                    aKeyLinks.push(this.sKeyLink);
                }

                var mParameters = {
                    MainKeyLink: this.sKeyLink,
                    KeyLinks: aKeyLinks.join(","),
                    SkipValidations: true
                };
                this.oSelectEntiItemDialog.setBusy(true);
                this.getView().getModel().callFunction(
                    Constants.FunctionImports.CreateSourcingProject, {
                    method: "POST",
                    urlParameters: mParameters,
                    success: function (oData, oResponse) {
                        this.oSelectEntiItemDialog.setBusy(false);
                        if (oResponse) {
                            var aResults = oData.results;
                            var aMessageHandlingData = [];
                            aResults.forEach(function (oResult) {
                                aMessageHandlingData = MessageViewHelper.formatMessageDataStructure(oResult, aMessageHandlingData);
                            });

                            var aCopyMessageHandlingData = aMessageHandlingData.filter(function (oMessage) {
                                return oMessage.type !== MessageType.Success;
                            });

                            if (aCopyMessageHandlingData.length !== 0) {
                                var bIsWithoutErrors = aMessageHandlingData.every(function (oMessage) {
                                    return oMessage.type !== MessageType.Error;
                                });

                                this.initMessageViewDialog(aMessageHandlingData, bIsWithoutErrors);
                            } else {
                                this.getView().getModel().refresh();
                                var oParams = {
                                    "SourcingProjectUUID": aResults[0].SourcingProject,
                                    "IsActiveEntity": true
                                };
                                var sMessageText = aResults[0].MsgText;

                                var oMessageDialogView = this.byId("messageViewDialog--idMessageView");
                                if (oMessageDialogView) {
                                    this.onMessageViewCancel();
                                }
                                this.oSelectEntiItemDialog.close();

                                MessageToast.show(sMessageText);

                                NavigationHelper.navigateToExternalApp(this.getView().getController(), "SourcingProject", null, oParams, true);
                            }
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.oSelectEntiItemDialog.setBusy(false);
                        if (oError.responseText) {
                            MessageBox.error(oError.message);
                        }
                    }.bind(this)
                });
            },

            handleOkBtnMessageDialog: function () {
                var sSourcingProjectUUID = this.getView().getModel("extraMessageViewDetailsModel").getProperty("/createdSourcingProject");
                var sMessageText = this.getView().getModel("extraMessageViewDetailsModel").getProperty("/successMessageText");
                var oParams = {
                    "SourcingProjectUUID": sSourcingProjectUUID,
                    "IsActiveEntity": true
                };

                var oMessageDialogView = this.byId("messageViewDialog--idMessageView");
                if (oMessageDialogView) {
                    this.onMessageViewCancel();
                }
                this.oSelectEntiItemDialog.close();

                MessageToast.show(sMessageText);

                NavigationHelper.navigateToExternalApp(this.getView().getController(), "SourcingProject", null, oParams, true);
            },
            /**
             * Selects and disables the row which has workitem equal to the eNTI workitem
             * from which the Create Sourcing Project button have been pressed
             */
            _selectAndDisableRow: function () {
                var oSelecteNTIItemDialogBox = this.getView().byId("selectEntiItemDialog--idSelectEntiItemDialogBox");
                var oSelecteNTIItemTable = this.getView().byId("selectEntiItemDialog--idSelectEntiItemTable");

                var sWorkitemId = oSelecteNTIItemDialogBox.getParent().getBindingContext().getProperty("WorkitemID");
                var aItems = oSelecteNTIItemTable.getItems();

                // Mark row as selected and non-editable where row workitem id is 
                // equal to the opened eNTI workitem
                aItems.forEach(function (oItem) {
                    var sRowWorkitemId = oItem.getBindingContext().getProperty("WorkItemID");
                    var bIsMultiSelectExist = !!oItem && !!oItem.getMultiSelectControl();
                    if (sWorkitemId === sRowWorkitemId && bIsMultiSelectExist) {
                        oItem.setSelected(true);
                        oItem.getMultiSelectControl().setEnabled(false);
                    }
                });
            },

            /**
             * Method to perform cross app navigation to Mass Change App
             */
            onPressUpdateContracts: function () {
                var oPayload = {
                    KeyLink: this.sKeyLink
                };
                this.getModel().callFunction(Constants.FunctionImports.UpdateContracts, {
                    method: "POST",
                    urlParameters: oPayload,
                    success: this._successUpdateContracts.bind(this),
                    error: function () {

                    }
                });
            },

            /**
             * Success handler for Update Contracts FI
             * @param {object} oResponse - response from backend  
             */
            _successUpdateContracts: function (oResponse) {
                var aResults = oResponse.results;
                var aMaterials = [], aPurchasers = [];
                aResults.forEach(function (oResult) {
                    aMaterials.push(oResult.Material.replaceAll(" ", "*"));
                });
                if (aResults.length) {
                    aPurchasers.push(aResults[0].Purchaser);
                }
                this._navigateToMassChange(aMaterials, aPurchasers);
            },

            /**
             * Perform Cross App Navigation to Mass Change App
             * @param {Array} aMaterials - Materials to be prefilled
             * @param {Array} aPurchasers - Purchaing Group to be prefilled
             */
            _navigateToMassChange: function (aMaterials, aPurchasers) {
                var oParams = {
                    Material: aMaterials,
                    PurchasingGroup: aPurchasers
                };
                // Navigate to Supplier
                NavigationHelper.navigateToExternalApp(this, "MassChange", null, oParams, true);
            }

        });
    });