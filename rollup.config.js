
import html from 'rollup-plugin-bundle-html';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: './src/ts/index.ts',
  output: {
    file: './build/bundle.js',
    format: 'iife',
  },
  plugins: [
    html({
      template: 'src/html/index.html',
      dest: "build",
      filename: 'index.html',
    }),
    postcss({
      plugins: [],
      extract: true,
    }),
    serve({
      open: true,
      contentBase: [
        'build',
      ]
    }),
    typescript(),
  ],
};