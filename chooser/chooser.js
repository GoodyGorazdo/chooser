/**
   const select = new Chooser({
    el: 'filter',                                       Root element Id
    placeholder: 'some_placeholder',                    default "choser"
    current: 2,
    data: [
      {
        value: 'По номеру',
        attr: {                                         any attributes can be added (key - value)
          id: 'id',
          'data-some_attr': 'some_value',
        },
        chooserId: 'some_unique_id',                    chooser id is assigned automatically by the index of the item in the array.
                                                        If necessary, you can reassign it.
                                                        Used to select an element and focus on an element:
                                                        (select.select (chooserId), select.focuse (chooserId)).
      },

      { value: 'По балансу' },
      { value: 'По последней транзакции' },
    ],
    classList: {
      current: 'some-class__current',
      list: 'some-class__list',
      item: 'some-class__item',
    }
  });

  Aattributes

  data-chooser_no_close=${id} - do not close this.checkMiss(event);

  Classes
  focused - stylizing the state of focus when accessing from the keyboard

*/


const getTemplate = (props) => {
  const items = props.data.map(item => {
    const ind = props.data.indexOf(item);
    const dataId = item.chooserId ?? `${props.el}_${ind + 1}`;
    props.data[ind].id = dataId;
    let attr = '';
    if (item.attr) {
      for (let key in item.attr) {
        const newAttr = `${key}=${item.attr[key]} `;
        attr += newAttr;
      }
    }
    return /*html*/`
      <li
        class="${props.classList.item ?? ''} chooser__item"
        ${attr}
        data-chooser_type="chooser_item"
        data-chooser_id="${dataId}"
      >
        ${item.value}
      </li>
    `;
  }).join('');

  return /*html*/`
        <button
          class="${props.classList.current ?? ''} chooser__current"
          data-chooser_current
          data-chooser_type="chooser_button"
          data-chooser_no_close=${props.el}
        >
            ${props.placeholder}
        </button>
        <ul class="${props.classList.list ?? ''} chooser__list">
            ${items}
        </ul>
  `;
}


export class Chooser {
  constructor(props) {
    this.props = props;
    this.$el = document.getElementById(props.el);

    this.elId = props.el;
    this.placeholder = props.placeholder ?? "Chooser";
    this.data = props.data ?? [];
    this.activeDescendant = props.current ? `${this.elId}_${props.current}` : null;

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
    this.onKey = this.onKey.bind(this);
    this.$el.addEventListener('click', this.clickHendler);
    this.$el.addEventListener("keydown", this.onKey);
    this.$list = this.$el.querySelector('.chooser__list');
    this.$list.addEventListener("keydown", this.onKey);
    this.$current = this.$el.querySelector('[data-chooser_current]');
    if (this.activeDescendant) this.select(this.activeDescendant);
  }

  clickHendler(event) {
    const { chooser_type } = event.target.dataset;

    if (chooser_type == 'chooser_button') {
      this.toggle();
    } else if (chooser_type == 'chooser_item') {
      const id = event.target.dataset.chooser_id;
      this.select(id);
    }
  }

  get current() {
    return this.data.find(item => item.id == this.activeDescendant);
  }

  select(id) {
    this.activeDescendant = id;
    this.$current.textContent = this.current.value;

    this.$el.querySelectorAll('[data-chooser_type="chooser_item"]')
      .forEach(item => item.classList.remove('chooser_selected'));
    this.$el.querySelector(`[data-chooser_id="${id}"]`).classList.add('chooser_selected');

    this.close();
  }

  toggle() {
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
    this.$el.classList.add('open');
    document.addEventListener('click', this.checkMiss);
  }

  close() {
    this.isOpen = false;
    document.removeEventListener('click', this.checkMiss)
    this.$el.classList.remove('open');
  }

  destroy() {
    this.$el.removeEventListener('click', this.clickHendler);
    this.$el.addEventListener("keydown", this.onKey);
    this.$list.addEventListener("keydown", this.onKey);
    this.$el.parentElement.removeChild(this.$el);
  }

  focus(id) {
    this.defocus();
    const item = this.$el.querySelector(`[data-chooser_id="${id}"]`);
    if (item) item.classList.add("focused");
    this.focused = id;
  }

  defocus() {
    this.focused = null;
    this.$el
      .querySelectorAll(".focused")
      .forEach((element) => element.classList.remove("focused"));
  }

  focuseFirst() {
    this.focus(this.data[0].id);
  }

  focuseLast() {
    const item = this.data[this.data.length - 1].id;
    this.focus(item);
  }

  checkDescendantAndOpen() {
    if (this.activeDescendant === null) this.focuseFirst();
    else this.focus(this.activeDescendant);
    this.open();
  }

  #onKeyNextCurrent(current, t = 0) {
    const newCurrent = t == 0
      ? current.nextElementSibling
      : current.previousElementSibling;
    if (newCurrent) return newCurrent;
    else return false;
  }

  #onKeyUpOrDown(type) {
    let nowCurrent = document.querySelector(
      `[data-chooser_id=${this.focused}]`
    );
    let checkNewCurrent = type == "ArrowDown"
      ? this.#onKeyNextCurrent(nowCurrent)
      : this.#onKeyNextCurrent(nowCurrent, 1);
    if (checkNewCurrent) {
      const { chooser_id } = checkNewCurrent.dataset;
      this.focus(chooser_id);
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
      case "Enter":
        if (!this.isOpen) {
          this.checkDescendantAndOpen();
        } else if (this.isOpen) {
          this.select(this.focused)
          this.close();
        }
        break;
      case "ArrowDown":
      case "ArrowUp":
        if (!this.isOpen) this.checkDescendantAndOpen();
        else if (this.open && !focused) this.checkDescendantAndOpen();
        else this.#onKeyUpOrDown(event.key);
        break;
    }
  }
}
