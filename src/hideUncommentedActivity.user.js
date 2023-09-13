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

    const observer = new MutationObserver(observeMutations);

    function removeUncommentedActivity(node) {
        if (node.nodeType === 1 && node.classList.contains('activity-entry') && node.classList.contains('activity-anime_list')) {
            const countSpan = node.querySelector('span.count');
            const actionRepliesDiv = node.querySelector('div.action.replies');
            if (!countSpan || (actionRepliesDiv && !actionRepliesDiv.contains(countSpan))) {
                node.remove();
            }
        }
    }

    function observeMutations(mutations) {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                removeUncommentedActivity(node);
            });
        }
    }

    const activityFeed = document.querySelector('.activity-feed');
    if (activityFeed) {activityFeed.forEach(removeUncommentedActivity);}
    observer.observe(document.body, {childList: true, subtree: true});
})();