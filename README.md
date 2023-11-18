# Examples
  https://codepen.io/CyBeRrRrr/pen/NWXVZow?editors=0110

# Start
  To start, just copy the `chooser.js` and `chooser.css` files.
  Then connect them to the head of your html file
  ```html
  <script defer="defer" src="chooser.js"></script>
  <link href="chooser.css" rel="stylesheet">
  ```

  Then connect your file with scripts, such as `index.js`
  ```html
  <script defer="defer" src="index.js"></script>
  ```

  and create a new Chooser instance in your file using the object with the settings.

# Example of a settings object
```js
  const options = {
    el: 'select',
    placeholder: 'some_placeholder',
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
```

# Complete list of settings
```js
const select = new Chooser({
  el: 'element',
      // -- 'el': Root element Id
  placeholder: 'some_placeholder',
      // -- 'placeholder': default "choser"
  current: 2,
      // -- active item on start
  label: 'some_label',
      // -- 'label': default "Выберите элемент:". required element. is an ARIA lable
  input: {
      // -- activate input elment instead of button in header
      filter: true,
        // -- if true - filters the items according to the entered line
      numbers: true,
        // -- if true - only numbers can be entered in the input
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
          // -- 'attr': any attributes can be added (key - value)
      },

      id: 'some_unique_id',
          // -- 'id': item id is assigned automatically by the index of the item in the array.
          //    If necessary, you can reassign it.
          //    Used to select an element and focus on an element:
          //    (select.select (chooserId), select.focuse (chooserId)).

      group: 'some_name',
          // -- add group to hide the names of one group

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
         }
        // -- the function will be executed during the click of the item
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
    },
      // -- function will be executed during initialization

  onSelect(item) {
    someFunction(item);
  }
    // -- the function will be executed during the selection of the item

});
```
#  Aattributes
```js
  `data-chooser_no_close=${id}` // do not close this.checkMiss(event);
```
#  Classes
  * hover       - stylizing the state of hover
  * focused     - stylizing the state of focus when accessing from the keyboard
  * selected    - stylizing the state of selected item
  * disabled    - stylizing the state of disabled item
                (is automatically added to all items in the group except the selected)
                it with this class becomes selectable and skipped when selected from the keyboard
