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

eval("window.onload = async function () {\r\n\r\n    console.log(\"Loaded\")\r\n\r\n    await loadKapsalonsHomepage();\r\n\r\n    async function loadKapsalonsHomepage() {\r\n\r\n        let kapsalonList = [];\r\n        let kapsalonListHomepageHTML;\r\n\r\n        await fetch('https://web2-kapsamazing-driesv.herokuapp.com/kapsalons')\r\n            .then(response => {\r\n                return response.json();\r\n            })\r\n            .then(data => {\r\n                console.log(data);\r\n                kapsalonList = data;\r\n            })\r\n\r\n        kapsalonList.forEach(e => {\r\n            kapsalonListHomepageHTML += `\r\n                <a class=\"kapsalon-article-a\" href=\"./kapsalon-info.html\">\r\n                <article class=\"datalist-kapsalon-article\" id=\"${e._id}\">\r\n                    <figure class=\"kapsalon-article-figure\">\r\n                        <img class=\"kapsalon-article-img\" src=\"./images/example-kapsalon-1.jpg\" alt=\"\">\r\n                    </figure>\r\n                    <div class=\"kapsalon-article-info\">\r\n                        <h4 class=\"kapsalon-article-title\">${e.name}</h4>\r\n                        <div class=\"kapsalon-article-restaurant\">\r\n                            <span class=\"icon-location edit-location-icon\"></span>\r\n                            <div class=\"kapsalon-article-restaurant-name\">${e.restaurant}</div>\r\n                            <div class=\"kapsalon-article-restaurant-distance\">0,7 km</div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"kapsalon-article-moreinfo\">\r\n                        <div class=\"kapsalon-article-rating\">\r\n                            <div class=\"kapsalon-article-rating-number\">4,4/5</div>\r\n                            <span class=\"icon-star-full edit-star-icon\"></span>\r\n                            <span class=\"icon-star-full edit-star-icon\"></span>\r\n                            <span class=\"icon-star-full edit-star-icon\"></span>\r\n                            <span class=\"icon-star-full edit-star-icon\"></span>\r\n                            <span class=\"icon-star-empty edit-star-icon\"></span>\r\n                        </div>\r\n                        <div class=\"kapsalon-article-price\">€${e.price}</div>\r\n                    </div>\r\n                </article>\r\n            </a>\r\n                `\r\n        });\r\n\r\n        document.getElementById('kapsalon-datalist').innerHTML = kapsalonListHomepageHTML;\r\n    }\r\n}\n\n//# sourceURL=webpack://web2-frontend-driesvanmierlo/./src/script.js?");

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