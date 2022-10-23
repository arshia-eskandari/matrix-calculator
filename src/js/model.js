// import { fraction , divide, add, dotMultiply, string, isFraction} from 'mathjs';
import * as mathjs from 'mathjs';
const state = {
    page: 0,
    copy,
};

export const changeStatePage = function (pageNum) {
    state.page = pageNum;
    // console.log(state.page);
    return state.page;
};

export const getStatePage = function () {
    return state.page;
};

export const setCopySate = function (mat) {
    state.copy = mat;
};

export const getCopyState = function (mat) {
    return state.copy;
};

class MatrixLogic {
    _reducedRowEchelonForm = [];
    _originalSign = 1;

    _addOrSubtract = {
        true: mathjs.add,
        false: mathjs.subtract,
    };

    _fractionizeMatrix(mat, isNegating = false) {
        try {
            if (isNegating)
                return mat.map(row =>
                    row.map(col =>
                        mathjs.multiply(
                            mathjs.fraction(col),
                            mathjs.fraction(-1)
                        )
                    )
                );
            return mat.map(row => row.map(col => mathjs.fraction(col)));
        } catch (err) {
            throw new Error('The cells must valid numbers and non-empty.');
        }
    }

    performOperation(matrixObj) {
        const pageNum = getStatePage();
        const { mat1, mat2, isNegating } = matrixObj;
        const fractionizedMat1 = this._fractionizeMatrix(mat1);
        let fractionizedMat2;
        if (mat2) fractionizedMat2 = this._fractionizeMatrix(mat2, isNegating);

        if (pageNum === 1)
            return this.basicMatrixOperations(
                fractionizedMat1,
                fractionizedMat2
            );
        if (pageNum === 2) return this.gaussJordanAlgo(fractionizedMat1, true);
        if (pageNum === 3) return this.gaussJordanAlgo(fractionizedMat1, false);
        if (pageNum === 4) return this.findDeterminant(fractionizedMat1);
        if (pageNum === 5)
            return this.multiplyMatrices(fractionizedMat1, fractionizedMat2);
    }
    /**
     * Checks whether a given matrix is valid
     * @param {*} mat The matrix to be validated
     * @returns {Boolean} True if mat is valid or false otherwise
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    _isMatrixValid(mat) {
        if (!Array.isArray(mat)) return false;
        if (mat.some(row => !Array.isArray(row) || row.length === 0))
            return false;
        let isEveryCellNumeric = true;
        mat.forEach(row => {
            row.forEach(cell => {
                if (!mathjs.isFraction(cell) || !isFinite(cell))
                    isEveryCellNumeric = false;
            });
        });
        if (!isEveryCellNumeric) return false;
        if (mat.length != 1) {
            const [firstRow] = mat;
            return mat.every(row => row.length === firstRow.length);
        }
        return true;
    }

    /**
     * Checks whether two matrices have the same size
     * @param {*} mat1 The first matrix to be validated and compared
     * @param {*} mat2 The second matrix to be validated and compared
     * @returns {Boolean} True if the matrix structure is the same or false otherwise
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    _sameSize(mat1, mat2) {
        if (!this._isMatrixValid(mat1) || !this._isMatrixValid(mat2))
            return false;
        return mat1.every((row, i) => row.length === mat2[i].length);
    }

    /**
     * Adds or subtracts matrices (throws an error if the matrices are invalid)
     * @param {*} mat1 Matrix1
     * @param {*} mat2 Matrix2
     * @param {Boolean} [isAdding=true]
     * @returns {Array} return a matrix that is the result of adding or subtracting mat1 and mat2
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    basicMatrixOperations(mat1, mat2, isAdding = true) {
        if (!this._sameSize(mat1, mat2))
            throw Error('The matrices are invalid.');
        const matrixToReturn = [];
        const operation = this._addOrSubtract[isAdding];
        mat1.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (matrixToReturn.length === i) {
                    matrixToReturn[i] = [];
                }
                matrixToReturn[i][j] = operation(cell, mat2[i][j]);
            });
        });
        return this._formatFractionalMatrix(matrixToReturn);
    }

    /**
     * Checks whether two matrices have the proper sizes for multiplication
     * @param {*} mat1 The first matrix to be multiplied
     * @param {*} mat2 The second matrix to be multiplied
     * @returns {Boolean} True if the matrix sizes are proper or false otherwise
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    _canMultiply(mat1, mat2) {
        if (!this._isMatrixValid(mat1) || !this._isMatrixValid(mat2))
            return false;
        return mat1[0].length === mat2.length;
    }

    /**
     * multiplies the row of a matrix by the column of another one
     * @param {*} arr1 Matrix row
     * @param {*} arr2 Matrix column
     * @returns {Number} The multiplication result
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    _multiplyHelper(arr1, arr2) {
        return arr1.reduce(
            (acc, cur, i) => mathjs.add(acc, mathjs.dotMultiply(cur, arr2[i])),
            0
        );
    }

    /**
     * Multiplies two matrices (throws an error if the matrix sizes are not proper for multiplication)
     * @param {*} mat1 The first matrix to be multiplied
     * @param {*} mat2 The second matrix to be multiplied
     * @returns {Array} The multiplication result (matrix)
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    multiplyMatrices(mat1, mat2) {
        if (!this._canMultiply(mat1, mat2))
            throw Error('The matrices are invalid.');
        const matrixToReturn = [];
        const columnMatrix = [];
        mat2.forEach((row2, j) => {
            row2.forEach((col2, k) => {
                if (columnMatrix.length === k) {
                    columnMatrix[k] = [];
                }
                columnMatrix[k][j] = col2;
            });
        });
        mat1.forEach((row1, i) => {
            columnMatrix.forEach((row3, p) => {
                if (matrixToReturn.length === i) {
                    matrixToReturn[i] = [];
                }
                matrixToReturn[i][p] = this._multiplyHelper(row1, row3);
            });
        });
        return this._formatFractionalMatrix(matrixToReturn);
    }

    /**
     * Performs adding/subtracting row operations on two rows
     * @param {Array} mat Matrix to be modified
     * @param {Number} rowNum1 The first row number used for subtracting or addition
     * @param {Number} rowNum2 The second row number used for subtracting or addition
     * @param {Number} [multiplyBy = -1] The number used to multiply row2 by
     * @returns {Array}
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    _rowOps(mat, rowNum1, rowNum2, multiplyBy = mathjs.fraction(-1)) {
        [mat[rowNum1]] = [
            mat[rowNum2].map((cell, i) =>
                mathjs.add(mathjs.multiply(cell, multiplyBy), mat[rowNum1][i])
            ),
        ];
    }

    /**
     * Swaps the rows of a given matrix
     * @param {Number} rowNum1 The index of the first row to be swapped
     * @param {Number} rowNum2 The index of the second row to be swapped
     * @param {Array} mat Matrix to be modified
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    _swapRows(mat, rowNum1, rowNum2) {
        [mat[rowNum1], mat[rowNum2]] = [mat[rowNum2], mat[rowNum1]];
    }

    /**
     * Divides matrix rows by a specified number
     * @param {Array} mat Matrix to be modified
     * @param {Number} rowNum The index of the row to be divied
     * @param {Number} num The number to divide the row by
     */
    _divideRow(mat, rowNum, num) {
        [mat[rowNum]] = [mat[rowNum].map(cell => mathjs.divide(cell, num))];
    }

