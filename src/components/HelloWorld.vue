<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1 class="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">{{ msg }}</h1>

  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <button 
      type="button" 
      @click="count++" 
      class="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors mb-4"
    >
      count is {{ count }}
    </button>
    
    <p class="text-gray-700 dark:text-gray-300 mb-4">
      Edit
      <code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p class="mt-6 text-gray-600 dark:text-gray-400">
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank" class="text-blue-500 hover:underline">
      create-vue
    </a>, the official Vue + Vite starter
  </p>
  
  <p class="mt-2 text-gray-600 dark:text-gray-400">
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      class="text-blue-500 hover:underline"
    >
      Vue Docs Scaling up Guide
    </a>.
  </p>
</template>