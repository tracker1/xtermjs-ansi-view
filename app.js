import { render, useState, useEffect, html } from 'https://unpkg.com/@fordi-org/buildless';
import {cp437MapToUtf8} from './cp437.js';

import { initializeTerm } from './terminal.js';

export const fileName = f => f.replace(/\.\w+$/, '').replace(/[\W\_\-]/g, ' ');

const delay = ms => new Promise(r => setTimeout(r, ms));

const pickerEl = document.getElementById('picker');
const pickValue = (options, value, defaultValue) => Array.from(options).includes(value) ? value : defaultValue;
const mapText = t => t.trim().split(/(\r?\n)+/g).map(f => f.trim()).filter(f => f).sort();

let term;
let lastAnsi, lastAnsiText;
const setAnsi = async (ansi) => {
  const isDosFile = (/(\.ans|\.asc)$/i).test(ansi)
  if (lastAnsi !== ansi) {
    localStorage.setItem('ANSI', ansi);
    let text;
    
    if (isDosFile) {
      const data = new Uint8Array(
        await fetch(`ansi/${ansi}`).then(r => r.arrayBuffer())
      );
      text = Array.from(data).map(b => {
        const c = String.fromCharCode(b);
        return cp437MapToUtf8[c] || c;
      }).join('');
    } else {
      text = await fetch(`ansi/${ansi}`).then(r => r.text());
    }
    text = text
      .split(/\r?\n/)
      .join('\r\n')
      .replace(/\033\[s[\s\r\n]+\033\[u/g, '')

    let sauce = text.substr(-129);
    if (/^\x1aSAUCE/.test(sauce)) {
      // strip sauce record
      text = text.substr(0, text.length - 129);
      // TODO: parse sauce record
    } else {
      sauce = null;
    }

    lastAnsiText = text;
    lastAnsi = ansi;
  }

  await delay(10);
  term?.clear?.();
  await delay(10);
  
  const lines = lastAnsiText.split(/\r?\n/g);
  for (var i=0; lastAnsi == ansi && i<lines.length; i++) {
    await delay(25);
    if (lastAnsi !== ansi) return term;
    if (i+1 < lines.length) {
      term?.writeln?.(lines[i]);
    } else {
      term?.write?.(lines[i]);
    }
  }
};

const Picker = () => {
  const [state, setState] = useState({
    loaded: false, 
    ansis: [], 
    ansi: null,
  });

  const {loaded, ansis, ansi} = state;

  useEffect(() => {
    const loaders = [
      ['CP437', 'Web437_ATI_8x16.woff'],
      ['Cascadia Code', 'CascadiaCodePL.woff2'],
      ['Fira Code', 'FiraCode-VF.woff2'],
    ].map(async ([family, file]) => {
      const url = `url("${location.origin}/fonts/${font}")`;

      const face = new FontFace(family, `url("${location.origin}/fonts/${file}")`);
      await face.load();
      document.fonts.add(face);
    });
    Promise.all(loaders).then(async () => {
      // load ansi and fonts list
      term = initializeTerm();
      const ansis = await fetch('ansi.txt').then(r => r.text()).then(mapText)
      const ansi = pickValue(ansis, localStorage.getItem('ANSI'), 'trn-welcome4.ans');
      setState({ loaded: true, ansis, ansi });
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setAnsi(ansi);
  }, [ansi])

  if (!loaded) return html`<div>Loading Data</div>`;

  return html`
    <div>
      <label>
        Ansi:
        <select onChange=${e => setState({ ...state, ansi: e.target.value })}>
          ${ansis.map(f => html`
            <option value=${f} selected=${f === ansi}>${f.replace(/\.\w+$/g,'')}</option>
          `)}
        </select>
      </label>
    </div>
  `;
};

render(html`<${Picker}/>`, pickerEl);
