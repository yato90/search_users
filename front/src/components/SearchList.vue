<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const number = ref('')
const results = ref([])
const loading = ref(false)  // состояние загрузки

let cancelToken

const handleSubmit = async () => {
    if (cancelToken) {
        cancelToken.cancel("Операция отменена из-за нового запроса.")
    }
    cancelToken = axios.CancelToken.source()
    loading.value = true

    try {
        const response = await axios.post('http://localhost:3000/search', {
            email: email.value,
            number: number.value.replace(/-/g, '')
        }, {
        cancelToken: cancelToken.token
        })
        results.value = response.data
        loading.value = false
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log("Запрос отменен", error.message)
        } else {
            console.error("Что-то пошло не так: ", error)
        }
    }
}
</script>

<template>
    <h1>Поиск пользователей</h1>
    <form @submit.prevent="handleSubmit">
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" v-model="email" required />
        </div>
        <div class="form-group">
            <label for="number">Number:</label>
            <input type="text" v-model="number" v-mask="'##-##-##'" />
        </div>
        <button type="submit">Отправить</button>
    </form>
    <div v-if="loading" class="loading">
        <p>Загрузка...</p>
    </div>
    <div v-if="results.length" class="results">
        <h2>Результаты:</h2>
        <ul>
            <li v-for="(result, index) in results" :key="index">
                {{ result.email }} - {{ result.number }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
h1 {
  font-size: 2em;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  margin-bottom: 5px;
  font-size: 1.2em;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  font-size: 1em;
  color: white;
  background-color: #007BFF;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #0056b3;
}

.loading {
  margin-top: 20px;
  font-size: 1.2em;
  color: #007BFF;
}

.results {
  margin-top: 20px;
  text-align: left;
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
}

.results h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.results ul {
  list-style-type: none;
  padding: 0;
}

.results li {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>