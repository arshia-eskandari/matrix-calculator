import { MUTIPLY_PAGE_NUM, OPERATIONS_PAGE_NUM, PAGE_IDS } from '../config';

class BoardView {
    _pageIds = PAGE_IDS;
    _pageNum = 0;
    _type;
    _calcBtn = document.querySelector('#calculate-btn');
    _clearBtn = document.querySelector('#clear-btn');
    _copyBtn = document.querySelector('#copy');
    _pasteBtn = document.querySelector('#paste');
    _matResultContainer = document.querySelector('.matrix-result matrix');
    _optionContainers = document.querySelectorAll('.matrix-options');
    _optionContainersToUse;
    _errorSectionP = document.querySelector('.error p');
    _allCellInputs = document.querySelectorAll('main li input');
    _resultCells = document.querySelectorAll('.matrix-result input');
    _middleBtns = document.querySelectorAll('.middle');
    _resetNum = 2;
    _mainLis = document.querySelectorAll('main li');
    _mainUls = document.querySelectorAll('main ul');

    resetPage() {
        [...this._middleBtns].forEach(
            btn => (btn.dataset.num = this._resetNum)
        );
        this._addOrRemoveHelper(
            this._resetNum,
            true,
            true,
            this._mainLis,
            this._mainUls
        );
    }

    addHandlerWindowLoad(handler) {
        window.addEventListener('load', handler);
    }

    addVariationHandler() {
        if (!this._optionContainersToUse[0]) return;
        this._optionContainersToUse.forEach(option =>
            option.addEventListener('click', this._variationHandler.bind(this))
        );
    }

    _variationHandler(e) {
        const targetedBtn = e.target.closest('.var');
        if (!targetedBtn) return;
        this.clear(true);
        if (targetedBtn.classList.contains('inc')) {
            if (targetedBtn.classList.contains('order'))
                this._addOrRemove(
                    targetedBtn.previousElementSibling,
                    true,
                    true,
                    false
                );
            else if (targetedBtn.classList.contains('row'))
                this._addOrRemove(
                    targetedBtn.previousElementSibling,
                    true,
                    false,
                    true
                );
            else
                this._addOrRemove(
                    targetedBtn.previousElementSibling,
                    true,
                    false,
                    false
                );
            return;
        }
        if (targetedBtn.classList.contains('order'))
            this._addOrRemove(
                targetedBtn.nextElementSibling,
                false,
                true,
                false
            );
        else if (targetedBtn.classList.contains('row'))
            this._addOrRemove(
                targetedBtn.nextElementSibling,
                false,
                false,
                true
            );
        else
            this._addOrRemove(
                targetedBtn.nextElementSibling,
                false,
                false,
                false
            );
    }

    _addOrRemove(middleBtn, isIncreasing, isOrder, isRow) {
        if (isIncreasing && middleBtn.dataset.num === '11') return;
        if (!isIncreasing && middleBtn.dataset.num === '0') return;
        const middleBtns = document.querySelectorAll(
            `${this._pageIds[this._pageNum]} .middle`
        );
        const liArr = document.querySelectorAll(
            `${this._pageIds[this._pageNum]} li`
        );
        const ulArr = document.querySelectorAll(
            `${this._pageIds[this._pageNum]} ul`
        );
        if (middleBtn.classList.contains('linked')) {
            console.log('hot');
            if (isIncreasing) {
                middleBtns.forEach(btn =>
                    btn.classList.contains('linked') ? btn.dataset.num++ : btn
                );
            } else {
                middleBtns.forEach(btn =>
                    btn.classList.contains('linked') ? btn.dataset.num-- : btn
                );
            }
            this._addOrRemoveHelper(
                middleBtn.dataset.num,
                true,
                true,
                liArr,
                ulArr,
                true
            );
            return;
        }
        if (isOrder) {
            if (isIncreasing) {
                middleBtns.forEach(btn => btn.dataset.num++);
            } else {
                middleBtns.forEach(btn => btn.dataset.num--);
            }
            this._addOrRemoveHelper(
                middleBtn.dataset.num,
                true,
                true,
                liArr,
                ulArr
            );
            return;
        }
        if (isRow) {
            if (isIncreasing) {
                middleBtns.forEach(btn =>
                    btn.textContent.trim() === 'R' &&
                    !btn.classList.contains('linked')
                        ? btn.dataset.num++
                        : btn
                );
            } else {
                middleBtns.forEach(btn =>
                    btn.textContent.trim() === 'R' &&
                    !btn.classList.contains('linked')
                        ? btn.dataset.num--
                        : btn
                );
            }
            this._addOrRemoveHelper(
                middleBtn.dataset.num,
                true,
                false,
                null,
                ulArr
            );
            return;
        }
        if (isIncreasing) {
            middleBtns.forEach(btn =>
                btn.textContent.trim() === 'C' &&
                !btn.classList.contains('linked')
                    ? btn.dataset.num++
                    : btn
            );
        } else {
            middleBtns.forEach(btn =>
                btn.textContent.trim() === 'C' &&
                !btn.classList.contains('linked')
                    ? btn.dataset.num--
                    : btn
            );
        }
        this._addOrRemoveHelper(
            middleBtn.dataset.num,
            false,
            true,
            liArr,
            null
        );
    }

