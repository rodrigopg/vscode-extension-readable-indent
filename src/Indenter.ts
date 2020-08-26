import { TextEditorOptions, WorkspaceConfiguration } from "vscode";
import customAlphaSort from './util/alpha-sort';
import hash from './util/hash';
import { Pivots } from './pivots';

type ConfigOptions = { minimumWhitespaceBeforePivot: number } | WorkspaceConfiguration;

/**
 * Indenter
 */
class Indenter {
  // @description Flag to alphabetize lines of code when making readable
  private _shouldReset: boolean = false;
  // @description Flag to alphabetize lines of code when making readable
  private _alphabetize: boolean = false;
  // @description VSCode Workspace configuration for RI
  private _configOptions: ConfigOptions = {
    minimumWhitespaceBeforePivot: 10
  };
  // @description Lines of code split on newlines
  private locRaw: string[] = [];
  // @description
  private _origin: string = '';
  // @description md5 hash of input
  private _originHash: string = '';
  // @description Expanding tabs to space for indentation, detected from workspace.editor settings
  private _textEditorOptions: TextEditorOptions = {
    tabSize: 2
  };
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
    this.reset();

    // if (this.reuseOriginal(code)) {
    // this.locRaw = this._origin.split(/\n/);
    // } else {
    this._origin = code;
    this._originHash = hash(this._origin);
    this.locRaw = code.split(/\n/);
    // }

    this.locRaw = this.pivots.process(this.locRaw, this._shouldReset);

    this.sortLines();
    return this.locRaw.join('\n');
  }

  /**
   * Generate a md5 hash to determine if this is a permutation
   * @param 
   */
  private reuseOriginal(s: string): boolean {
    if (this._originHash) {
      return hash(s) === this._originHash;
    }
    return false;
  }

  /**
   * Realiza a ordenação alfabética das linhas
   */
  private sortLines(): void {
    // alpha sort if configuration is set
    if (this._alphabetize === true) {
      this.locRaw = customAlphaSort(this.locRaw);
    }
  }

  /*****************************************************************************
   **** start: PUBLIC METHODS and PROPERTIES 
   *****************************************************************************/
  public get origin(): string {
    return this._origin;
  }

  public get originHash(): string {
    return this._originHash;
  }

  /**
   * sets VSCode configuration options
   */
  public set configOptions(options: ConfigOptions) {
    this._configOptions = options;
  }

  /**
   * Sets text editor options
   */
  public set textEditorOptions(options: TextEditorOptions) {
    this._textEditorOptions = options;
  }

  /**
   * Sets alphabetize flag
   */
  public set alphabetize(alphabetize: boolean) {
    this._alphabetize = alphabetize;
  }

  /**
   * Sets alphabetize flag
   */
  public set resetIndent(reset: boolean) {
    this._shouldReset = reset;
  }

}

export default Indenter;
