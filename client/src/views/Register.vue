<template>
  <div class="auth-container">
    <div class="snowflakes">
      <div class="snowflake" v-for="n in 50" :key="n" :style="{ left: Math.random() * 100 + '%', animationDelay: Math.random() * 5 + 's' }"></div>
    </div>
    <div class="auth-card">
      <IconGift :size="60" color="#ffd700" class="card-icon" />
      <h1>Регистрация</h1>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Логин</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            minlength="3"
            maxlength="20"
            placeholder="Введите логин (3-20 символов)"
          />
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="Введите пароль (минимум 6 символов)"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Подтвердите пароль</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            minlength="6"
            placeholder="Повторите пароль"
          />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      <p class="auth-link">
        Уже есть аккаунт? <router-link to="/login">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '../services/api';
import IconGift from '../components/IconGift.vue';

const router = useRouter();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'Пароль должен быть не менее 6 символов';
    return;
  }

  if (username.value.length < 3 || username.value.length > 20) {
    error.value = 'Логин должен быть от 3 до 20 символов';
    return;
  }

  loading.value = true;

  try {
    const response = await authAPI.register(username.value, password.value);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    router.push('/wishes');
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при регистрации';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #2d1b3d 100%);
  background-attachment: fixed;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.snowflakes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.snowflake {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: fall linear infinite;
}

.snowflake:nth-child(3n) {
  width: 7px;
  height: 7px;
  animation-duration: 10s;
}

.snowflake:nth-child(3n+1) {
  width: 12px;
  height: 12px;
  animation-duration: 15s;
}

.snowflake:nth-child(3n+2) {
  width: 8px;
  height: 8px;
  animation-duration: 12s;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.auth-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 240, 245, 0.98) 100%);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 50px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 440px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 2;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-icon {
  display: block;
  margin: 0 auto 30px;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #dc143c;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-weight: 700;
  color: #555;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
}

input:focus {
  outline: none;
  border-color: #dc143c;
  box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.1);
}

.btn {
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, #dc143c 0%, #ff6347 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(220, 20, 60, 0.6);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #dc143c;
  background: #ffe4e1;
  padding: 14px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid #dc143c;
}

.auth-link {
  text-align: center;
  margin-top: 30px;
  color: #666;
  font-size: 15px;
}

.auth-link a {
  color: #dc143c;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.3s;
}

.auth-link a:hover {
  color: #ff6347;
  text-decoration: underline;
}
</style>
