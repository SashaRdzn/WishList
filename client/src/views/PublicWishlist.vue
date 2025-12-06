<template>
  <div class="public-wishlist">
    <div class="snowflakes">
      <div class="snowflake" v-for="n in 50" :key="n" :style="{ left: Math.random() * 100 + '%', animationDelay: Math.random() * 5 + 's' }"></div>
    </div>
    <header class="header">
      <div class="header-content">
        <IconGift :size="48" color="#ffd700" class="header-icon" />
        <h1>Список желаний {{ user?.username }}</h1>
        <p class="subtitle">Выберите подарок, который хотите подарить</p>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
      </div>

      <div v-else class="wishes-container">
        <div v-if="wishes.length === 0" class="empty-state">
          <IconBox :size="80" color="#dc143c" />
          <p>У этого пользователя пока нет подарков в списке желаний.</p>
        </div>

        <div v-else class="wishes-grid">
          <div 
            v-for="wish in wishes" 
            :key="wish._id" 
            class="wish-card"
            :class="{ 'reserved': wish.reserved, 'with-link': wish.link }"
          >
            <div v-if="wish.image" class="wish-image">
              <img :src="getImageUrl(wish.image)" :alt="wish.title" />
            </div>
            <div v-else class="wish-image placeholder">
              <IconImage :size="64" color="#c0c0c0" />
            </div>
            
            <div class="wish-content">
              <h3 :class="{ 'has-link': wish.link }">
                <a v-if="wish.link" :href="wish.link" target="_blank" rel="noopener noreferrer">
                  {{ wish.title }}
                  <IconLink :size="20" color="#ffd700" class="link-icon" />
                </a>
                <template v-else>{{ wish.title }}</template>
              </h3>
              
              <div v-if="wish.price" class="price-display">
                {{ formatPrice(wish.price) }}
              </div>
              
              <div v-if="wish.reserved" class="reserved-badge">
                <IconCheck :size="20" color="#fff" />
                <span class="badge-text">Зарезервировано</span>
              </div>
              
              <div v-else class="reserve-section">
                <button 
                  @click="handleReserveClick(wish._id)" 
                  class="btn btn-reserve"
                >
                  <IconTarget :size="20" color="#fff" />
                  Зарезервировать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showRegisterModal" class="modal-overlay" @click="closeRegisterModal">
      <div class="modal-content" @click.stop>
        <h2>Регистрация</h2>
        <p class="modal-subtitle">Зарегистрируйтесь, чтобы зарезервировать подарок</p>
        <form @submit.prevent="handleRegisterAndReserve" class="auth-form">
          <div class="form-group">
            <label for="reg-username">Логин</label>
            <input
              id="reg-username"
              v-model="registerForm.username"
              type="text"
              required
              minlength="3"
              maxlength="20"
              placeholder="Введите логин (3-20 символов)"
            />
          </div>
          <div class="form-group">
            <label for="reg-password">Пароль</label>
            <input
              id="reg-password"
              v-model="registerForm.password"
              type="password"
              required
              minlength="6"
              placeholder="Введите пароль (минимум 6 символов)"
            />
          </div>
          <div class="form-group">
            <label for="reg-confirm-password">Подтвердите пароль</label>
            <input
              id="reg-confirm-password"
              v-model="registerForm.confirmPassword"
              type="password"
              required
              minlength="6"
              placeholder="Повторите пароль"
            />
          </div>
          <div v-if="registerError" class="error-message">{{ registerError }}</div>
          <button type="submit" :disabled="registerLoading" class="btn btn-primary">
            {{ registerLoading ? 'Регистрация...' : 'Зарегистрироваться и зарезервировать' }}
          </button>
        </form>
        <div class="auth-switch">
          <span>Уже есть аккаунт? </span>
          <button @click="switchToLogin" class="link-btn">Войти</button>
        </div>
        <button @click="closeRegisterModal" class="btn-close">✕</button>
      </div>
    </div>

    <div v-if="showLoginModal" class="modal-overlay" @click="closeLoginModal">
      <div class="modal-content" @click.stop>
        <h2>Вход</h2>
        <p class="modal-subtitle">Войдите, чтобы зарезервировать подарок</p>
        <form @submit.prevent="handleLoginAndReserve" class="auth-form">
          <div class="form-group">
            <label for="login-username">Логин</label>
            <input
              id="login-username"
              v-model="loginForm.username"
              type="text"
              required
              placeholder="Введите логин"
            />
          </div>
          <div class="form-group">
            <label for="login-password">Пароль</label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              required
              placeholder="Введите пароль"
            />
          </div>
          <div v-if="loginError" class="error-message">{{ loginError }}</div>
          <button type="submit" :disabled="loginLoading" class="btn btn-primary">
            {{ loginLoading ? 'Вход...' : 'Войти и зарезервировать' }}
          </button>
        </form>
        <div class="auth-switch">
          <span>Нет аккаунта? </span>
          <button @click="switchToRegister" class="link-btn">Зарегистрироваться</button>
        </div>
        <button @click="closeLoginModal" class="btn-close">✕</button>
      </div>
    </div>

    <div v-if="showSuccessModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content success-modal" @click.stop>
        <IconGift :size="80" color="#ffd700" class="success-icon" />
        <h2>Отлично!</h2>
        <p>Вы успешно зарезервировали подарок!</p>
        <button @click="closeModal" class="btn btn-primary">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { publicAPI, authAPI } from '../services/api';
