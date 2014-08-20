[![Build Status](https://travis-ci.org/hcodes/jst.png?branch=master)](https://travis-ci.org/hcodes/jst)

# jst 
Клиентский и серверный шаблонизатор на JavaScript

Возможности:
+ Скорость
+ Блочное наследование
+ Параметры для шаблонов и блоков
+ Параметры по умолчанию
+ Фильтры и возможность их расширения
+ Блоки (подшаблоны)
+ Экранирование HTML по умолчанию

## Установка
`npm install jst_compiler -g`
  
## Использование в командной строке
`jst_compiler ./example.jst` - компиляция одного шаблона в файл `./example.jst.js` 

`jst_compiler ./example.jst ./file.jst.js` - компиляция одного шаблона в файл `./file.jst.js`  

`jst_compiler ./examples` - компиляция папки с шаблонами в файл `./all.jst.js`

`jst_compiler ./examples ./examples.jst.js` - компиляция папки с шаблонами в файл `./examples.jst.js`

`jst_compiler -w ./examples ./examples.jst.js` - компиляция папки с шаблонами в файл `./examples.jst.js` без jst-ядра

`jst_compiler -h` - вызов справки

`jst_compiler -v` - версия компилятора

## Плагин для сборки с Gulp
[gulp-jst_compiler](https://github.com/hcodes/gulp-jst_compiler)

## Быстрый старт
1. `npm install jst_compiler -g`
1. Создаём файл с расширением .jst - `example.jst`:
  ```HTML
<template name="example">
    Hello world!
</template>
  ```

1. `jst_compiler ./example.jst`


##Подключение в браузере

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

##Использование в nodejs
  ```JavaScript
require('./all.jst.js'); // Скомпилированные шаблоны и ядро
...
var content = jst('example');
  ```
  
## Передача и вставка параметров
Для вывода данных в шаблоне используется запись`<%= data %>`.
Значения null или undefined заменяются на пустую строку, HTML при вставки экранируется.

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
    <h2><%= title %></h1>
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
    <%= template('another_template', x) %>
</template>

<template name="another_template" params="x">
    ...
</template>
  ```

## Блоки(подшаблоны) и вызов блока
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

    <%= block('block1', x) %>
    <%= block('block2') %>

</template>
  ```

## Циклы в шаблонах
  ```HTML
<template name="for" params="items">
    ...
    <%= each('item', items) %>
    ...
</template>
        
<template name="item" params="element, index">
    ...
    <%= element %>
    ...
</template>
  ```
  
### Вызов шаблона в цикле
  ```JavaScript
// Обычный способ
var content = jst.each('item', [1, 2, 3]);

// Для jQuery
$('#content').jstEach('item', [1, 2, 3]);
```

### Циклы в блоках
  ```HTML
<template name="for" params="items">
    <block name="block" params="element, index">
        <%= element %>
    </block>

    <%= eachBlock('block', items) %>

</template>
  ```

### Вызов блока в цикле
  ```HTML
<script>
    // Обычный способ
    var content = jst.eachBlock('for', 'item', [1, 2, 3]);
    
    // Для jQuery
    $('#content').jstEachBlock('for', 'item', [1, 2, 3]);
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

    <%= block('block1', x) %>
    <%= block('block2') %>

</template>

<template name="two" params="x" extend="one">
    <%= block('block1', x) %>
</template>
  ```
  
## Фильтры
Фильтр позволяет преобразовать данные перед их вставкой в шаблон.

По умолчанию на весь вывод данных накладывается фильтр `_undef` (замена `null` и `undefined` на пустую строку). 
При использовании записи вида `<%= a %>` накладывается фильтр `html`.

Короткая запись фильтра - `<%= data | trim %>`  
Длинная - `<%= filter.trim(data) %>` 

Можно указывать несколько фильтров, порядок выполнения - слева направо. 
`<%= data | stripTags | trim | truncate(8) %>` 
`<%= filter.truncate(filter.trim(filter.stripTags(data), 8))) %>`

## Поддерживаемые фильтры
###trim
Удалить пробелы с начала и конца строки:  
`<%= '  hello  world!  ' | trim %>` → `hello world!`
        
###ltrim
Удалить пробелы с начала строки:  
`<%= '  hello  world!  ' | ltrim %>` → `hello world!  `

###rtrim
Удалить пробелы с конца строки:  
`<%= '  hello  world!  ' | rtrim %>` → `  hello world!`

###truncate
Обрезать строку до нужной длины:  
`<%= '1234567' | truncate(3) %>` → `123`

###upper
Перевести символы в верхний регистр:  
`<%= 'john' | upper %>` → `JOHN`
    
###lower
Перевести символы в нижний регистр:  
`<%= 'HoUsE' | lower %>` → `house`

###ucfirst
Первый символ в верхний регистр:  
`<%= 'alice' | ucfirst %>` → `Alice`
    
###lcfirst
Первый символ в нижний регистр:  
`<%= 'Dog' | lcfirst %>` → `dog`
        
###first
Вывести первый элемент массива или первый символ строки:  
`<%= [2, 3, 4] | first %>` → `2`  
`<%= 'Cat' | first %>` → `C`

###last
Вывести последний элемент массива или последний символ строки:  
`<%= [2, 3, 4] | last %>` → `4`  
`<%= 'Cat' | last %>` → `t`

###prepend
Добавить строку перед значением:  
`<%= 'world!' | prepend('Hello ') %>` → `Hello world!`

###append
Добавить строку после значения:  
`<%= 'Hello ' | append('world!') %>` → `Hello world!`

###repeat
Повторить строку нужное количество раз:  
`<%= 'many ' | repeat(3) %>` → `many many many `
    
###remove
Удалить текст по регулярному выражению:  
`<%= 'hello world!' | remove('l') %>` → `heo word!`
    
###replace
Заменить текст по регулярному выражению:  
`<%= 'Hello boss!' | replace('boss', 'Duck') %>` → `Hello Duck!`
        
###collapse
Удалить повторяющиеся пробелы:  
`<%= 'Dog' | collapse %>` → `dog`
    
###stripTags
Удалить HTML-теги:  
`<%= '<p>123</p>' | stripTags %>` → `123`

###join
Склеить массив в строку:  
`<%= [1, 2, 3] | join(' ') %>` → `1 2 3`

###html
Экранировать HTML:  
`<%= '<p>123</p>' %>` → `&lt;p&gt;123&lt;/p&gt;`  
`<%= '<p>123</p>' | html %>` → `&amp;lt;p&amp;gt;123&amp;lt;/p&amp;gt;` - двойное экранирование  
`<%!  '<p>123</p>' %>` → `<p>123</p>`  
`<%!  '<p>123</p>' | html %>` → `&lt;p&gt;123&lt;/p&gt;`

###unhtml
Разэкранировать HTML:  
`<%= data | unhtml %>`
        
###uri    
Экранировать урл:  
`<%= myUrl | uri %>`

###void
Запретить вывод значения:  
`<%= data | void %>`
        
###Как добавить свой фильтр?
  ```JavaScript
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
В случае ошибки, шаблон в результирующий код не включается,  вместо этого вставляется `console.warn('...')` с названием шаблона и описанием ошибки.

При вызове в коде неизвестного шаблона генерируется исключение.

Отладка в шаблонах:
  ```HTML
<template name="example" params="data">
    <% console.log(data) %>
</template>
  ```


## Лицензия
The MIT License (MIT)

Copyright (c) 2013-2014 Денис Селезнев <hcodes@yandex.ru>

Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (в дальнейшем именуемыми «Программное Обеспечение»), безвозмездно использовать Программное Обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, добавление, публикацию, распространение, сублицензирование и/или продажу копий Программного Обеспечения, также как и лицам, которым предоставляется данное Программное Обеспечение, при соблюдении следующих условий:

Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного Обеспечения.

ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ, НО НЕ ОГРАНИЧИВАЯСЬ ГАРАНТИЯМИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ ПРАВ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО ИСКАМ О ВОЗМЕЩЕНИИ УЩЕРБА, УБЫТКОВ ИЛИ ДРУГИХ ТРЕБОВАНИЙ ПО ДЕЙСТВУЮЩИМ КОНТРАКТАМ, ДЕЛИКТАМ ИЛИ ИНОМУ, ВОЗНИКШИМ ИЗ, ИМЕЮЩИМ ПРИЧИНОЙ ИЛИ СВЯЗАННЫМ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ ИЛИ ИСПОЛЬЗОВАНИЕМ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫМИ ДЕЙСТВИЯМИ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ.
