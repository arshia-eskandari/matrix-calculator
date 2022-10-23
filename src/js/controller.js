import navView from './views/navView.js';
import {
    changeStatePage,
    getCopyState,
    getStatePage,
    matrixLogic,
    setCopySate,
} from './model.js';
// import { fraction, divide, add, dotMultiply, string, isFraction} from 'mathjs';
import * as mathjs from 'mathjs';
import boardView from './views/boardView.js';
import { changeCurrentLinkToNew, getMatrix } from './helpers.js';
import {
    INSTRUCTIONS_PAGE_NUM,
    MUTIPLY_PAGE_NUM,
    OPERATIONS_PAGE_NUM,
    PAGE_IDS,
} from './config.js';

const controlNavView = function (e) {
    // 1. find the target a tag and reset the pages
    const targetedATag = e.target.closest('a');
    if (!targetedATag) return;
    boardView.resetPage();

    // 2. if the current a tag is the same as clicked return
    const current = document.querySelector('.clicked');
    const newId = targetedATag.href.split('/').at(-1);
    const pageNum = parseInt(targetedATag.dataset.page);
    if (current.id === newId) return;
    boardView.clear();

    // 3. change the active link
    changeCurrentLinkToNew(newId, current);

    // 4. change the state
    changeStatePage(pageNum);

    // 5. add new event listeners
    boardView.optionContainerSetter(pageNum);
};

const controlWindowLoad = function () {
    // 1. get the window hash and current active link
    const locationId = `#${window.location.hash.split('#').at(-1)}`;
    if (locationId === '#') {
        navView.changeActiveClass('#instructions');
        changeCurrentLinkToNew('#instructions');
        changeStatePage(INSTRUCTIONS_PAGE_NUM);
        return;
    }
    navView.changeActiveClass(locationId);
    const current = document.querySelector('.clicked');

    // 2. change the active link
    changeCurrentLinkToNew(locationId, current);

    // 3. change the state
    const pageNum = parseInt(document.querySelector(locationId).dataset.page);
    changeStatePage(pageNum);

    // 4. add new event listeners
    boardView.optionContainerSetter(pageNum);
};

const controlCalculateEvent = function () {
    try {
        // 1. get the current active page number
        const pageNum = getStatePage();
        const pageId = PAGE_IDS[pageNum];
        let isNegating = false;

        if (pageNum === 1) {
            const op = document.querySelector(`${pageId} #operation`).value;
            if (op === '-') isNegating = true;
        }

        // 2. if the page number is not 1 or 5 we only need one matrix
        const mat1 = getMatrix(pageId, '.matrix1');

        if (pageNum !== OPERATIONS_PAGE_NUM && pageNum !== MUTIPLY_PAGE_NUM) {
            const result = matrixLogic.performOperation({ mat1 });
            boardView.displayResult(result);
            console.log(result);
            return;
        }

        // 3. if the page number is 1 or 5 then we do need 2 matrices
        const mat2 = getMatrix(pageId, '.matrix2');

        const result = matrixLogic.performOperation({ mat1, mat2, isNegating });
        boardView.displayResult(result);
        console.log(result);
    } catch (err) {
        boardView.displayError(err.message);
        console.log(err);
    }
};

const copyEventHandler = function () {
    const pageNum = getStatePage();
    const pageId = PAGE_IDS[pageNum];
    const matRes = getMatrix(pageId, '.matrix-result', true);
    setCopySate(matRes);
};

const pasteEventHandler = function () {
    const matrixToPaste = getCopyState();
    if (!matrixToPaste) return;
    console.log(matrixToPaste);
    const rowNum = matrixToPaste.length - 1;
    const colNum = matrixToPaste[0].length - 1;
    boardView.paste(matrixToPaste, rowNum, colNum);
};

const init = function () {
    navView.activeLinkEvent();
    navView.addHandlerRender(controlNavView);
    boardView.addHandlerWindowLoad(controlWindowLoad);
    boardView.calculateEvent(controlCalculateEvent);
    boardView.clearClickEvent();
    boardView.copyEvent(copyEventHandler);
    boardView.pasteEvent(pasteEventHandler);
};

init();
