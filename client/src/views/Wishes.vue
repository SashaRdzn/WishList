<template>
  <div class="wishes-container">
    <header class="header">
      <div class="header-content">
        <h1>Мой список желаний</h1>
        <div class="user-info">
          <span>Привет, {{ user?.username }}!</span>
          <div class="user-actions">
            <div class="share-section">
              <input 
                :value="publicLink" 
                readonly 
                class="share-input"
                ref="shareInputRef"
              />
              <button @click="copyLink" class="btn btn-share">
                {{ linkCopied ? '✓ Скопировано!' : '📋 Копировать ссылку' }}
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
            {{ loading ? 'Добавление...' : 'Добавить подарок' }}
          </button>
        </form>
      </div>

      <div class="wishes-list">
        <h2>Мои подарки ({{ wishes.length }})</h2>
        <div v-if="wishes.length === 0" class="empty-state">
          <p>У вас пока нет подарков. Добавьте первый!</p>
        </div>
        <div v-else class="wishes-grid">
          <div v-for="wish in wishes" :key="wish._id" class="wish-card">
            <div v-if="wish.image" class="wish-image">
              <img :src="getImageUrl(wish.image)" :alt="wish.title" />
            </div>
            <div v-else class="wish-image placeholder">
              <span>Нет изображения</span>
            </div>
            <div class="wish-content">
              <h3>{{ wish.title }}</h3>
              
              <div v-if="wish.reserved" class="reserved-info">
                <span class="reserved-badge">🎁 Зарезервировано: {{ wish.reservedBy }}</span>
              </div>
              
              <div class="wish-actions">
                <button @click="startEdit(wish)" class="btn btn-small btn-edit">Изменить</button>
                <button @click="handleDelete(wish._id)" class="btn btn-small btn-delete">Удалить</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Модальное окно редактирования -->
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { wishAPI, authAPI } from '../services/api';

const router = useRouter();
const wishes = ref([]);
const newWish = ref({ title: '', image: null });
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
    await wishAPI.create(newWish.value.title, newWish.value.image);
    newWish.value = { title: '', image: null };
    document.getElementById('image').value = '';
    await loadWishes();
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при добавлении подарка';
  } finally {
    loading.value = false;
  }
};

const startEdit = (wish) => {
  editingWish.value = { ...wish };
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
    await wishAPI.update(editingWish.value._id, editingWish.value.title, editImage.value);
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
    // Обновляем localStorage
    localStorage.setItem('user', JSON.stringify(response.data));
    // Генерируем публичную ссылку
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
    // Fallback для старых браузеров
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
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 28px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
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
  border-radius: 8px;
}

.share-input {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  width: 250px;
  background: white;
  color: #333;
}

.btn-share {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  font-size: 12px;
  padding: 6px 12px;
  white-space: nowrap;
}

.btn-share:hover {
  background: white;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.add-wish-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.add-wish-card h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.wish-form {
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
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

input[type="text"],
input[type="file"] {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
}

small {
  color: #666;
  font-size: 12px;
}

.wishes-list h2 {
  color: #333;
  margin-bottom: 20px;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
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

.wish-image {
  width: 100%;
  height: 200px;
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
  font-size: 18px;
}

.reserved-info {
  margin-bottom: 15px;
}

.reserved-badge {
  display: inline-block;
  padding: 8px 12px;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.wish-actions {
  display: flex;
  gap: 10px;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-edit {
  background: #17a2b8;
  color: white;
}

.btn-edit:hover {
  background: #138496;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  background: #fee;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
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
  padding: 30px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>

