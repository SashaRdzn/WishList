# Wishlist Frontend

Vue.js приложение для управления списками желаний.

## Локальная разработка

```bash
npm install
npm run dev
```

Приложение будет доступно на `http://localhost:5173`

## Переменные окружения

Создайте файл `.env.local` в корне папки `client`:

```
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
```

## Деплой на Netlify

1. Подключите репозиторий к Netlify
2. Укажите:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
3. Добавьте переменные окружения в настройках Netlify:
   - `VITE_API_URL` - URL вашего API (например: `https://api.example.com/api`)
   - `VITE_API_BASE_URL` - Базовый URL для статических файлов (например: `https://api.example.com`)

Подробная инструкция в файле `DEPLOY.md` в корне проекта.
