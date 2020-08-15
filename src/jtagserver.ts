import axios from 'axios';
axios.defaults.timeout = 3000;
import * as vscode from 'vscode';
import { spawnSync } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
const sleep = promisify(setTimeout);

export class JtagServer {
    private _serverUrl: string = '';
    private timer = true;
    private highlightDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'green',
        border:  '2px solid white',
        color:  'white'
    });;
    private lastProfile = '';

    construct() { }

    async startQueryLoop() {
        this.timer = true;
        while ( true === this.timer ) {
            if (!vscode.window.activeTextEditor) {
                return;
            }
            await sleep(1500);

            if ( true !== this.timer ) {
                this.clearHightlight();
                return;
            }

            this.getConfigurations();
            let profile = await this.getLatestProfile();
            if (profile == '') {
                this.lastProfile = '';
                continue;
            }
            if (profile == this.lastProfile || profile == '') {
                continue;
            }
            this.lastProfile = profile;
            this.renderFile(profile);
        }
    }

    stopQueryLoop() {
        this.timer = false;

        this.clearHightlight()
    }

    clearHightlight() {
        vscode.window.visibleTextEditors.forEach(visibleEditor => {
            visibleEditor.setDecorations(this.highlightDecorationType, []);
        });
    }

    getConfigurations() {
        this._serverUrl = vscode.workspace.getConfiguration().get('coveragepy.serverUrl') || '';
    }

    async getLatestProfile(): Promise<string> {
        let activeTextEditor = vscode.window.activeTextEditor;
        let fileNeedsRender = activeTextEditor?.document.fileName;

        let profileApi = `${this._serverUrl}/v1/lines?file=`+fileNeedsRender;

        try {
            let res = await axios.get(profileApi, );
            if (res.status != 200) {
                return ""
            }
            let body: string = res.data.toString();
            return body;
        } catch(err) {
            console.error('network connection error.')
        } 

        return "";
    }

    renderFile(profile: string) {
        let editor = vscode.window.activeTextEditor;
        let doc = editor?.document;

        let lines = profile.trim().split(',')
        let ranges: vscode.Range[] = [];
        for (let line of lines) {
            let startLine = Number(line);
            let endLine = startLine;
            let textLine = doc?.lineAt(--endLine);
            let textLineLength = textLine?.text.length || 0;
            let range = new vscode.Range(
              new vscode.Position(--startLine, 0),
              new vscode.Position(endLine, textLineLength)
            );
            ranges.push(range);
        } 

        this.triggerUpdateDecoration(ranges);
    }

    triggerUpdateDecoration(ranges: vscode.Range[]) {
        if (!vscode.window.activeTextEditor) {
            return;
        }
      
        // console.debug('[' + new Date().toUTCString() + '] ' + 'update latest profile success')

        if (ranges.length == 0) {
            this.clearHightlight();
        } else {
            vscode.window.activeTextEditor.setDecorations(
                this.highlightDecorationType,
                ranges
            )
        }
    }
}