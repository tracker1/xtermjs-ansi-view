// not published with regular exports - will access via window
import 'https://unpkg.com/devtools-detect@3.0.1/index.js';
import 'https://unpkg.com/xterm@4.9.0/lib/xterm.js';
import 'https://unpkg.com/xterm-addon-web-links@0.4.0/lib/xterm-addon-web-links.js';
import 'https://unpkg.com/xterm-addon-fit@0.4.0/lib/xterm-addon-fit.js';
import 'https://unpkg.com/xterm-addon-unicode11@0.2.0/lib/xterm-addon-unicode11.js';

import { theme } from './theme.js';

const delay = ms => new Promise(r => setTimeout(r, ms));

const { WebLinksAddon } = window.WebLinksAddon;
const { FitAddon } = window.FitAddon;
const { Unicode11Addon } = window.Unicode11Addon;

const termEl = document.getElementById('terminal');

const termLinks = new WebLinksAddon();
const termFit = new FitAddon();
const termUnicode = new Unicode11Addon();

const getFontSize = () => {
  const w = document.getElementById('terminal').clientWidth;
  if (w > 1285) return 32;
  if (w > 970) return 24;
  if (w > 650) return 16;
  if (w >= 572) return 14;
  return 12;
}

export const initializeTerm = () => {
  const w = document.documentElement.clientWidth;
  const term = window.term = new Terminal({ 
    fontFamily: `"CP437", "Cascadia Code", "Fira Code", monospace`,
    fontSize: getFontSize(),
    convertEol: true, // treat \n like \r\n
    disableStdin: true, // view only
    cols: 80,
    // cursorBlink: true,
    // cursorStyle: 'underline',
    theme: { ...theme, cursor: 'rgba(0,0,0,0)', cursorAccent: 'rgba(0,0,0,0)' }, // hide cursor
  });

  term.loadAddon(termLinks);
  term.loadAddon(termFit);
  term.loadAddon(termUnicode);
  term.unicode.activeVersion = '11';
  term.fit = termFit.fit.bind(termFit);
  term.open(termEl);

  // have terminal fit the viewport - handle devtools open/close event(s)
  const onResize = () => {
    term.setOption('fontSize', getFontSize());
    term.fit();
  }
  
  term.fit();
  window.addEventListener('resize', onResize);
  window.addEventListener('devtoolschange', onResize);

  const disposeFn = term.dispose;
  term.dispose = (...args) => {
    try {
      disposeFn(...args);
    } catch(_) {}
    term.dispose = () => {};
    window.removeEventListener('resize', onResize);
    window.removeEventListener('devtoolschange', onResize);
  }

  return term;
};
