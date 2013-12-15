# jst
Клиентский и серверный шаблонизатор на JavaScript
  
Возможности:
+ Быстрота
+ Блочное наследование
+ Блоки (подшаблоны)
+ Параметры для шаблонов
+ Расширяемые фильтры
+ Параметры по умолчанию
+ Экранирование тегов по умолчанию


## Установка
`npm install jst_compiler -g`
  
## Использование в коммандной строке
`jst_compiler -v`  - версия компилятора
  
`jst_compiler ./example.jst` - компиляция одного шаблона в файл -> ./example.jst.js 

`jst_compiler ./example.jst ./other_example.jst.js` - компиляция одного шаблона в файл -> ./example.jst.js  

`jst_compiler ./examples` - компиляция папки с шаблонами

`jst_compiler -a ./examples ./all.jst.js` - компиляция папки с шаблонами в один файл

`jst_compiler -a -p ./examples ./all.jst.js` - компиляция папки с шаблонами в один файл со вставкой jst.js


## Быстрый старт
1. `npm install jst_compiler -g`
1. Создаём файл с расширением .jst - `example.jst`
1. Содержание файла:
  ```HTML
  <template name="example">
    Hello world!
  </template>
  ```

1. `jst_compiler example.jst example.jst.js`
1. Подключаем в странице
  ```HTML
  ...  
  <!-- Скомпилированные шаблоны -->
  <script type="text/javascript" src="/js/example.jst.js"></script>
  ...
  ```

1. Вызов в js-коде:
  ```JavaScript
    $('#container').jst('example');
  ```

## Пример шаблона (example.jst):
      <!-- Простейший шаблон -->
      <template name="example">
        Hello world!
      </template>

## Передача и вставка параметра
      <template name="example" params="word">
        Hello <%= word %>!
      </template>

## Передача и вставка параметра без экранирования HTML
    <template name="example" params="word">
    Hello <%! word %>!
    </template>

## Параметры по умолчанию
      <template name="example" params="word = 'world'">
        Hello <%= world %>!
      </template>

## Инлайн-js
      <template name="example" params="word">
        Hello<% var b = word || 'world'; %> <%= b %>!
      </template>
      
## Комментарии 
      <template name="example" params="word">
        Hello <%# мой комментарий %>!
      </template>
      
## Более подробно
      <template name="example" namespace="Tpl._cache" params="x, y, z" trim="false">
        x: <%= x %><br />
        <% if (y > 5) { %>
        y: <%= y %><br />
        <% } %>
        z: <%= z - 10 %>
      </template>

## Использование фильтра
      <template name="example" params="x">
        <%= filter.trim(x) %>
      </template>
      
## Вызов другого шаблона
      <template name="example" params="x">
        <%= template('another_template', x) %>
      </template>

## Не удалять пробелы между HTML-тегами и тегами шаблонизатора
В примере, если x=1 и y=2 => '1 2', без + => '12'
      <template name="example" params="x">
        <%= x +%> <%=+ y %>
      </template>      

## Цикличный шаблон
      <template name="another_template" params="element, index, obj">
        <ul>
            <li>
                <%= index + 1 %>. <%= element %>
            </li>
        </ul>
      </template>
      В js: jst.forEach('example', data);
      
## Вызов цикла внутри шаблона
      <template name="example" params="data">
        ...
            <%= forEach('another_template', data) %>
        ...
      </template>
            
## Вывод данных
Для вывода данных в шаблоне используется запись`<%= myVar %>`.

Значения null или undefined заменяются на пустую строку.
`<%= null %>` -> ''
`<%= undefined %>` -> ''

По умолчанию всё экранируется.
`<%= '<p></p>' %>` -> '&lt;p&gt;&lt;/p&gt;'

Для вставки без экранирования используется запись `<%! myVar %>`.
`<%! '<p></p>' %>` -> '<p></p>'

## Фильтры
Фильтр позволяет преобразовать данные перед их вставкой в шаблон.

По умолчанию на весь вывод данных накладывается фильтр _undef (замена null и undefined на пустую строку).
При использовании записи вида '<%= a %>' накладывается фильтр html.

Короткая запись фильтры - `<%= myVar | trim %>`
Длинная - `<%= filter.trim(myVar) %>`

Можно указывать несколько фильтров, порядок выполнения слева направо.
`<%= myVar | stripTags | trim | truncate(8) %>`
`<%= filter.truncate(filter.trim(filter.stripTags(myVar), 8))) %>`

## Поддерживаемые фильтры
###trim
Удалить пробелы с начала и конца строки  
`<%= myVar | trim %>`  
`<%= '  hello  world!  ' %>` -> 'hello world!'  
        
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
        
###repeat
Повторить строку нужное количество раз  
`<%= myVar | repeat(count) %>`  
`<%= 'many ' | repeat(3) %>` -> 'many many many '  
    
###remove
Удалить текст по регулярному выражению   
`<%= myVar | remove(regexp) %>`  
`<%= 'hello world!' | remove('l') %>` -> 'hello word!'
    
###replace
Заменить текст по регулярному выражению  
`<%= myVar | replace(search, replace) %>`  
`<%= 'Hello boss!' | replace('boss', 'Duck') %>` -> 'Hello Duck!'
        
###indent
К переносам строки добавить нужный отступ  
`<%= myVar | repeat(padding) %>`  
`<%= '1.\n2.\n3.' | repeat('   ') %>` -> '   1.\n   2.\n   3.'

###collapse
Удалить повторяющиеся пробелы  
`<%= myVar | collapse %>`  
`<%= 'Dog' | collapse %>` -> 'dog'
    
###stripTags
Удалить HTML-теги  
`<%= '<p>123</p>' | stripTags %>` -> '123'

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
## TODO
+ отключения сжатия внутри тегов script, pre, code и пр.
