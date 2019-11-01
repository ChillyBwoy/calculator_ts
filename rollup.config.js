
import html from 'rollup-plugin-bundle-html';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/ts/index.ts',
  output: {
    file: './build/bundle.js',
    format: 'iife',
    sourcemap: true,
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
    typescript(),
    serve({
      contentBase: [
        'build',
      ]
    }),
  ],
};