import IconGift from '../components/IconGift.vue';
import IconCheck from '../components/IconCheck.vue';
import IconTarget from '../components/IconTarget.vue';
import IconLink from '../components/IconLink.vue';
import IconBox from '../components/IconBox.vue';
import IconImage from '../components/IconImage.vue';

const route = useRoute();
const user = ref(null);
const wishes = ref([]);
const loading = ref(true);
const error = ref('');
const showSuccessModal = ref(false);
const showRegisterModal = ref(false);
const showLoginModal = ref(false);
const pendingWishId = ref(null);
const registerForm = ref({ username: '', password: '', confirmPassword: '' });
const loginForm = ref({ username: '', password: '' });
const registerError = ref('');
const loginError = ref('');
const registerLoading = ref(false);
const loginLoading = ref(false);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getImageUrl = (imagePath) => {
  return `${API_BASE_URL}${imagePath}`;
};

const formatPrice = (priceInRubles) => {
  if (!priceInRubles) return '';
  const rubles = Math.round(priceInRubles);
  const dollars = Math.round(priceInRubles / 75);
  return `${rubles}₽ / ${dollars}$`;
};

const loadWishlist = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const publicId = route.params.publicId;
    const response = await publicAPI.getWishlist(publicId);
    user.value = response.data.user;
    wishes.value = response.data.wishes;
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при загрузке списка желаний';
  } finally {
    loading.value = false;
  }
};

const handleReserveClick = (wishId) => {
  const token = localStorage.getItem('token');
  if (token) {
    reserveWish(wishId);
  } else {
    pendingWishId.value = wishId;
    showRegisterModal.value = true;
  }
};

const reserveWish = async (wishId) => {
  try {
    const publicId = route.params.publicId;
    await publicAPI.reserveWish(publicId, wishId);
    await loadWishlist();
    showSuccessModal.value = true;
    pendingWishId.value = null;
  } catch (err) {
    if (err.response?.status === 401) {
      pendingWishId.value = wishId;
      showRegisterModal.value = true;
    } else {
      error.value = err.response?.data?.error || 'Ошибка при резервировании подарка';
    }
  }
};

const handleRegisterAndReserve = async () => {
  registerError.value = '';

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = 'Пароли не совпадают';
    return;
  }

  if (registerForm.value.password.length < 6) {
    registerError.value = 'Пароль должен быть не менее 6 символов';
    return;
  }

  registerLoading.value = true;

  try {
    const response = await authAPI.register(registerForm.value.username, registerForm.value.password);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    showRegisterModal.value = false;
    
    if (pendingWishId.value) {
      await reserveWish(pendingWishId.value);
    }
    
    registerForm.value = { username: '', password: '', confirmPassword: '' };
  } catch (err) {
    registerError.value = err.response?.data?.error || 'Ошибка при регистрации';
  } finally {
    registerLoading.value = false;
  }
};

const handleLoginAndReserve = async () => {
  loginError.value = '';
  loginLoading.value = true;

  try {
    const response = await authAPI.login(loginForm.value.username, loginForm.value.password);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    showLoginModal.value = false;
    
    if (pendingWishId.value) {
      await reserveWish(pendingWishId.value);
    }
    
    loginForm.value = { username: '', password: '' };
  } catch (err) {
    loginError.value = err.response?.data?.error || 'Неверный логин или пароль';
  } finally {
    loginLoading.value = false;
  }
};

