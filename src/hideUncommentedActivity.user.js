// ==UserScript==
// @name         Anilist: Hide Unwanted Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.6b
// @description  Hides unwanted activity on Anilist's activity feeds
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @license      MIT
// ==/UserScript==

import {ConfigValidator} from "./ConfigValidator";
import {MutationObserverManager} from "./MutationObserverManager";

const config = {
    targetLoadCount: 2, // Number of activities to show per click on the "Load More" button
    remove: {
        uncommented: true, // Remove activities that have no comments
        unliked: false, // Remove activities that have no likes
        customStrings: [], // Remove activities with user-defined strings
        caseSensitive: false, // Whether string removal should be case-sensitive
    },
    runOn: {
        home: true, // Run the script on the home feed
        social: true, // Run the script on social feeds
        profile: false, // Run the script on user profile feeds
    },
};

(function () {
    'use strict';
    if (ConfigValidator.validate(config)) {
        new MutationObserverManager(config);
    } else {
        console.error('Script disabled due to configuration errors.');
    }
})();