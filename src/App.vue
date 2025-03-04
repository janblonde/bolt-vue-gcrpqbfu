<script setup lang="ts">
// App.vue is now just a router view container
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style>
.app-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}
</style>