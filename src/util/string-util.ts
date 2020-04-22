const findEntireWordIndex = (s: string, wordToFind: string): number => {
    let regex = wordToFind.match(/^[a-zA-Z0-9]+$/gi) ?new RegExp("\\b" + wordToFind + "\\b", "gi") : new RegExp(wordToFind,"gi");
    let match = s.match(regex);
    if (match) {
        let index = s.search(regex);
        return s.indexOf(match[0], index);
    }
    return -1;
};
export default findEntireWordIndex;