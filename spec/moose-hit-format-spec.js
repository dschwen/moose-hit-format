'use babel';

import HitFormat from '../lib/hit-format';

describe('When we format a hit input file', () => {
  let editor;

  beforeEach(async () => {
    editor = await atom.workspace.open('somefile.i');
    await editor.setText('[Mesh]\ntype = GeneratedMesh\ndim=3\n[]');
    await editor.setCursorBufferPosition(8);

    const hitFormatInstance = new HitFormat();
    await hitFormatInstance.format(editor);
  });

  it('Should update the editor with the formatted code', async () => {
    expect(editor.getText()).toEqual('#include "hello.cpp"; int main(){return 0; }');
  });

  it('Should update the editor cursor position to stay on the same letter', async () => {
    expect(editor.getCursorBufferPosition()).toEqual(12);
  });
});