    _addOrRemoveHelper(num, isRow, isCol, liArr, ulArr, isLinked = false) {
        if (isLinked) {
            ulArr.forEach(ul => this._rowColHelper(ul, num, true, true));
            liArr.forEach(li => this._rowColHelper(li, num, false, true));
            return;
        }
        if (isRow & isCol) {
            ulArr.forEach(ul => this._rowColHelper(ul, num, true, false));
            liArr.forEach(li => this._rowColHelper(li, num, false, false));
            return;
        }
        if (isCol) {
            liArr.forEach(li => this._rowColHelper(li, num, false, false));
            return;
        }
        ulArr.forEach(ul => this._rowColHelper(ul, num, true, false));
    }

    _rowColHelper(el, num, isRow, isLinked) {
        let elNum;
        let isLinkedCell;
        if (isRow) elNum = parseInt(el.dataset.rowNum);
        else elNum = parseInt(el.dataset.colNum);

        if (isLinked) isLinkedCell = el.classList.contains('linked-cell');
        else isLinkedCell = !el.classList.contains('linked-cell');

        if (elNum > num && isLinkedCell) el.classList.add('hidden');
        if (elNum <= num && isLinkedCell) el.classList.remove('hidden');
    }

    optionContainerSetter(pageNum) {
        if (!pageNum) return;
        this._pageNum = pageNum;
        // 1. remove all event handlers from the matrix options
        this._optionContainers.forEach(container =>
            container.replaceWith(container.cloneNode(true))
        );
        // 2. reset the _optionContainers field
        this._optionContainers = document.querySelectorAll('.matrix-options');

        if (pageNum === OPERATIONS_PAGE_NUM) {
            this._optionContainersToUse = [
                this._optionContainers[pageNum - 1],
                this._optionContainers[pageNum],
            ];
            this.addVariationHandler();
            return;
        }
        if (pageNum === MUTIPLY_PAGE_NUM) {
            this._optionContainersToUse = [
                this._optionContainers[pageNum],
                this._optionContainers[pageNum + 1],
            ];
            this.addVariationHandler();
            return;
        }
        this._optionContainersToUse = [this._optionContainers[pageNum]];
        this.addVariationHandler();
    }

    calculateEvent(handler) {
        this._calcBtn.addEventListener('click', handler);
    }

    _displayMatrix(container, result) {
        container.forEach((row, i) => {
            if (!row.classList.contains('hidden')) {
                [...row.children].forEach((col, j) => {
                    if (!col.classList.contains('hidden'))
                        col.firstElementChild.value = result[i][j];
                });
            }
        });
    }

    displayResult(result) {
        if (Array.isArray(result)) {
            const resultMatixRows = document.querySelectorAll(
                `${this._pageIds[this._pageNum]} .matrix-result .matrix ul`
            );
            this._displayMatrix([...resultMatixRows], result);
            return;
        }
        const numericResultContainer = document.querySelector(
            `${this._pageIds[this._pageNum]} .op:last-child`
        );
        numericResultContainer.textContent = `) = ${result}`;
    }

    displayError(mssg) {
        this._errorSectionP.classList.remove('hidden');
        this._errorSectionP.textContent = mssg;
    }

    clearClickEvent() {
        this._clearBtn.addEventListener('click', this.clear.bind(this, false));
    }

    clear(clearResultOnly) {
        this._errorSectionP.classList.add('hidden');
        if (clearResultOnly) {
            [...this._resultCells].forEach(inp => (inp.value = ''));
            [...this._allCellInputs].forEach(inp => {
                if (
                    inp.parentElement.classList.contains('hidden') ||
                    inp.parentElement.parentElement.classList.contains('hidden')
                )
                    inp.value = '';
            });
            return;
        }
        [...this._allCellInputs].forEach(inp => (inp.value = ''));
    }

    copyEvent(handler) {
        this._copyBtn.addEventListener('click', handler);
    }

    pasteEvent(handler) {
        this._pasteBtn.addEventListener('click', handler);
    }

    paste(mat, rowNum, colNum) {
        console.log(mat);
        [...this._middleBtns].forEach(btn => {
            if (btn.textContent.trim() === 'R') btn.dataset.num = rowNum;
            else btn.dataset.num = colNum;
        });
        this._addOrRemoveHelper(rowNum, true, false, null, this._mainUls);
        this._addOrRemoveHelper(colNum, false, true, this._mainLis, null);
        const mat1Container = document.querySelectorAll(
            `${this._pageIds[this._pageNum]} .matrix1 .matrix ul`
        );
        this._displayMatrix([...mat1Container], mat);
    }
}

export default new BoardView();
