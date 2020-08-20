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
        const index = getIndicesOf(regexp, line);

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

export class Pivots {
    lineComments: string[] = [];
    pivots: Pivot[];

    constructor() {
        this.pivots = [];

        this.addPivot(
            ":=", "Atribuição de valores",
            new RegExp(/\:\=/, "gi"),
            undefined
        );

        // this.addPivot(
        //     "=", "Atribuição de valores 2",
        //     new RegExp(/(?!\:)(?:\=)/, "gi"),
        //     undefined
        // );

        this.addPivot(
            ":New(", "Metodo construtor",
            new RegExp(/(?:\:New\()+(.*)+(?:\))/, "gi"),
            this.commaPivot(), ":New(", ")"
        );

        // this.addPivot(
        //     "(", "Parenteses",
        //     new RegExp(/(?:\()(.+)(?:\))/, "gi"),
        //     commaPivot, "(", ")"
        // );

        this.addPivot(
            "{", "Arrays em linha",
            new RegExp(/(?:\{)(.+)(?:\})/, "gi"),
            this.commaPivot(), "{", "}"
        );

        this.addPivot(
            "as", "Tipagem da dados",
            new RegExp(/\bas\b/, "gi"),
            undefined, " as "
        );

        // this.pivots.push(this.menudefPivot());
    }

    commaPivot(): Pivot {
        let commaPivot = new Pivot(
            ",", "Virgula",
            new RegExp(/\,/, "gi"),
        );
        commaPivot.openIdentifier = ", ";
        return commaPivot;
    }

    addPivot(identifier: string, description: string, regExp: RegExp, internalPivot?: Pivot, openIdentifier?: string, closeIdentifier?: string) {
        let newPivot = new Pivot(
            identifier,
            description,
            regExp,
        );
        if (internalPivot) {
            newPivot.addInternalPivot(internalPivot);
        }

        if (openIdentifier) {
            newPivot.openIdentifier = openIdentifier;
        }

        if (closeIdentifier) {
            newPivot.closeIdentifier = closeIdentifier;
        }
        this.pivots.push(newPivot);
    }

    public process(lines: string[], reset: boolean): string[] {
        lines = this.removeComments(lines);

        lines = lines.map(line => {
            return this.removeExtraSpaces(line);
        });

        if (reset) {
            return this.putCommentsBack(lines);
        }

        this.pivots.forEach(pivot => {
            for (let index = 0; index < lines.length; index++) {
                pivot.evalLine(lines[index], index);
            }
            lines = pivot.joinLines(lines);
        });
        return this.putCommentsBack(lines);
    }

    private removeComments(lines: string[]): string[] {
        lines = lines.map(line => {
            let matched = line.matchAll(/\/\/(.*)/g).next();
            let comments = "";
            let index = line.length;

            if (!matched.done) {
                if (isUseablePivot(line, matched.value.index!)) {
                    index = matched.value.index!;
                    comments = matched.value[0];
                }
            }
            this.lineComments.push(comments);
            return line.substr(0, index);
        });
        return lines;
    }

    private putCommentsBack(lines: string[]): string[] {
        for (let i = 0; i < lines.length; i++) {
            if (this.lineComments[i].trim() !== '') {
                if (lines[i].trim() !== '') {
                    lines[i] += " ";
                }
                lines[i] += this.lineComments[i].trimLeft();
            }
        }
        return lines;
    }

    /**
    * Remove espaços extras das linhas
    */
    private removeExtraSpaces(line: string): string {
        // Preserva first indent
        const matchFirstIndent = line.match(/^\s+/);
        let firstIndent = '';
        if (matchFirstIndent !== null) {
            firstIndent = matchFirstIndent[0];
        }

        const matchs = line
            .replace(/\'/g, "\`")
            .replace(/\"/g, "\‘")
            .match(/[^\s\`]+|\`([^\`]*)\`|\‘([^\‘])\‘/g);
        if (matchs) {
            line = firstIndent
                + matchs!
                    .join(" ")
                    .replace(/\`/g, "\'")
                    .replace(/\‘/g, '\"');
        }

        return line;
    }

    private menudefPivot(): Pivot {

        let menudefPivot = new Pivot(
            "ADD OPTION", "MenuDef",
            new RegExp(/(?:ADD\s+OPTION)(.+)/, "gi")
        );

        let title = new Pivot(
            "TITLE", "Opções TITLE MenuDef",
            new RegExp(/(?:\bTITLE\b)(.+)/, "gi"),
        );

        let operation = new Pivot(
            "OPERATION", "Opções OPERATION MenuDef",
            new RegExp(/(?:\bOPERATION\b)(.+)/, "gi"),
        );

        let action = new Pivot(
            "ACTION", "Opções ACTION MenuDef",
            new RegExp(/(?:\bACTION\b)(.+)/, "gi"),
        );

        let access = new Pivot(
            "ACCESS", "Opções ACCESS MenuDef",
            new RegExp(/(?:\ACCESS\b)(.+)/, "gi"),
        );


        menudefPivot.addInternalPivot(title);
        title.addInternalPivot(operation);
        operation.addInternalPivot(action);
        action.addInternalPivot(access);

        return menudefPivot;
    }
}