sap.ui.define([
	"vwks/nlp/s2p/mm/pmaterial/manage/utils/Constants",
	"sap/ui/core/IconColor"
], function (Constants, IconColor) {
	"use strict";
	var formatter = {

		/**
		 * formatter method for notes
		 * @param {string} sNotesType note type
		 * @returns {array} array of note type
		 */
		returnNotesJSON: function (sNotesType) {
			var aNoteTypes = [];
			if (sNotesType && typeof sNotesType === "string") {
				var aSplitString = sNotesType.split(" ");
				for (var i = 0; i < aSplitString.length; i++) {
					var oNoteTypes = {};
					oNoteTypes.name = aSplitString[i];
					oNoteTypes.settings = {
						"languageList": {
							"showSecondaryValues": true
						}
					};
					aNoteTypes.push(oNoteTypes);
				}
			}
			return aNoteTypes;
		},

		/**
		 * formatter method for message icon
		 * @param {string} sStatus status of the message
		 * @return {string} message icon
		 */
		messageIconFormatter: function (sStatus) {
			var sMessageIcon = "";
			switch (sStatus) {
			case "S":
				sMessageIcon = Constants.Icons.Success;
				break;
			case "W":
				sMessageIcon = Constants.Icons.Warning;
				break;
			case "E":
				sMessageIcon = Constants.Icons.Error;
				break;
			}
			return sMessageIcon;
		},

		/**
		 * formatter method for message icon color
		 * @param {string} sStatus status of the message
		 * @return {string} color of the icon
		 */
		messageIconColorFormatter: function (sStatus) {
			var sMessageIconColor = "";
			switch (sStatus) {
			case "S":
				sMessageIconColor = IconColor.Positive;
				break;
			case "W":
				sMessageIconColor = IconColor.Critical;
				break;
			case "E":
				sMessageIconColor = IconColor.Negative;
				break;
			default:
				sMessageIconColor = IconColor.Neutral;
			}
			return sMessageIconColor;
		},

		/**
		 * formatter method to handle create sourcing project button visibility 
		 * @param {boolean} bEditable - UI editable value
		 * @param {string} sVisible - string value ("X"/"") of visibility of respective button
		 * @param {string} sStatus is Item Status
		 * @returns {boolean} boolean value of visibility of respective button
		 * @public
		 */
		changeSourcingProjectButtonVisibility: function (bEditable, sVisible, sStatus) {
			return (sVisible === "X") && !bEditable && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete);
		},

		/**
		 * Formatter method for Create and Delete action buttons
		 * @param {boolean} bEditable - UI editable value
		 * @param {string} sActionType - Action Type,
		 * @param {string} sStatus is Item Status
		 * @returns {boolean} boolean value of visibility of respective button
		 */
		coauButtonsVisibility: function (bEditable, sActionType, sStatus) {
			return bEditable && sActionType === Constants.ActionTypes.COAU && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete);
		},

		/**
		 * formatter method to handle button visibility in case of Action Type RFCD
		 * @param {boolean} bEditable - UI editable value
		 * @param {string} sActionType - Action Type
		 * @param {string} sStatus is Item Status
		 * @returns {boolean} boolean value of visibility of respective button
		 */
		rfcdButtonsVisibility: function (bEditable, sActionType, sStatus) {
			return bEditable && sActionType === Constants.ActionTypes.RFCD && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete);
		},

		/**
		 * formatter method to handle button visibility in case of Action Type TECH
		 * @param {boolean} bEditable - UI editable value
		 * @param {string} sActionType - Action Type
		 * @param {string} sVisible - string value ("X"/"") of visibility of respective button
		 * @param {string} sStatus is Item Status
		 * @returns {boolean} boolean value of visibility of respective button
		 * @public
		 */
		techChangeButtonsVisibility: function (bEditable, sActionType, sVisible, sStatus) {
			return bEditable && (sVisible === "X") && sActionType === Constants.ActionTypes.TECH && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete);
		},

		/**
		 * formatter method to handle Update Contract button visibility
		 * in case of Action Type TECH
		 * @param {boolean} bEditable - UI editable value
		 * @param {string} sActionType - Action Type
		 * @param {string} sStatus is Item Status
		 * @returns {boolean} boolean value of visibility of Send for Approval button / active state for Complete Evaluation button
		 * @public 
		 */
		techButtonUpdateContractFormatter: function (bEditable, sActionType, sStatus) {
			return bEditable && sActionType === Constants.ActionTypes.TECH && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete);
		},

		/**
		 * formatter method to handle Send for Approval button visibility and active/inactive property for Complete Evaluation button 
		 * in case of Action Type TECH
		 * @param {string} sValue - string value ("X"/"") of visibility of Send for Approval button
		 * @param {string} sActionType - Action Type
		 * @param {string} sStatus is Item Status
		 * @returns {boolean} boolean value of visibility of Send for Approval button / active state for Complete Evaluation button
		 * @public
		 */
		 techChangeButtonsFormatter: function (sValue, sActionType, sStatus) {
			return (sValue === "X") && sActionType === Constants.ActionTypes.TECH && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete);
		},
		/**
		 * formatter method to handle Notify Development button visibility
		 * in case of Action Type TECH
		 * @param {string} sActionType - Action Type
		 * @param {string} sStatus is Item Status
		 * @returns {boolean} boolean value of visibility of Notify Development button
		 * @public
		 */
		notifyDevButtonVisibility: function (sActionType, sStatus) {
			return sActionType === Constants.ActionTypes.COAU && !(sStatus === Constants.Status.Completed || sStatus === Constants.Status.Obsolete || sStatus === Constants.Status.WaitingForExternal);
		}
	};
	return formatter;
}, true);