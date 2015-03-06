# Uploading images to a server

Since the img.ly SDK is drawing all graphics on an HTML canvas, uploading the
result to a server is not as easy as it seems. To upload the contents of an
image, you have to render it to a DataURL (a base64-encoded string containing
the pixel data), upload the string to a server using AJAX / XHR, decode it
on the server and save it to a file.

## Rendering to a DataURL

Rendering the final image to a DataURL is as easy as passing the format type
`data-url` to the render function, like this:

```js
// Let `kit` be your ImglyKit instance
kit.render("data-url", "image/png")
  .then(function (dataUrl) {

  });
```

## Sending the DataURL to a server

Now let's take the DataURL and upload the data to our server using `jQuery.ajax()`:

```js
// Let `kit` be your ImglyKit instance
kit.render("data-url", "image/png")
  .then(function (dataUrl) {

    $.ajax({
      type: "POST",
      url: "/my-upload-handler.php",
      data: {
        image: dataUrl
      }
    }).done(function(o) {
      console.log('saved');
    });

  });
```

## Saving the image to a file

This looks different in every language, but the idea is always the same: Decode
the base64-encoded string and write the resulting data into a file. Here is an
example written in PHP:

```php
<?php
  $img = $_POST["image"];

  // Remove leading meta information
  $img = str_replace("data:image/png;base64,", "", $img);
  $img = str_replace(" ", "+", $img);

  // Decode the data
  $data = base64_decode($img);

  // Write the data to a file in the local file system
  $file = "uploads/my-file.png";
  $success = file_put_contents($file, $data);
  print $success ? $file : "Unable to save the file.";
?>
```
