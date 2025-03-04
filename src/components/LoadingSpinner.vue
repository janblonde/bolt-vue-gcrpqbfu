<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}>();
</script>

<template>
  <div class="flex justify-center items-center">
    <div 
      class="animate-spin rounded-full border-t-transparent"
      :class="{
        'h-4 w-4 border-2': size === 'sm',
        'h-8 w-8 border-4': size === 'md' || !size,
        'h-12 w-12 border-4': size === 'lg',
        'border-green-500': color === 'green' || !color,
        'border-blue-500': color === 'blue',
        'border-gray-500': color === 'gray',
        'border-white': color === 'white'
      }"
    ></div>
  </div>
</template>