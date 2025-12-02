# Backend - Инструкция по настройке

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка переменных окружения

Создайте файл `.env` в корне папки `backend` со следующим содержимым:

```env
# MongoDB подключение
# Для локальной MongoDB:
MONGODB_URI=mongodb://localhost:27017/wishlist

# Или для MongoDB Atlas (облачная база):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wishlist

# Секретный ключ для JWT (используйте случайную строку)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Порт сервера
PORT=5000

# Режим работы
NODE_ENV=development
```

### Как получить MongoDB URI:

**Локальная установка:**
1. Установите MongoDB: https://www.mongodb.com/try/download/community
2. Запустите MongoDB сервис
3. Используйте: `mongodb://localhost:27017/wishlist`

**MongoDB Atlas (рекомендуется для начала):**
1. Зайдите на https://www.mongodb.com/cloud/atlas
2. Создайте бесплатный аккаунт
3. Создайте новый кластер (бесплатный)
4. Нажмите "Connect" → "Connect your application"
5. Скопируйте Connection String
6. Замените `<password>` на ваш пароль пользователя
7. Добавьте название базы данных в конце: `/wishlist`

## Шаг 3: Запуск сервера

```bash
# Режим разработки (с автоматической перезагрузкой)
npm run dev

# Или обычный запуск
npm start
```

Сервер будет доступен на http://localhost:5000

## Структура API

### Авторизация
- `POST /api/auth/register` - Регистрация
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Вход
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Получить информацию о текущем пользователе
  Требует заголовок: `Authorization: Bearer <token>`

### Подарки (требуют авторизации)
- `GET /api/wishes` - Получить все подарки
- `POST /api/wishes` - Создать подарок
  - Формат: `multipart/form-data`
  - Поля: `title` (обязательно), `image` (опционально)
- `PUT /api/wishes/:id` - Обновить подарок
- `DELETE /api/wishes/:id` - Удалить подарок

## Папки и файлы

- `public/uploads/` - автоматически создается для хранения загруженных изображений
- Изображения доступны по адресу: `http://localhost:5000/uploads/filename.jpg`

