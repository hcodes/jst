# jst
[![NPM version](https://img.shields.io/npm/v/jst_compiler.svg?style=flat)](https://www.npmjs.com/package/jst_compiler)
[![Build Status](https://img.shields.io/travis/hcodes/jst.svg?style=flat)](https://travis-ci.org/hcodes/jst)
[![Coverage Status](https://img.shields.io/coveralls/hcodes/jst.svg?style=flat)](https://coveralls.io/r/hcodes/jst)
[![Dependency Status](https://img.shields.io/david/hcodes/jst.svg)](https://david-dm.org/hcodes/jst)

Клиентский и серверный шаблонизатор на JavaScript.

Возможности:
+ быстрый — шаблоны компилируются в чистый JavaScript;
+ компактный — ядро шаблонизатора занимает менее 6 КБ;
+ безопасный — экранирование HTML по умолчанию;
+ монолитный — ядро и скомпилированные шаблоны помещаются в один файл;
+ расширяемый — можно добавлять свои фильтры, наследовать шаблоны;
+ простой — 10 минут на изучение.

## Установка
`npm install jst_compiler -g`

## Использование в командной строке
`jst_compiler ./example.jst.html` - компиляция одного шаблона в файл `./example.jst.js`

`jst_compiler ./example.jst.html ./file.jst.js` - компиляция одного шаблона в файл `./file.jst.js`

`jst_compiler ./examples` - компиляция папки с шаблонами в файл `./all.jst.js`

`jst_compiler ./examples ./examples.jst.js` - компиляция папки с шаблонами в файл `./examples.jst.js`

`jst_compiler -w ./examples ./examples.jst.js` - компиляция папки с шаблонами в файл `./examples.jst.js` без jst-ядра

`jst_compiler -h` - вызов справки

`jst_compiler -V` - версия компилятора

## Плагин для сборки с Gulp
[gulp-jst_compiler](https://github.com/hcodes/gulp-jst_compiler)

## Быстрый старт
+ `npm install jst_compiler -g`
+ Создаём файл с расширением `.jst.html` - `example.jst.html`:
```HTML
<template name="example">
    Hello world!
</template>
```
+ `jst_compiler ./example.jst.html`


## Подключение в браузере

```HTML
<!-- Скомпилированные шаблоны и ядро -->
<script src="./all.jst.js"></script>
...
<div id="container"></div>
...
<script>
    // Обычный способ
    document.getElementById('container').innerHTML = jst('example');

    // для jQuery
    $('#container').jst('example');
</script>
```

## Использование в Node.js
```js
require('./all.jst.js'); // Скомпилированные шаблоны и ядро
...
var content = jst('example');
```

## Передача и вставка параметров
Для вывода данных в шаблоне используется запись`<%= data %>`.
Значения `null` или `undefined` заменяются на пустую строку, HTML при вставки экранируется.

Для вставки без HTML-экранирования используется запись `<%! data %>`.
```HTML
<template name="example" params="word">
    Hello <%= word %>! <!-- С экранированием HTML -->
</template>

<template name="example" params="word">
    Hello <%! word %>! <!-- Без экранирования HTML -->
</template>
```

## Параметры по умолчанию
```HTML
<template name="example" params="title, str = 'world'">
    <h2><%= title %></h2>
    Hello <%= str %>!
</template>
```

## Условия
```HTML
<template name="example" params="x">
    <% if (x) { %>
        Yes
    <% } else { %>
        No
    <% } %>
</template>
```
Предпочтительное использование условий (тернарная версия):
```HTML
<template name="example" params="x">
    <%= x ? 'Yes' : 'No' %>
</template>
```

## Вызов шаблона из шаблона
```HTML
<template name="example" params="x">
    <%! template('myAnotherTemplate', x) %>
</template>

<template name="myAnotherTemplate" params="x">
    ...
</template>
```

## Блоки (подшаблоны) и вызов блока
```HTML
<template name="example" params="x">
    <block name="block1" params="y">
        ...
        <%= y %>
        ...
    </block>
    <block name="block2">
        ...
    </block>

    <%= block('block1', x) %> <!-- HTML экранируется -->
    <%! block('block2') %> <!-- HTML не экранируется -->

</template>
```

## Циклы в шаблонах
```HTML
<template name="myTemplate" params="items">
    ...
    <%= each('myAnotherTemplate', items) %>
    ...
</template>

<template name="myAnotherTemplate" params="element, index">
    ...
    <%= element %>
    ...
</template>
```
Итерироваться можно как по массивам, так и по объектам.

### Вызов шаблона в цикле
```js
// Обычный способ
var content = jst.each('item', [1, 2, 3]);

// Для jQuery
$('#content').jstEach('item', [1, 2, 3]);
```

### Циклы в блоках
```HTML
<template name="myTemplate" params="items">
    <block name="myBlock" params="element, index">
        <%= element %>
    </block>

    <%= eachBlock('myBlock', items) %>

</template>
```

### Вызов блока в цикле
```HTML
<script>
    // Обычный способ
    var content = jst.eachBlock('myTemplate', 'myBlock', [1, 2, 3]);

    // Для jQuery
    $('#content').jstEachBlock('myTemplate', 'myBlock', [1, 2, 3]);
</script>
```
## Наследование
Между шаблонами наследуются блоки.
Механизм наследования в шаблонах основан на прототипах в JavaScript.
```HTML
<template name="one" params="x">
    <block name="block1" params="y">
        ...
        <%= y %>
        ...
    </block>
    <block name="block2">
        ...
    </block>

    <%= block('block1', x) %> <!-- HTML экранируется -->
    <%! block('block2') %> <!-- HTML не экранируется -->

</template>

<template name="two" params="x" extend="one">
    <%= block('block1', x) %>
</template>
```

## Фильтры
Фильтр позволяет преобразовать данные перед их вставкой в шаблон.

По умолчанию на весь вывод данных накладывается фильтр `_undef` (замена `null` и `undefined` на пустую строку).
При использовании записи вида `<%! a %>` `html` не экранируется, а при `<%= a %>` накладывается фильтр `html`.

Короткая запись фильтра - `<%= data | trim %>`
Длинная - `<%= filter.trim(data) %>`

Можно указывать несколько фильтров, порядок выполнения - слева направо.<br/>
`<%= data | stripTags | trim | truncate(8) %>`<br/>
`<%= filter.truncate(filter.trim(filter.stripTags(data), 8))) %>`

## Поддерживаемые фильтры
### trim
Удалить пробелы с начала и конца строки:<br/>
`<%= '  hello  world!  ' | trim %>` → `hello world!`

### ltrim
Удалить пробелы с начала строки:<br/>
`<%= '  hello  world!  ' | ltrim %>` → `hello world!  `

### rtrim
Удалить пробелы с конца строки:<br/>
`<%= '  hello  world!  ' | rtrim %>` → `  hello world!`

### truncate
Обрезать строку до нужной длины:<br/>
`<%= '1234567' | truncate(3) %>` → `123`

### upper
Перевести символы в верхний регистр:<br/>
`<%= 'john' | upper %>` → `JOHN`

### lower
Перевести символы в нижний регистр:<br/>
`<%= 'HoUsE' | lower %>` → `house`

### ucfirst
Первый символ в верхний регистр:<br/>
`<%= 'alice' | ucfirst %>` → `Alice`

### lcfirst
Первый символ в нижний регистр:<br/>
`<%= 'Dog' | lcfirst %>` → `dog`

### first
Вывести первый элемент массива или первый символ строки:<br/>
`<%= [2, 3, 4] | first %>` → `2`<br/>
`<%= 'Cat' | first %>` → `C`

### last
Вывести последний элемент массива или последний символ строки:<br/>
`<%= [2, 3, 4] | last %>` → `4`<br/>
`<%= 'Cat' | last %>` → `t`

### prepend
Добавить строку перед значением:<br/>
`<%= 'world!' | prepend('Hello ') %>` → `Hello world!`

### append
Добавить строку после значения:<br/>
`<%= 'Hello ' | append('world!') %>` → `Hello world!`

### repeat
Повторить строку нужное количество раз:<br/>
`<%= 'many ' | repeat(3) %>` → `many many many `

### remove
Удалить текст по регулярному выражению:<br/>
`<%= 'hello world!' | remove('l') %>` → `heo word!`

### replace
Заменить текст по регулярному выражению:<br/>
`<%= 'Hello boss!' | replace('boss', 'Duck') %>` → `Hello Duck!`

### collapse
Удалить повторяющиеся пробелы:<br/>
`<%= 'Dog' | collapse %>` → `dog`

### stripTags
Удалить HTML-теги:<br/>
`<%= '<p>123</p>' | stripTags %>` → `123`

### join
Склеить массив в строку:<br/>
`<%= [1, 2, 3] | join(' ') %>` → `1 2 3`

### html
Экранировать HTML:<br/>
`<%= '<p>123</p>' %>` → `&lt;p&gt;123&lt;/p&gt;`<br/>
`<%= '<p>123</p>' | html %>` → `&amp;lt;p&amp;gt;123&amp;lt;/p&amp;gt;` - двойное экранирование<br/>
`<%!  '<p>123</p>' %>` → `<p>123</p>`<br/>
`<%!  '<p>123</p>' | html %>` → `&lt;p&gt;123&lt;/p&gt;`

### unhtml
Разэкранировать HTML:<br/>
`<%= data | unhtml %>`

### uri
Экранировать урл:<br/>
`<%= myUrl | uri %>`

### void
Запретить вывод значения:<br/>
`<%= data | void %>`

### Как добавить свой фильтр?
```js
jst.filter.myFilter = function (str, param) {
    //...
    return str;
};
```

## Сохранение пробелов между jst-тегами
```HTML
<template name="example" params="x, y">
    <%= 'x' %> hello world! <%= 'y' %> <!-- xhello world!y -->
    <%= 'x' +%> hello world!  <%= 'y' %> <!-- x hello world!y -->
    <%= 'x' +%> hello world!  <%=+ 'y' %> <!-- x hello world! y -->
</template>
```

## Использование JavaScript в шаблонах
```HTML
<template name="example" params="word">
    Hello<% var b = word || 'world'; %> <%= b %>!
</template>
```

## Комментарии
```HTML
<template name="example" params="word">
    Hello <%# мой комментарий %>!
</template>
```
```HTML
<template name="example" params="word">
    Hello <%# мой
    многострочный
    комментарий %>!
</template>
```

## Отладка
После компиляции каждый шаблон выполняется с помощью eval.
В случае ошибки, шаблон в результирующий код не включается, вместо этого вставляется `console.warn('...')` с названием шаблона и описанием ошибки.

При вызове в коде неизвестного шаблона генерируется исключение.

Отладка в шаблонах:
```HTML
<template name="example" params="data">
    <% console.log(data) %>
</template>
```


## [Лицензия](https://github.com/hcodes/jst/blob/master/LICENSE.md)
MIT License
