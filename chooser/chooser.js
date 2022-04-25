/**
  Start
  First, just copy the chooser.js and chooser.css files to the project folder.
  Then connect them to the head of your html file

  <script defer="defer" src="/your/path/chooser.js"></script>
  <link href="/your/path/chooser.css" rel="stylesheet">

  Then connect your file with scripts, such as scripts.js
  <script defer="defer" src="scripts.js"></script>

  and create a new Chooser instance in your file using the object with the settings.

  Example of a settings object

  const options = {
    el: 'select',
    placeholder: 'Сортировка',
    current: 2,
    data: [
      {
        value: 'some_value',
        attr: {
          'some_attr': 'some_value'
        }
      },
      { value: 'some_value' },
      { value: 'some_value' },
    ],
    classList: {
      label: 'some-class__label',
      wrapper: 'some-class__wrapper',
      current: 'some-class__button',
      list: 'some-class__list',
      item: 'some-class__item',
    }
  }

  const select = new Chooser(options);


  Complete list of settings

  const select = new Chooser({
  el: 'filter',
      -- 'el': Root element Id
  placeholder: 'some_placeholder',
      -- 'placeholder': default "choser"
  current: 2,
      -- active item on start
  label: 'some_label'
      -- 'label': default "Выберите элемент:". required element. is an ARIA lable
  group: 'convertings'
      -- add group to hide the names of one group
  data: [
    {
      value: 'some_value',
      attr: {
        'some_attr': 'some_value',
        'some_attr': 'some_value',
        'some_attr': 'some_value',
          -- 'attr': any attributes can be added (key - value)
      },
      id: 'some_unique_id',
          -- 'id': item id is assigned automatically by the index of the item in the array.
              If necessary, you can reassign it.
              Used to select an element and focus on an element:
              (select.select (chooserId), select.focuse (chooserId)).
      itemGroup: 'some_name',
          -- add group to hide the names of one group
    },

    {
      value: 'some_value',
      attr: {
        'some_attr': 'some_value',
        'some_attr': 'some_value',
        'some_attr': 'some_value',
      },
      id: 'some_unique_id'
    },

    { value: 'some_value' },
  ],
  classList: {
    label: 'some-class__label',
    wrapper: 'some-class__wrapper',
    current: 'some-class__button',
    list: 'some-class__list',
    item: 'some-class__item',
  }
});

  Aattributes

  data-chooser_no_close=${id} - do not close this.checkMiss(event);

  Classes

  focused - stylizing the state of focus when accessing from the keyboard
  selected - stylizing the state of selected item
  disabled - stylizing the state of disabled item
            (is automatically added to all items in the group except the selected)
            it with this class becomes selectable and skipped when selected from the keyboard

*/


const getTemplate = (props) => {
  const items = props.data.map(item => {
    const ind = props.data.indexOf(item);
    const dataId = item.chooserId ?? `${props.el}_${ind + 1}`;
    props.data[ind].id = dataId;

    let disabled = false;
    if (item.group || props.group) {
      props.data[ind].group = item.group
        ? item.group
        : `${props.group}_${ind}`;

      const check = document.querySelectorAll(`[data-chooser_group="${props.data[ind].group}"]`);
      if (check) {
        check.forEach(item => {
          if(item.classList.contains('selected')) disabled = true;
        });
      }
    }

    let attr = '';
    if (item.attr) {
      for (let key in item.attr) {
        const newAttr = `${key}=${item.attr[key]} `;
        attr += newAttr;
      }
    }

    return /*html*/`
      <li
        class="${props.classList.item ?? ''} chooser__item${disabled ? ' disabled' : ''}"
        id="${dataId}"
        ${attr}
        ${props.data[ind].group
        ? `data-chooser_group=${props.data[ind].group}`
        : ''}
        data-chooser_type="chooser_item"
        role="option"
      >
        ${item.value}
      </li>
    `;
  }).join('');

  return /*html*/`
        <span
          id="${props.el}_desc"
          class="${props.classList.label ?? ''} chooser__desc"
        >
          ${props.label ?? "Выберите элемент:"}
        </span>
        <div class="${props.classList.wrapper ?? ''} chooser__wrapper">
          <button
            class="${props.classList.current ?? ''} chooser__current"
            id="${props.el}_button"
            data-chooser_type="chooser_button"
            data-chooser_no_close=${props.el}
            aria-labelledby="${props.el}_desc ${props.el}_button"
            aria-haspopup="listbox"
          >
            <span data-chooser_current>
              ${props.placeholder}
            </span>
            <span class="${props.classList.icon ?? ''} chooser__icon"></span>
          </button>
          <ul
            class="${props.classList.list ?? ''} chooser__list"
            role="listbox"
            tabindex="-1"
            aria-labelledby="${props.el}_desc"
            >
            ${items}
          </ul>
        </div>
  `;
}


export class Chooser {
  constructor(props) {
    this.props = props;
    this.props.data = props.data.map(item => ({ ...item }));

    this.$el = document.getElementById(props.el);
    this.elId = props.el;
    this.props.placeholder = props.placeholder ?? "Chooser";

    this.activeDescendant = props.current ? `${this.elId}_${props.current}` : null;
    this.activeGroup = null;
    this.isOpen = false;
    this.focused = null;

    this.#render();
    this.#setup();
  }

