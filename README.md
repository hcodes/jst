# jst
Клиентский и серверный шаблонизатор на JavaScript
  
Возможности:
+ Быстрота
+ Параметры для шаблонов и блоков
+ Параметры по умолчанию
+ Фильтры и возможность их расширения
+ Блоки (подшаблоны)
+ Блочное наследование
+ Экранирование HTML по умолчанию

## Установка
`npm install jst_compiler -g`
  
## Использование в коммандной строке
`jst_compiler ./example.jst` - компиляция одного шаблона в файл `./example.jst.js` 

`jst_compiler ./example.jst ./file.jst.js` - компиляция одного шаблона в файл `./file.jst.js`  

`jst_compiler ./examples` - компиляция папки с шаблонами в файл `./all.jst.js`

`jst_compiler ./examples ./examples.jst.js` - компиляция папки с шаблонами в файл `./examples.jst.js`

`jst_compiler -h` - вызов справки

`jst_compiler -v` - версия компилятора

## Быстрый старт
1. `npm install jst_compiler -g`
1. Создаём файл с расширением .jst - `example.jst`
1. Содержание файла:
  ```HTML
<template name="example">
    Hello world!
</template>
  ```

1. `jst_compiler ./example.jst`


##Подключение в браузере
  ```HTML
<!-- Скомпилированные шаблоны и jst-ядро -->
<script src="./all.jst.js"></script>
...
<div id="example"></div>
...
<script>
    document.getElementById('footer').innerHTML = jst('footer');
    // или для jQuery
    $('#example').jst('example');
</script>
  ```

##Использование в nodejs
  ```JavaScript
require('./templates/all.jst.js');
...
var content = jst('example');
  ```
  
## Передача и вставка параметров
Для вывода данных в шаблоне используется запись`<%= data %>`.
Значения null или undefined заменяются на пустую строку.
HTML при вставки экранируется.

Для вставки без экранирования HTML используется запись `<%! data %>`.
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
<template name="example" params="word = 'world'">
    Hello <%= world %>!
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
  
### Вызов цикличного шаблона
  ```JavaScript
// Обычный способ
var content = jst.each('item', [1, 2, 3]);

// Для jQuery
$('#content').jstEach('item', [1, 2, 3]);
```

## Циклы в блоках
  ```HTML
<template name="for" params="items">
    <block name="block" params="element, index">
        <%= element %>
    </block>

    <%= eachBlock('block', items) %>

</template>
  ```

### Вызов цикличного шаблона
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

## Сохранение пробелов между jst-тегами
  ```HTML
<template name="example" params="x, y">
    <%= x %> hello world! <%= y %> <!-- xhello world!y -->
    <%= x +%> hello world!  <%= y %> <!-- x hello world!y -->
    <%= x +%> hello world!  <%=+ y %> <!-- x hello world! y -->
</template>      
  ```
  
## Фильтры
Фильтр позволяет преобразовать данные перед их вставкой в шаблон.

По умолчанию на весь вывод данных накладывается фильтр _undef (замена null и undefined на пустую строку).
При использовании записи вида '<%= a %>' накладывается фильтр html.

Короткая запись фильтра - `<%= data | trim %>`
Длинная - `<%= filter.trim(data) %>`

Можно указывать несколько фильтров, порядок выполнения слева направо.
`<%= data | stripTags | trim | truncate(8) %>`
`<%= filter.truncate(filter.trim(filter.stripTags(data), 8))) %>`

## Поддерживаемые фильтры
###trim
Удалить пробелы с начала и конца строки  
`<%= data | trim %>`  
`<%= '  hello  world!  ' | trim %>` → `hello world!`
        
###ltrim
Удалить пробелы с начала строки
`<%= data | ltrim %>`  
`<%= '  hello  world!  ' | trim %>` → `hello world!  `

###rtrim
Удалить пробелы с конца строки
`<%= data | ltrim %>`  
`<%= '  hello  world!  ' | trim %>` → `  hello world!`  

