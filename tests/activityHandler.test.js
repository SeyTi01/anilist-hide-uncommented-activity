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

    it('should remove node if it is unliked and remove.unliked is true', function(done) {
        fs.readFile('./tests/data/activity-unliked.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.remove.unliked = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.true;
            expect(activityHandler.currentLoadCount).to.equal(0);
            done();
        });
    });

    it('should remove node if it is uncommented and remove.uncommented is true', function(done) {
        fs.readFile('./tests/data/activity-uncommented.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.true;
            expect(activityHandler.currentLoadCount).to.equal(0);
            done();
        });
    });

    it('should remove node if it contains images and remove.images is true', function(done) {
        fs.readFile('./tests/data/activity-with-images.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.remove.images = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.true;
            expect(activityHandler.currentLoadCount).to.equal(0);
            done();
        });
    });

    it('should remove node if it contains videos and remove.videos is true', function(done) {
        fs.readFile('./tests/data/activity-with-videos.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.remove.videos = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.true;
            expect(activityHandler.currentLoadCount).to.equal(0);
            done();
        });
    });


    afterEach(function() {
        activityHandler.resetState();
        restore();
    });
});