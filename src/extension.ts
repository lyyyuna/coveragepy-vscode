// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { JtagServer } from './jtagserver';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let pyStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	pyStatusBarItem.text = 'Py Coverage OFF';
	pyStatusBarItem.command = 'extension.switch';
	pyStatusBarItem.show();

	let jtagserver = new JtagServer();

	let disposable = vscode.commands.registerCommand('extension.switch', async () => {
		if (pyStatusBarItem.text == 'Py Coverage OFF') {
			pyStatusBarItem.text = 'Py Coverage ON';
			// get current project package structure
			await jtagserver.startQueryLoop();
		} else {
			pyStatusBarItem.text = 'Py Coverage OFF';
			jtagserver.stopQueryLoop();
		}
	})

	context.subscriptions.push(disposable);
}

export function deactivate() {}