###truncate
Обрезать строку до нужной длины  
`<%= data | truncate(length) %>`  
`<%= '1234567' | truncate(3) %>` → `123`

###upper
Перевести символы в верхний регистр  
`<%= data | upper %>`  
`<%= 'john' | upper %>` → `JOHN`
    
###lower
Перевести символы в нижний регистр  
`<%= data | lower %>`  
`<%= 'HoUsE' | lower %>` → `house`

###ucfirst
Первый символ в верхний регистр  
`<%= data | ucfirst %>`  
`<%= 'alice' | ucfirst %>` → `Alice`
    
###lcfirst
Первый символ в нижний регистр  
`<%= data | lcfirst %>`  
`<%= 'Dog' | lcfirst %>` → `dog`
        
###first
Вывести первый элемент массива или первый символ строки
`<%= data | first %>`  
`<%= [2, 3, 4] | first %>` → `2`
`<%= 'Cat' | first %>` → 'C'

###last
Вывести последний элемент массива или последний символ строки
`<%= data | last %>`  
`<%= [2, 3, 4] | last %>` → `4`
`<%= 'Cat' | last %>` → `t`

###prepend
Добавить строку перед значением
`<%= data | prepend(string) %>`  
`<%= 'world!' | prepend('Hello ') %>` → `Hello world!`

###append
Добавить строку после значения
`<%= data | append(string) %>`  
`<%= 'Hello ' | prepend('world!') %>` → `Hello world!`

###repeat
Повторить строку нужное количество раз  
`<%= data | repeat(count) %>`  
`<%= 'many ' | repeat(3) %>` → `many many many `  
    
###remove
Удалить текст по регулярному выражению   
`<%= data | remove(regexp) %>`  
`<%= 'hello world!' | remove('l') %>` → `heo word!`
    
###replace
Заменить текст по регулярному выражению  
`<%= data | replace(search, replace) %>`  
`<%= 'Hello boss!' | replace('boss', 'Duck') %>` → `Hello Duck!`
        
###collapse
Удалить повторяющиеся пробелы  
`<%= data | collapse %>`  
`<%= 'Dog' | collapse %>` → `dog`
    
###stripTags
Удалить HTML-теги  
`<%= data | stripTags %>`  
`<%= '<p>123</p>' | stripTags %>` → `123`

###join
Склевание массива в строку
`<%= data | join(string) %>`  
`<%= [1, 2, 3] | join(' ') %>` → `1 2 3`

###html
Экранирование HTML  
`<%= '<p>123</p>' %>` → `&lt;p&gt;123&lt;/p&gt;`  
`<%= data | html %>` → `&amp;lt;p&amp;gt;123&amp;lt;/p&amp;gt;` - двойное экранирование  
`<%!  '<p>123</p>' %>` → `<p>123</p>`
`<%!  data | html %>` → `&lt;p&gt;123&lt;/p&gt;`

###unhtml
Разэкранировать HTML  
`<%= data | unhtml %>`
        
###uri    
Экранировать урл  
`<%= myUrl | uri %>`

###void
Запрет вывода значения
`<%= data | void %>`

###json
Вывести json - JSON.stringify(object)
`<%= data | json %>`  
`<%= [1, 2, 3] |  json %>` → `[1, 2, 3]`
        
###log
Дополнительно выводим  данные и в консоль (console.log)
`<%= data | log %>`  

###_undef (для служебного использования)
Заменить `undefined` или `null` на пустую строку, данный фильтр используется по умолчанию при любой вставки данных.
        
###Как добавить свой фильтр?
  ```JavaScript
jst.filter.myFilter = function (str, param1, param2, ...) {
    //...
    return str;
};
  ```

## Отладка 
После компиляции каждый шаблон выполняется с помощью eval.
В случае ошибки, шаблон в результирующий код не включается,  вместо этого вставляется `console.warn('...')` с описанием ошибки.

При вызове в коде неизвестного шаблона генерируется исключение.

Отладка в шаблонах:
  ```HTML
<template name="example" params="data">
    <% console.log(data) %>
</template>
  ```
