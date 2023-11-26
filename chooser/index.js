/**
  Step 1: Setting Up Chooser

  First, just copy the chooser.js and chooser.css files to the project folder.

  Link them in the head of your HTML file:
  <script defer="defer" src="/your/path/chooser.js"></script>
  <link href="/your/path/chooser.css" rel="stylesheet">

  Connect your script file, such as scripts.js:
  <script defer="defer" src="scripts.js"></script>

  Step 2: Creating a Chooser Instance

  Create a new Chooser instance in your file using the settings object:
  const options = {
    el: 'select',
    placeholder: 'placeholder',
    current: 2,
    index: some_index,
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

  Full List of Chooser Settings:

  const select = new Chooser({
  el: 'element',                      -- ID of the root element (required).
  index: some_index,                  -- A unique index for ease of selection in the code (required).
  placeholder: 'some_placeholder',    -- 'Default value for the selected item (default is "Chooser").
  current: 2,                         -- Index of the active item on start.
  label: 'some_label',                -- default "Выберите элемент:". required element. is an ARIA lable
  multiple: boolean,                  -- Allowing multiple selection.
  input: {                            -- Settings for activating an input element instead of a button in the header.
      filter: boolean,                -- Filtering items based on the entered string.
      numbers: boolean,               -- Allowing only numerical input.
      id: 'some id',                  -- ID of the input element.
      attr: {                         -- Additional attributes for the input element.
        type: 'text',
        placeholder: 'placeholder',
      },

    },
  data: [                             --An array of objects with data for Chooser items.
    {
      value: 'some_value',
      attr: {
        'some_attr': 'some_value',
        'some_attr': 'some_value',
        'some_attr': 'some_value',
                                      -- any attributes can be added (key - value)
      },
      id: 'some_unique_id',
                                      -- 'id': item id is assigned automatically by the index of the item in the array.
                                          If necessary, you can reassign it.
                                          Used to select an element and focus on an element:
                                          (select.select (chooserId), select.focuse (chooserId)).
      group: {
        'path': 'some_value',         -- add group to hide the items other instance of Chooser
        'isInverted': bollean,        -- makes all elements not included in the group inactive
        'isSlave': boolean,           -- cannot influence other elements of the group, only susceptible to influence
      },
      onClick(item) {                 -- A function executed during initialization.
          someFunction(item);
        }
    },
  ],
  classList: {                        -- Classes for different Chooser elements.
    label: 'some-class__label',
    wrapper: 'some-class__wrapper',
    current: 'some-class__button',
    list: 'some-class__list',
    item: 'some-class__item',
  }
  onSetUp(items, instance) {                    -- A function executed during initialization.
      someFunction(items, instance);
    },
  onSelect(item, instance) {                    -- A function executed when selecting an item.
    someFunction(item, instance);
  }
});

  Methods

  select(id, action = true)      -- Selecting an element by index.
    id                           -- id html el;
    action                       -- run callbacks;

  getCurrentItem()         -- Getting the currently selected item.
  getMultipleCurrents()    -- Getting the currently selected item.

  Aattributes
  data-chooser_no_close=${id} -- Preventing the element from closing on an event.

  Classes
  hover       -- Styling state on hover.
  focused     -- Styling state when accessed from the keyboard.
  selected    -- Styling state of the selected item.
  disabled    -- Styling state of a disabled item in a group (automatically added to all items except the selected).


*/

const checkgroupDisabled = (groupName) => {
  const disabled = false;
  const check = document.querySelectorAll(`[data-chooser_group="${groupName}"]`);
  check && check.forEach((element) => {
    if (element.classList.contains("selected")) disabled = true;
  });

  return disabled;
}

const getGroup = (item, selected) => {
  if (!item.group?.path) return ['', false];

  return [
    `data-chooser_group=${item.group.path}`,
    selected ? false : checkgroupDisabled(item.group.path)
  ];
};

const getAttributesString = (attributes) => {
  if (!attributes) return '';
  return Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
};

const createListItem = (props, item, ind, chooser, list, selected) => {
  const dataID = item.id ?? `${props.el}_${item.index ?? ind}`;
  props.data[ind].id = dataID;
  if (selected) list.setAttribute("aria-activedescendant", dataID);
  let attr = getAttributesString(item.attr);
  let [group, disabled] = getGroup(item, selected);
  chooser.data[dataID] = { ...item };

  return `
    <li
      id="${dataID}"
      class="${props.classList?.item ?? ""} chooser__item${disabled ? " disabled" : ""} ${selected ? "selected" : ""}"
      ${attr}
      ${group}
      data-chooser_type="chooser_item"
      role="option"
      ${selected ? 'aria-selected="true"' : ""}
    >
      ${item.value}
    </li>
  `;
};

