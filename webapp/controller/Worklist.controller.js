sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/FilterOperator",
	"sap/m/Dialog",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/ui/commons/TextView",
	"sap/m/Token"
], function (BaseController, JSONModel, ODATAModel, Dialog, Label, TextView, formatter, Filter, FilterOperator, Token, ColumnListItem) {
	"use strict";

	return BaseController.extend("orders.ZSD_ORDERS.controller.Worklist", {

		// formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			var sUrl = "/sap/opu/odata/sap/ZSD_ORDRS_SRV/";
			var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
			sap.ui.getCore().setModel(oModel);

			// Set default dates delivery tab
			this.setDelvDefaultDates();

			// Set default dates billing tab
			this.setBillDefaultDates();

			// Inomplete tab default ates
			this.setIncompleteDefDates();

			// Inomplete tab default ates
			this.setCreditDefDates();

			this.getView().setBusy(true);

				// Empty Json for selected entries in Media issue F4 Help
				this.oJsonData = new JSONModel([], true);
				this.getView().setModel(this.oJsonData, "Dsosel");
				
			// JSON Model for ZSD_ORDRSET
			this.getOwnerComponent().getModel().read("/ZSD_ORDRSSet", {

				success: function (oData, response) {
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setSizeLimit(2000);
					oJSONModel.setData(oData);
					// sap.ui.getCore().setModel(oJSONModel);
					this.getView().setModel(oJSONModel, "Chartdata");
					// sap.m.MessageToast.show("Data Read Successfully1");
					// oData.bindRows("/Chartdata");
					this.getView().setBusy(false);
				}.bind(this)
			});

			// JSON Model for BillingBlockSet
			this.BillRefreshEH();

			// this.getOwnerComponent().getModel().read("/BillingBlockSet", {
			// 	success: function (oData1, response) {
			// 		var oJSONModelb = new sap.ui.model.json.JSONModel();
			// 		oJSONModelb.setSizeLimit(2000);
			// 		oJSONModelb.setData(oData1);
			// 		// sap.ui.getCore().setModel(oJSONModelb);
			// 		this.getView().setModel(oJSONModelb, "Billing");
			// 		// sap.m.MessageToast.show("Data Read 2");
			// 		// oData1.bindRows("/Billing");
			// 	}.bind(this)

			// });

			// JSON Model for Entityset CreditSet
			this.CreditRefreshEH();
			// this.getOwnerComponent().getModel().read("/CreditSet", {
			// 	success: function (oData2, response) {
			// 		var oJSONModelc = new sap.ui.model.json.JSONModel();
			// 		oJSONModelc.setSizeLimit(300);
			// 		oJSONModelc.setData(oData2);
			// 		// sap.ui.getCore().setModel(oJSONModelb);
			// 		this.getView().setModel(oJSONModelc, "Credit");
			// 		// sap.m.MessageToast.show("Data Read 3");
			// 		// oData1.bindRows("/Credit");
			// 	}.bind(this)

			// });
sap.ui.getCore().multiDso = [];
			// JSON Model for Entityset DeliveryBlock
			this.DELVREFRESHWEH();

			// this.getOwnerComponent().getModel().read("/DeliveryBlockSet", {
			// 	success: function (oData3, response) {
			// 		var oJSONModeld = new sap.ui.model.json.JSONModel();
			// 		oJSONModeld.setSizeLimit(300);
			// 		oJSONModeld.setData(oData3);
			// 		// sap.ui.getCore().setModel(oJSONModelb);
			// 		this.getView().setModel(oJSONModeld, "Delivery");
			// 		// sap.m.MessageToast.show("Data Read 3");
			// 		// oData1.bindRows("/Credit");
			// 	}.bind(this)

			// });

			// var oIconTabFilter = this.getView().byId("Tab2");

			// JSON Model for Entityset IncompleteSet
			this.IOREFRESHEH();

			// this.getOwnerComponent().getModel().read("/IncompleteSet", {
			// 	success: function (oDatai, response) {
			// 		var oJSONModeli = new sap.ui.model.json.JSONModel();
			// 		oJSONModeli.setSizeLimit(2000);
			// 		oJSONModeli.setData(oDatai);
			// 		// sap.ui.getCore().setModel(oJSONModelb);
			// 		this.getView().setModel(oJSONModeli, "Incomplete");
			// 		// sap.m.MessageToast.show("Data Read 3");
			// 		// oData1.bindRows("/Credit");
			// 		// oIconTabFilter.setCount(oDatai.results.this.length);
			// 	}.bind(this)

			// });

			// JSON Model for Entityset Order Types
			this.getOwnerComponent().getModel().read("/OrderTypeSet", {
				success: function (oDatat, response) {
					var oJSONModelt = new sap.ui.model.json.JSONModel();
					oJSONModelt.setSizeLimit(500);
					oJSONModelt.setData(oDatat);
					// sap.ui.getCore().setModel(oJSONModelb);
					this.getView().setModel(oJSONModelt, "Otypes");
					// sap.m.MessageToast.show("Data Read 3");
					// oData1.bindRows("/Credit");
				}.bind(this)

			});

			this._oInput = this.getView().byId("Iotype");
			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				// tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});

			/*Start Chart1  NPOLINA */
			// var oTextView = new sap.ui.commons.TextView();
			// oTextView.setText("Please wait, loading data");

			// var oVizFrame = this.getView().byId("idVizFrameo");
			// oVizFrame.setVizProperties({
			// 	// dataLabel: {
			// 	// 	visible: true,
			// 	// 	type: "value",

			// 	// 	showTotal: true
			// 	// },

			// 	// title: {
			// 	// 	text: "Blocked Orders Status",
			// 	// 	visible: "false"
			// 	// },

			// 	// plotArea: {
			// 	// 	colorPalette: d3.scale.category20().range(),
			// 	// 	drawingEffect: "glossy"

			// 	// },

			// 	valueAxis: {
			// 		label: {
			// 			//						formatString: formatPattern.SHORTFLOAT
			// 		},
			// 		title: {
			// 			visible: true
			// 		}
			// 	},
			// 	categoryAxis: {
			// 		title: {
			// 			visible: false
			// 		}
			// 	},
			// 	noData: oTextView

			// });

			// var oPopOver = this.getView().byId("idPopOver");
			// oPopOver.setActionItems([{
			// 	type: "action"

			// 	// 		// text: "Ok",

			// 	// 	// press: function() {

			// 	// 	// 	this.getView().byId("chartContainerdcc").switchChart(this.getView().byId("chartContainerdcc").getContent()[1]);
			// 	// 	// }.bind(this)
			// }]);
			// oPopOver.connect(oVizFrame.getVizUid());
			/*End Chart1  NPOLINA */

			/*Start Chart2  NPOLINA */

			var oVizFrame3 = this.getView().byId("idVizFrame5");
			//		 oVizFrame2.setModel(dataModel);
			var oDataset3 = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
						name: "OrderTypes",
						value: "{Auart}"
					}, {
						name: "Period",
						value: "{Prodh}"
					}

				],

				measures: [{
						name: "Billing",
						value: "{Faksk}"
					}, {
						name: "Delivery",
						value: "{Lifsk}"
					}, {
						name: "Credit",
						value: "{Cmgst}"
					},
					// 		// {
					// 		// 	name: 'Overall',
					// 		// 	value: "{Gbsta}"
					// 		// },

					{
						name: "Price",
						value: "{Netwr}"
					}

				],

				data: {
					path: "/ZSD_ORDRSSet"
						//					path: "results"
				},

			});
			oVizFrame3.setDataset(oDataset3);
			oVizFrame3.setVizProperties({
				title: {
					text: "Block Status trend...",
					visible: "false"
				},
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					drawingEffect: "glossy"

				},
				noData: "Loading.."

			});
			// /*	End Chart3  NPOLINA */

			// onInit Method ending					

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		//////////////////////////////////////////////////////////  Delv Blk SO F4 Start
		/////////////// Pop Up for Delv Block SO
		inputDso: "",
		fragmentDso: null,
		onHelpRequestDSO: function (oEvent) {

			this.inputDso = oEvent.getSource().getId();
			if (this.fragmentDso === null) {
				this.fragmentDso = new sap.ui.xmlfragment("orders.ZSD_ORDERS.view.FrgmntDELVSO", this);

				this.fragmentDso.setTitle("Sales Orders with Delv Block");
				this.getView().addDependent(this.fragmentDso);
			}
			//			var aToken = this.getView().byId("productInput").getTokens();

			this.fragmentDso.open();
		},

		//Cancel Button on Media issue F4
		cancelDelvSO: function () {

			this.fragmentDso.close();

		},

		//////////////////////////////////////////////////////////  Delv Blk SO F4 End

		// Default dates in Delivery Block Tab
		setDelvDefaultDates: function () {
			var currentDate = new Date();
			var oToDate = this.getView().byId("edated");
			oToDate.setDateValue(currentDate);
			// sap.ui.getCore().startdate = currentDate;

			var date = currentDate;
			date = date.setDate(date.getDate() - 210);
			this.getView().byId("sdated").setDateValue(new Date(date));

			var currentDate2 = new Date();
			var oToDate2 = this.getView().byId("edated");
			oToDate2.setDateValue(currentDate2);

			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-dd"
			});
			sap.ui.getCore().sdated = oDateFormat.format(currentDate);
			sap.ui.getCore().edated = oDateFormat.format(currentDate2);

		},

		// Default dates in Billing Block Tab
		setBillDefaultDates: function () {
			var currentDate = new Date();
			var oToDate = this.getView().byId("Bedate");
			oToDate.setDateValue(currentDate);
			// sap.ui.getCore().startdate = currentDate;

			var date = currentDate;
			date = date.setDate(date.getDate() - 180);
			this.getView().byId("Bsdate").setDateValue(new Date(date));

			var currentDate2 = new Date();
			var oToDate2 = this.getView().byId("Bedate");
			oToDate2.setDateValue(currentDate2);

			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-dd"
			});
			sap.ui.getCore().Bsdate = oDateFormat.format(currentDate);
			sap.ui.getCore().Bedate = oDateFormat.format(currentDate2);

		},

		// Default dates in Inomplete Block Tab
		setIncompleteDefDates: function () {
			var currentDate = new Date();
			var oToDate = this.getView().byId("Ioedate");
			oToDate.setDateValue(currentDate);
			// sap.ui.getCore().startdate = currentDate;

			var date = currentDate;
			date = date.setDate(date.getDate() - 120);
			this.getView().byId("Iosdate").setDateValue(new Date(date));

			var currentDate2 = new Date();
			var oToDate2 = this.getView().byId("Ioedate");
			oToDate2.setDateValue(currentDate2);

			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-dd"
			});
			sap.ui.getCore().Iosdate = oDateFormat.format(currentDate);
			sap.ui.getCore().Ioedate = oDateFormat.format(currentDate2);

		},

		// Set Credit Tab default dates
		setCreditDefDates: function () {
			var currentDate = new Date();
			var oToDate = this.getView().byId("Cedate");
			oToDate.setDateValue(currentDate);
			// sap.ui.getCore().startdate = currentDate;

			var date = currentDate;
			date = date.setDate(date.getDate() - 120);
			this.getView().byId("Csdate").setDateValue(new Date(date));

			var currentDate2 = new Date();
			var oToDate2 = this.getView().byId("Cedate");
			oToDate2.setDateValue(currentDate2);

			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-dd"
			});
			sap.ui.getCore().Iosdate = oDateFormat.format(currentDate);
			sap.ui.getCore().Ioedate = oDateFormat.format(currentDate2);

		},
		//////////////////////////////////////////////////////////  F4
		onvalsearch: function (oEvent) {

			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			var path;
			var oTableStdListTemplate;
			var oFilterTableNo;
			this.oDialog = sap.ui.xmlfragment("orders.ZSD_ORDERS.view.valuehelpsingle", this);
			path = "/OrderTypeSet";
			oTableStdListTemplate = new sap.m.StandardListItem({
				title: "{Auart}",
				description: "{Bezei}"
			}); // //create a filter for the binding
			oFilterTableNo = new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, "");
			this.oDialog.unbindAggregation("items");
			this.oDialog.bindAggregation("items", {
				path: path,
				template: oTableStdListTemplate,
				filters: [oFilterTableNo]
			}); // }// open value help dialog filtered by the input value
			this.oDialog.open(sInputValue);
		},

		handleTableValueHelpConfirm: function (e) {
			var s = e.getParameter("selectedItem");
			if (s) {
				this.byId(this.inputId).setValue(s.getBindingContext().getObject().Auart);
				this.readRefresh(e);
			}
			this.oDialog.destroy();
		},

		handleTableValueHelpSearch: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Auart", FilterOperator.Contains, sValue);

			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});

			var selectedotyp = this.getView().byId("Iotyp").getSelectedItem();
			sap.ui.getCore().otyp2 = selectedotyp ? selectedotyp.getKey() : null;

			var dataobject = {};
			dataobject.Auart = sValue;

			var oFilter = new sap.ui.model.Filter({
				filters: [

					new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, dataobject.Auart)
				],
				and: true
			});

			odatamodelobject.read("/OrderTypeSet", {
				filters: [oFilter],
				success: function (oDatat, response) {

					// var oJSONModelt = new sap.ui.model.json.JSONModel();
					// oJSONModelt.setData(oDatat);
					// sap.ui.getCore().setModel(oJSONModelt);
					// this.getView().setModel(oJSONModelt, "Incomplete");
					// sap.m.MessageToast.show("Filter applied successfully");
					oDatat.bindRows("items");

				},

				error: function (oError) {

					sap.m.MessageToast.show("Data Read error ");
				}

			});
		},

		typechange: function (oEvent) {

			var Value = oEvent.getParameter("value");
			sap.ui.getCore().media = Value ? Value : null;
			// this.shipToSelected();
		},
		///////////////////////////////////////////////////////////
		///// Get Incomplete Items details
		fragment2: null,
		IitemsEH: function (oEvent) {

			// var listRules=this.getView().byId("myTable");
			// listRules.getModel().refresh();
			
			sap.ui.getCore().Vbeln = this.getView().getModel("Incomplete").getProperty("Vbeln", oEvent.getSource().getBindingContext(
				"Incomplete"));
			sap.ui.getCore().Prodh = "";
			this.vbeln = sap.ui.getCore().Vbeln.trimRight();
			this.Prodh = sap.ui.getCore().Prodh;
			this.getItemDetails();
			if (this.fragment2 === null) {
				this.fragment2 = new sap.ui.xmlfragment("orders.ZSD_ORDERS.view.FragmentIncItems", this);
				this.getView().addDependent(this.fragment2);
			}
			this.fragment2.setTitle("Items of" + " " + sap.ui.getCore().Vbeln);
			//this.fragment2.addStyleClass("styleclass1");
			this.fragment2.open();
		},

		getItemDetails: function () {

			var objFilter1 = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.vbeln);
		
			var oFilter = new sap.ui.model.Filter({
				filters: [
					// objFilter1
					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.vbeln),
					new sap.ui.model.Filter("Prodh", sap.ui.model.FilterOperator.EQ, this.Prodh)
				],
				and: true
			});
			var sUrl = "/sap/opu/odata/sap/ZSD_ORDRS_SRV/";
			var oDatam1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});
			oDatam1.refresh(true);
			this.getView().setBusy(true);
			oDatam1.read("/ItemINCSet", {
				filters: [oFilter],
				success: function (oData16, response) {

					var oJSONM16 = new sap.ui.model.json.JSONModel();
					oJSONM16.refresh(true);
					oJSONM16.setData(oData16);
					sap.ui.getCore().setModel(oJSONM16);

					this.getView().setModel(oJSONM16, "Iitems");
					this.getView().setBusy(false);
					// sap.m.MessageToast.show("Success");
					oData16.bindRows("/Iitems");

				}.bind(this),
				error: function (oError) {
					sap.m.MessageToast.show("Data Read error ");
				}
			});
		},

		//Cancel Button 
		cancelItem: function () {
			this.fragment2.close();
		},

		// Get Incompletion Items list
		fragmentIL: null,
		IitemlistEH: function (oEvent) {
			
			sap.ui.getCore().Vbeln = this.getView().getModel("Incomplete").getProperty("Vbeln", oEvent.getSource().getBindingContext(
				"Incomplete"));
			sap.ui.getCore().Prodh = "INCL";
			this.vbeln = sap.ui.getCore().Vbeln.trimRight();
			this.Prodh = sap.ui.getCore().Prodh;
			this.getItemDetails();
			if (this.fragmentIL === null) {
				this.fragmentIL = new sap.ui.xmlfragment("orders.ZSD_ORDERS.view.FragmentIncList", this);
				this.getView().addDependent(this.fragmentIL);
			}
			this.fragmentIL.setTitle("Incompletion List of Order: " + " " + sap.ui.getCore().Vbeln);
			//this.fragment2.addStyleClass("styleclass1");
			this.fragmentIL.open();
		},

		cancelItemIL: function () {
			this.fragmentIL.close();
		},
		///////////////////////////////////////////////////////////
		// Get Delivery Item details
		fragmentd: null,
		DitemsEH: function (oEvent) {

			sap.ui.getCore().Vbeln = this.getView().getModel("Delivery").getProperty("Vbeln", oEvent.getSource().getBindingContext(
				"Delivery"));
			// sap.ui.getCore().Auart = "INC";
			this.vbeln = sap.ui.getCore().Vbeln.trimRight();

			this.getDELVItemDetails();
			if (this.fragmentd === null) {
				this.fragmentd = new sap.ui.xmlfragment("orders.ZSD_ORDERS.view.FragDELVItems", this);
				this.getView().addDependent(this.fragmentd);
			}
			this.fragmentd.setTitle("Items of" + " " + sap.ui.getCore().Vbeln);
			//this.fragment2.addStyleClass("styleclass1");
			this.fragmentd.open();
		},

		getDELVItemDetails: function () {

			var objFilter1 = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.vbeln);

			var oFilter = new sap.ui.model.Filter({
				filters: [
					// objFilter1
					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.vbeln)
				],
				and: true
			});
			var sUrl = "/sap/opu/odata/sap/ZSD_ORDRS_SRV/";
			var oDatam1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});

			// var that = this;
			oDatam1.read("/ItemDELVSet", {
				filters: [oFilter],
				success: function (oData16, response) {

					var oJSONM16 = new sap.ui.model.json.JSONModel();
					oJSONM16.setData(oData16);
					sap.ui.getCore().setModel(oJSONM16);
					this.getView().setModel(oJSONM16, "Ditems");
					// sap.m.MessageToast.show("Success");
					oData16.bindRows("/Ditems");
				}.bind(this),
				error: function (oError) {
					sap.m.MessageToast.show("Data Read error ");
				}
			});
		},

		//Cancel Button 
		DcancelItem: function () {
			this.fragmentd.close();
		},

		///////////////////////////////////////////////////////////
		// Get Billing Item details
		fragmentb: null,
		BitemsEH: function (oEvent) {

			sap.ui.getCore().Vbeln = this.getView().getModel("Billing").getProperty("Vbeln", oEvent.getSource().getBindingContext(
				"Billing"));
			// sap.ui.getCore().Auart = "INC";
			this.vbeln = sap.ui.getCore().Vbeln.trimRight();

			this.getBILLItemDetails();
			if (this.fragmentb === null) {
				this.fragmentb = new sap.ui.xmlfragment("orders.ZSD_ORDERS.view.FragBILLItems", this);
				this.getView().addDependent(this.fragmentb);
			}
			this.fragmentb.setTitle("Items of" + " " + sap.ui.getCore().Vbeln);
			//this.fragment2.addStyleClass("styleclass1");
			this.fragmentb.open();
		},

		getBILLItemDetails: function () {

			var objFilter1 = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.vbeln);

			var oFilter = new sap.ui.model.Filter({
				filters: [
					// objFilter1
					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.vbeln)
				],
				and: true
			});
			var sUrl = "/sap/opu/odata/sap/ZSD_ORDRS_SRV/";
			var oDatam1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});

			// var that = this;
			oDatam1.read("/ItemBILLSet", {
				filters: [oFilter],
				success: function (oData16, response) {

					var oJSONM16 = new sap.ui.model.json.JSONModel();
					oJSONM16.setData(oData16);
					sap.ui.getCore().setModel(oJSONM16);
					this.getView().setModel(oJSONM16, "Bitems");
					// sap.m.MessageToast.show("Success");
					oData16.bindRows("/Bitems");
				}.bind(this),
				error: function (oError) {
					sap.m.MessageToast.show("Data Read error ");
				}
			});
		},

		//Cancel Button 
		BcancelItem: function () {
			this.fragmentb.close();
		},

