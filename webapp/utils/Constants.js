sap.ui.define([], function () {
	"use strict";

	return Object.freeze({
		ActionTypes: {
			COAU: "COAU",
			RFCD: "RFCD",
			TECH: "TECH",
            ENTI: "ENTI"
		},
        Status: {
            Completed: "COMP",
            Obsolete: "OBS",
            WaitingForExternal: "WEXT"
        },        
        MessageTypes: {
            Success: "S",
            Info: "I",
            Error: "E",
            Warning: "W",
            SUCCESS: "Success",
            INFO: "Information",
            ERROR: "Error",
            WARNING: "Warning"
        },
        ValidityStatus: {
            Valid: "Valid",
            Expired: "Expired",
            All: "All"
        },

        notifyDevelopmentFilters: ["ActionType"],
        notifyDevelopmentStatusTexts: ["In progress", "New", "Read", "Updated"],
        contractBundleFilters: ["ActionType"],
        contractBundleStatusTexts: ["In progress", "New", "Read", "Updated", "Waiting For External"],

		FunctionImports: {
			CreateCCTRDLandEdit: "/CreateCCTRDLandEdit",
			CopyCCTRandEdit: "/CopyCCTRandEdit",
			ReleaseForEvaluation: "/ReleaseForEvaluation",
			CompleteEvaluation: "/CompleteEvaluation",
			SendForApproval: "/SendForApproval",
			SendToSupplier: "/SendToSupplier",
			CreateSourcingProject: "/CreateSourcingProject",
			AddProcurementLine: "/AddProc",
			AddAttachment: "/AddAttach",
			UpdateSourcingProject: "/UpdateSourcingProject",
			CopyComponent: "/CopyComp",
			DeleteComponent: "/DeleteComp",
            ValidateSupplier: "/ValidateSupplier",
            EmailPopup: "/EmailPopup",
            SendEmail: "/SendEmail",
            UpdateContracts: "/UpdateContracts"
		},

		Icons: {
			Success: "sap-icon://message-success",
			Warning: "sap-icon://message-warning",
			Error: "sap-icon://message-error"
		}
	});
});