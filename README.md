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
`jst_compiler ./example.jst` - компиляция одного шаблона в файл ./example.jst.js 

`jst_compiler ./example.jst ./file.jst.js` - компиляция одного шаблона в файл ./file.jst.js  

`jst_compiler ./examples` - компиляция папки с шаблонами в файл ./all.jst.js

`jst_compiler ./examples ./examples.jst.js` - компиляция папки с шаблонами в файл ./examples.jst.js

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
1. Подключаем на странице:
  ```HTML
<!-- Скомпилированные шаблоны и jst-ядро -->
<script src="./all.jst.js"></script>
...
<script>
    document.getElementById('footer').innerHTML = jst('footer');
    // или для jQuery
    $('#footer').jst('footer');
</script>
  ```

## Пример шаблона (example.jst):
  ```HTML
<!-- Простейший шаблон -->
<template name="example">
    Hello world!
</template>
  ````
  
## Передача и вставка параметров
Для вывода данных в шаблоне используется запись`<%= myVar %>`.
Значения null или undefined заменяются на пустую строку.
HTML при вставки экранируется.

Для вставки без экранирования HTML используется запись `<%! myVar %>`.
  ```HTML
  <template name="example" params="word">
    Hello <%= word %>! <!-- С экранированием HTML -->
  </template>

  <template name="example" params="word">
    Hello <%! word %>! <!-- Без экранирования HTML -->
  </template>
  ````
  
