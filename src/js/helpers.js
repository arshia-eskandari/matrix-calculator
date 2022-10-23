export const changeCurrentLinkToNew = function (id, cur) {
    // 1. remove the clicked class from the currently selected nav a tag and add
    // the hidden class to it
    if (cur) {
        cur.classList.remove('clicked');
        cur.classList.add('hidden');
    }

    // 2. display the new selected calculator
    const newClicked = document.querySelector(id);
    newClicked.classList.add('clicked');
    newClicked.classList.remove('hidden');
};

export const getMatrix = function (pageId, matrixclass, fillWithZeros = false) {
    const matContainer = document.querySelectorAll(
        `${pageId} ${matrixclass} .matrix ul`
    );
    const matRows = [...matContainer].filter(
        row => !row.classList.contains('hidden')
    );
    return matRows.map(row =>
        [...row.children]
            .filter(col => !col.classList.contains('hidden'))
            .map(col => {
                if (fillWithZeros) {
                    if (col.firstElementChild.value === '') return '0';
                    else return col.firstElementChild.value;
                } else {
                    return col.firstElementChild.value;
                }
            })
    );
};
