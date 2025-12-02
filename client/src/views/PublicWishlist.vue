<template>
  <div class="public-wishlist">
    <header class="header">
      <div class="header-content">
        <h1>Список желаний {{ user?.username }}</h1>
        <p class="subtitle">Выберите подарок, который хотите подарить</p>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">
        <p>Загрузка...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
      </div>

      <div v-else class="wishes-container">
        <div v-if="wishes.length === 0" class="empty-state">
          <p>У этого пользователя пока нет подарков в списке желаний.</p>
        </div>

        <div v-else class="wishes-grid">
          <div 
            v-for="wish in wishes" 
            :key="wish._id" 
            class="wish-card"
            :class="{ 'reserved': wish.reserved }"
          >
            <div v-if="wish.image" class="wish-image">
              <img :src="getImageUrl(wish.image)" :alt="wish.title" />
            </div>
            <div v-else class="wish-image placeholder">
              <span>Нет изображения</span>
            </div>
            
            <div class="wish-content">
              <h3>{{ wish.title }}</h3>
              
              <div v-if="wish.reserved" class="reserved-badge">
                <span class="badge-text">🎁 Зарезервировано: {{ wish.reservedBy }}</span>
              </div>
              
              <div v-else class="reserve-section">
                <input
                  v-model="reserveNames[wish._id]"
                  type="text"
                  :placeholder="'Введите ваше имя'"
                  class="reserve-input"
                  maxlength="50"
                />
                <button 
                  @click="reserveWish(wish._id)" 
                  class="btn btn-reserve"
                  :disabled="!reserveNames[wish._id] || reserveNames[wish._id].trim().length === 0"
                >
                  Зарезервировать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Модальное окно подтверждения -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>🎉 Отлично!</h2>
        <p>Вы успешно зарезервировали подарок!</p>
        <button @click="closeModal" class="btn btn-primary">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { publicAPI } from '../services/api';

const route = useRoute();
const user = ref(null);
const wishes = ref([]);
const loading = ref(true);
const error = ref('');
const reserveNames = ref({});
const showSuccessModal = ref(false);

const API_URL = 'http://localhost:5000';

const getImageUrl = (imagePath) => {
  return `${API_URL}${imagePath}`;
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

const reserveWish = async (wishId) => {
  const reservedBy = reserveNames.value[wishId]?.trim();
  
  if (!reservedBy || reservedBy.length === 0) {
    return;
  }

  try {
    const publicId = route.params.publicId;
    await publicAPI.reserveWish(publicId, wishId, reservedBy);
    
    // Обновляем список
    await loadWishlist();
    
    // Показываем модальное окно
    showSuccessModal.value = true;
    
    // Очищаем поле ввода
    reserveNames.value[wishId] = '';
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при резервировании подарка';
  }
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
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading, .error-container {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.error-message {
  color: #e74c3c;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  color: #666;
}

.wishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.wish-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.wish-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.wish-card.reserved {
  opacity: 0.7;
  border: 2px solid #28a745;
}

.wish-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f0f0f0;
}

.wish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wish-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.wish-content {
  padding: 20px;
}

.wish-content h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 20px;
}

.reserved-badge {
  margin-top: 15px;
  padding: 12px;
  background: #d4edda;
  border-radius: 8px;
  text-align: center;
}

.badge-text {
  color: #155724;
  font-weight: 600;
  font-size: 14px;
}

.reserve-section {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reserve-input {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.reserve-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reserve {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-reserve:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-reserve:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.modal-content p {
  margin-bottom: 25px;
  color: #666;
}
</style>

