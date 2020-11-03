/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"orders/ZSD_ORDERS/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
