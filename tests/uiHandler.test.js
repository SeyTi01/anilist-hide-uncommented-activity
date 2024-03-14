const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const { UIHandler } = require('../src/activityFeedFilter.user');
const { JSDOM } = require('jsdom');
const { restore } = require('sinon');

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
        restore();
    });

    it('should set loadMore button and handle click', () => {
        const loadMoreButton = document.createElement('button');
        uiHandler.assignLoadMore(loadMoreButton);

        expect(uiHandler.loadMore).to.equal(loadMoreButton);

        const simulateDomEventsSpy = sinon.spy(uiHandler, 'triggerScrollEvents');
        const showCancelSpy = sinon.spy(uiHandler, 'displayCancel');

        uiHandler.clickLoadMore();

        expect(simulateDomEventsSpy.calledOnce).to.be.true;
        expect(showCancelSpy.calledOnce).to.be.true;

        simulateDomEventsSpy.restore();
        showCancelSpy.restore();
    });

    it('should reset the state', () => {
        uiHandler.userPressed = true;
        uiHandler.resetState();

        expect(uiHandler.userPressed).to.be.false;
    });

    it('should open a popup when the options button is clicked', () => {
        uiHandler.createOptions();

        const openPopupSpy = sinon.spy(uiHandler, 'openPopup');

        uiHandler.clickOptionsButton();

        expect(openPopupSpy.calledOnce).to.be.true;

        openPopupSpy.restore();
    });
});