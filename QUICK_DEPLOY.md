# Быстрый деплой на Netlify

## Шаг 1: Деплой Backend (Railway/Render)

1. Создайте аккаунт на [Railway](https://railway.app) или [Render](https://render.com)
2. Подключите GitHub репозиторий
3. Укажите папку `backend` как root directory
4. Добавьте переменные окружения:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=random_secret_key_here
   NODE_ENV=production
   FRONTEND_URL=https://your-netlify-site.netlify.app
   ```
5. Сохраните URL вашего бэкенда (например: `https://your-app.railway.app`)

## Шаг 2: Деплой Frontend на Netlify

1. Зайдите на [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Подключите GitHub репозиторий
4. Настройки билда:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
5. В "Advanced" → "Environment variables" добавьте:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   VITE_API_BASE_URL=https://your-app.railway.app
   ```
   (Замените на ваш URL бэкенда!)
6. Нажмите "Deploy site"

## Шаг 3: Обновите FRONTEND_URL на бэкенде

1. После деплоя Netlify выдаст URL (например: `https://amazing-site.netlify.app`)
2. Вернитесь в настройки бэкенда и обновите:
   ```
   FRONTEND_URL=https://amazing-site.netlify.app
   ```
3. Перезапустите бэкенд

## Готово! 🎉

Ваше приложение должно работать!

