const select = new Chooser({
  el: 'select',
  current: 1,
  label: 'Группа 1',
  group: 'some-name',
  data: [
    { value: '1', group: 'some_name' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
  ],
  classList: {
    label: 'some-section__name select__desc',
    wrapper: 'some-section__wrapper select__wrapper',
    current: 'some-section__button select__current',
    icon: 'some-section__icon select__icon',
    list: 'some-section__list select__list',
    item: 'some-section__item select__item',
  },
});

const select1 = new Chooser({
  el: 'select1',
   placeholder: 'Placeholder',
  label: 'Группа 2',
  group: 'some-name',
  data: [
    {
      value: '1',
      id: 'value_1',
      'data-attr': 'a',
      group: 'some_name',
      onClick(item) {
        console.log('onClick: ')
        console.log(item);
      },
    },
    {
      value: '2',
      id: 'value_2',
      'data-attr': 'b',
      onClick(item) {
        console.log('onClick: ')
        console.log(item);
      },
    },
    {
      value: '3',
      id: 'value_3',
      'data-attr': 'c',
      onClick(item) {
        console.log('onClick: ')
        console.log(item);
      },
    },
    {
      value: '4',
      id: 'value_4',
      'data-attr': 'd',
      onClick(item) {
        console.log('onClick: ')
        console.log(item);
      },
    },
    {
      value: '5',
      id: 'value_5',
      'data-attr': 'e',
      onClick(item) {
        console.log('onClick item: ')
        console.log(item);
      },
    },
  ],
  classList: {
    label: 'some-section__name select__desc',
    wrapper: 'some-section__wrapper select__wrapper',
    current: 'some-section__button select__current',
    icon: 'some-section__icon select__icon',
    list: 'some-section__list select__list',
    item: 'some-section__item select__item',
  },
  onSetUp(items) {
    console.log('onSetUp items: ');
    console.log(items);
  },
  onSelect(item) {
    console.log('onSelect item: ');
    console.log(item);
  },
});

const selectWithInput = new Chooser({
  el: 'select_input',
  placeholder: 'placeholder',
  label: 'Выберите или введите',
  input: {
    filter: true,
    numbers: true,
    id: 'some_id',
    attr: {
      type: 'text',
      placeholder: 'placeholder',
    },
  },
  data: [
    { value: '1', group: 'some_name' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
  ],
  classList: {
    label: 'some-section__name select__desc',
    wrapper: 'some-section__wrapper select__wrapper',
    current: 'some-section__button select__current',
    icon: 'some-section__icon select__icon',
    list: 'some-section__list select__list',
    item: 'some-section__item select__item',
  },
});

window.s = select;