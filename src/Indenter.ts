import { TextEditorOptions, WorkspaceConfiguration } from "vscode";
import { FormatSQL } from "./indenters/sql";
import { Pivots } from './pivots';
import customAlphaSort from './util/alpha-sort';
import hash from './util/hash';

type ConfigOptions = { minimumWhitespaceBeforePivot: number } | WorkspaceConfiguration;

/**
 * Indenter
 */
class Indenter {
  // @description VSCode Workspace configuration for RI
  private _configOptions: ConfigOptions = {
    minimumWhitespaceBeforePivot: 10
  };

  /** sets VSCode configuration options */
  public set configOptions(options: ConfigOptions) {
    this._configOptions = options;
  }

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
      const sql = new FormatSQL(code);
      code = sql.formatEmbeddedSQL(this.copySQL);
      return code;
    }

    this.lines = code.split(/\n/);

    this.reset();
    this.lines = this.pivots.process(this.lines, this.resetIndent);
    this.sortLines();

    return this.lines.join('\n');
  }

  /** Realiza a ordenação alfabética das linhas */
  private sortLines(): void {
    if (this.alphabetize) {
      this.lines = customAlphaSort(this.lines);
    }
  }
}

export default Indenter;
