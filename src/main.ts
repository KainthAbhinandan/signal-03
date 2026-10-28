import './style.css';
import { createGame } from './app/createGame';

const root = document.getElementById('app');
if (!root) throw new Error('The application mount point is missing.');
let dispose: (() => void) | undefined;
let obsolete = false;
void createGame(root).then(destroy => { if (obsolete) destroy(); else dispose = destroy; });
if (import.meta.hot) import.meta.hot.dispose(() => { obsolete = true; dispose?.(); });
