const fs = require('fs');
const jsdom = require('jsdom');
const { expect } = require('chai');
const { ActivityHandler, config } = require('../src/hideUnwantedActivity.user');
const { restore, spy } = require('sinon');

function setupAndTest(filePath, testConfig, doneCallback) {
    fs.readFile(filePath, 'utf8', function (err, htmlContent) {
        if (err) throw err;

        const dom = new jsdom.JSDOM(htmlContent);
        const node = dom.window.document.body.firstChild;
        Object.assign(config.remove, testConfig);

        const removeSpy = spy(node, 'remove');
        const activityHandler = new ActivityHandler();

        activityHandler.removeEntry(node);

        expect(removeSpy.calledOnce).to.be.true;
        expect(activityHandler.currentLoadCount).to.equal(0);
        doneCallback();
    });
}

describe('removeEntry', function () {
    afterEach(function () {
        restore();
    });

    it('should remove node if it is unliked and remove.unliked is true', function (done) {
        setupAndTest(
            './tests/data/activity-unliked.html',
            { uncommented: false, unliked: true },
            done
        );
    });

    it('should remove node if it is uncommented and remove.uncommented is true', function (done) {
        setupAndTest(
            './tests/data/activity-uncommented.html',
            { uncommented: true },
            done
        );
    });

    it('should remove node if it contains images and remove.images is true', function (done) {
        setupAndTest(
            './tests/data/activity-with-images.html',
            { uncommented: false, images: true },
            done
        );
    });

    it('should remove node if it contains videos and remove.videos is true', function (done) {
        setupAndTest(
            './tests/data/activity-with-videos.html',
            { uncommented: false, videos: true },
            done
        );
    });

    it('should remove node if it contains a custom string and remove.customStrings is not empty', function (done) {
        setupAndTest(
            './tests/data/activity-with-custom-string.html',
            {
                uncommented: false,
                customStrings: ['custom string'],
                caseSensitive: false,
            },
            done
        );
    });

    it('should remove node if it satisfies linked conditions', function (done) {
        setupAndTest(
            './tests/data/activity-linked-conditions.html',
            { uncommented: false, linkedConditions: [['unliked', 'images']] },
            done
        );
    });
});