import { getIndicesOf, isUseablePivot } from "./util/string-util";

interface PivotItem {
    size: number;
    word: string;
}

interface PivotItens {
    line: PivotItem[];
    lineNumber: number;
    index?: number;
}

class Pivot {
    identifier: string;
    openIdentifier: string = "";
    closeIdentifier: string = "";
    description: string;
    biggerLenght: number[] = [];
    found: PivotItens[] = [];
    rule: RegExp;
    internalPivots?: Pivot[] = [];
    parent?: Pivot;
    allowMultipleInstances: Boolean = false;

    constructor(identifier: string, description: string, rule: RegExp) {
        this.identifier = identifier;
        this.openIdentifier = " " + identifier + " ";
        this.description = description;
        this.rule = rule;
    }

    addInternalPivot(pivot: Pivot) {
        pivot.parent = this;
        this.internalPivots?.push(pivot);
    }

    isInternalPivot(): Boolean {
        return this.parent !== undefined;
    }

    evalLine(line: string, lineNumber: number): void {
        let next = line.matchAll(this.rule).next();

        if (next.done) {
            return;
        }

        this.internalPivots?.forEach(internalPivot => {
            if (next.value.length === 2) {
                internalPivot.evalLine(next.value[1], lineNumber);
            } else {
                internalPivot.evalLine(next.value[0], lineNumber);
            }
        });

        let pivotLine: PivotItens = { lineNumber: lineNumber, line: [] };
        let lineSplit = this.splitPivots(line);
        if (!lineSplit) { return; }

        for (let index = 0; index < lineSplit.length; index++) {
            const item = lineSplit[index].trim();
            pivotLine.line.push({ size: item.length, word: item });

            if (this.biggerLenght.length < pivotLine.line.length) {
                this.biggerLenght.push(0);
            }
            if (this.biggerLenght[pivotLine.line.length - 1] < item.length) {
                this.biggerLenght[pivotLine.line.length - 1] = item.length;
            }
        }

        this.found.push(pivotLine);
    }

    splitPivots(line: string, regexp: RegExp = this.rule): string[] | null {
        const lineSplit: string[] = [];
        let startIndex: number = 0;
        let index = getIndicesOf(regexp, line);
        if (!this.allowMultipleInstances) {
            index = [index[0]];
        }
        index.forEach(i => {
            if (!isUseablePivot(line, i)) {
                return null;
            }
            lineSplit.push(line.substr(startIndex, i - startIndex));
            startIndex = i + this.identifier.length;
        });

        lineSplit.push(line.substr(startIndex, line.length - startIndex));

        return lineSplit;
    }

    joinLines(lines: string[], isInternalPivot: Boolean = false): string[] {
        if (this.found.length > 0) {
            this.found.forEach(pivotLine => {

                // Preserva first indent
                let firstIndent = '';
                if (!isInternalPivot) {
                    let next = lines[pivotLine.lineNumber].matchAll(/^\s+/g).next();
                    if (!next.done) {
                        firstIndent = next.value[0];
                    }
                }

                let idx = -1;
                const newLine = pivotLine.line.map(line => {
                    idx++;
                    return line.word.padEnd(this.biggerLenght[idx], ' ');
                });
                lines[pivotLine.lineNumber] = firstIndent + newLine.join(this.openIdentifier).trimRight();
            });

            // replace the line on present pivot
            this.internalPivots?.forEach(internalPivot => {
                let oldInternalLines: string[] = lines.map(line => {
                    let match = line.matchAll(this.rule);
                    let next = match.next();
                    if (!next.done) {
                        return next.value[1];
                    }
                    return line;
                });

                let newInternalLines = internalPivot.joinLines(oldInternalLines, true);
                for (let index = 0; index < newInternalLines.length; index++) {
                    let line = internalPivot.found[index];
                    if (line) {
                        let replaceValue = this.openIdentifier + newInternalLines[line.lineNumber] + this.closeIdentifier;
                        lines[line.lineNumber] = lines[line.lineNumber].replace(this.rule, replaceValue);
                    }
                }
            });
        }
        return lines;
    }

    private joinLine(lineSplit: PivotItem[]): string {
        let newLine: string = '';

        for (let idx = 0; idx < lineSplit.length; idx++) {
            newLine += lineSplit[idx].word.padEnd(this.biggerLenght[idx], ' ') + this.identifier;
        }
        return newLine.trimRight();
    }
}

export default Pivot;