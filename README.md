# jst
===

  jst - шаблонизатор на JavaScript
  
Возможности:
+ Блоки (подшаблоны)
+ Блочное наследование
+ Расширяемые фильтры
+ Параметры для шаблонов
+ Параметры по умолчанию
+ Экранирование тегов по умолчанию
  
## Использование в коммандной строке
  node ./jst_compiler.js -v  - версия компилятора  

  компиляция одного шаблона в файл -> ./example.jst.js  
  node ./jst_compiler.js ./example.jst  
  
  компиляция одного шаблона в файл -> ./example.jst.js  
  node ./jst_compiler.js ./example.jst ./other_example.jst.js
  
  компиляция папки с шаблонами
  node ./jst_compiler.js ./examples
  
  компиляция папки с шаблонами в один файл
  node ./jst_compiler.js -a ./examples ./all.jst.js
    
  
## Пример шаблона (example.jst):
      <!-- Простейший шаблон -->
      <template name="example">
        Hello world!
      </template>

## Передача и вставка параметра
      <template name="example" params="word">
        Hello <%= word %>!
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
        <%= filter.html(x) %>
      </template>
      
## Вызов другого шаблона
      <template name="example" params="x">
        <%= template('another_template', x) %>
      </template>

## Не удалять пробелы между HTML-тегами и тегами шаблонизатора
В примере, если x=1 и y=2 => '1 2', без + => '12'
      <template name="example" params="x">
        <%= filter.html(x) +%> <%=+ y %>
      </template>      

## Цикличный шаблон
      <template name="another_template" params="element, index, obj">
        <ul>
            <li>
                <%= index + 1 %>. <%= filter.html(element) %>
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
После компиляции каждый шаблон выполняется с помощью eval, ошибки выводятся в коммандную строку.
Также в скомпилированный шаблон вставляются ошибки компиляции как console.warn('...').

При вызове неизвестного шаблона генерируется исключение.

Отладка шаблонов:
      <template name="example" params="data">
            <% console.log(data); %>
      </template>
