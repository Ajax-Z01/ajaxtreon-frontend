<template>
  <div>
    <header>
      <!-- Your header content here -->
      <div v-if="route.meta.someMetaProperty">
        <!-- Example: Display something based on meta data -->
      </div>
    </header>

    <main>
      <!-- Page content will be rendered here -->
      <NuxtPage />
    </main>

    <footer>
      <!-- Your footer content here -->
    </footer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
