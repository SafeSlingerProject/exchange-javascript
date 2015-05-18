[![Build Status](https://travis-ci.org/SafeSlingerProject/exchange-javascript.png?branch=master)](https://travis-ci.org/SafeSlingerProject/exchange-javascript)

Quick Links:
[Downloads](https://github.com/SafeSlingerProject/SafeSlinger-Media/wiki/Platforms),
[Wiki](https://github.com/SafeSlingerProject/SafeSlinger-Media/wiki),
[Support, Translations, Contributing](https://github.com/SafeSlingerProject/SafeSlinger-Media/wiki/Contributing),
[Research Paper](http://sparrow.ece.cmu.edu/group/pub/farb_safeslinger_mobicom2013.pdf),
[Project Website](http://www.cylab.cmu.edu/safeslinger)

**WARNING: Under Construction**
--

SafeSlinger JavaScript Client Projects
===================
JavaScript library implementation of the SafeSlinger Exchange.

- **/build** Contains the consolidated scripts for the exchange library (**safeslinger.js**) and a demo UI (**safeslinger-ui.js**) for testing. 
- **/src** Main source to generate the build libraries from. 

Steps to Build the Library
===================

You should have latest version of Node.js and npm package manager installed.

After forking, run the following command in the main directory.

```
npm install -g grunt-cli
```
Then do a ```npm install``` in the main directory.

For building the library.

Use
```grunt ```
OR
```grunt build``` 

To build the library automatically while you save changes in any javascript file.
 
Use
``` grunt watch ```


License
=======
	The MIT License (MIT)

	Copyright (c) 2010-2015 Carnegie Mellon University

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.