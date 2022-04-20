const getTemplate = (data, id, placeholder) => {

  const items = data.map(item => {
    const ind = data.indexOf(item);
    const dataId = `${id}_${ind + 1}`;
    data[ind].id = dataId;
    return /*html*/`
      <li
        class="chooser__item"
        data-chooser_type="chooser_item"
        data-chooser_id="${dataId}"
      >
        ${item.value}
      </li>
    `;
  }).join('');

  return /*html*/`
      <div class="chooser__wrapper">
        <div
          class="chooser__current"
          data-chooser_type="chooser_button"
        >
          <span data-chooser_type="current">
            ${placeholder}
          </span>
        </div>
        <ul class="chooser__list">
            ${items}
        </ul>
     </div>
  `;
}


export class Chooser {
  constructor(props) {
    this.$el = document.getElementById(props.el);

    this.elId = props.el;
    this.placeholder = props.placeholder ?? "Chooser",
    this.data = props.data ?? [];
    this.selectedId = props.current ? `${this.elId}_${props.current}` : null;

    this.#render();
    this.#setup();
  }

  #render() {
    this.$el.classList.add('chooser');
    this.$el.innerHTML = getTemplate(this.data, this.elId, this.placeholder);
  }

  #setup() {
    this.clickHendler = this.clickHendler.bind(this);
    this.$el.addEventListener('click', this.clickHendler);
    this.$current = this.$el.querySelector('[data-chooser_type="current"]');
    if(this.selectedId) this.select(this.selectedId);
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

  get isOpen() {
    return this.$el.classList.contains('open');
  }

  get current() {
    return this.data.find( item => item.id == this.selectedId);
  }

  select(id) {
    this.selectedId = id;
    this.$current.textContent = this.current.value;

    this.$el.querySelectorAll('[data-chooser_type="chooser_item"]')
      .forEach(item => item.classList.remove('chooser_selected'));
    this.$el.querySelector(`[data-chooser_id="${id}"]`).classList.add('chooser_selected');

    this.close();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.$el.classList.add('open');
  }

  close() {
    this.$el.classList.remove('open');
  }

  destroy() {
    this.$el.removeEventListener('click', this.clickHendler);
    this.$el.parentElement.removeChild(this.$el);
  }

}
