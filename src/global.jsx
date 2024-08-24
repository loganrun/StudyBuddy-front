import { Buffer } from 'buffer';

window.global = window;
window.process = { env: {} };
window.Buffer = Buffer;
