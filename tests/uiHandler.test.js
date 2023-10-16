const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const { UIHandler } = require('../src/hideUnwantedActivity.user');
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html lang="en"><body></body></html>');
global.window = jsdom.window;
global.document = jsdom.window.document;
global.HTMLElement = jsdom.window.HTMLElement;

describe('UIHandler', () => {
    let uiHandler;

    beforeEach(() => {
        uiHandler = new UIHandler();
    });

    afterEach(() => {
        uiHandler = null;
    });

    it('should set loadMore button and handle click', () => {
        const loadMoreButton = document.createElement('button');
        uiHandler.setLoadMore(loadMoreButton);

        expect(uiHandler.loadMore).to.equal(loadMoreButton);

        const simulateDomEventsSpy = sinon.spy(uiHandler, 'simulateDomEvents');
        const showCancelSpy = sinon.spy(uiHandler, 'showCancel');

        uiHandler.clickLoadMore();

        expect(simulateDomEventsSpy.calledOnce).to.be.true;
        expect(showCancelSpy.calledOnce).to.be.true;

        simulateDomEventsSpy.restore();
        showCancelSpy.restore();
    });

    it('should reset the state', () => {
        uiHandler.resetState();

        expect(uiHandler.userPressed).to.be.false;
    });
});