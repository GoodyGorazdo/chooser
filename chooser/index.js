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

  Complete list of settings
  const select = new Chooser({
  el: 'element',
      -- 'el': Root element Id
  index: some_index,
      -- required, some unique index for convenience of choosing the side of the code
  placeholder: 'some_placeholder',
      -- 'placeholder': default "choser"
  current: 2,
      -- active item on start
  label: 'some_label',
      -- 'label': default "Выберите элемент:". required element. is an ARIA lable
  input: {
      -- activate input elment instead of button in header
      filter: true,
        -- if true - filters the items according to the entered line
      numbers: true,
        -- if true - only numbers can be entered in the input
      id: 'some id',
      attr: {
        type: 'text',
        placeholder: 'placeholder',
      },
    },
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
      group: 'some_name',
          -- add group to hide the names of one group
      switch: {
        name: 'some_name'
          -- required
        target: 'some_value'
          -- target to be switched
        path: 'some_value'
          -- click element to swich target
        inverted: boolean
          -- if true target be enabled, and other switch targets disabled
      }
      onClick(item) {
          someFunction(item);
        } -- the function will be executed during the click of the item
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
  onSetUp(items) {
      someFunction(items);
    }, -- function will be executed during initialization
  onSelect(item) {
    someFunction(item);
  }  -- the function will be executed during the selection of the item
});

  Methods

  select(index, true) - select element;
    index - index needle element in ements array;
    true - obligatory;

  getCurrentItem() - return current item;

  Aattributes
  data-chooser_no_close=${id} - do not close this.checkMiss(event);

  Classes
  hover       - stylizing the state of hover
  focused     - stylizing the state of focus when accessing from the keyboard
  selected    - stylizing the state of selected item
  disabled    - stylizing the state of disabled item
                (is automatically added to all items in the group except the selected)
                it with this class becomes selectable and skipped when selected from the keyboard


*/

const checkgroupDisabled = (groupType, groupName) => {
  const disabled = false;
  const check = document.querySelectorAll(`[data-chooser_${groupType}="${groupName}"]`);
  check && check.forEach((element) => {
    if (element.classList.contains("selected")) disabled = true;
  });

  return disabled;
}

const getGroupAttributes = (item, selected) => {
  const disabled = selected
    ? false
    : checkgroupDisabled('group', item.group);

  return [`data-chooser_group=${item.group}`, disabled];
};

const getSwitchGroupAttributes = (item) => {
  const disabled = item.switch.target
  ? false
  : checkgroupDisabled('switch-path', item.group);

  let switchGroup = `data-chooser_switch-name=${item.switch.name}`;
  if (item.switch.target) {
    switchGroup += ` data-chooser_switch-target=${item.switch.target}`;
  }
  if (item.switch.path) {
    switchGroup += ` data-chooser_switch-path=${item.switch.path}`;
  }

  return [switchGroup, disabled];
};

const getGroup = (item) => {
  if (item.switch) {
    return getSwitchGroupAttributes(item);
  } else if (item.group) {
    return getGroupAttributes(item);
  }

  return ['', false];
}

const getAttributesString = (attributes) => {
  if (!attributes) return '';
  return Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
};

const createListItem = (props, item, ind, chooser, list, selected) => {
  const dataId = item.id ?? `${props.el}_${item.index ?? ind}`;
  props.data[ind].id = dataId;
  if (selected) list.setAttribute("aria-activedescendant", dataId);
  let attr = getAttributesString(item.attr);
  let [group, disabled] = getGroup(item);
  chooser.data[dataId] = { ...item };

  return `
    <li
      id="${dataId}"
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
    this.props = props;
    this.props.data = props.data.map((item) => ({ ...item }));
    this.data = {};

    this.$el = document.getElementById(props.el);
    this.elId = props.el;
    this.props.placeholder = props.placeholder ?? "Chooser";

    this.activeDescendant = props.current
      ? (props.data[props.current - 1].id ??
        `${this.elId}_${props.current - 1}`)
      : null;
    this.activeGroup = null;
    this.activeSwitchGroup = null;
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
    if (this.props.onSetUp) this.props.onSetUp(this.props.data);
  }

  getCurrentItem() {
    return this.current;
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
      this.close();
    }
  }

  get current() {
    return this.props.data.find((item) => item.id == this.activeDescendant);
  }

  runCallbacks(id) {
    if (this.props.onSelect) this.props.onSelect(this.data[id]);
    if (this.data[id].onClick) this.data[id].onClick(this.data[id]);
  }

  disableSelected() {
    this.$el.querySelectorAll('[data-chooser_type="chooser_item"]').forEach(
      (item) => {
        item.classList.remove("selected");
        item.removeAttribute("aria-selected");
      },
    );
  }

  enableSelected(id) {
    const currentEl = this.$el.querySelector(`#${id}`);
    currentEl.classList.add("selected");
    currentEl.setAttribute("aria-selected", true);
    this.$list.setAttribute("aria-activedescendant", id);
  }

  setCurrentText() {
    if (this.props.input) this.$current.value = this.current.value;
    else this.$current.textContent = this.current.value;
  }

  select(id, handler = false) {
    if (handler) id = `${this.elId}_${id}`;
    this.activeDescendant = id;
    this.disableSelected();
    this.setCurrentText();
    this.runCallbacks(id);
    this.enableSelected(id);
    this.disableSelectedGroup(this.current);
  }

  disableSelectedGroup(item) {
    if (item.switch?.path) {
      this.disableSwitchGroup(item);
    } else if (item.group) {
      this.disableGroup("group", "activeGroup", item.group);
    }
  }

  disableGroup(target, active, group) {
    this.enableGroupAll(target, active);
    this[active] = group;
    const $group = document.querySelectorAll(`[data-chooser_${target}=${group}]`);
    $group.forEach((item) => {
      if (!item.classList.contains("selected")) item.classList.add("disabled");
    });
  }

  disableSwitchGroup(item) {
    if (item.switch.inverted) {
      this.disableSwitchGroupInverted(item.switch.path, item.switch.name);
    } else {
      this.disableGroup('switch-target', 'activeSwitchGroup', item.switch.path);
    }
  }

  disableSwitchGroupInverted(group, name) {
    this.enableSwitchGroupInverted(name);
    const $group = document.querySelectorAll(`[data-chooser_switch-name=${name}][data-chooser_switch-target]`);
    $group.forEach((item) => {
      if (!item.classList.contains("selected") &&
        item.getAttribute("data-chooser_switch-target") !== group) {
        item.classList.add("disabled");
      }
    });

    this.activeSwitchGroup = group;
  }

  enableSwitchGroupInverted(name) {
    document.querySelectorAll(`[data-chooser_switch-name=${name}]`).forEach(item => {
        item.classList.remove("disabled");
    });
  }

  enableGroupAll(target, active) {
    const $disabled = document.querySelectorAll(`[data-chooser_${target}=${this[active]}]`);
    if ($disabled) {
      $disabled.forEach((item) => item.classList.remove("disabled"));
    }
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

  get $listBottomPos() {
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
