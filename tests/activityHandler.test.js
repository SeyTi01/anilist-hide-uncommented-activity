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

    it('should remove unliked node if remove.unliked is true', function(done) {
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

    it('should not remove uncommented node if remove.unliked is true', function(done) {
        fs.readFile('./tests/data/activity-uncommented.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.remove.unliked = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.false;
            expect(activityHandler.currentLoadCount).to.equal(1);
            done();
        });
    });

    it('should not remove image node if remove.unliked is true', function(done) {
        fs.readFile('./tests/data/activity-images.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.remove.unliked = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.false;
            expect(activityHandler.currentLoadCount).to.equal(1);
            done();
        });
    });

    it('should not remove video node if remove.unliked is true', function(done) {
        fs.readFile('./tests/data/activity-videos.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.remove.unliked = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.false;
            expect(activityHandler.currentLoadCount).to.equal(1);
            done();
        });
    });

    it('should not remove customString node if remove.unliked is true', function(done) {
        fs.readFile('./tests/data/activity-customStrings.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.remove.unliked = true;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.false;
            expect(activityHandler.currentLoadCount).to.equal(1);
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
        fs.readFile('./tests/data/activity-images.html', 'utf8', function(err, htmlContent) {
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
        fs.readFile('./tests/data/activity-videos.html', 'utf8', function(err, htmlContent) {
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

    it('should remove node if it contains a custom string and remove.customStrings is not empty', function(done) {
        fs.readFile('./tests/data/activity-customStrings.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.remove.customStrings = ['custom string'];
            config.remove.caseSensitive = false;
            const dom = new jsdom.JSDOM(htmlContent);
            const node = dom.window.document.body.firstChild;
            const removeSpy = spy(node, 'remove');
            activityHandler.removeEntry(node);

            expect(removeSpy.calledOnce).to.be.true;
            expect(activityHandler.currentLoadCount).to.equal(0);
            done();
        });
    });

    it('should remove node if it satisfies linked conditions', function(done) {
        fs.readFile('./tests/data/activity-linkedConditions.html', 'utf8', function(err, htmlContent) {
            if (err) throw err;
            config.remove.uncommented = false;
            config.linkedConditions = [['unliked', 'images']];
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