export type ExpressionUsable = { open: number, close: number };

const findEntireWordIndex = (s: string, wordToFind: string): number => {
    let regex = wordToFind.match(/^[a-zA-Z0-9]+$/gi) ? new RegExp("\\b" + wordToFind + "\\b", "gi") : new RegExp(wordToFind, "gi");
    let match = s.match(regex);
    if (match) {
        let index = s.search(regex);
        return s.indexOf(match[0], index);
    }
    return -1;
};
export default findEntireWordIndex;

export function getIndicesOf(pivot: RegExp, expression: string): number[] {
    let indices: number[] = [];
    let match = expression.match(pivot);
    if (!match) {
        return [];
    }
    let fullIndex = 0;
    let index = 0;
    while ((index = expression.search(pivot)) > -1) {
        fullIndex += index;
        indices.push(fullIndex);

        index += match[0].length;
        fullIndex += match[0].length;
        expression = expression.substr(index, expression.length - index);
    }
    return indices;
}

function setContextChars(): ExpressionUsable[] {
    let contextChars: ExpressionUsable[] = [];

    // contextChars.push({ open: '/'.charCodeAt(0) + '*'.charCodeAt(0), close: '*'.charCodeAt(0) + "/".charCodeAt(0) });
    contextChars.push({ open: '"'.charCodeAt(0), close: '"'.charCodeAt(0) });
    contextChars.push({ open: "'".charCodeAt(0), close: "'".charCodeAt(0) });
    contextChars.push({ open: '`'.charCodeAt(0), close: '`'.charCodeAt(0) });
    contextChars.push({ open: '['.charCodeAt(0), close: ']'.charCodeAt(0) });
    contextChars.push({ open: '{'.charCodeAt(0), close: '}'.charCodeAt(0) });
    contextChars.push({ open: '('.charCodeAt(0), close: ')'.charCodeAt(0) });
    return contextChars;
}

export function isUseablePivot(line: string, index: number): boolean {
    let expression: number[] = [];
    let contextChars = setContextChars();

    for (let i = 0; i < line.length && i < index; i++) {
        for (let x = 0; x < contextChars.length; x++) {
            const contextChar = contextChars[x];
            const charCode = line.charCodeAt(i);
            if (charCode === contextChar.open && (contextChar.open !== contextChar.close ||
                (contextChar.open === contextChar.close
                    && charCode !== expression[expression.length - 1]))
            ) {
                expression.push(charCode);
                break;
            } else if (charCode === contextChar.close) {
                expression.pop();
                break;
            }
        }
    }
    return expression.length === 0;
}