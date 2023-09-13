// ==UserScript==
// @name         Anilist: Hide Uncommented Activity
// @namespace    https://github.com/SeyTi01/
// @version      1.0
// @description  Hides uncommented activity on home- or social feed
// @author       SeyTi01
// @match        https://anilist.co/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const config = {
        removeUncommented: true,
        removeUnliked: false,
        targetLoadCount: 3
    };

    const observer = new MutationObserver(observeMutations);
    let currentLoadCount = 0;
    let userPressedButton = true;
    let loadMoreButton;

    function removeEntry(node) {
        let removed = false;
        if (node.nodeType === 1 && node.classList.contains('activity-entry')) {
            const repliesDiv = node.querySelector('div.action.replies');
            const likesDiv = node.querySelector('div.action.likes');

            if (config.removeUncommented && !hasCount(repliesDiv)) {
                node.remove();
                removed = true;
            }

            if (config.removeUnliked && !hasCount(likesDiv)) {
                node.remove();
                removed = true;
            }
        }

        return removed;
    }

    function observeMutations(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length !== 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('activity-entry')) {
                        if (removeEntry(node) === false) {
                            currentLoadCount++
                        }
                    }

                    if (node.nodeType === 1 && node.classList.contains('load-more')) {
                        loadMoreButton = node;
                    }
                });
            }
        }

        if (currentLoadCount < config.targetLoadCount && userPressedButton) {
            if (loadMoreButton) {
                loadMoreButton.click();
                loadMoreButton = null;
            }
        } else {
            currentLoadCount = 0;
            userPressedButton = false;
        }
    }

    function hasCount(div) {
        return div?.querySelector('span.count');
    }

    observer.observe(document.body, {childList: true, subtree: true});
    loadMoreButton.addEventListener("click", userPressedButton = true)
})();