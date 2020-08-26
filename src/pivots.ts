import Pivot from "./pivot";
import { isUseablePivot } from "./util/string-util";

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

        this.addPivot(
            "aadd(", "AAdd",
            new RegExp(/(?:aadd\()(.*)(?:\))/, "gi"),
            this.commaPivot(), "aadd(", ")"
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
        commaPivot.allowMultipleInstances = true;
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