const switchToLogin = () => {
  showRegisterModal.value = false;
  showLoginModal.value = true;
  registerError.value = '';
};

const switchToRegister = () => {
  showLoginModal.value = false;
  showRegisterModal.value = true;
  loginError.value = '';
};

const closeRegisterModal = () => {
  showRegisterModal.value = false;
  registerForm.value = { username: '', password: '', confirmPassword: '' };
  registerError.value = '';
  pendingWishId.value = null;
};

const closeLoginModal = () => {
  showLoginModal.value = false;
  loginForm.value = { username: '', password: '' };
  loginError.value = '';
  pendingWishId.value = null;
};

const closeModal = () => {
  showSuccessModal.value = false;
};

onMounted(() => {
  loadWishlist();
});
</script>

<style scoped>
.public-wishlist {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #2d1b3d 100%);
  background-attachment: fixed;
  position: relative;
  overflow-x: hidden;
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

.header {
  /*background: linear-gradient(135deg, rgba(220, 20, 60, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%);*/
  /*backdrop-filter: blur(10px);*/
  color: white;
  padding: 60px 0;
  /*box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);*/
  position: relative;
  z-index: 2;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.header-icon {
  margin-bottom: 20px;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

h1 {
  margin: 0 0 15px 0;
  font-size: 42px;
  font-weight: 800;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffd700 0%, #ff6347 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 18px;
  opacity: 0.95;
  margin: 0;
  font-weight: 400;
  color: #ffd700;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 20px;
  position: relative;
  z-index: 2;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 215, 0, 0.2);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 40px 20px;
  background: rgba(220, 20, 60, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px solid rgba(220, 20, 60, 0.5);
}

.error-message {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  color: #fff;
}

.wishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.wish-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid rgba(255, 215, 0, 0.3);
  position: relative;
}

.wish-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #dc143c, #ffd700, #228b22);
  opacity: 0;
  transition: opacity 0.3s;
}

.wish-card:hover::before {
  opacity: 1;
}

.wish-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.4);
  border-color: #ffd700;
}

.wish-card.reserved {
  opacity: 0.85;
  border-color: #228b22;
}

.wish-card.reserved::before {
  background: #228b22;
  opacity: 1;
}

.wish-card.with-link {
  border-left: 4px solid #ffd700;
}

.wish-image {
  width: 100%;
  height: 260px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffe4e1 0%, #f0e68c 100%);
  position: relative;
}

.wish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.wish-card:hover .wish-image img {
  transform: scale(1.1);
}

.wish-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.wish-content {
  padding: 24px;
}

.wish-content h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
}

.wish-content h3.has-link a {
  color: #dc143c;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s;
}

.wish-content h3.has-link a:hover {
  color: #ff6347;
}

.link-icon {
  vertical-align: middle;
}

.price-display {
  font-size: 20px;
  font-weight: 700;
  color: #228b22;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #228b22 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.reserved-badge {
  margin-top: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #228b22 0%, #32cd32 100%);
  border-radius: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.badge-text {
  color: white;
  font-weight: 700;
  font-size: 15px;
}

.reserve-section {
  margin-top: 16px;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-reserve {
  background: linear-gradient(135deg, #dc143c 0%, #ff6347 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
}

.btn-reserve:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(220, 20, 60, 0.6);
}

.btn-primary {
  background: linear-gradient(135deg, #dc143c 0%, #ff6347 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 20, 60, 0.6);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 240, 245, 0.98) 100%);
  border-radius: 24px;
  padding: 40px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 215, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #dc143c;
  font-size: 32px;
  font-weight: 800;
  text-align: center;
}

.modal-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 15px;
}

.success-modal {
  text-align: center;
}

.success-icon {
  margin-bottom: 20px;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  animation: bounce 0.6s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.success-modal h2 {
  margin-bottom: 15px;
  color: #228b22;
}

.success-modal p {
  margin-bottom: 30px;
  color: #666;
  font-size: 18px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 700;
  color: #555;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  padding: 14px;
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

.auth-switch {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.link-btn {
  background: none;
  border: none;
  color: #dc143c;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
  padding: 0;
}

.link-btn:hover {
  color: #ff6347;
}

.btn-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #ffe4e1;
  color: #dc143c;
}

@media (max-width: 768px) {
  h1 {
    font-size: 32px;
  }

  .wishes-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 30px 20px;
  }
}
</style>
