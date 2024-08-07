sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "vwks/nlp/s2p/mm/pmaterial/manage/utils/Formatter"
], function (JSONModel, Fragment, Formatter) {
    "use strict";

    var ReuseMessageBox = {
        formatter: Formatter,
        /**
         * @param {object} oView - Parent View
         * @param {sap.ui.model.resource.ResourceModel} oi18nModel - i18n model
         */
        init: function (oView, oi18nModel) {
            this._oView = oView;
            this.oi18nModel = oi18nModel;
        },

        /**
         * Load and open Dialog.
         * @param {object} oResponse - BE response object
         * @public
         */
        loadDialog: function (oResponse) {
            var oResultModel = new JSONModel();
            oResultModel.setData(oResponse);
            Fragment.load({
                id: "idMessageBoxFragment",
                name: "vwks.nlp.s2p.mm.pmaterial.manage.ext.reuse.fragment.ReuseMessageBoxDialog",
                controller: this
            }).then(function (oDialog) {
                this._oMessageBoxFragment = oDialog;
                this._oMessageBoxDialog = Fragment.byId("idMessageBoxFragment", "idMessageBoxDialog");
                this._oMessageBoxDialog.setModel(oResultModel, "messageModel");
                this._oView.addDependent(this._oMessageBoxFragment);
                this._oMessageBoxFragment.open();
            }.bind(this));            
        },
        /**
         * Handler for Close button press in Message Box fragment
         */
        handleClosemessageBoxDialog: function () {
            this._oMessageBoxFragment.close();
            this._oMessageBoxFragment.destroy();
            this._oMessageBoxFragment = null;
        }
    };
    return ReuseMessageBox;
}, true);