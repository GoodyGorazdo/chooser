import { Chooser } from './chooser/chooser';
import './chooser/chooser.scss';

const select = new Chooser({
  el: 'select',
  // placeholder: 'kjdsfj',
  current: 3,
  data: [
    { value: '1' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
  ],
});
const select1 = new Chooser({
  el: 'select1',
  // placeholder: 'kjdsfj',
  data: [
    { value: '1' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
  ],
});

window.s = select;