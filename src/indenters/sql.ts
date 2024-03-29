import * as vscode from 'vscode';

export class FormatSQL {
    private code: string = '';
    public codeAsSql: string = '';
    private args: Args[] = [];
    private rules: RegExpFindAndReplace[] = [];
    private firstIndentSize: number = 0;
    private copySQL: boolean = false;
    private pasteSQL: boolean = false;
    private config = vscode.workspace.getConfiguration("extension.beautifyadvpl");

    constructor(code: string) {
        this.code = code;
        this.codeAsSql = code;
    }

    public formatEmbeddedSQL(copySql: boolean = false, pasteSql: boolean = false): string {
        this.copySQL = copySql;

        this.buildRules();
        this.setFirstIndent();
        this.mapArgs();

        if (copySql) {
            // Copy code as SQL to Clipboard
            const copy = require("copy-paste");
            copy.copy(this.codeAsSql);
        } else {
            let fmt = require('sql-formatter-plus');
            this.code = fmt.format(this.code, this.getConfig());
            this.applyIndent();
        }

        this.putBackArgs();

        return this.code;
    }

    private getConfig(insertSpaces: Boolean = true, tabSize: number = 4) {
        return {
            indent: insertSpaces ? ' '.repeat(tabSize) : '\t',
            language: 'sql',
            uppercase: this.config.get("sql_uppercase"),
            linesBetweenQueries: 2
        };
    }

    private mapArgs() {
        this.rules.forEach((e) => {
            while (true) {
                let next = this.code.matchAll(e.search).next();
                if (next.done) { break; }
                let id = e.identifier + String(next.value.index);
                let expression = next.value[0];
                this.code = this.code.replace(expression, id);
                this.args.push({ old: id, new: expression });

                this.copyEmbeddedSQL(next, e);
            }
        });
    }

    private putBackArgs() {
        this.args.forEach((e) => {
            this.code = this.code.replace(e.old, e.new);
        });
    }

    private buildRules(pasteSQL: boolean = false) {
        if (pasteSQL) {
            this.rules = [
                {
                    // %Table:SA1%
                    search: new RegExp(/([a-z0-9]{3})[0-9]{2}0/gim),
                    identifier: "percentTableTwoDotspercentTable",
                    replace: '%Table:$1%'
                },
                {
                    // %NotDel%%
                    search: new RegExp(/(D_E_L_E_T_\s*=\s*['"]\s+['"]|D_E_L_E_T_\s*<>\s*['"]\*['"])/gim),
                    identifier: "percentNotDelpercent",
                    replace: "%NotDel%"
                },
                {
                    // %xFilial:SA1%
                    search: new RegExp(/([a-z0-9]{2})(_FILIAL\s*=\s*)('.*[^']{1,4}')/gim),
                    identifier: "percentxFilialTwoDotspercent",
                    replace: "$1$2%xFilial:S$1%" //"'" + this.getBranch() + "'"
                },
                {
                    // %xFilial:DA1%
                    search: new RegExp(/([a-z0-9]{3})_FILIAL\s*=\s*('.*[^']{1,4}')/gim),
                    identifier: "percentxFilialTwoDotspercent",
                    replace: "$1$2%xFilial:S$1%" //"'" + this.getBranch() + "'"
                }
            ];
        } else {
            this.rules = [
                {
                    // Comments
                    search: new RegExp(/\/\/(.*$)/gim),
                    identifier: "slashslashcomments",
                    replace: "/*$1*/"
                },
                {
                    // %Table:SA1%
                    search: new RegExp(/%Table:([a-z0-9]{3})%/gim),
                    identifier: "percentTableTwoDotspercentTable",
                    replace: '$1' + this.getCompany() + '0'
                },
                {
                    // %NotDel%%
                    search: new RegExp(/%NotDel%/gim),
                    identifier: "percentNotDelpercent",
                    replace: "D_E_L_E_T_=' '"
                },
                {
                    // BETWEEN %Exp:MV_PAR01% AND %Exp:MV_PAR02%
                    search: new RegExp(/(BETWEEN)\s*%exp:([^%]{1,})%\s*(AND)\s*%exp:([^%]{1,})%/gim),
                    identifier: "percentBetweenExpTwoDotspercent",
                    replace: "$1 '$2' $3 '$4'"
                },
                {
                    // %Exp:MV_PAR01%
                    search: new RegExp(/%exp:([^%]{1,})%/gim),
                    identifier: "percentExpTwoDotspercent",
                    replace: "'$1'"
                },
                {
                    // %xFilial:SA1%        
                    search: new RegExp(/%xFilial:([^%]{1,})%/gim),
                    identifier: "percentxFilialTwoDotspercent",
                    replace: "'" + this.getBranch() + "'"
                }
            ];
        }
    }

    private getCompany() {
        return this.config.get("sql_company");
    }

    private getBranch() {
        return this.config.get("sql_branch");
    }

    private setFirstIndent() {
        const tabSpaces = 4;
        this.firstIndentSize = this.code.replace(/\t/g, " ".repeat(tabSpaces)).search(new RegExp(/\w/gim));
        if (this.firstIndentSize < 0) {
            this.firstIndentSize = 0;
        }
    }

    private applyIndent() {
        this.code = this.code.split(/\n/).map((line) => {
            return ' '.repeat(this.firstIndentSize) + line;
        }).join("\n");
    }

    private copyEmbeddedSQL(next: IteratorResult<RegExpMatchArray, any>, e: RegExpFindAndReplace) {
        if (!this.copySQL) { return; }
        let expression: string = replaceArgs(next, e);
        this.codeAsSql = this.codeAsSql.replace(next.value[0], expression);
    }

    public convertToEmbeddedSQL(): string {
        const cp = require("copy-paste");
        this.code = cp.paste();

        this.buildRules(true);
        this.rules.forEach((e) => {
            while (true) {
                let next = this.code.matchAll(e.search).next();
                if (next.done) { break; }
                this.code = this.code.replace(next.value[0], replaceArgs(next, e));
            }
        });

        this.formatEmbeddedSQL();
        return this.code;

    }
}

type RegExpFindAndReplace = { search: RegExp, identifier: string, replace?: string }; // Default replace should be $0. the expression result itself
type Args = { old: string, new: string };


function replaceArgs(next: IteratorResult<RegExpMatchArray, any>, e: RegExpFindAndReplace): string {
    let s: string = e.replace ?? next.value[0];

    for (let i = 0; i <= next.value.length; i++) {
        do {
            s = s.replace("$" + i, next.value[i]);
        } while (s !== s.replace("$" + i, next.value[i]))
    }
    return s;
}