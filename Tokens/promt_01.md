## 9. Первый промпт-задача для Codex 
Привет! Все начиналось со звонка менеджера. он срочно просил сделать презентацию из старой. я посмотрел, и понял что лучше сделать с нуля. Это гораздо быстрей, чем исправлять ошибки старой. перечислены ошибки в старой презентации,  D:\!PROJECTS\RASSON\Victory 2_PLUS_9F_BLACK\Victory 2Ф_JPG_presentation\PRESENTATION_ANTI_PATTERNS.md. Я весь день собирал материал и готовил описание. обдумывал всё. Это большая задумка, но все реально сделать за вечер. Теперь я готов передать тебе в работу всё. Ознакомся внимательно, уточним непонятные моменты ели нужно. и составим план работы на вечер. Работает над планом
и структурой лучшая модель Sol, выполняет пункты уже более слабые. Terra, luna. Я уже подсобрал мысли в кучку пока собирал материал

Прочитай @CODEX_SEED.md и @DESIGN_SYSTEM.md.

Задача slice 1:
1) Scaffold Vite + TypeScript.
2) Подключи fonts из ⟦PATH/fonts⟧.
3) Создай src/styles/tokens.css строго по DESIGN_SYSTEM §15 (--wb-*).
4) Сверстай пустой shell: .wb-deck + 2 dummy .wb-slide (cover + closing) full viewport.
5) data-wb-theme="home" data-wb-variant="dark".
6) README: scripts dev/build.

Не подключай Next.js. Не используй shadcn на client slides.
Не выдумывай specs стола. После slice 1 остановись и покажи tree.
```

Следующие slice (не делать в первом сообщении, пока slice 1 не ок):
- slice 2: types + deck.json эталона из `⟦brief⟧` + narrative 12 slides  
- slice 3: renderer всех archetypes  
- slice 4: print.css + `npm run export:pdf`  
- slice 5: /console toggles  
- slice 6: $impeccable polish  