// Get Billing Item details
		fragmentc: null,
		CitemsEH: function (oEvent) {

			sap.ui.getCore().Vbeln = this.getView().getModel("Credit").getProperty("Vbeln", oEvent.getSource().getBindingContext(
				"Credit"));
			// sap.ui.getCore().Auart = "INC";
			this.vbeln = sap.ui.getCore().Vbeln.trimRight();

			this.getCreditItemDetails();
			if (this.fragmentc === null) {
				this.fragmentc = new sap.ui.xmlfragment("orders.ZSD_ORDERS.view.FragCItems", this);
				this.getView().addDependent(this.fragmentc);
			}
			this.fragmentc.setTitle("Items of" + " " + sap.ui.getCore().Vbeln);
			//this.fragment2.addStyleClass("styleclass1");
			this.fragmentc.open();
		},

		getCreditItemDetails: function () {

			var objFilter1 = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.vbeln);

			var oFilter = new sap.ui.model.Filter({
				filters: [
					// objFilter1
					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.vbeln)
				],
				and: true
			});
			var sUrl = "/sap/opu/odata/sap/ZSD_ORDRS_SRV/";
			var oDatam1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});
		
			// var that = this;
			oDatam1.read("/ItemCreditSet", {
				filters: [oFilter],
				success: function (oData16, response) {

					var oJSONM16 = new sap.ui.model.json.JSONModel();
					oJSONM16.setData(oData16);
					sap.ui.getCore().setModel(oJSONM16);
					this.getView().setModel(oJSONM16, "Citems");
					// sap.m.MessageToast.show("Success");
					oData16.bindRows("/Citems");
				}.bind(this),
				error: function (oError) {
					sap.m.MessageToast.show("Data Read error ");
				}
			});
		},

		//Cancel Button 
		CcancelItem: function () {
			this.fragmentc.close();
		},
		
		///////////////////////////////////////////////////////////

		// Incomplete Orders REFRESH
		// RefreshIOEH: function (oEvent) {
		// 	var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
		// 		json: true,
		// 		loadMetadataAsync: true
		// 	});

		// 	odatamodelobject.read("/IncompleteSet", {

		// 		success: function (oData, response) {
		// 			this.getView().getModel().refresh(true);
		// 			sap.m.MessageToast.show("Page refreshed");

		// 		}.bind(this),

		// 		error: function (oError) {

		// 			sap.m.MessageToast.show("Error in Page refresh");
		// 		}
		// 	});
		// },

		//Incompletion Order/Order Type selected from list and Refresh 
		IOREFRESHEH: function (oEvent) {
			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});
			var DataObject2 = [];
			
			var items = this.getView().byId("Inctype").getSelectedKeys();

			for (var i = 0; i < items.length; i++) {

				var item = items[i];

				DataObject2.push(new sap.ui.model.Filter("Fdnam", sap.ui.model.FilterOperator.EQ, item));
				// DataObject2.push(item);

			}

			sap.ui.getCore().multiItype = DataObject2;

			// oMultiComboBox.setSelectedItems ( oMultiComboBox.getItems() )
			var selectedotyp = this.getView().byId("Iotyp").getSelectedItem();
			sap.ui.getCore().otyp2 = selectedotyp ? selectedotyp.getKey() : null;

			var dataobject = {};

			dataobject.Vbeln = sap.ui.getCore().so2;
			dataobject.Auart = sap.ui.getCore().otyp2;
			// dataobject.Matnr = DataObject2;

			var iosdate = this.getView().byId("Iosdate").getValue();
			var ioedate = this.getView().byId("Ioedate").getValue();
			sap.ui.getCore().bsdate = iosdate;
			sap.ui.getCore().bedate = ioedate;

			if (ioedate < iosdate) {
				// sap.m.MessageToast.show("'Date-To' earlier than 'Date-From',Pleasei check! ");
				sap.m.MessageBox.warning("'Date-To'  earlier  than  'Date-From ', Pleasei check! ");
				return;
			}

			var oFilter = new sap.ui.model.Filter({
				filters: [

					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, dataobject.Vbeln),
					new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, dataobject.Auart),
					new sap.ui.model.Filter("Stdate", sap.ui.model.FilterOperator.EQ, iosdate),
					new sap.ui.model.Filter("Endate", sap.ui.model.FilterOperator.EQ, ioedate)

				],
				and: true
			});

			oFilter = oFilter.aFilters.concat(DataObject2);

			odatamodelobject.read("/IncompleteSet", {
				filters: [oFilter],
				success: function (oDatai, response) {

					var oJSONModeli = new sap.ui.model.json.JSONModel();
					oJSONModeli.setData(oDatai);
					sap.ui.getCore().setModel(oJSONModeli);
					this.getView().setModel(oJSONModeli, "Incomplete");
					// sap.m.MessageToast.show("Filter applied successfully");
					var itab2 = this.getView().byId("Tab2");
					itab2.setCount(oDatai.results.length);
					oDatai.bindRows("/Incomplete");

				}.bind(this),

				error: function (oError) {

					sap.m.MessageToast.show("Data Read error ");
				}

			});
		},

		//Delivery block Order/Order Type selected from list 
		DsoEH: function (oEvent) {
			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});

			var selectedItem = this.getView().byId("Dso").getSelectedItem();
			sap.ui.getCore().so2 = selectedItem ? selectedItem.getKey() : null;

			var selectedotyp = this.getView().byId("Dotyp").getSelectedItem();
			sap.ui.getCore().otyp2 = selectedotyp ? selectedotyp.getKey() : null;

			var dataobject = {};
			dataobject.Vbeln = sap.ui.getCore().so2;
			dataobject.Auart = sap.ui.getCore().otyp2;

			var oFilter = new sap.ui.model.Filter({
				filters: [

					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, dataobject.Vbeln),
					new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, dataobject.Auart)
				],
				and: true
			});

			odatamodelobject.read("/DeliveryBlockSet", {
				filters: [oFilter],
				success: function (oDatai, response) {

					var oJSONModeli = new sap.ui.model.json.JSONModel();
					oJSONModeli.setData(oDatai);
					sap.ui.getCore().setModel(oJSONModeli);
					this.getView().setModel(oJSONModeli, "Delivery");
					// sap.m.MessageToast.show("Filter applied successfully");
					oDatai.bindRows("/Delivery");

				}.bind(this),

				error: function (oError) {

					sap.m.MessageToast.show("Data Read error ");
				}

			});
		},

		//Credit block Order/Order Type selected from list 
		CsoEH: function (oEvent) {
			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});

			var selectedItem = this.getView().byId("cso").getSelectedItem();
			sap.ui.getCore().so2 = selectedItem ? selectedItem.getKey() : null;

			var selectedotyp = this.getView().byId("cotyp").getSelectedItem();
			sap.ui.getCore().otyp2 = selectedotyp ? selectedotyp.getKey() : null;

			var dataobject = {};

			dataobject.Vbeln = sap.ui.getCore().so2;
			dataobject.Auart = sap.ui.getCore().otyp2;

			var oFilter = new sap.ui.model.Filter({
				filters: [

					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, dataobject.Vbeln),
					new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, dataobject.Auart)
				],
				and: true
			});

			odatamodelobject.read("/CreditSet", {
				filters: [oFilter],
				success: function (oDatai, response) {

					var oJSONModeli = new sap.ui.model.json.JSONModel();
					oJSONModeli.setData(oDatai);
					sap.ui.getCore().setModel(oJSONModeli);
					this.getView().setModel(oJSONModeli, "Credit");
					// sap.m.MessageToast.show("Filter applied successfully");
					oDatai.bindRows("/Credit");

				}.bind(this),

				error: function (oError) {

					sap.m.MessageToast.show("Data Read error ");
				}

			});
		},

		//  Oveview/Chart Tab Blocks CheckBox event 	Overview Tab for Chart	
		BILLGEH: function () {

			var dataobject = {};

			dataobject.billt1 = this.getView().byId("billt1").getSelected();
			dataobject.delvt1 = this.getView().byId("delvt1").getSelected();
			dataobject.overt1 = this.getView().byId("overt1").getSelected();
			dataobject.credt1 = this.getView().byId("credt1").getSelected();
			dataobject.incot1 = this.getView().byId("incot1").getSelected();
			dataobject.sele1 = this.getView().byId("selblock").getSelectedItem().getKey();

			// var dropdownbox  =	this.getView().byId("mydropdownbox").getSelectedItem().getText();
			var oFilter = new sap.ui.model.Filter({
				filters: [

					new sap.ui.model.Filter("Faksk", sap.ui.model.FilterOperator.EQ, dataobject.billt1),
					new sap.ui.model.Filter("Lifsk", sap.ui.model.FilterOperator.EQ, dataobject.delvt1),
					new sap.ui.model.Filter("Gbsta", sap.ui.model.FilterOperator.EQ, dataobject.overt1),
					new sap.ui.model.Filter("Cmgst", sap.ui.model.FilterOperator.EQ, dataobject.credt1),
					new sap.ui.model.Filter("Huvall", sap.ui.model.FilterOperator.EQ, dataobject.incot1),
					new sap.ui.model.Filter("Blocktype", sap.ui.model.FilterOperator.EQ, dataobject.sele1)

				],
				and: true
			});

			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});

			var oModel = this.getView().getModel();
			var oModelJson = new sap.ui.model.json.JSONModel();

			odatamodelobject.read("/ZSD_ORDRSSet", {
				filters: [oFilter],

				success: function (oData, response) {
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData);
					sap.ui.getCore().setModel(oJSONModel);
					this.getView().setModel(oJSONModel, "Chartdata");
					// sap.m.MessageToast.show("Filter applied successfully");
					oData.bindRows("/Chartdata");

				}.bind(this),

				error: function (oError) {

					sap.m.MessageToast.show("Data Read error ");
				}

			});
		},

		// Billing Block Release Event Handler	
		UnblockBBWEH: function (oEvent) {

			var oTable = this.getView().byId("bill"); //reading

			// var iIndex = oTable.getSelectedIndex();

			var oModel2 = oTable.getModel();

			var aRows = oModel2.getData();

			// var aContexts = oTable.getSelectedContexts(); //finding the checked item

			// sap.m.MessageToast.show(aContexts.length + " " + "row(s) selected.");

			var cItem = [];
			sap.ui.getCore().cItem = [];
			sap.ui.getCore().cReq = [];
			var cReq = [];
			var sMsg;
			var tableo = this.getView().byId("bill");
			// var items = tableo.getSelectedContextPaths();
			var items = tableo.getSelectedIndices();
			var modelo = this.getView().getModel("Billing");
			var DataObject = {};

			if (items.length == 0) {
				sap.m.MessageToast.show("Please select Order to Release ");
				return;
			}

			for (var i = 0; i < items.length; i++) {

				// var value = modelo.getProperty(items[i]).Vbeln;
				var value = this.getView().byId("bill").getContextByIndex(items[i]).getProperty().Vbeln;
				DataObject.Vbeln = value;

				// var value1 = modelo.getProperty(items[i]).Posnr;
				var value1 = this.getView().byId("bill").getContextByIndex(items[i]).getProperty().Posnr;
				DataObject.Posnr = value1;

				var oFilter = new sap.ui.model.Filter({
					filters: [

						new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, DataObject.Vbeln, "REL"),
						new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, DataObject.Posnr),
						new sap.ui.model.Filter("Faksk", sap.ui.model.FilterOperator.EQ, "REL")
					],
					and: true
				});

				var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
					json: true,
					loadMetadataAsync: true
				});

				var oModel = this.getView().getModel();
				var oModelJson = new sap.ui.model.json.JSONModel();

				odatamodelobject.read("/BillingBlockSet", {
					filters: [oFilter],

					success: function (oData, response) {
						var oJSONModel = new sap.ui.model.json.JSONModel();
						oJSONModel.setData(oData);
						sap.ui.getCore().setModel(oJSONModel);
						this.getView().setModel(oJSONModel, "Billing");
						sap.m.MessageToast.show("Order Billing Block Released Successfully");
						oData.bindRows("/Billing");

					}.bind(this),

					error: function (oError) {

						sap.m.MessageToast.show("Error in Release Billing Block");
					}

				});
			}
			sap.ui.getCore().items = null;
		},

		// Credit Block Release Event Handler	
		UnblockCBWEH: function (oEvent) {

			var oTable = this.getView().byId("credit"); //reading

			var oModel2 = oTable.getModel();

			var aRows = oModel2.getData();

			var aContexts = oTable.getSelectedContexts(); //finding the checked item

			sap.m.MessageToast.show(aContexts.length + " " + "row(s) selected.");

			var cItem = [];
			sap.ui.getCore().cItem = [];
			sap.ui.getCore().cReq = [];
			var cReq = [];

			var tableo = this.getView().byId("credit");
			var items = tableo.getSelectedContextPaths();
			var modelo = this.getView().getModel("Credit");
			var DataObject = {};

			var array2 = [];

			if (items.length == 0) {
				sap.m.MessageToast.show("Please select record to process1 ");
				return;
			}

			for (var i = 0; i < items.length; i++) {

				var value = modelo.getProperty(items[i]).Vbeln;
				DataObject.Vbeln = value;

				var value1 = modelo.getProperty(items[i]).Posnr;
				DataObject.Posnr = value1;

				var oFilter = new sap.ui.model.Filter({
					filters: [

						new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, DataObject.Vbeln, "REL"),
						new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, DataObject.Posnr),
						new sap.ui.model.Filter("Cmgst", sap.ui.model.FilterOperator.EQ, "REL")
					],
					and: true
				});

				var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
					json: true,
					loadMetadataAsync: true
				});

				// var oModel = this.getView().getModel();
				// var oModelJson = new sap.ui.model.json.JSONModel();

				odatamodelobject.read("/CreditSet", {
					filters: [oFilter],

					success: function (oData, response) {
						var oJSONModel = new sap.ui.model.json.JSONModel();
						oJSONModel.setData(oData);
						sap.ui.getCore().setModel(oJSONModel);
						this.getView().setModel(oJSONModel, "Credit");
						sap.m.MessageToast.show("Order Credit Block Released Successfully");
						oData.bindRows("/Credit");

					}.bind(this),

					error: function (oError) {

						sap.m.MessageToast.show("Error in Release Credit Block");
					}

				});

				// array2 = [new Filter("Vbeln", sap.ui.model.FilterOperator.EQ, value)];
				// array2 = [new Filter("Posnr", sap.ui.model.FilterOperator.EQ, value1)];

				//cReq.push(new Filter("Vbeln", sap.ui.model.FilterOperator.EQ, value));
				//cReq.push(new Filter("Posnr", sap.ui.model.FilterOperator.EQ, value1));

			}
		},

		// Delivery Block Release Event Handler	
		// UnblockDLWEH: function (oEvent) {

		// 	var oTable = this.getView().byId("delv"); //reading

		// 	// var iIndex = oTable.getSelectedIndex();

		// 	var oModel2 = oTable.getModel();

		// 	var aRows = oModel2.getData();

		// 	// var aContexts = oTable.getSelectedContexts(); //finding the checked item

		// 	// sap.m.MessageToast.show(aContexts.length + " " + "row(s) selected.");

		// 	var cItem = [];
		// 	sap.ui.getCore().cItem = [];
		// 	sap.ui.getCore().cReq = [];
		// 	var cReq = [];
		// 	var sMsg;
		// 	var tableo = this.getView().byId("delv");
		// 	// var items = tableo.getSelectedContextPaths();
		// 	var items = tableo.getSelectedIndices();
		// 	var modelo = this.getView().getModel("Delivery");
		// 	var DataObject = {};

		// 	if (items.length == 0) {
		// 		sap.m.MessageToast.show("Please2 select Order to Release ");
		// 		return;
		// 	}

		// 	for (var i = 0; i < items.length; i++) {

		// 		// var value = modelo.getProperty(items[i]).Vbeln;
		// 		var value = this.getView().byId("delv").getContextByIndex(items[i]).getProperty().Vbeln;
		// 		DataObject.Vbeln = value;

		// 		// var value1 = modelo.getProperty(items[i]).Posnr;
		// 		var value1 = this.getView().byId("delv").getContextByIndex(items[i]).getProperty().Posnr;
		// 		DataObject.Posnr = value1;

		// 		var oFilter = new sap.ui.model.Filter({
		// 			filters: [

		// 				new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, DataObject.Vbeln, "REL"),
		// 				new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, DataObject.Posnr),
		// 				new sap.ui.model.Filter("Lifsk", sap.ui.model.FilterOperator.EQ, "REL")
		// 			],
		// 			and: true
		// 		});

		// 		var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
		// 			json: true,
		// 			loadMetadataAsync: true
		// 		});

		// 		var oModel = this.getView().getModel();
		// 		var oModelJson = new sap.ui.model.json.JSONModel();

		// 		odatamodelobject.read("/DeliveryBlockSet", {
		// 			filters: [oFilter],

		// 			success: function (oDatad, response) {
		// 				var oJSONModel = new sap.ui.model.json.JSONModel();
		// 				oJSONModel.setData(oDatad);
		// 				sap.ui.getCore().setModel(oJSONModel);
		// 				this.getView().setModel(oJSONModel, "Delivery");
		// 				sap.m.MessageToast.show("Order Delivery Block Released Successfully");
		// 				oDatad.bindRows("/Delivery");

		// 			}.bind(this),

		// 			error: function (oError) {

		// 				sap.m.MessageToast.show("Error in Release Delivery Block");
		// 			}

		// 		});
		// 	}
		// },

		//////   Update delivery
		// Delivery Block Release Event Handler	
		fragmentDI: null,
		UpdateDLWEH: function (oEvent) {
			//this.getView().getModel().submitChanges();
			this.btnSource = oEvent.getSource();
			// var sMsg;
			var tableo = this.getView().byId("delv");
			var items = tableo.getSelectedIndices();
			// var modelo = this.getView().getModel("Delivery");
			sap.ui.getCore().count = items.length;
			var itemData = [];
			var DataObject = {};
			var value, value1;
			this.ebtnSourc = oEvent.getSource();
			if (items.length == 0) {
				sap.m.MessageToast.show("Please select Order to Release ");
				return;
			}

			for (var i = 0; i < items.length; i++) {
				value = this.getView().byId("delv").getContextByIndex(items[i]).getProperty().Vbeln;
				DataObject.Vbeln = value;
				DataObject.Message = "";
				value1 = this.getView().byId("delv").getContextByIndex(items[i]).getProperty().Posnr;

				itemData.push({
					Vbeln: value,
					Posnr: value1
						// Matnr: ""
				});
				DataObject.NP_VBELN = itemData;

			}
			
			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/");

			var that = this;
			// that.getView().setBusy(true);

			odatamodelobject.create("/DelvHeadSet", DataObject, {
				success: function (oData, oResp) {
					that.getView().setBusy(false);
					// sap.m.MessageBox.success("Successful ");
				
					//////////////////////////////////////////////////
					// if (oData.NP_VBELN.results.length === 1 && oData.Message) {
					// 	sap.m.MessageBox.success(oData.Vbeln + " : " + oData.Message);
					// } else {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "Dmsg");
					sap.ui.getCore().setModel(oModel);
					// if (!that.notificationPopover) {
					// 	that.oMessageTemplate = new sap.m.MessageItem({
					// 		type: "{msg>Msgty}",
					// 		title: "Sales Order: {msg>Vbeln} ",
					// 		// active: true,
					// 		// subtitle: "{msg>Posnr}",
					// 		description: "{msg>Msg1}     {msg>Msg2}      {msg>Msg3}",
					// 		// description: "{msg>Msg3}",
					// 		text: "{msg>Msg2}",
					// 		groupName: "abc"
					// 	});
					// }
					// var oPopover = new sap.m.MessagePopover();
					// oPopover.bindAggregation("items", {
					// 	template: that.oMessageTemplate,
					// 	// contentWidth:"800px",
					// 	path: "msg>/NP_VBELN/results"
					// });
					// that.notificationPopover = oPopover;
					// that.getView().addDependent(that.notificationPopover);
					// that.notificationPopover.openBy(that.btnSource);
					// }
					//
					if (that.fragmentDI === null) {
						that.fragmentDI = new sap.ui.xmlfragment("orders.ZSD_ORDERS.view.FrgmntDELVERR", that);
						that.getView().addDependent(that.fragmentDI);
					}
					that.fragmentDI.setTitle("Delivery block Release status");
					//this.fragment2.addStyleClass("styleclass1");
					that.fragmentDI.open();

					///////////////////////////////////////////////////

					that.DELVREFRESHWEH();
				},
				error: function (oerr) {
					sap.m.MessageBox.error("Error in Delivery Block release");

					that.getView().setBusy(false);
				}

			});

			// odatamodelobject.update(oKey, DataObject, {
			// 	success: function (oData, resp) {

			// 		var sCompleteMessage = resp.headers["sap-message"];

			// 		var oMessage = JSON.parse(sCompleteMessage);

			// 		sap.m.MessageBox.show( + DataObject.Vbeln + " : " + oMessage.message );
			// 		that.DELVREFRESHWEH();
			// 	},
			// 	error: function (err) {
			// 		sap.m.MessageBox.error("Failed to release Delivery Block");
			// 	}
			// });
		},

		//Cancel Button 
		cancelItemDI: function () {
			this.fragmentDI.close();
		},

		// ErrorsDEH: function (oEvent) {
		// 	// oMessagePopover.toggle(oEvent.getSource());
		// 	this._getMessagePopover().openBy(oEvent.getSource());

		// },

		_getMessagePopover: function () {

			// create popover lazily (singleton)

			if (!this._oMessagePopover) {

				// create popover lazily (singleton)

				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(),

					"com.bso.Fragment.messagePopover", this);

				this.getView().addDependent(this._oMessagePopover);

			}

			return this._oMessagePopover;

		},

		////\\ Update Delivery

		// Delivery Block Refresh Event Handler
		DELVREFRESHWEH: function (oEvent) {

			var oTable = this.getView().byId("delv"); //reading

			sap.ui.getCore().cItem = [];
			sap.ui.getCore().cReq = [];

			var DataObject = {};

			var value = 0;
			var value1 = 0;
			DataObject.Vbeln = value;

			var selectedotyp = this.getView().byId("Dotyp").getSelectedItem();
			sap.ui.getCore().otyp2 = selectedotyp ? selectedotyp.getKey() : null;

			var dsdate = this.getView().byId("sdated").getValue();
			var dedate = this.getView().byId("edated").getValue();
			sap.ui.getCore().bsdate = dsdate;
			sap.ui.getCore().bedate = dedate;

			if (dedate < dsdate) {
				// sap.m.MessageToast.show("'Date-To' earlier than 'Date-From',Please4 check! ");
				sap.m.MessageBox.warning("'Date-To'  earlier  than  'Date-From ', Please5 check! ");
				return;
			}

			DataObject.Posnr = value1;

			var oFilter = new sap.ui.model.Filter({
				filters: [

					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, DataObject.Vbeln),
					new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, DataObject.Posnr),
					new sap.ui.model.Filter("Lifsk", sap.ui.model.FilterOperator.EQ, "RF"),
					new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().otyp2),
					new sap.ui.model.Filter("Stdate", sap.ui.model.FilterOperator.EQ, dsdate),
					new sap.ui.model.Filter("Endate", sap.ui.model.FilterOperator.EQ, dedate)
				],
				and: true
			});

			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});


			var DataObject2 = [];
			
			var items = this.getView().byId("Dso").getTokens();

			for (var i = 0; i < items.length; i++) {

				var item = items[i].getText();

				DataObject2.push(new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, item));
				// DataObject2.push(item);

			}

			sap.ui.getCore().multiItype = DataObject2;
			
			// var oModel = this.getView().getModel();
			// var oModelJson = new sap.ui.model.json.JSONModel();
      
           oFilter = oFilter.aFilters.concat(DataObject2);
           
			odatamodelobject.read("/DeliveryBlockSet", {
				filters: [oFilter],

				success: function (oData, response) {
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData);
					sap.ui.getCore().setModel(oJSONModel);
					this.getView().setModel(oJSONModel, "Delivery");
					// sap.m.MessageToast.show("Delivery Data refreshed");
					var itab3 = this.getView().byId("Tab3");
					itab3.setCount(oData.results.length);
					oData.bindRows("/Delivery");
				}.bind(this),
				error: function (oError) {
					sap.m.MessageToast.show("Error in Page refresh");
				}

			});
			 
				this.getView().byId("Dso").removeAllTokens();
				this.getView().getModel("Dsosel").setData([]);
				// sap.ui.getCore().byId("DSOselTable").getModel("Dsosel").refresh(true);
				// var table = sap.ui.getCore().byId("DSOselTable");
				// table.setNoData();
			// }

		},

		// Credit Block Refresh Event Handler
		CreditRefreshEH: function (oEvent) {

			var oTable = this.getView().byId("credit"); //reading

			sap.ui.getCore().cItem = [];
			sap.ui.getCore().cReq = [];

			var DataObject = {};

			var value = 0;
			var value1 = 0;
			DataObject.Vbeln = value;

			var selectedotyp = this.getView().byId("cotyp").getSelectedItem();
			sap.ui.getCore().otyp2 = selectedotyp ? selectedotyp.getKey() : null;

			var csdate = this.getView().byId("Csdate").getValue();
			var cedate = this.getView().byId("Cedate").getValue();
			sap.ui.getCore().csdate = csdate;
			sap.ui.getCore().cedate = cedate;

			if (cedate < csdate) {
				// sap.m.MessageToast.show("'Date-To' earlier than 'Date-From',Please6 check! ");
				sap.m.MessageBox.warning("'Date-To'  earlier  than  'Date-From ', Please7 check! ");
				return;
			}

			DataObject.Posnr = value1;

			var oFilter = new sap.ui.model.Filter({
				filters: [

					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, DataObject.Vbeln),
					new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, DataObject.Posnr),
					new sap.ui.model.Filter("Cmgst", sap.ui.model.FilterOperator.EQ, "RF"),
					new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().otyp2),
					new sap.ui.model.Filter("Stdate", sap.ui.model.FilterOperator.EQ, csdate),
					new sap.ui.model.Filter("Endate", sap.ui.model.FilterOperator.EQ, cedate)
				],
				and: true
			});

			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});

			// var oModel = this.getView().getModel();
			// var oModelJson = new sap.ui.model.json.JSONModel();

			odatamodelobject.read("/CreditSet", {
				filters: [oFilter],

				success: function (oData, response) {
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData);
					sap.ui.getCore().setModel(oJSONModel);
					this.getView().setModel(oJSONModel, "Credit");
					// sap.m.MessageToast.show("Credit block  Data refreshed");
					var itab5 = this.getView().byId("Tab5");
					itab5.setCount(oData.results.length);
					oData.bindRows("/Credit");
				}.bind(this),
				error: function (oError) {
					sap.m.MessageToast.show("Error in Data refresh");
				}

			});

			// }

		},
		//////   

		// Billing Block Release Event Handler	
		fragmentBI: null,
		UpdateBBWEH: function (oEvent) {
			//this.getView().getModel().submitChanges();
			this.btnSourceb = oEvent.getSource();
			var sMsg;
			var tableo = this.getView().byId("bill");
			var items = tableo.getSelectedIndices();
			var modelo = this.getView().getModel("Billing");
			sap.ui.getCore().count = items.length;
			var itemData = [];
			var DataObject = {};
			var value, value1;
			this.ebtnSourc = oEvent.getSource();
			if (items.length == 0) {
				sap.m.MessageToast.show("Please select Order to Release ");
				return;
			}

			for (var i = 0; i < items.length; i++) {
				value = this.getView().byId("bill").getContextByIndex(items[i]).getProperty().Vbeln;
				DataObject.Vbeln = value;
				DataObject.Message = "";
				value1 = this.getView().byId("bill").getContextByIndex(items[i]).getProperty().Posnr;

				itemData.push({
					Vbeln: value,
					Posnr: value1
						// Matnr: ""
				});
				DataObject.NP_VBELN = itemData;

			}

			// DataObject.Vbeln = value;

			// DataObject.NP_VBELN = itemData;

			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/");

			var that = this;
			// that.getView().setBusy(true);

			odatamodelobject.create("/BillHeadSet", DataObject, {
				success: function (oData, oResp) {
					that.getView().setBusy(false);
					var oModel = new JSONModel();
					oModel.setData(oData);
					that.getView().setModel(oModel, "Bmsg");
					sap.ui.getCore().setModel(oModel);
					// if (!that.notificationPopover) {
					// 	that.oMessageTemplate = new sap.m.MessageItem({
					// 		type: "{msg>Msgty}",
					// 		title: "Sales Order: {msg>Vbeln} ",
					// 		active: true,
					// 		// subtitle: "{msg>Posnr}",
					// 		description: "{msg>Msg1}     {msg>Msg2}      {msg>Msg3}",
					// 		// description: "{msg>Msg3}",
					// 		text: "{msg>Msg2}",
					// 		groupName: "abc"
					// 	});
					// }
					// var oPopover = new sap.m.MessagePopover();
					// oPopover.bindAggregation("items", {
					// 	template: that.oMessageTemplate,
					// 	contentWidth: "800px",
					// 	path: "msg>/NP_VBELN/results"
					// });
					// that.notificationPopover = oPopover;
					// that.getView().addDependent(that.notificationPopover);
					// that.notificationPopover.openBy(that.btnSourceb);
					// }

					if (that.fragmentBI === null) {
						that.fragmentBI = new sap.ui.xmlfragment("orders.ZSD_ORDERS.view.FrgmntBILLERR", that);
						that.getView().addDependent(that.fragmentBI);
					}
					that.fragmentBI.setTitle("Billing block Release status");
					//this.fragment2.addStyleClass("styleclass1");
					that.fragmentBI.open();

					///////////////////////////////////////////////////

					that.BillRefreshEH();
				},
				error: function (oerr) {
					sap.m.MessageBox.error("Error in Billing Block release");
					that.getView().setBusy(false);
				}
			});
		},

		//Cancel Button 
		cancelItemBI: function () {
			this.fragmentBI.close();
		},
		
		// Delivery Block Refresh Event Handler
		BillRefreshEH: function (oEvent) {

			var oTable = this.getView().byId("bill"); //reading

			var DataObject = {};

			var value = 0;
			var value1 = 0;
			DataObject.Vbeln = value;

			var selectedotypb = this.getView().byId("Botyp").getSelectedItem();
			sap.ui.getCore().otypb2 = selectedotypb ? selectedotypb.getKey() : null;

			var bsdate = this.getView().byId("Bsdate").getValue();
			var bedate = this.getView().byId("Bedate").getValue();
			sap.ui.getCore().bsdate = bsdate;
			sap.ui.getCore().bedate = bedate;

			if (bedate < bsdate) {
				// sap.m.MessageToast.show("'Date-To' earlier than 'Date-From',Please8 check! ");
				sap.m.MessageBox.warning("'Date-To'  earlier  than  'Date-From ', Please9 check! ");
				return;
			}

			// var value1 = modelo.getProperty(items[i]).Posnr;
			DataObject.Posnr = value1;

			var oFilter = new sap.ui.model.Filter({
				filters: [

					new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, DataObject.Vbeln),
					new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, DataObject.Posnr),
					new sap.ui.model.Filter("Faksk", sap.ui.model.FilterOperator.EQ, "RF"),
					new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().otypb2),
					new sap.ui.model.Filter("Stdate", sap.ui.model.FilterOperator.EQ, bsdate),
					new sap.ui.model.Filter("Endate", sap.ui.model.FilterOperator.EQ, bedate)
				],
				and: true
			});

			var odatamodelobject = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/", {
				json: true,
				loadMetadataAsync: true
			});

			odatamodelobject.read("/BillingBlockSet", {
				filters: [oFilter],

				success: function (oData, response) {
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData);
					sap.ui.getCore().setModel(oJSONModel);
					this.getView().setModel(oJSONModel, "Billing");
					// sap.m.MessageToast.show("Billing data refreshed");
					var itab4 = this.getView().byId("Tab4");
					itab4.setCount(oData.results.length);
					oData.bindRows("/Billing");
				}.bind(this),
				error: function (oError) {
					sap.m.MessageToast.show("Error in Billing data refresh");
				}

			});

			// }

		},

		// Billing Block Release Event Handler	
		UpdateCBWEH: function (oEvent) {
			// var sMsg;
			var tableo = this.getView().byId("credit");
			var items = tableo.getSelectedIndices();
			// var modelo = this.getView().getModel("Credit");

			var DataObjectb = {};

			if (items.length == 0) {
				sap.m.MessageToast.show("Please select Order to Release ");
				return;
			}

			for (var i = 0; i < items.length; i++) {
				var value = this.getView().byId("credit").getContextByIndex(items[i]).getProperty().Vbeln;
				DataObjectb.Vbeln = value;

				var value1 = this.getView().byId("credit").getContextByIndex(items[i]).getProperty().Posnr;
				DataObjectb.Posnr = value1;

				var oKey = this.getView().getModel().createKey("/CreditSet", {
					Vbeln: DataObjectb.Vbeln
						//	Posnr: dataRecord.Posnr
				});

				var odatamodelobjectb = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZSD_ORDRS_SRV/");

				var that = this;
				odatamodelobjectb.update(oKey, DataObjectb, {
					success: function (oData1, oresp) {

						// var bCompleteMessage = oresp.headers["sap-message"];

						// var bMessage = JSON.parse(bCompleteMessage);

						sap.m.MessageBox.show(+DataObjectb.Vbeln + " : " + "Credit block released successfully");
						that.CreditRefreshEH();
					},
					error: function (err) {
						sap.m.MessageBox.error("Failed to release Credit Block Block");
					}
				});

			}

		},

