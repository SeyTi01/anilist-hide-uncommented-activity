const fs = require('fs');
const jsdom = require('jsdom');
const { expect} = require('chai');
const { ActivityHandler, config } = require('../src/hideUnwantedActivity.user');
const {restore, spy} = require("sinon");

describe('removeEntry', function() {
    let activityHandler;

    beforeEach(function() {
        activityHandler = new ActivityHandler();
    });

    function testRemoveFunction(htmlPath, configOptions, expectedRemoveCalled, expectedLoadCount) {
        it(`should ${expectedRemoveCalled ? '' : 'not '}remove node with config: ${JSON.stringify(configOptions)}`, function(done) {
            fs.readFile(htmlPath, 'utf8', function(err, htmlContent) {
                if (err) throw err;
                Object.assign(config, configOptions);
                const dom = new jsdom.JSDOM(htmlContent);
                const node = dom.window.document.body.firstChild;
                const removeSpy = spy(node, 'remove');
                activityHandler.removeEntry(node);

                expect(removeSpy.calledOnce).to.equal(expectedRemoveCalled);
                expect(activityHandler.currentLoadCount).to.equal(expectedLoadCount);
                done();
            });
        });
    }

    // Tests for unliked
    testRemoveFunction('./tests/data/activity-unliked.html', { remove: { unliked: true, uncommented: false } }, true, 0);
    testRemoveFunction('./tests/data/activity-uncommented.html', { remove: { unliked: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-images.html', { remove: { unliked: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-videos.html', { remove: { unliked: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-customStrings.html', { remove: { unliked: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-linkedConditions.html', { remove: { unliked: true, uncommented: false } }, true, 0);

    // Tests for uncommented
    testRemoveFunction('./tests/data/activity-unliked.html', { remove: { uncommented: true } }, false, 1);
    testRemoveFunction('./tests/data/activity-uncommented.html', { remove: { uncommented: true } }, true, 0);
    testRemoveFunction('./tests/data/activity-images.html', { remove: { uncommented: true } }, false, 1);
    testRemoveFunction('./tests/data/activity-videos.html', { remove: { uncommented: true } }, false, 1);
    testRemoveFunction('./tests/data/activity-customStrings.html', { remove: { uncommented: true } }, false, 1);
    testRemoveFunction('./tests/data/activity-linkedConditions.html', { remove: { uncommented: true } }, false, 1);

    // Tests for images
    testRemoveFunction('./tests/data/activity-unliked.html', { remove: { images: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-uncommented.html', { remove: { images: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-images.html', { remove: { images: true, uncommented: false } }, true, 0);
    testRemoveFunction('./tests/data/activity-videos.html', { remove: { images: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-customStrings.html', { remove: { images: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-linkedConditions.html', { remove: { images: true, uncommented: false } }, true, 0);

    // Tests for videos
    testRemoveFunction('./tests/data/activity-unliked.html', { remove: { videos: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-uncommented.html', { remove: { videos: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-images.html', { remove: { videos: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-videos.html', { remove: { videos: true, uncommented: false } }, true, 0);
    testRemoveFunction('./tests/data/activity-customStrings.html', { remove: { videos: true, uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-linkedConditions.html', { remove: { videos: true, uncommented: false } }, false, 1);

    // Tests for customStrings
    testRemoveFunction('./tests/data/activity-unliked.html', { remove: { customStrings: ['custom string'], uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-uncommented.html', { remove: { customStrings: ['custom string'], uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-images.html', { remove: { customStrings: ['custom string'], uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-videos.html', { remove: { customStrings: ['custom string'], uncommented: false } }, false, 1);
    testRemoveFunction('./tests/data/activity-customStrings.html', { remove: { customStrings: ['custom string'], uncommented: false } }, true, 0);
    testRemoveFunction('./tests/data/activity-linkedConditions.html', { remove: { customStrings: ['custom string'], uncommented: false } }, false, 1);

    // Tests for linkedConditions
    testRemoveFunction('./tests/data/activity-unliked.html', { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, false, 1);
    testRemoveFunction('./tests/data/activity-uncommented.html', { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, false, 1);
    testRemoveFunction('./tests/data/activity-images.html', { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, false, 1);
    testRemoveFunction('./tests/data/activity-videos.html', { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, false, 1);
    testRemoveFunction('./tests/data/activity-customStrings.html', { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, false, 1);
    testRemoveFunction('./tests/data/activity-linkedConditions.html', { remove: { uncommented: false }, linkedConditions: [['images', 'unliked']] }, true, 0);

    afterEach(function() {
        activityHandler.resetState();
        restore();
    });
});