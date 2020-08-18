import { normalize } from "path";
import { getIndicesOf } from "./util/string-util";
import { close, open } from "fs";

type ExpressionUsable = { open: number, close: number };

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
    contextChars: ExpressionUsable[];

    constructor(identifier: string, description: string, rule: RegExp) {
        this.identifier = identifier;
        this.description = description;
        this.rule = rule;
        this.contextChars = this.setContextChars();
    }

    setContextChars(): ExpressionUsable[] {
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

    addInternalPivot(pivot: Pivot) {
        pivot.parent = this;
        this.internalPivots?.push(pivot);
    }

    isInternalPivot(): Boolean {
        return this.parent !== undefined;
    }

    evalLine(line: string, lineNumber: number): void {
        let match = line.matchAll(this.rule);
        let next = match.next();
        if (next.done) {
            return;
        }

        this.internalPivots?.forEach(internalPivot => {
            internalPivot.evalLine(next.value[1], lineNumber);
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
            if (!this.isUseablePivot(line, i)) {
                return null;
            }
            lineSplit.push(line.substr(startIndex, i - startIndex));
            startIndex = i + this.identifier.length;
        });

        lineSplit.push(line.substr(startIndex, line.length - startIndex));

        return lineSplit;
    }

    isUseablePivot(line: string, index: number): boolean {
        let expression: number[] = [];

        for (let i = 0; i < line.length && i < index; i++) {
            for (let x = 0; x < this.contextChars.length; x++) {
                const contextChar = this.contextChars[x];
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

        let commaPivot = new Pivot(
            ",", "Virgula",
            new RegExp(/\,/, "gi"),
        );
        commaPivot.openIdentifier = ", ";

        this.addPivot(
            ":=", "Atribuição de valores",
            new RegExp(/[\:\+\-]=/, "gi"),
            undefined, " := "
        );

        this.addPivot(
            ":New(", "Metodo construtor",
            new RegExp(/(?:\:New\()+(.*)+(?:\))/, "gi"),
            commaPivot, ":New(", ")"
        );

        // this.addPivot(
        //     "(", "Parenteses",
        //     new RegExp(/(?:\()(.+)(?:\))/, "gi"),
        //     commaPivot, "(", ")"
        // );

        this.addPivot(
            "{", "Arrays em linha",
            new RegExp(/(?:\{)(.+)(?:\})/, "gi"),
            commaPivot, "{", "}"
        );

        this.pivots.push(this.menudefPivot());

        this.addPivot(
            "as", "Tipagem da dados",
            new RegExp(/\bas\b/, "gi"),
            undefined, " as "
        );
    }

    addPivot(identifier: string, description: string, regExp: RegExp, internalPivot?: Pivot, openIdentifier: string = identifier, closeIdentifier?: string) {
        let newPivot = new Pivot(
            identifier,
            description,
            regExp,
        );
        if (internalPivot) {
            newPivot.addInternalPivot(internalPivot);
        }

        newPivot.openIdentifier = openIdentifier;

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
            let index = line.length;
            let comments = "";
            if (!matched.done) {
                comments = matched.value[0];
                index = matched.value.index!;
            }
            this.lineComments.push(comments);
            return line.substr(0, index);
        });
        return lines;

    }

    private putCommentsBack(lines: string[]): string[] {
        for (let i = 0; i < lines.length; i++) {
            lines[i] += this.lineComments[i];
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
            new RegExp(/ADD\s+OPTION.*$/, "gi")
        );

        menudefPivot.addInternalPivot(new Pivot(
            "TITLE", "Opções TITLE MenuDef",
            new RegExp(/\b(TITLE)\b/, "gim"),
        ));

        menudefPivot.addInternalPivot(new Pivot(
            "OPERATION", "Opções OPERATION MenuDef",
            new RegExp(/\b(OPERATION)\b/, "gim"),
        ));

        menudefPivot.addInternalPivot(new Pivot(
            "ACTION", "Opções ACTION MenuDef",
            new RegExp(/\b(ACTION)\b/, "gim"),
        ));

        menudefPivot.addInternalPivot(new Pivot(
            "ACCESS", "Opções ACCESS MenuDef",
            new RegExp(/\b(ACCESS)\b/, "gim"),
        ));

        return menudefPivot;
    }
}