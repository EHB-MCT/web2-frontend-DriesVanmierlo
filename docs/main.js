/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/script.js":
/*!***********************!*\
  !*** ./src/script.js ***!
  \***********************/
/***/ (() => {

eval("let kapsalonsList;\r\n\r\nwindow.onload = async function () {\r\n    \r\n    console.log(\"Loaded\")\r\n\r\n    await loadKapsalonsHomepage();\r\n\r\n    async function loadKapsalonsHomepage() {\r\n        console.log(\"start data fetch\")\r\n        await fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')\r\n            .then(response => {\r\n                return response.json();\r\n            })\r\n            .then(data => {\r\n                console.log(data);\r\n            })\r\n    }\r\n}\n\n//# sourceURL=webpack://web2-frontend-driesvanmierlo/./src/script.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/script.js"]();
/******/ 	
/******/ })()
;