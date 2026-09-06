import {
  decomposeHangul,
  romanize,
  romanizeAligned,
  romanizeLines,
} from '../dist/index.js';

console.log(romanize('안녕하세요, K-pop!'));
console.log(romanize('학교', { tensification: 'official' }));
console.log(romanize('한국어', { system: 'MR' }));
console.log(romanizeLines(['같이 가자', '', '사랑해']));
console.log(romanizeAligned('한국어!'));
console.log(decomposeHangul('한'));
