# Настройка MongoDB на Windows

## Вариант 1: MongoDB установлен, но не запущен

### Шаг 1: Найти папку установки MongoDB

Обычно MongoDB устанавливается в одну из этих папок:
- `C:\Program Files\MongoDB\Server\<версия>\bin\`
- `C:\MongoDB\bin\`

### Шаг 2: Запустить MongoDB вручную

Откройте PowerShell или CMD **от имени администратора** и выполните:

```powershell
# Перейдите в папку bin MongoDB (замените путь на ваш)
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Создайте папку для данных (если её нет)
mkdir C:\data\db

# Запустите MongoDB
.\mongod.exe
```

Оставьте это окно открытым - MongoDB будет работать.

### Шаг 3: Проверить подключение

Откройте **новое** окно терминала и выполните:

```powershell
cd "C:\Program Files\MongoDB\Server\7.0\bin"
.\mongo.exe
```

Если видите приглашение `>`, значит MongoDB работает!

## Вариант 2: Запуск MongoDB как службы Windows (рекомендуется)

### Шаг 1: Установить MongoDB как службу

Откройте PowerShell **от имени администратора**:

```powershell
# Перейдите в папку bin
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Установите как службу (создайте папку для данных сначала)
mkdir C:\data\db -Force
.\mongod.exe --install --dbpath="C:\data\db"
```

### Шаг 2: Запустить службу

```powershell
# Запустить службу
Start-Service MongoDB

# Или через GUI:
# Win+R → services.msc → найдите "MongoDB" → Правый клик → Запустить
```

### Шаг 3: Проверить статус

```powershell
Get-Service MongoDB
```

Должно быть "Running" (Запущена).

## Вариант 3: Использовать MongoDB Atlas (облако, проще всего)

Если локальная установка вызывает проблемы:

1. Зайдите на https://www.mongodb.com/cloud/atlas
2. Создайте бесплатный аккаунт
3. Создайте кластер (бесплатный)
4. Получите Connection String
5. Обновите `.env` файл:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wishlist
```

## Проверка подключения из Node.js

После настройки MongoDB, запустите backend:

```bash
cd backend
npm run dev
```

Если видите сообщение "✅ MongoDB подключен" - всё работает!

## Частые проблемы

### "MongoDB подключен" не появляется
- Проверьте, что MongoDB запущен
- Проверьте правильность MONGODB_URI в `.env`
- Убедитесь, что порт 27017 не занят другим приложением

### Ошибка "ECONNREFUSED"
- MongoDB не запущен
- Неправильный адрес в MONGODB_URI

### Ошибка "Authentication failed" (для Atlas)
- Проверьте username и password в строке подключения
- Убедитесь, что ваш IP добавлен в whitelist в MongoDB Atlas

