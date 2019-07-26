# word-to-html 

A tiny tool to convert Microsoft Word document to HTML in **Nodejs** and in **chrome**,
you can use the tool convert tables with merged cells and nested tables to html file in **Nodejs** or **chrome**, the online tool [wordhtml](https://wordhtml.com/) can not do this.
Beyond that, you can convert words with different font-family or font-size in a line to html string in **chrome**.

## **table example**
[example.html(mobile)](https://github.com/BUPTlhuanyu/word-to-html/blob/master/test/examplebrowser.png)

## **attention**
If a line of words have different font-family or font-size in your .docx, it can not convert
your .docx to html expectly in nodejs, but this can be fixed in the browsers such as chrome. because 
the npm package `jsdom` can not realize the `DOMParser`'s function perfectly. 
So if you want to convert the font-family and font-size exactly, you can see how to use `word2html.js` in browsers!

## **Install**
```
npm i word-to-html --save-dev
```
**or**
```
yarn add word-to-html
```

## **api in nodejs:** word2html(absPath [,options,env])
absPath: string | Array`<string>`

absPath is your file's absolute path

options: {tdTextAlign:string,tdVerticalAlign:string}

tdTextAlign controls the `<td>` tag's text-align

tdVerticalAlign controls the `<td>` tag's vertical-align

env: 'node' | 'browser'

default value is 'node',if you want to convert the `font-family/font -size/color`, env must be 'browser', then you get a .html file, after you open the .html file in chrome, you will get a string in `console panel`, the result is what you want.

## **Usage in nodejs**

```
var path = require('path');
var word2html = require('word-to-html');
//Word document's absolute path
var absPath = path.join(__dirname,'test.docx');
word2html(absPath,{tdVerticalAlign:'top'})
```
the html generated in your WorkSpace.

## **Usage in browsers**
#### step 1:  execute the code below in your node 
```
var path = require('path');
var word2html = require('word-to-html');
//Word document's absolute path
var absPath = path.join(__dirname,'test.docx');
word2html(absPath,{tdVerticalAlign:'top'},'browser')
```

#### step 2:  get the html string in your browser  
open the html file generated just now, and copy the result string of the console panel into your html tempalte, you will see the content of your .docx file will be in your html template. 