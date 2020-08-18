import * as vscode from 'vscode';
import Indenter from './Indenter';

const replace = new Indenter();

const resetIndent = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, thisArg: any): void => {
	formatText(textEditor, edit, false, true);
};
const indent = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, thisArg: any): void => {
	formatText(textEditor, edit);
};
const indentAlpha = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, thisArg: any): void => {
	formatText(textEditor, edit, true);
};

/**
 * Perform indention and replacement
 */
const formatText = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, alphabetize: boolean = false, resetIndent: boolean = false) => {
	const doc = textEditor.document;
	const sel = textEditor.selection;
	// must set config options for runtime changes
	replace.configOptions = vscode.workspace.getConfiguration('extension.readableIntent');

	try {
		const firstLine = doc.lineAt(sel.start.line);
		const lastLine = doc.lineAt(sel.end.line);

		// ensure that entire lines are being replaced as the granularity is line-based
		const expandedSelection = new vscode.Range(firstLine.lineNumber, 0, lastLine.lineNumber, lastLine.text.length);

		replace.textEditorOptions = textEditor.options;
		replace.alphabetize = alphabetize;
		replace.resetIndent = resetIndent;
		// replace with indented code
		edit.replace(expandedSelection, replace.indent(doc.getText(expandedSelection)));
		// re-select the newly replaced lines to keep visual context in editor
		textEditor.selection = new vscode.Selection(expandedSelection.start, expandedSelection.end);
	} catch (e) {
		vscode.window.showInformationMessage(`${e.message}\n\nPlease report to https://github.com/rodrigopg/vscode-extension-readable-indent/issues`);
		console.error(e);
	}
};

/**
 * VSCode activation registers relevant commands - this extension requires a text selection
 * @param context
 */
export function activate(context: vscode.ExtensionContext) {
	const commands: vscode.Disposable[] = [];

	// https://vscode-docs.readthedocs.io/en/stable/extensionAPI/vscode-api/#commands.registerTextEditorCommand
	commands.push(vscode.commands.registerTextEditorCommand("extension.readableIndent.indent", indent));
	commands.push(vscode.commands.registerTextEditorCommand("extension.readableIndent.indentAlpha", indentAlpha));
	commands.push(vscode.commands.registerTextEditorCommand("extension.readableIndent.reset", resetIndent));

	context.subscriptions.push(...commands);
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log('@deactivate for indentacao-variaveis-advpl');
}