///// Delivery Block Sold-to F4 START		
	//Customer  selections	in Delivery Block F4
			rowSelectionDso: function (oEvent) {
				
				// User selected all rows
				//	var oTable = sap.ui.getCore().byId("mySelProdTable").setModel("sel");
				if ((oEvent.getParameter("listItems").length > 1) && oEvent.getParameter("selected") === true) {
					for (var i = 0; i < oEvent.getParameter("listItems").length; i++) {
						var selectedItem2 = oEvent.getParameter("listItems")[i].getBindingContext().getProperty("Kunnr");
						this.getView().getModel("Dsosel").getData().push({
							"Kunnr": selectedItem2
						});
						this.getView().getModel("Dsosel").updateBindings(true);
					}
				}
				//Slected only single row
				else {
					var selectedItem = oEvent.getParameter("listItem").getBindingContext().getProperty("Kunnr");
					if (oEvent.getParameter("listItem").getProperty("selected") === true) {
						this.getView().getModel("Dsosel").getData().push({
							"Kunnr": selectedItem
						});
						this.getView().getModel("Dsosel").updateBindings(true);
						//deselected single row
					} else {
						this.getView().getModel("Dsosel").getData().pop({
							"Kunnr": selectedItem
						});
						this.getView().getModel("Dsosel").updateBindings(true);
					}
				}
				//User deselected allrows
				if ((oEvent.getParameter("listItems").length > 1) && oEvent.getParameter("selected") === false) {
					this.getView().getModel("Dsosel").setData([]);
				}
				//sap.ui.getCore().byId("mySelProdTable").insertItem(selectedItem.clone(selectedItem.getId(),Math.random()));
			},		
			
	// Accept Button in Customer F4 in Delivery Block selected items
			acceptDelvSO: function (oEvent) {
			this.getView().byId("Dso").removeAllTokens();
				var aFilter = [];
				//	var oTable = sap.ui.getCore().byId("myProdTable");
				var oTable = sap.ui.getCore().byId("DSOselTable");
				//	var oTable = this.fragmentMedia.getContent()[1];
				//var selectedItems = oTable.getSelectedItems();
				var selectedItems = oTable.getItems();
				sap.m.URLHelper.triggerSms(["+919963376425"]);
				//if table has any any selected items capture it else clear
				if (selectedItems.length > 0) {
					// var aToken = this.getView().byId("Dso").getTokens();
					// this.getView().byId("Dso").destroyTokens([aToken]);
					for (var i = 0; i < selectedItems.length; i++) {

						var selectedItem = selectedItems[i].getBindingContext("Dsosel").getProperty("Kunnr");
						var defToken = new sap.m.Token({
							text: selectedItem
						});

						this.getView().byId("Dso").addToken(defToken);
						sap.ui.getCore().dso = selectedItem;
						aFilter.push(selectedItem);
					}
					sap.ui.getCore().multiDso = aFilter;
                  sap.ui.getCore().byId("DelvSOTable").removeSelections(true);
				} else {
					// aToken = this.getView().byId("Dso").getTokens();
					// this.getView().byId("Dso").destroyTokens([aToken]);
					sap.ui.getCore().dso = null;
					sap.ui.getCore().multiDso = [];
				}
                
				this.fragmentDso.close();

				// this.DELVREFRESHWEH(oEvent)();
			},
			
	//Clear all selections Deliveryblock  Customers 
			clearDelvSO: function () {
				var oTable = sap.ui.getCore().byId("DelvSOTable");
				//var oTable = this.fragmentMedia.getContent()[1];
				var selectedItems = oTable.getSelectedItems();

				if (selectedItems.length > 0) {
					oTable.removeSelections(true);
					var aToken = this.getView().byId("Dso").getTokens();
					this.getView().byId("Dso").destroyTokens([aToken]);
					sap.ui.getCore().multiDso = [];
				}
				//remove selections also
				this.getView().getModel("Dsosel").setData([]);
				//var searchValue = sap.ui.core.Fragment.byId("mediaDialog", "mySearch").getValue();
				var searchField = sap.ui.getCore().byId("mySearch");
				searchField.setValue(null);
					this.getView().byId("Dso").removeAllTokens();
			},
			
			//delete selected Customers from Delivery block customer F4 selected table
			deleteSelectionDso: function (oEvent) {
				var selectedItem = oEvent.getParameter("listItem");
				var oTable = sap.ui.getCore().byId("DSOselTable");
				//var oTable = this.fragmentMedia.getContent()[1];
				oTable.removeItem(selectedItem);
			},
			
			
		//Change tokens in Sold-to Multi Input
			DsoChange: function (oEvent) {
				var value = oEvent.getParameter("type");
				if (value === "removed") {
				//remove from selection in value help	
						var text = oEvent.getParameter("token").getText();
                         this.getView().getModel("Dsosel").getData().pop({
						"Kunnr": text});
				         this.getView().getModel("Dsosel").updateBindings(true);
				         
					var aFilter = [];

					var aToken = this.getView().byId("Kunnr").getTokens();
					//if table has any any selected items capture it else clear
					if (aToken.length > 0) {
						for (var i = 0; i < aToken.length; i++) {

							var selectedItem = aToken[i].getProperty("text");
							// var defToken = new sap.m.Token({
							// 	text: selectedItem
							// });
					
				         
							aFilter.push(selectedItem);
						}
						sap.ui.getCore().multiMedia = aFilter;
					} else {
						sap.ui.getCore().multiMedia = [];
						sap.ui.getCore().media = null;
					}
				
					this.DELVREFRESHWEH(oEvent)();
				}
			},			
///// Delivery Block Sold-to F4 END			
		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
			// var sPreviousHash = History.getInstance().getPreviousHash(),
			// 				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			// 			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
			// 				history.go(-1);
			// 			} else {
			// 				oCrossAppNavigator.toExternal({
			// 					target: {
			// 						shellHash: "#Shell-home"
			// 					}
			// 				});
			// }			

		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("Arktx", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Vbeln")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});