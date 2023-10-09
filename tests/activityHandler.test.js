const fs = require('fs');
const jsdom = require('jsdom');
const { expect } = require('chai');
const { ActivityHandler, config } = require('../src/hideUnwantedActivity.user');
const { restore, spy } = require('sinon');

function setupAndTestPositive(filePath, testConfig, doneCallback) {
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

    it('should remove unliked node if remove.unliked is true', function (done) {
        setupAndTestPositive(
            './tests/data/activity-unliked.html',
            { uncommented: false, unliked: true },
            done
        );
    });

    it('should remove uncommented node if remove.uncommented is true', function (done) {
        setupAndTestPositive(
            './tests/data/activity-uncommented.html',
            { uncommented: true },
            done
        );
    });

    it('should remove image node if remove.images is true', function (done) {
        setupAndTestPositive(
            './tests/data/activity-images.html',
            { uncommented: false, images: true },
            done
        );
    });

    it('should remove video node if remove.videos is true', function (done) {
        setupAndTestPositive(
            './tests/data/activity-videos.html',
            { uncommented: false, videos: true },
            done
        );
    });

    it('should remove customString node if remove.customStrings is not empty', function (done) {
        setupAndTestPositive(
            './tests/data/activity-customString.html',
            {
                uncommented: false,
                customStrings: ['custom string'],
                caseSensitive: false,
            },
            done
        );
    });

    it('should node if it satisfies linked conditions', function (done) {
        setupAndTestPositive(
            './tests/data/activity-linkedConditions.html',
            { uncommented: false, linkedConditions: [['unliked', 'images']] },
            done
        );
    });
});