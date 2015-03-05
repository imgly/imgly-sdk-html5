# Customizing the photo editor

We designed the photo editor to be easily customizable using our API. The
features explained on this page apply to our default UI ("Night UI").

## Selecting the available operations

Using the `selectOperations` function, you can decide which operations should
be available to the user. [Every operation has its own unique identifier](misc/operation-identifiers.md).

To select only the `crop` and `filters` operations, call `selectOperations`
with an object containing an `only` property *before* calling `kit.run()`:

```js
var kit = new ImglyKit({
  image: myImage,
  ui: true,
  container: document.querySelector("#container")
});

kit.selectOperations({ only: "crop, filters" });

kit.run();
```

To select all operations except the `text` and `stickers` operations, you
can pass an object containing an `except` property:

```js
kit.selectOperations({ except: "text, stickers" });
```

## Selecting the available filters

Using the `selectFilters` function of the `FiltersControl`, you can select
the available filters. [Every filter has its own unique identifier](misc/filter-identifiers.md).

Make sure you call this function *after* calling `kit.run()`:

```js
var filtersControl = kit.ui.controls.filters;
filtersControl.selectFilters({ only: ["semired, k1, k2, k6"] });
```

## Adding and selecting available crop ratios

Using the `addRatio` function of the `CropControl`, you can register custom ratios.
A ratio has an `identifier`, a `ratio` value and a `selected` state. The `identifier`
is a unique string that you will use to select the ratios available to the user. The `ratio`
is either a number value (e.g. 1.33 for 4:3 ratio) or a special string (`*` for
free crop or `original` for the ratio of the original image). The `selected` state
specifies whether the ratio should be pre-selected when entering the crop operation.

```js
var cropControl = kit.ui.controls.crop;
cropControl.addRatio("facebook-cover", 851 / 315, true); // selected set to true
cropControl.addRatio("twitter-cover", 1500 / 500);
```

To select the ratios available to the user, call `selectRatios` the same way you do with
filters. The 4 default ratios are `custom`, `square`, `4-3` and `16-9`.

```js
cropControl.selectRatios({ only: "facebook-cover,twitter-cover" });
```

## Adding and selecting stickers

Using the `addSticker` function of the `StickersControl`, you can register
custom stickers. A sticker has an `identifier` and a `path`. The `identifier`
is a unique string that you will use to select the stickers available to
the user.

```js
var stickersControl = kit.ui.controls.stickers;
stickersControl.addSticker("bird", "stickers/bird.png");
```

To select the stickers available to the user, call `selectStickers` the same
way you do with filters. See the [list of default sticker identifiers](misc/sticker-identifiers.md).

```js
stickersControl.selectStickers({ only: "glasses-nerd, bird" });
```

## Adding and selecting fonts

:construction: Not implemented, yet! :construction:

# Advanced customizations

* [Creating custom filters](creating-custom-filters.md)
* [Creating custom operations](creating-custom-operations.md)
