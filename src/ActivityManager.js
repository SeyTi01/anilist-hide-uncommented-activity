export class ActivityManager {
    constructor(config) {
        this.config = config;
        this.loadMoreButton = null;
        this.cancelButton = null;
    }

    handleLoadMoreButton(button) {
        this.loadMoreButton = button;
        this.loadMoreButton.addEventListener('click', () => {
            this.userPressedButton = true;
            this.showCancelButton();
        });
    }

    removeEntry(node) {
        if (
            this.shouldRemoveUncommented(node) ||
            this.shouldRemoveUnliked(node) ||
            this.shouldRemoveByCustomStrings(node)
        ) {
            node.remove();
            return true;
        }

        return false;
    }

    showCancelButton() {
        if (!this.cancelButton) {
            this.createCancelButton();
        } else {
            this.cancelButton.style.display = 'block';
        }
    }

    clickLoadMoreButton() {
        if (this.loadMoreButton) {
            this.loadMoreButton.click();
            this.loadMoreButton = null;
        }
    }

    resetState() {
        this.currentLoadCount = 0;
        this.userPressedButton = false;
        if (this.cancelButton) {
            this.cancelButton.style.display = 'none';
        }
    }

    simulateDomEvents() {
        const domEvent = new Event('scroll', {bubbles: true});
        const intervalId = setInterval(() => {
            if (this.userPressedButton) {
                window.dispatchEvent(domEvent);
            } else {
                clearInterval(intervalId);
            }
        }, 100);
    }

    shouldRemoveUncommented(node) {
        if (this.config.remove.uncommented) {
            return !this.hasCountSpan(node.querySelector(SELECTORS.replies));
        }
        return false;
    }

    shouldRemoveUnliked(node) {
        if (this.config.remove.unliked) {
            return !this.hasCountSpan(node.querySelector(SELECTORS.likes));
        }
        return false;
    }

    shouldRemoveByCustomStrings(node) {
        return this.config.remove.customStrings.some((customString) => {
            return this.config.remove.caseSensitive
                ? node.textContent.includes(customString)
                : node.textContent.toLowerCase().includes(customString.toLowerCase());
        });
    }

    hasCountSpan(node) {
        return node?.querySelector('span.count');
    }

    createCancelButton() {
        const buttonStyles = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                z-index: 9999;
                line-height: 1.3;
                background-color: rgb(var(--color-background-blue-dark));
                color: rgb(var(--color-text-bright));
                font: 1.6rem 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                -webkit-font-smoothing: antialiased;
                box-sizing: border-box;
            `;

        this.cancelButton = Object.assign(document.createElement('button'), {
            textContent: 'Cancel',
            className: 'cancel-button',
            style: `--button-color: rgb(var(--color-blue)); ${buttonStyles}`,
            onclick: () => {
                this.userPressedButton = false;
                this.cancelButton.style.display = 'none';
            },
        });

        document.body.appendChild(this.cancelButton);
    }
}

export const SELECTORS = {
    button: 'div.load-more',
    activity: 'div.activity-entry',
    replies: 'div.action.replies',
    likes: 'div.action.likes',
};