  #render() {
    this.$el.classList.add('chooser');
    this.$el.innerHTML = getTemplate(this.props);
  }

  #setup() {
    this.checkMiss = this.checkMiss.bind(this);
    this.clickHendler = this.clickHendler.bind(this);
    this.defocus = this.defocus.bind(this);
    this.onKey = this.onKey.bind(this);
    this.$el.addEventListener('click', this.clickHendler);
    this.$el.addEventListener("keydown", this.onKey);
    this.$list = this.$el.querySelector('.chooser__list');
    this.$list.addEventListener("keydown", this.onKey);
    this.$current = this.$el.querySelector('[data-chooser_current]');
    this.$icon = this.$el.querySelector('.chooser__icon');
    this.$open = [
      this.$el,
      this.$current,
      this.$list,
      this.$icon,
    ];
    if (this.activeDescendant) this.select(this.activeDescendant);
  }

  clickHendler(event) {
    event.preventDefault();
    const { chooser_type } = event.target.dataset;
    if (chooser_type == 'chooser_button') {
      this.#toggle();
    } else if (chooser_type == 'chooser_item') {
      this.select(event.target.id, event.target);
      this.close();
    }
  }

  get current() {
    return this.props.data.find(item => item.id == this.activeDescendant);
  }

  select(id, target) {
    this.activeDescendant = id;
    const item = this.current;
    this.$current.textContent = item.value;
    this.$el.querySelectorAll('[data-chooser_type="chooser_item"]')
      .forEach(item => {
        item.classList.remove('selected');
        item.removeAttribute('aria-selected');
      });
    const currentEl = this.$el.querySelector(`#${id}`);
    currentEl.classList.add('selected');
    currentEl.setAttribute('aria-selected', true);
    this.$list.setAttribute('aria-activedescendant', id);
    if (this.props.group || item.group) this.disableGroup(item.group);
  }

  disableGroup(group) {
    const $disbled = document.querySelectorAll(`[data-chooser_group=${this.activeGroup}]`);
    if ($disbled) {
      $disbled.forEach(item => item.classList.remove('disabled'));
    }
    const $group = document.querySelectorAll(`[data-chooser_group=${group}]`);
    $group.forEach(item => {
      if (!item.classList.contains('selected')) item.classList.add('disabled');
    });
    this.activeGroup = group;
  }

  #toggle() {
    this.isOpen ? this.close() : this.open();
  }

  checkMiss(event) {
    const { chooser_no_close } = event.target.dataset;
    if (!chooser_no_close || chooser_no_close !== this.elId) {
      this.close();
    }
  }

  open() {
    this.isOpen = true;
    this.$open.forEach(el => el.classList.add('open'));
    document.addEventListener('click', this.checkMiss);
    this.$list.addEventListener("mouseenter", this.defocus);
  }

  close() {
    this.isOpen = false;
    this.$open.forEach(el => el.classList.remove('open'));
    document.removeEventListener('click', this.checkMiss);
    this.defocus();
  }

  destroy() {
    this.$el.removeEventListener('click', this.clickHendler);
    this.$el.removeEventListener("keydown", this.onKey);
    this.$list.removeEventListener("keydown", this.onKey);
    this.$el.parentElement.removeChild(this.$el);
  }

  focus(id, t = 0) {
    this.defocus();
    const item = this.$el.querySelector(`#${id}`);
    if (item && !item.classList.contains('disabled')) {
      item.classList.add("focused");
      this.focused = id;
    } else {
      let checkNewCurrent = t == 0
        ? this.#onKeyNextCurrent(item)
        : this.#onKeyNextCurrent(item, 1);
      if (checkNewCurrent) this.focus(checkNewCurrent.id);
    }
  }

  defocus() {
    this.focused = null;
    const items = this.$el.querySelectorAll(".focused")
    if (items) {
      items.forEach((element) => element.classList.remove("focused"));
    }
  }

  focuseFirst() {
    this.focus(this.props.data[0].id);
  }

  focuseLast() {
    const item = this.props.data[this.props.data.length - 1].id;
    this.focus(item, 1);
  }

  #checkDescendantAndOpen() {
    if (this.activeDescendant === null) this.focuseFirst();
    else this.focus(this.activeDescendant);
    this.open();
  }

  #onKeyNextCurrent(current, t = 0) {
    const newCurrent = t == 0
      ? current.nextElementSibling
      : current.previousElementSibling;
    if (newCurrent) {
      if (!newCurrent.classList.contains('disabled')) return newCurrent;
      else return this.#onKeyNextCurrent(newCurrent, t);
    }
    else return false;
  }

  #onKeyUpOrDown(type) {
    let nowCurrent = this.$el.querySelector(`#${this.focused}`);
    let checkNewCurrent = type == "ArrowDown"
      ? this.#onKeyNextCurrent(nowCurrent)
      : this.#onKeyNextCurrent(nowCurrent, 1);
    if (checkNewCurrent) {
      this.focus(checkNewCurrent.id);
      return true;
    } else {
      type == "ArrowDown"
        ? this.focuseFirst()
        : this.focuseLast();
    }
  }

  onKey(event) {
    if (event.key !== "Tab") event.preventDefault();
    const focused = this.$el.querySelector(".focused");
    switch (event.key) {
      case "Home":
        if (!this.isOpen) break;
        else this.focuseFirst();
        break;
      case "End":
        if (!this.isOpen) break;
        else this.focuseLast();
        break;
      case "Escape":
        this.close();
        break;
      case "Tab":
        if (this.isOpen) this.close();
        break;
      case " ":
      case "Enter":
        if (!this.isOpen) {
          this.#checkDescendantAndOpen();
        } else if (this.isOpen) {
          this.select(this.focused)
        }
        break;
      case "ArrowDown":
      case "ArrowUp":
        if (!this.isOpen) this.#checkDescendantAndOpen();
        else if (this.open && !focused) this.#checkDescendantAndOpen();
        else this.#onKeyUpOrDown(event.key);
        break;
    }
  }
}
