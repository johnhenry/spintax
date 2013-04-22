#Spintax

##Parse spintax formatted text
Regular expression validation is often useful, but also often inaccurate.
Sometimes it's just better to do it manually

##Node
### Installation

    $ npm install spintax

### Example

```js
var spintax = require('spintax');
    spintax.unspin("{Hello|Hi} John!"); //#"Hello John!" or "Hi John"
    spintax.countVariations("{Hello|Hi} John!"); //#2
```

##Web
### Installation
```html
   <script src="./lib/spintax.js" ></script>
```
### Example
```html
   <script>
        spintax.unspin("Text goes {here|there|anywhere}{.|!|?}"); //#"Text goes there?" or "Text goes anywhere!" or...
        spintax.countVariations("Text goes {here|there|anywhere}{.|!|?}"); //#9
   </script>
```
## License

(The MIT License)

Copyright (c) 2013 John Henry &lt;john@iamjohnhenry.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.