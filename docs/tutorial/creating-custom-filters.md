# Creating custom filters

Filters are simple extendable JavaScript classes with an `identifier` and
a `render` function. The img.ly SDK provides a `PrimitivesStack` class and
some `Primitive` that can be used to build filters. See the [documentation](http://sdk.img.ly/docs/html5)
for all existing primitives and their available options.

Use `ImglyKit.Filter`'s `extend` function to create a subclass of `Filter`

```js
// First parameter of `extend` are the prototype properties, second
// parameter are the class properties.
var MyFilter = ImglyKit.Filter.extend({
  render: function (renderer) {
    // A `PrimitivesStack` holds a list of `Primitive` instances
    var stack = new ImglyKit.Filter.PrimitivesStack();

    // Turn image into grayscale, increase contrast
    stack.add(new ImglyKit.Filter.Primitives.Grayscale());
    stack.add(new ImglyKit.Filter.Primitives.Contrast({
      contrast: 1.5
    }));

    return stack.render(renderer);
  }
}, {
  identifier: "myfilter"
});
```

Afterwards, you can either pass an instance of your filter to the
`FiltersOperation` or add the filter to the UI, like this:

```js
// Let `kit` be your img.ly SDK instance
var filtersControl = kit.ui.controls.filters;
filtersControl.addFilter(MyFilter);
filtersControl.selectFilters({ only: ["myfilter"] });
```

Please note that you will have to add a preview to your `assets` folder. The
original image that we used for our previews can be found [here](http://sdk.img.ly/img/img.jpg).
