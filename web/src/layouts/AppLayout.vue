<!-- src/layouts/AppLayout.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const menuItems = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home'
  },
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-chart-bar'
  },
  {
    label: 'Settings',
    icon: 'pi pi-fw pi-cog'
  }
]);

onMounted(() => {
  toast.add({ severity: 'success', summary: 'Success', detail: 'Application loaded successfully', life: 3000 });
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Menubar :model="menuItems" class="mb-4">
      <template #start>
        <div class="flex items-center">
          <h1 class="text-xl font-semibold ml-2">Django Hans</h1>
        </div>
      </template>
      <template #end>
        <Button icon="pi pi-user" rounded text aria-label="User" />
      </template>
    </Menubar>

    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- This is where page content will go -->
      <router-view />
    </div>

    <Toast />
  </div>
</template>

<style scoped>
/* Additional custom styles can be added here */
</style>
