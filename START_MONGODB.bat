@echo off
echo Запуск MongoDB...
echo.
echo MongoDB будет работать в этом окне.
echo НЕ ЗАКРЫВАЙТЕ это окно, пока работаете с приложением!
echo.
echo Для остановки нажмите Ctrl+C
echo.
pause

"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath="C:\data\db"

pause

