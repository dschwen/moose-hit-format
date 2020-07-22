# MOOSE hit Format

A package for the Atom text editor that lets you format your MOOSE input files
according to the canonical MOOSE input file style. An emscripten transpiled
version of the MOOSE hit library is included so it works out of the box. The
package has support for automatically formatting files when you save.

## Developer note

Updates to the hit format code in MOOSE may require a rebuilding of the `hit.js`
and `hit.wasm` files. Use emsdk to activate a recent emscripten environment, set
`MOOSE_DIR` to the root of the MOOSE repository and run `make` in the `lib`
directory of the plugin. Commit the `hit.js` and `hit.wasm` files and republish
the plugin.
