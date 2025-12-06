const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📁 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Доступен по: http://localhost:${PORT}`);
});