const currentInputElement = (props) => {
  const id = props.input.id ?? `${props.el}_input`;
  const attr = props.input.attr ? getAttributesString(props.input.attr) : "";

  return `
    <input
      class="${props.classList.current ?? ""} chooser__input"
      id=${id}
      ${attr}
      data-chooser_type="chooser_input"
      data-chooser_no_close=${props.el}
      aria-labelledby="${props.el}_desc ${props.el}_input"
      aria-haspopup="listbox"
      data-chooser_current
    >
    <span class="${props.classList.icon ?? ""} chooser__icon"></span>
  `;
}

const currentButtonElement = (props) => {
  return `
    <button
      class="${props.classList?.current ?? ""} chooser__current"
      id="${props.el}_button"
      data-chooser_type="chooser_button"
      data-chooser_no_close=${props.el}
      aria-labelledby="${props.el}_desc ${props.el}_button"
      aria-haspopup="listbox"
    >
      <span data-chooser_current>
        ${props.placeholder}
      </span>
      <span class="${props.classList?.icon ?? ""} chooser__icon"></span>
    </button>
  `;
}

const createCurrentElement = (props) => {
  if (props.input) {
    return currentInputElement(props);
  } else {
    return currentButtonElement(props);
  }
};

const getTemplate = (props, chooser) => {
  return `
    <span
      id="${props.el}_desc"
      class="${props.classList?.label ?? ""} chooser__desc"
    >
      ${props.label ?? "Выберите элемент:"}
    </span>
    <div class="${props.classList?.wrapper ?? ""} chooser__wrapper">
      ${createCurrentElement(props)}
      <ul
        id=${props.el}_list
        class="${props.classList?.list ?? ""} chooser__list"
        role="listbox"
        tabindex="-1"
        aria-labelledby="${props.el}_desc"
      >
        ${props.data.map((item, ind) => createListItem(props, item, ind, chooser)).join("")}
      </ul>
    </div>
  `;
};

export default class Chooser {
  constructor(props) {
    this.data = {};
    this.props = props;
    this.props.data = props.data.map((item) => ({ ...item }));
    this.$el = document.getElementById(props.el);
    this.elId = props.el;
    this.props.placeholder = props.placeholder ?? "Chooser";
    this.activeDescendant = props.current
      ? (props.data[props.current - 1].id ??
        `${this.elId}_${props.current - 1}`)
      : null;
    this.isMultiple = props.isMultiple ?? false;
    this.multipleList = [];
    this.isOpen = false;
    this.focused = null;

    this.#render();
    this.#setup();
  }

