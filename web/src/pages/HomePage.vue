<!-- src/pages/HomePage.vue -->
<script setup>
import { ref } from 'vue';

const features = ref([
  {
    icon: 'pi pi-server',
    title: 'Django Backend',
    description: 'Robust Python web framework with built-in authentication and admin panel'
  },
  {
    icon: 'pi pi-prime',
    title: 'Vue 3 & PrimeVue',
    description: 'Modern reactive UI with beautiful, accessible components'
  },
  {
    icon: 'pi pi-palette',
    title: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid custom designs'
  },
  {
    icon: 'pi pi-cog',
    title: 'RESTful API',
    description: 'Clean API architecture with Django REST Framework'
  }
]);

const resources = ref([
  { name: 'Django Documentation', url: 'https://docs.djangoproject.com/' },
  { name: 'Vue 3 Guide', url: 'https://vuejs.org/guide/introduction.html' },
  { name: 'PrimeVue Components', url: 'https://primevue.org/' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/docs' }
]);
</script>

<template>
  <div>
    <!-- Hero Section - Changed to green gradient -->
    <div class="bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg shadow-lg mb-6 p-8 text-white">
      <h1 class="text-3xl font-bold mb-4">Welcome to Django Hans</h1>
      <p class="text-lg mb-6 max-w-3xl">
        A modern full-stack template combining the power of Django with the reactivity of Vue 3.
        Get started quickly with this production-ready development environment.
      </p>
      <div class="flex gap-3">
        <Button label="Get Started" icon="pi pi-play" severity="secondary" class="p-button-rounded p-button-lg" />
      </div>
    </div>

    <!-- Features Section -->
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Key Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card v-for="(feature, index) in features" :key="index" class="border-1 border-gray-200 shadow-sm">
        <template #header>
          <!-- Changed background color to light green -->
          <div class="flex justify-center p-3 bg-green-50">
            <!-- Changed icon color to green -->
            <i :class="[feature.icon, 'text-4xl text-green-600']"></i>
          </div>
        </template>
        <template #title>
          <h3 class="text-lg font-semibold text-gray-800">{{ feature.title }}</h3>
        </template>
        <template #content>
          <p class="text-gray-600">{{ feature.description }}</p>
        </template>
      </Card>
    </div>

    <!-- Components Demo Section -->
    <h2 class="text-2xl font-bold mb-4 text-gray-800">UI Component Library</h2>
    <Card class="mb-6 border-1 border-gray-200 shadow-sm">
      <template #content>
        <p class="mb-4 text-gray-600">Explore the variety of PrimeVue components available in this template:</p>
        <div class="flex flex-wrap gap-2">
          <!-- Changed primary button to green -->
          <Button label="Primary" class="p-button-success" />
          <Button label="Secondary" severity="secondary" />
          <Button label="Success" severity="success" />
          <Button label="Info" severity="info" />
          <Button label="Warning" severity="warning" />
          <Button label="Help" severity="help" />
          <Button label="Danger" severity="danger" />
        </div>
      </template>
    </Card>

    <!-- Resources Section -->
    <Panel header="Resources & Documentation" toggleable class="mb-6 border-1 border-gray-200 shadow-sm">
      <div class="flex flex-col gap-2">
        <div v-for="(resource, index) in resources" :key="index" class="p-2 hover:bg-green-50 rounded">
          <!-- Changed link color to green -->
          <a :href="resource.url" target="_blank" class="text-green-600 hover:text-green-800 flex items-center">
            <i class="pi pi-external-link mr-2"></i>
            {{ resource.name }}
          </a>
        </div>
      </div>
    </Panel>

    <!-- Getting Started -->
    <Panel header="Getting Started" toggleable class="border-1 border-green-100 shadow-sm bg-green-50">
      <div class="prose max-w-none">
        <p class="text-gray-700">
          Edit <code class="bg-white px-1 py-0.5 rounded border border-green-200">src/pages/HomePage.vue</code> to customize this page.
          The application uses a Django backend with REST framework and a Vue 3 frontend with PrimeVue components.
        </p>
        <div class="mt-4 p-4 bg-white rounded border border-green-200 font-mono text-sm">
          <div class="text-green-600">// Start the development server</div>
          <div class="text-gray-800">npm run dev</div>
        </div>
      </div>
    </Panel>
  </div>
</template>

<style scoped>
.p-card .p-card-content {
  padding-top: 0.5rem;
}
</style>