## Параметры по умолчанию
  ```HTML
  <template name="example" params="word = 'world'">
    Hello <%= world %>!
  </template>
  ````
  
## Условия
    <template name="example" params="x">
        <% if (x) { %>
            Yes
        <% } else {%>
            No
        <% } %>
    </template>

## Использование JavaScript в шаблонах
    <template name="example" params="word">
        Hello<% var b = word || 'world'; %> <%= b %>!
    </template>
      
## Комментарии 
    <template name="example" params="word">
        Hello <%# мой комментарий %>!
    </template>
            
## Вызов шаблона из шаблона
    <template name="example" params="x">
        <%= template('another_template', x) %>
    </template>

    <template name="another_template" params="x">
        ...
    </template>

## Вызов блока
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

## Циклы в шаблонах
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

### Вызов цикличного шаблона
    <script>
        ...
        // Обычный способ
        var content = jst.each('item', [1, 2, 3]);
        
        // Для jQuery
        $('#content').jstEach('item', [1, 2, 3]);
        ...
    </script>

## Циклы в блоках
    <template name="for" params="items">
        <block name="block" params="element, index">
            <%= element %>
        </block>

        <%= eachBlock('block', items) %>

    </template>

### Вызов цикличного шаблона
    <script>
        // Обычный способ
        var content = jst.eachBlock('for', 'item', [1, 2, 3]);
        
        // Для jQuery
        $('#content').jstEachBlock('for', 'item', [1, 2, 3]);
    </script>

## Сохранение пробелов между jst-тегами
    <template name="example" params="x, y">
        <%= x %> hello world! <%= y %> <!-- xhello world!y -->
        <%= x +%> hello world!  <%= y %> <!-- x hello world!y -->
        <%= x +%> hello world!  <%=+ y %> <!-- x hello world! y -->
    </template>      

## Фильтры
Фильтр позволяет преобразовать данные перед их вставкой в шаблон.

По умолчанию на весь вывод данных накладывается фильтр _undef (замена null и undefined на пустую строку).
При использовании записи вида '<%= a %>' накладывается фильтр html.

Короткая запись фильтра - `<%= myVar | trim %>`
Длинная - `<%= filter.trim(myVar) %>`

Можно указывать несколько фильтров, порядок выполнения слева направо.
`<%= myVar | stripTags | trim | truncate(8) %>`
`<%= filter.truncate(filter.trim(filter.stripTags(myVar), 8))) %>`

## Поддерживаемые фильтры
###trim
Удалить пробелы с начала и конца строки  
`<%= myVar | trim %>`  
`<%= '  hello  world!  ' | trim %>` -> 'hello world!'  
        
###truncate
Обрезать строку до нужной длины  
`<%= myVar | truncate(length) %>`  
`<%= '1234567' | truncate(3) %>` -> '123'

###upper
Перевести символы в верхний регистр  
`<%= myVar | upper %>`  
`<%= 'john' | upper %>` -> 'JOHN'  
    
###lower
Перевести символы в нижний регистр  
`<%= myVar | lower %>`  
`<%= 'HoUsE' | lower %>` -> 'house'

###ucfirst
Первый символ в верхний регистр  
`<%= myVar | ucfirst %>`  
`<%= 'alice' | ucfirst %>` -> 'Alice'
    
###lcfirst
Первый символ в нижний регистр  
`<%= myVar | lcfirst %>`  
`<%= 'Dog' | lcfirst %>` -> 'dog'
        
###first
Вывести первый элемент массива или первый символ строки
`<%= myVar | first %>`  
`<%= [2, 3, 4] | first %>` -> '2'
`<%= 'Cat' | first %>` -> 'C'

###last
Вывести последний элемент массива или последний символ строки
`<%= myVar | last %>`  
`<%= [2, 3, 4] | last %>` -> '4'
`<%= 'Cat' | last %>` -> 't'

###prepend
Добавить строку перед значением
`<%= myVar | prepend(string) %>`  
`<%= 'world!' | prepend('Hello ') %>` -> 'Hello world!'

###append
Добавить строку после значения
`<%= myVar | append(string) %>`  
`<%= 'Hello ' | prepend('world!') %>` -> 'Hello world!'

###repeat
Повторить строку нужное количество раз  
`<%= myVar | repeat(count) %>`  
`<%= 'many ' | repeat(3) %>` -> 'many many many '  
    
###remove
Удалить текст по регулярному выражению   
`<%= myVar | remove(regexp) %>`  
`<%= 'hello world!' | remove('l') %>` -> 'heo word!'
    
###replace
Заменить текст по регулярному выражению  
`<%= myVar | replace(search, replace) %>`  
`<%= 'Hello boss!' | replace('boss', 'Duck') %>` -> 'Hello Duck!'
        
###indent
К переносам строки добавить нужный отступ  
`<%= myVar | repeat(padding) %>`  
`<%= '1.\n2.\n3.' | repeat(' ') %>` -> '   1.\n 2.\n 3.'

###collapse
Удалить повторяющиеся пробелы  
`<%= myVar | collapse %>`  
`<%= 'Dog' | collapse %>` -> 'dog'
    
###stripTags
Удалить HTML-теги  
`<%= myVar | stripTags %>`  
`<%= '<p>123</p>' | stripTags %>` -> '123'

###join
Склевание массива в строку
`<%= myVar | join(string) %>`  
`<%= [1, 2, 3] | join(' ') %>` -> '1 2 3'

###html
Экранирование HTML  
`<%= '<p>123</p>' %>` -> "&lt;p&gt;123&lt;/p&gt;"   
`<%= myVar | html %>` -> "&amp;lt;p&amp;gt;123&amp;lt;/p&amp;gt;" - двойное экранирование  
`<%!  '<p>123</p>' %>` -> "<p>123</p>"  
`<%!  myVar | html %>` -> "&lt;p&gt;123&lt;/p&gt;"

###unhtml
Разэкранировать HTML  
`<%= myVar | unhtml %>`
        
###uri    
Экранировать урл  
`<%= myUrl | uri %>`

###void
Запрет вывода значения
`<%= myVar | void %>`

###json
Вывести json - JSON.stringify(object)
`<%= myVar | json %>`  
`<%= [1, 2, 3] |  json %>` -> '[1, 2, 3]'
        
###log
Вывести значение в шаблон и в консоль (console.log)
`<%= myVar | log %>`  

###_undef (для служебного использования)
Заменить undefined или null на пустую строку, данный фильтр используется по умолчанию при любой вставки данных  
`<%= null %>` -> ''  
`<%! null %>` -> ''  
`<%= undefined %>` -> ''  
`<%! undefined %>` -> ''          
        
###Как добавить свой фильтр?
    ```JavaScript
        jst.filter.myFilter = function (str, param1, param2, ...) {
            //...
            return str;
        };
    ```

## Отладка 
После компиляции каждый шаблон выполняется с помощью eval.
В случае ошибки, шаблон в результирующий код не включается,  вместо этого вставляется console.warn('...') с описанием ошибки.

При вызове в коде неизвестного шаблона генерируется исключение.

Отладка в шаблонах:
    ```HTML
    <template name="example" params="data">
         <% console.log(data) %>
    </template>
    ```
