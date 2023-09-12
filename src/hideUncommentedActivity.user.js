// ==UserScript==
// @name         Anilist: Hide Uncommented Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.0
// @description  Hides uncommented activity on home- or social feed
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    function removeUncommentedActivity() {
        const activityContainer = document.querySelector('.activity-feed');

        if (activityContainer) {
            const activityObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node instanceof HTMLElement) {
                            if (node.classList.contains('activity-entry') && node.classList.contains('activity-anime_list')) {
                                const countSpan = node.querySelector('span.count');
                                if (!countSpan) {
                                    node.remove();
                                }
                            }
                        }
                    });
                });
            });

            const observerConfig = { childList: true, subtree: true };
            activityObserver.observe(activityContainer, observerConfig);
        }
    }

    window.addEventListener('load', function() {
        removeUncommentedActivity();
    });
})();