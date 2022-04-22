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