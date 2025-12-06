# Инструкция по деплою на Netlify

## Архитектура

Проект состоит из двух частей:
- **Frontend** (Vue.js) - деплоится на Netlify
- **Backend** (Node.js/Express) - деплоится на отдельный сервис (Railway, Render, или другой)

## Деплой Frontend на Netlify

### 1. Подготовка

1. Убедитесь, что все изменения закоммичены в Git
2. Перейдите в папку `client`:
   ```bash
   cd client
   ```

### 2. Создание сайта на Netlify

1. Зайдите на [netlify.com](https://netlify.com) и войдите в аккаунт
2. Нажмите "Add new site" → "Import an existing project"
3. Подключите ваш Git репозиторий
4. Настройте билд:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

### 3. Настройка переменных окружения

В настройках сайта на Netlify (Site settings → Environment variables) добавьте:

```
VITE_API_URL=https://ваш-бэкенд-урл.com/api
VITE_API_BASE_URL=https://ваш-бэкенд-урл.com
```

**Важно**: Замените `https://ваш-бэкенд-урл.com` на реальный URL вашего бэкенда после его деплоя.

### 4. Деплой

Netlify автоматически задеплоит сайт при пуше в Git. Или нажмите "Deploy site" вручную.

## Деплой Backend

### Вариант 1: Railway (рекомендуется)

1. Зайдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте сервис из GitHub репозитория
4. Выберите папку `backend`
5. Настройте переменные окружения:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   ```
6. Railway автоматически определит Node.js проект и запустит `npm start`

### Вариант 2: Render

1. Зайдите на [render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Добавьте переменные окружения (как в Railway)
6. После деплоя получите URL вашего бэкенда

### Вариант 3: Другой сервис

Любой сервис, поддерживающий Node.js (Heroku, Vercel Serverless Functions, и т.д.)

## Переменные окружения для Backend

Создайте файл `.env` в папке `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wishlist
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
```

**Важно**: 
- `MONGODB_URI` - строка подключения к MongoDB (можете использовать MongoDB Atlas для production)
- `JWT_SECRET` - секретный ключ для JWT токенов (используйте случайную строку)
- Не коммитьте файл `.env` в Git!

## Настройка CORS

Убедитесь, что в `backend/src/app.js` CORS настроен правильно:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Добавьте переменную окружения `FRONTEND_URL` на бэкенде с URL вашего Netlify сайта.

## Проверка деплоя

1. Проверьте, что frontend доступен по адресу Netlify
2. Проверьте, что backend отвечает на запросы (например, `/api/health`)
3. Попробуйте зарегистрироваться и создать подарок
4. Проверьте, что изображения загружаются правильно

## Обновление переменных окружения

Если вы изменили URL бэкенда:

1. Обновите `VITE_API_URL` и `VITE_API_BASE_URL` в Netlify
2. Пересоберите сайт (Netlify сделает это автоматически или нажмите "Trigger deploy")

## MongoDB

Для production рекомендуется использовать MongoDB Atlas:
1. Создайте аккаунт на [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте кластер
3. Получите connection string
4. Добавьте его в `MONGODB_URI` на бэкенде

## Troubleshooting

### Ошибки CORS
- Убедитесь, что `FRONTEND_URL` на бэкенде указывает на ваш Netlify сайт
- Проверьте, что CORS включен в настройках бэкенда

### Изображения не загружаются
- Проверьте, что `VITE_API_BASE_URL` указан правильно
- Убедитесь, что бэкенд правильно отдает статические файлы из `/uploads`

### Ошибки аутентификации
- Проверьте, что `JWT_SECRET` одинаковый (если используете несколько инстансов)
- Убедитесь, что токены сохраняются в localStorage

## Полезные ссылки

- [Netlify документация](https://docs.netlify.com/)
- [Railway документация](https://docs.railway.app/)
- [Render документация](https://render.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