  #render() {
    this.$el.classList.add("chooser");
    this.$el.innerHTML = getTemplate(this.props, this);
  }

  #setup() {
    this.checkMiss = this.checkMiss.bind(this);
    this.clickHendler = this.clickHendler.bind(this);
    this.defocus = this.defocus.bind(this);
    this.removeHover = this.removeHover.bind(this);
    this.addHover = this.addHover.bind(this);
    this.onKey = this.onKey.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.$el.addEventListener("click", this.clickHendler);
    this.$el.addEventListener("keydown", this.onKey);
    this.$list = this.$el.querySelector(".chooser__list");
    this.$list.addEventListener("keydown", this.onKey);
    this.$current = this.$el.querySelector("[data-chooser_current]");
    this.$icon = this.$el.querySelector(".chooser__icon");
    this.$open = [this.$el, this.$current, this.$list, this.$icon];
    if (this.activeDescendant) this.select(this.activeDescendant);
    if (this.props.input) {
      this.$current.addEventListener("focus", this.open);
      this.filterOnInput = this.filterOnInput.bind(this);
      this.$current.addEventListener("input", this.filterOnInput);
    }

    const groups = this.props.data.filter(item => item.group);
    if (groups.length > 0) {
      document.addEventListener('ChooserGroupChange', this.onGroupChange.bind(this));
    }

    if (this.props.onSetUp) this.props.onSetUp(this);
  }


  getCurrentItem() {
    return this.current;
  }

  getMultipleCurrents() {
    return this.multipleCurrents;
  }

  filterItemsByValueStart(value) {
    this.props.data.filter((item) => {
      return item.value.startsWith(value);
    });
  }

  getFilteredItemsTemplate(items) {
    return items.map((item, ind) => {
      return li(this.props, item, ind, this, this.$list);
    })
      .join("");
  }

  filterOnInput(event) {
    let reg = false;
    if (this.props.input.numbers) reg = /[^0-9]/;
    if (reg) event.target.value = event.target.value.replace(reg, "");
    const newItems = this.filterItemsByValueStart(event.target.value)
    this.$list.innerHTML = this.getFilteredItemsTemplate(newItems);
    if (!newItems.length > 0) this.close();
    else if (!this.isOpen) this.open();
  }

  clickHendler(event) {
    event.preventDefault();
    const { chooser_type } = event.target.dataset;
    if (chooser_type == "chooser_button") {
      this.#toggle();
    } else if (chooser_type == "chooser_item") {
      this.select(event.target.id);
      if (!this.isMultiple) this.close();
    }
  }

  get current() {
    return this.props.data.find((item) => item.id == this.activeDescendant);
  }

  get multipleCurrents() {
    return this.props.data.filter(item => this.multipleList.includes(item.id));
  }

  runCallbacks(id) {
    if (this.props.onSelect) this.props.onSelect(this.data[id], this);
    if (this.data[id].onClick) this.data[id].onClick(this.data[id], this);
  }

  disableSelectedAll() {
    this.$el.querySelectorAll('[data-chooser_type="chooser_item"]').forEach(
      (item) => this.disableSelected(item),
    );
  }

  disableSelected(item) {
    item.classList.remove("selected");
    item.removeAttribute("aria-selected");
    this.$list.setAttribute("aria-activedescendant", '');
  }

  enableSelected(id, currentEl) {
    currentEl.classList.add("selected");
    currentEl.setAttribute("aria-selected", true);
    this.$list.setAttribute("aria-activedescendant", id);
  }

  setCurrentText() {
    if (this.props.input) this.$current.value = this.current.value;
    else this.$current.textContent = this.current.value;
  }

  select(id, action = true) {
    const currentEl = this.$el.querySelector(`#${id}`);
    if (this.isMultiple) {
      return this.selectMultiple(id, currentEl, action);
    };
    this.activeDescendant = id;
    this.disableSelectedAll();
    this.setCurrentText();
    this.enableSelected(id, currentEl);
    if (this.current.group) this.generateGroupEvent(this.current);
    action && this.runCallbacks(id);
  }

  selectMultiple(id, currentEl, action) {
    if (this.multipleList.includes(id)) {
      this.removeFromMultipleList(id);
      this.disableSelected(currentEl);
      if (this.data[id].group) this.generateGroupEvent(this.data[id]);
    } else {
      this.enableSelected(id, currentEl);
      this.multipleList.push(id);
      if (this.data[id].group) this.generateGroupEvent(this.data[id]);
    }

    action && this.runCallbacks(id);
  }

  generateGroupEvent(item) {
    const groupEvent = new CustomEvent('ChooserGroupChange', {
      detail: {
        el: this.props.el,
        path: item.group.path,
        isInverted: item.group.isInverted,
        isSlave: item.group.isSlave ?? false,
        isMultiple: this.isMultiple,
        multipleList: this.multipleList.reduce((list, id) => {
          list.push(this.data[id].group.path);
          return list;
        }, []),
      }
    });
    document.dispatchEvent(groupEvent);
  }

  groupItems(path) {
    return this.props.data.filter(item => item.group.path === path);
  }

  groupReset(path) {
    if (this.current && (path !== this.current.group.path)) {
      this.reset();
    }
  }

  groupResetMultiple(event) {
    if (!event.detail.isMultiple) return;
  }

  onGroupChange(event) {
    if (event.detail.el === this.props.el) return;
    if (event.detail.isSlave) return;
    if (!this.groupItems(event.detail.path)) return;
    if (event.detail.isMultiple) this.setGroupMultiple(event.detail);
    else this.setGroup(event.detail);
    if (!this.current && !event.detail.isMultiple) return;
    if (event.detail.isInverted) {
      this.groupReset(event.detail.path);
      this.groupResetMultiple(event);
    } else {

    }
  }

  removeFromMultipleList(id) {
    this.multipleList = this.multipleList.filter(item => item !== id);
  }

  setGroupMultiple(eventDetail) {
    this.$el.querySelectorAll('[data-chooser_type="chooser_item"]')
      .forEach(item => {
        if (eventDetail.multipleList.length < 1) {
          return this.enableGroupItem(item);
        }
        const { chooser_group } = item.dataset;
        const condition = eventDetail.multipleList.includes(chooser_group);
        this.switchGroup(item, condition, eventDetail.isInverted);
      });
  }

  setGroup(eventDetail) {
    this.$el.querySelectorAll('[data-chooser_type="chooser_item"]')
      .forEach(item => {
        const { chooser_group } = item.dataset;
        const condition = chooser_group === eventDetail.path;
        this.switchGroup(item, condition, eventDetail.isInverted);
      });
  }

  switchGroup(item, condition, isInverted) {
    if (condition) {
      this.enableGroup(item, isInverted);
    } else {
      this.disableGroup(item, isInverted);
    }
  }

  enableGroup(item, isInverted) {
    isInverted
      ? this.enableGroupItem(item)
      : this.disableGroupItem(item);
  }

  disableGroup(item, isInverted) {
    isInverted
      ? this.disableGroupItem(item)
      : this.enableGroupItem(item);
  }

  disableGroupItem(item) {
    if (item.classList.contains('selected')) {
      item.classList.remove('selected');
    };
    item.classList.add('disabled');
    if (this.multipleList) {
      this.removeFromMultipleList(item.id);
    }
  }

  enableGroupItem(item) {
    item.classList.remove('disabled');
  }

  reset() {
    console.log('reset');
    if (this.props.input) this.$current.value = '';
    else this.$current.textContent = this.props.placeholder;
    this.activeDescendant = null;
    this.multipleList = [];
    this.$el.querySelectorAll('[data-chooser_type="chooser_item"]')
      .forEach(item => item.classList.remove('selected'));
  }

  #toggle() {
    this.isOpen ? this.close() : this.open();
  }

  checkMiss(event) {
    const { chooser_no_close, chooser_type } = event.target.dataset;
    if (chooser_type == 'chooser_item') return;
    if (!chooser_no_close) return this.close();
    if (chooser_no_close !== this.elId) return this.close();
  }

  get listBottomPos() {
    return this.$list.getBoundingClientRect().bottom >
      document.documentElement.clientHeight &&
      this.$list.getBoundingClientRect().top >
      document.documentElement.clientHeight;
  }

  addHover(e) {
    this.defocus();
    e.target.classList.add("hover");
    this.focused = e.target.id;
  }

  removeHover() {
    this.focused = null;
    const el = document.querySelector(".hover");
    if (el) el.classList.remove("hover");
  }

  checkBottomPos() {
    if (!this.$listBottomPos) return;
    this.$list.style.bottom = window.getComputedStyle(this.$list).top;
    this.$list.style.top = "unset";
  }

  setOpenedListeners() {
    document.addEventListener("click", this.checkMiss);
    this.$list.addEventListener("mouseover", this.addHover);
    this.$list.addEventListener("mouseout", this.removeHover);
  }

  removeOpenedListeners() {
    document.removeEventListener("click", this.checkMiss);
    this.$list.removeEventListener("mouseover", this.addHover);
    this.$list.removeEventListener("mouseout", this.removeHover);
  }

  open() {
    if (this.$list.innerHTML == "") return;
    this.isOpen = true;
    this.$open.forEach((el) => el.classList.add("open"));
    this.setOpenedListeners();
    this.checkBottomPos();
  }

  close() {
    this.isOpen = false;
    this.$open.forEach((el) => el.classList.remove("open"));
    this.removeOpenedListeners();
    this.defocus();
    this.removeHover();
    if (this.$list.hasAttribute("style")) {
      this.$list.removeAttribute("style");
    }
  }

  destroy() {
    this.$el.removeEventListener("click", this.clickHendler);
    this.$el.removeEventListener("keydown", this.onKey);
    this.$list.removeEventListener("keydown", this.onKey);
    this.$el.innerHTML = ``;
  }

  focus(id, t = 0) {
    const hover = this.$list.querySelector(".hover");
    if (hover) hover.classList.remove("hover");
    this.defocus();
    const item = this.$el.querySelector(`#${id}`);
    if (item && !item.classList.contains("disabled")) {
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
    const items = this.$el.querySelectorAll(".focused");
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
      if (!newCurrent.classList.contains("disabled")) return newCurrent;
      else return this.#onKeyNextCurrent(newCurrent, t);
    } else return false;
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
      type == "ArrowDown" ? this.focuseFirst() : this.focuseLast();
    }
  }

  onKey(event) {
    if (event.key !== "Tab" && !this.props.input) event.preventDefault();
    const focused = this.$el.querySelector(".focused") ||
      this.$el.querySelector(`#${this.focused}`);
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
          this.select(this.focused);
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
