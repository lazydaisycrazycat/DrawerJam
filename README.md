# Parcel Jam

Играбельный прототип Telegram Web Game на React, TypeScript и Vite. Игрок освобождает грузовики с поля и подбирает порядок выезда под фиксированную очередь цветных посылок.

## Возможности

- 5 вручную заданных и проверенных на решаемость уровней;
- поле 5×5 и 6×6 с проверкой свободного пути;
- очередь посылок и временная парковка на 4 места;
- автоматическая загрузка подходящих посылок;
- победа, поражение, Restart и Undo;
- сохранение открытого уровня в `localStorage`;
- безопасный адаптер Telegram Mini Apps SDK;
- управление мышью и касанием без внешней графики.

## Запуск

```bash
npm install
npm run dev
```

Production-сборка:

```bash
npm run build
```

Проверка решаемости уровней:

```bash
npx esbuild scripts/validate-levels.ts --bundle --platform=node --outfile=.level-validation.cjs
node .level-validation.cjs
```

В Telegram вызываются `WebApp.ready()` и `WebApp.expand()`. При запуске в обычном браузере Telegram API безопасно игнорируется.
