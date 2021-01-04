import * as vscode from 'vscode';
import Indenter from './Indenter';

/**
 * VSCode activation registers relevant commands - this extension requires a text selection
 * @param context
 */
export function activate(context: vscode.ExtensionContext) {
	const commands: vscode.Disposable[] = [];

	// https://vscode-docs.readthedocs.io/en/stable/extensionAPI/vscode-api/#commands.registerTextEditorCommand
	commands.push(vscode.commands.registerTextEditorCommand("extension.beautifyadvpl.indent", indent));
	commands.push(vscode.commands.registerTextEditorCommand("extension.beautifyadvpl.indentAlpha", indentAlpha));
	commands.push(vscode.commands.registerTextEditorCommand("extension.beautifyadvpl.reset", resetIndent));
	commands.push(vscode.commands.registerTextEditorCommand("extension.beautifyadvpl.formatSQL", formatSQL));
	commands.push(vscode.commands.registerTextEditorCommand("extension.beautifyadvpl.copySQL", copySQL));

	context.subscriptions.push(...commands);
	console.log('@activate beautify-advpl');
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log('@deactivate for beautify-advpl');
}

const indenter = new Indenter();

const resetIndent = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, thisArg: any): void => {
	indenter.resetIndent = true;
	formatText(textEditor, edit);
	indenter.resetIndent = false;
};
const indent = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, thisArg: any): void => {
	formatText(textEditor, edit);
};
const indentAlpha = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, thisArg: any): void => {
	indenter.alphabetize = true;
	formatText(textEditor, edit);
	indenter.alphabetize = false;
};
const formatSQL = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, thisArg: any): void => {
	indenter.formatSQL = true;
	formatText(textEditor, edit);
	indenter.formatSQL = false;
};
const copySQL = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, thisArg: any): void => {
	indenter.copySQL = true;
	formatSQL(textEditor, edit, thisArg);
	indenter.copySQL = false;
};

/**
 * Perform indention and replacement
 */
const formatText = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
	const doc = textEditor.document;
	const sel = textEditor.selection;
	let indentedText = '';

	try {
		const firstLine = doc.lineAt(sel.start.line);
		const lastLine = doc.lineAt(sel.end.line);

		// ensure that entire lines are being replaced as the granularity is line-based
		const expandedSelection = new vscode.Range(firstLine.lineNumber, 0, lastLine.lineNumber, lastLine.text.length);

		indenter.textEditorOptions = textEditor.options;

		// Indent the Code
		indentedText = indenter.indent(doc.getText(expandedSelection));

		// replace with indented code
		if (!indenter.copySQL) {
			edit.replace(expandedSelection, indentedText);
			// re-select the newly replaced lines to keep visual context in editor
			textEditor.selection = new vscode.Selection(expandedSelection.start, expandedSelection.end);
		}
	} catch (e) {
		vscode.window.showInformationMessage(`${e.message}\n\nPlease report to https://github.com/rodrigopg/vscode-extension-readable-indent/issues`);
		console.error(e);
	}
};
