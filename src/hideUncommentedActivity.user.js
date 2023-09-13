// ==UserScript==
// @name         Anilist: Hide Uncommented Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.0
// @description  Hides uncommented activity on home- or social feed
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const config = {
        removeUncommented: true,
        removeUnliked: false,
    };

    const activityFeed = document.querySelector('.activity-feed');
    const observer = new MutationObserver(observeMutations);

    function removeEntry(node) {
        if (node.nodeType === 1 && node.classList.contains('activity-entry') && node.classList.contains('activity-anime_list')) {
            const repliesDiv = node.querySelector('div.action.replies');
            const likesDiv = node.querySelector('div.action.likes');

            if (config.removeUncommented && !repliesDiv?.querySelector('span.count')) {
                node.remove();
            }

            if (config.removeUnliked && !likesDiv?.querySelector('span.count')) {
                node.remove();
            }
        }
    }

    function observeMutations(mutations) {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                removeEntry(node);
            });
        }
    }

    if (activityFeed) {activityFeed.forEach(removeEntry);}
    observer.observe(document.body, {childList: true, subtree: true});
})();