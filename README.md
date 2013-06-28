# jst
Клиентский и серверный шаблонизатор на JavaScript
  
Возможности:
+ Блоки (подшаблоны)
+ Блочное наследование
+ Расширяемые фильтры
+ Параметры для шаблонов
+ Параметры по умолчанию
+ Экранирование тегов по умолчанию

## Установка
    git clone https://github.com/hcodes/jst.git
    cd ./jst
    npm install ./ -g
  
## Использование в коммандной строке
`jst_compiler -v`  - версия компилятора
  
`jst_compiler ./example.jst` - компиляция одного шаблона в файл -> ./example.jst.js 

`jst_compiler ./example.jst ./other_example.jst.js` - компиляция одного шаблона в файл -> ./example.jst.js  

`jst_compiler ./examples` - компиляция папки с шаблонами

`jst_compiler -a ./examples ./all.jst.js` - компиляция папки с шаблонами в один файл

`jst_compiler -a -p ./examples ./all.jst.js` - компиляция папки с шаблонами в один файл со вставкой jst.js

    
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
            
## Отладка 
При компиляции каждый шаблон выполняется с помощью eval, ошибки выводятся в коммандную строку.
Также в скомпилированный шаблон вставляются ошибки компиляции как console.warn('...').

При вызове неизвестного шаблона генерируется исключение.

Отладка шаблонов:
      <template name="example" params="data">
            <% console.log(data); %>
      </template>
