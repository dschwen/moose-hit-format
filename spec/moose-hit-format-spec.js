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
    expect(editor.getText()).toEqual('[Mesh]\n  type = GeneratedMesh\n  dim = 3\n[]');
  });
});
