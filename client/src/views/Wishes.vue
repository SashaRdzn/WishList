<template>
  <div class="wishes-container">
    <div class="snowflakes">
      <div class="snowflake" v-for="n in 50" :key="n" :style="{ left: Math.random() * 100 + '%', animationDelay: Math.random() * 5 + 's' }"></div>
    </div>
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <IconGift :size="40" color="#ffd700" class="header-icon" />
          <h1>Мой список желаний</h1>
        </div>
        <div class="user-info">
          <span class="username">Привет, {{ user?.username }}!</span>
          <div class="user-actions">
            <div class="share-section">
              <input 
                :value="publicLink" 
                readonly 
                class="share-input"
                ref="shareInputRef"
              />
              <button @click="copyLink" class="btn btn-share">
                <IconCopy :size="18" color="#fff" />
                {{ linkCopied ? 'Скопировано!' : 'Копировать' }}
              </button>
            </div>
            <button @click="handleLogout" class="btn btn-secondary">Выйти</button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="add-wish-card">
        <h2>Добавить подарок</h2>
        <form @submit.prevent="handleAddWish" class="wish-form">
          <div class="form-group">
            <label for="title">Название подарка</label>
            <input
              id="title"
              v-model="newWish.title"
              type="text"
              required
              maxlength="100"
              placeholder="Введите название подарка"
            />
          </div>
          <div class="form-group">
            <label for="link">Ссылка на товар (необязательно)</label>
            <input
              id="link"
              v-model="newWish.link"
              type="url"
              placeholder="https://example.com"
            />
            <small>Если указана ссылка, название будет выделено золотым цветом</small>
          </div>
          <div class="form-group">
            <label for="price">Цена в рублях (необязательно)</label>
            <input
              id="price"
              v-model="newWish.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Например: 1200"
            />
            <small v-if="newWish.price && parseFloat(newWish.price) > 0">
              {{ formatPrice(parseFloat(newWish.price)) }}
            </small>
          </div>
          <div class="form-group">
            <label for="image">Изображение (необязательно)</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              @change="handleImageSelect"
            />
            <small>Максимальный размер: 5MB. Форматы: JPG, PNG, GIF, WEBP</small>
          </div>
          <div v-if="error" class="error-message">{{ error }}</div>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            <IconPlus :size="20" color="#fff" />
            {{ loading ? 'Добавление...' : 'Добавить подарок' }}
          </button>
        </form>
      </div>

      <div class="wishes-list">
        <h2>Мои подарки ({{ wishes.length }})</h2>
        <div v-if="wishes.length === 0" class="empty-state">
          <IconBox :size="80" color="#dc143c" />
          <p>У вас пока нет подарков. Добавьте первый!</p>
        </div>
        <div v-else class="wishes-grid">
          <div v-for="wish in wishes" :key="wish._id" class="wish-card" :class="{ 'with-link': wish.link }">
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
                  <IconLink :size="18" color="#ffd700" class="link-icon" />
                </a>
                <template v-else>{{ wish.title }}</template>
              </h3>
              
              <div v-if="wish.price" class="price-display">
                {{ formatPrice(wish.price) }}
              </div>
              
              <div v-if="wish.reserved" class="reserved-info">
                <span class="reserved-badge">
                  <IconCheck :size="18" color="#fff" />
                  Зарезервировано
                </span>
              </div>
              
              <div class="wish-actions">
                <button @click="startEdit(wish)" class="btn btn-small btn-edit">
                  <IconEdit :size="16" color="#fff" />
                  Изменить
                </button>
                <button @click="handleDelete(wish._id)" class="btn btn-small btn-delete">
                  <IconDelete :size="16" color="#fff" />
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="editingWish" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <h2>Редактировать подарок</h2>
        <form @submit.prevent="handleUpdateWish" class="wish-form">
          <div class="form-group">
            <label for="edit-title">Название подарка</label>
            <input
              id="edit-title"
              v-model="editingWish.title"
              type="text"
              required
              maxlength="100"
            />
          </div>
          <div class="form-group">
            <label for="edit-link">Ссылка на товар (необязательно)</label>
            <input
              id="edit-link"
              v-model="editingWish.link"
              type="url"
              placeholder="https://example.com"
            />
          </div>
          <div class="form-group">
            <label for="edit-price">Цена в рублях (необязательно)</label>
            <input
              id="edit-price"
              v-model="editingWish.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Например: 1200"
            />
            <small v-if="editingWish.price && parseFloat(editingWish.price) > 0">
              {{ formatPrice(parseFloat(editingWish.price)) }}
            </small>
          </div>
          <div class="form-group">
            <label for="edit-image">Новое изображение (необязательно)</label>
            <input
              id="edit-image"
              type="file"
              accept="image/*"
              @change="handleEditImageSelect"
            />
            <small>Оставьте пустым, чтобы сохранить текущее изображение</small>
          </div>
          <div class="modal-actions">
            <button type="button" @click="cancelEdit" class="btn btn-secondary">Отмена</button>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              {{ loading ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { wishAPI, authAPI } from '../services/api';
import IconGift from '../components/IconGift.vue';
import IconCopy from '../components/IconCopy.vue';
import IconPlus from '../components/IconPlus.vue';
import IconCheck from '../components/IconCheck.vue';
import IconEdit from '../components/IconEdit.vue';
import IconDelete from '../components/IconDelete.vue';
import IconLink from '../components/IconLink.vue';
import IconBox from '../components/IconBox.vue';
import IconImage from '../components/IconImage.vue';

const router = useRouter();
const wishes = ref([]);
const newWish = ref({ title: '', price: '', link: '', image: null });
const editingWish = ref(null);
const editImage = ref(null);
const error = ref('');
const loading = ref(false);
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const publicLink = ref('');
const linkCopied = ref(false);
const shareInputRef = ref(null);

const API_URL = 'http://localhost:5000';

const getImageUrl = (imagePath) => {
  return `${API_URL}${imagePath}`;
};

const formatPrice = (priceInRubles) => {
  if (!priceInRubles) return '';
  const rubles = Math.round(priceInRubles);
  const dollars = Math.round(priceInRubles / 75);
  return `${rubles}₽ / ${dollars}$`;
};

const loadWishes = async () => {
  try {
    const response = await wishAPI.getAll();
    wishes.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при загрузке подарков';
  }
};

const handleImageSelect = (event) => {
  newWish.value.image = event.target.files[0];
};

const handleEditImageSelect = (event) => {
  editImage.value = event.target.files[0];
};

const handleAddWish = async () => {
  error.value = '';
  loading.value = true;

  try {
    await wishAPI.create(newWish.value.title, newWish.value.price || null, newWish.value.link || null, newWish.value.image);
    newWish.value = { title: '', price: '', link: '', image: null };
    document.getElementById('image').value = '';
    await loadWishes();
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при добавлении подарка';
  } finally {
    loading.value = false;
  }
};

const startEdit = (wish) => {
  editingWish.value = { ...wish, price: wish.price || '', link: wish.link || '' };
  editImage.value = null;
};

const cancelEdit = () => {
  editingWish.value = null;
  editImage.value = null;
};

const handleUpdateWish = async () => {
  error.value = '';
  loading.value = true;

  try {
    await wishAPI.update(
      editingWish.value._id, 
      editingWish.value.title, 
      editingWish.value.price || null,
      editingWish.value.link || null,
      editImage.value
    );
    editingWish.value = null;
    editImage.value = null;
    await loadWishes();
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при обновлении подарка';
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этот подарок?')) {
    return;
  }

  try {
    await wishAPI.delete(id);
    await loadWishes();
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при удалении подарка';
  }
};

const loadUser = async () => {
  try {
    const response = await authAPI.getMe();
    user.value = response.data;
    localStorage.setItem('user', JSON.stringify(response.data));
    if (user.value.publicId) {
      publicLink.value = `${window.location.origin}/list/${user.value.publicId}`;
    }
  } catch (err) {
    console.error('Ошибка загрузки пользователя:', err);
  }
};

const copyLink = async () => {
  if (!publicLink.value) return;
  
  try {
    await navigator.clipboard.writeText(publicLink.value);
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (err) {
    if (shareInputRef.value) {
      shareInputRef.value.select();
      document.execCommand('copy');
      linkCopied.value = true;
      setTimeout(() => {
        linkCopied.value = false;
      }, 2000);
    }
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(async () => {
  await loadUser();
  await loadWishes();
});
</script>

<style scoped>
.wishes-container {
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
  padding: 30px 0;
  /*box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);*/
  position: relative;
  z-index: 2;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon {
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffd700 0%, #ff6347 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.username {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.95;
  color: #ffd700;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.share-section {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.share-input {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  width: 250px;
  background: white;
  color: #333;
}

.btn-share {
  background: rgba(220, 20, 60, 0.9);
  color: white;
  font-size: 13px;
  padding: 8px 16px;
  white-space: nowrap;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-share:hover {
  background: rgba(220, 20, 60, 1);
  transform: translateY(-2px);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  z-index: 2;
}

.add-wish-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.add-wish-card h2 {
  margin-top: 0;
  margin-bottom: 30px;
  color: #dc143c;
  font-size: 28px;
  font-weight: 800;
}

.wish-form {
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

input[type="text"],
input[type="number"],
input[type="url"],
input[type="file"] {
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
}

input[type="text"]:focus,
input[type="number"]:focus,
input[type="url"]:focus {
  outline: none;
  border-color: #dc143c;
  box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.1);
}

small {
  color: #228b22;
  font-size: 14px;
  font-weight: 600;
}

.wishes-list h2 {
  color: white;
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 800;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  color: #fff;
}

.wishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.wish-card.with-link {
  border-left: 4px solid #ffd700;
}

.wish-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffe4e1 0%, #f0e68c 100%);
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

.reserved-info {
  margin-bottom: 16px;
}

.reserved-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #228b22 0%, #32cd32 100%);
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;

}

.wish-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
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

.btn-secondary {
  background: #6c757d;
  color: white;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-small {
  padding: 10px 16px;
  font-size: 13px;
}

.btn-edit {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(23, 162, 184, 0.6);
}

.btn-delete {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.6);
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
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  margin-bottom: 30px;
  color: #dc143c;
  font-size: 28px;
  font-weight: 800;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  h1 {
    font-size: 24px;
  }

  .wishes-grid {
    grid-template-columns: 1fr;
  }

  .share-input {
    width: 180px;
  }
}
</style>
