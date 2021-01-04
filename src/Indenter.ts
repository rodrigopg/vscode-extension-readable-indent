import { TextEditorOptions } from "vscode";
import { FormatSQL } from "./indenters/sql";
import { Pivots } from './pivots';
import customAlphaSort from './util/alpha-sort';

/**
 * Indenter
 */
class Indenter {
  /** Sets text editor options */
  public set textEditorOptions(options: TextEditorOptions) {
    this._textEditorOptions = options;
  }

  /** Flag to alphabetize lines of code when making readable */
  public alphabetize: boolean = false;

  /** Flag to Reset Indentation */
  public resetIndent: boolean = false;

  /** Flag to format sql lines of code when making readable */
  public formatSQL: boolean = false;

  public copySQL: boolean = false;
  public pasteSQL: boolean = false;


  /** @description Expanding tabs to space for indentation, detected from workspace.editor settings */
  private _textEditorOptions: TextEditorOptions = {
    tabSize: 2
  };

  // @description Lines of code split on newlines
  private lines: string[] = [];

  // @description supported pivot character sequences
  private pivots: Pivots = new Pivots();

  constructor() {
    this.reset();
  }

  /**
   * reset flags and detected values
   */
  private reset(): void {
    this.pivots = new Pivots();
  }

  /**
   * Indents indenter
   * @returns string Indented as requested
   */
  public indent(code: string): string {
    if (this.formatSQL) {
      return this.formatEmbeddedSQL(code);
    }

    return this.formatAdvpl(code);
  }

  /** Realiza a ordenação alfabética das linhas */
  private sortLines(): void {
    if (this.alphabetize) {
      this.lines = customAlphaSort(this.lines);
    }
  }

  private formatAdvpl(code: string): string {
    this.reset();
    this.lines = this.pivots.process(code.split(/\n/), this.resetIndent);
    this.sortLines();

    return this.lines.join('\n');
  }
  
  private formatEmbeddedSQL(code: string): string {
    const sql = new FormatSQL(code);
    if (this.pasteSQL) {
      sql.convertToEmbeddedSQL();
    }
    code = sql.formatEmbeddedSQL(this.copySQL);
    return code;
  }
}

export default Indenter;
