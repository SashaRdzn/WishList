@echo off
echo Установка MongoDB как службы Windows...
echo.
echo Это нужно сделать ОДИН РАЗ от имени администратора!
echo.
echo Нажмите правой кнопкой на этот файл и выберите "Запуск от имени администратора"
echo.
pause

"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --install --serviceName "MongoDB" --dbpath="C:\data\db"

echo.
echo MongoDB установлен как служба!
echo.
echo Теперь вы можете запустить службу командой:
echo net start MongoDB
echo.
echo Или через Services (services.msc)
echo.
pause