    /**
     * Sets the reducedRowEchelonForm property to the right identity matrix given matrix dimensions
     * @param {Number} matK Matrix row number
     * @param {Number} matL Matrix column number
     * @return {undefined}
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    _setRREF(matK, matL) {
        if (matK !== matL)
            throw Error('Cannot find the inverse of a non-square matrix.');
        const rows = Array.from({ length: matK }, (_, i) => {
            return Array.from({ length: matL }, (_, j) =>
                i === j ? mathjs.fraction(1) : mathjs.fraction(0)
            );
        });
        this._reducedRowEchelonForm = [];
        rows.forEach(row => this._reducedRowEchelonForm.push(row));
    }

    /**
     * Performs the Guass Jordan algorithm on a given matrix and returns the matrix or its inverse
     * @param {Array} mat The matrix to perform the Guass Jordan algorithm on
     * @param {Boolean} [findingInverse = false] Is the method supposed to find the inverse
     * @returns {Array | Object} The result matrix or the object of the RREF and its rank
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    gaussJordanAlgo(mat, findingInverse = false, findingTrigMatrix = false) {
        if (!this._isMatrixValid(mat)) throw Error('The matrix is invalid.');
        const matK = mat.length;
        const matL = mat[0].length;
        this._originalSign = 1;
        if (findingTrigMatrix) findingInverse = false;
        if (findingInverse) this._setRREF(matK, matL);
        const referenceIdentityMatrix = [...this._reducedRowEchelonForm];
        const rowNumArr = Array.from({ length: matK }, (_, i) => i);
        // 1. start from k = -1 and l = -1
        let k = -1;
        let l = -1;
        let step2 = true;
        let step3 = true;
        let rank = 0;
        while (true) {
            // 2. increment k by 1
            if (step2) k++;

            // 3. increment l by 1
            if (step3) l++;

            // 4. if l is greater than matL then we are done
            if (l >= matL) break;

            // 5. if mat[k][l] === 0 for numbers k to matK then return to step 3
            if (
                mat
                    .filter((_, i) => i >= k)
                    .every((_, i, filteredMat) => filteredMat[i][l]['n'] === 0)
            ) {
                step2 = false;
                continue;
            }

            // 6. interchange the k-th row by any other row whose row[l] is non-zero
            const [rowToSwap] = mat.filter((row, i) => i > k && row[l] !== 0);
            if (rowToSwap && mat[k][l]['n'] === 0) {
                const i = mat.indexOf(rowToSwap);
                this._swapRows(mat, k, i);
                if (findingTrigMatrix) {
                    this._originalSign *= -1;
                }
                if (findingInverse)
                    this._swapRows(this._reducedRowEchelonForm, k, i);
            }

            // 7. divide the k-th row by mat[k][l]
            if (!findingTrigMatrix) {
                if (mat[k][l]['n'] !== 0) {
                    if (findingInverse)
                        this._divideRow(
                            this._reducedRowEchelonForm,
                            k,
                            mat[k][l]
                        );
                    this._divideRow(mat, k, mat[k][l]);
                }
            }

            // 8. turn mat[i][l] into 0 for other rows except for the k-th row
            rowNumArr.forEach(rowNum => {
                // console.log(mathjs.dotMultiply(mat[rowNum][l], -1))
                if (rowNum !== k) {
                    if (!findingTrigMatrix) {
                        if (findingInverse)
                            this._rowOps(
                                this._reducedRowEchelonForm,
                                rowNum,
                                k,
                                mathjs.multiply(mat[rowNum][l], -1)
                            );
                        this._rowOps(
                            mat,
                            rowNum,
                            k,
                            mathjs.multiply(mat[rowNum][l], -1)
                        );
                    } else {
                        this._rowOps(
                            mat,
                            rowNum,
                            k,
                            mathjs.multiply(
                                mathjs.divide(mat[rowNum][l], mat[k][l]),
                                -1
                            )
                        );
                    }
                }
            });

            rank++;
            if (k < matK - 1) {
                step2 = true;
                continue;
            }
            break;
        }
        if (findingTrigMatrix)
            return {
                trigMat: this._formatFractionalMatrix(mat),
                sign: this._originalSign,
                rowNumArr,
            };
        if (!findingInverse) return rank;
        if (JSON.stringify(referenceIdentityMatrix) !== JSON.stringify(mat))
            throw Error('Matrix is not inversible.');
        return this._formatFractionalMatrix(this._reducedRowEchelonForm);
    }

    /**
     * Turns fractions into string for readability
     * @param {Array} mat Given matrix with fractional cells
     * @returns {Array} The cell-stringfied matrix
     * @this {MatrixLogic} MatrixLogic instance
     * @author Arshia Eskandari
     */
    _formatFractionalMatrix(mat) {
        return mat.map(row => {
            return row.map(cell => mathjs.string(cell));
        });
    }

    /**
     * Finds the determinant of a given matrix
     * @param {Array} mat The given matrix
     * @returns
     */
    findDeterminant(mat) {
        if (!this._isMatrixValid(mat)) throw Error('The matrix is invalid.');
        const { trigMat, sign, rowNumArr } = this.gaussJordanAlgo(
            mat,
            false,
            true
        );
        let det = mathjs.fraction(1);
        rowNumArr.forEach(i => (det = mathjs.multiply(det, trigMat[i][i])));
        return mathjs.string(mathjs.multiply(det, sign));
    }
}

export const matrixLogic = new MatrixLogic();
