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