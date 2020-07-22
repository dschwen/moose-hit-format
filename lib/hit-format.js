'use babel';

import { CompositeDisposable } from 'atom';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';

export default class HitFormat {
  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => this.handleBufferEvents(editor)),
    );

    this.subscriptions.add(atom.commands.add('atom-workspace', 'hit-format:format', () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        this.format(editor);
      }
    }));
  }

  destroy = () => {
    this.subscriptions.dispose();
  }

  handleBufferEvents = (editor) => {
    const buffer = editor.getBuffer();
    const bufferSavedSubscription = buffer.onWillSave(() => {
      const scope = editor.getRootScopeDescriptor().scopes[0];
      if (atom.config.get('moose-hit-format.formatOnSave') &&
          ['input.moose', 'tests.moose'].includes(scope)) {
        buffer.transact(() => this.format(editor));
      }
    });

    const editorDestroyedSubscription = editor.onDidDestroy(() => {
      bufferSavedSubscription.dispose();
      editorDestroyedSubscription.dispose();

      this.subscriptions.remove(bufferSavedSubscription);
      this.subscriptions.remove(editorDestroyedSubscription);
    });

    this.subscriptions.add(bufferSavedSubscription);
    this.subscriptions.add(editorDestroyedSubscription);
  }

  format = (editor) => {
    const buffer = editor.getBuffer();

    let exe = atom.config.get('moose-hit-format.executable');
    if (!exe) {
      if (os.platform() === 'win32') {
        exe = path.join(__dirname, 'hit.exe');
      } else {
        exe = path.join(__dirname, `hit.${os.platform()}`);
      }
    }

    // Call hit-format synchronously to  ensure that save waits for us
    // Don't catch errors to make them visible to users via atom's UI
    // We need to explicitly ignore stderr since there is no parent stderr on
    // windows and node.js will try to write to it - whether it's there or not

    const execOptions = { input: editor.getText() };

    const style = atom.config.get('moose-hit-format.style') || path.join(__dirname, 'default.style');
    // path.dirname(editor.getPath());

    const command =`"${exe}" format -style ${style} - `;
    try {
      const stdout = execSync(command, execOptions).toString();
      // Update buffer with formatted text. setTextViaDiff minimizes re-rendering
      buffer.setTextViaDiff(stdout);
      // Restore cursor position
    } catch (error) {
      if (error.message.indexOf('Command failed:') < 0) {
        throw error;
      } else {
        atom.notifications.addError('Hit Format Command Failed', {
          dismissable: true,
          detail: `hit-format failed with the below error. Consider reporting this by creating an issue here: https://github.com/dschwen/moose-hit-format/issues.\nError message: "${error.stderr.toString()}".\nWhen running: "${command}".\nStdout was: "${error.stdout.toString()}"`,
        });
      }
    }
  }

}
