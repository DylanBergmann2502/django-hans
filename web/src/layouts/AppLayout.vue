<!-- src/layouts/AppLayout.vue -->
<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const toast = useToast();
const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const menuItems = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-chart-bar',
    command: () => router.push('/dashboard'),
  }
]);

const userMenuItems = ref([
  {
    label: 'Profile',
    icon: 'pi pi-fw pi-user',
    command: () => router.push('/profile'),
  },
  {
    label: 'Settings',
    icon: 'pi pi-fw pi-cog',
    command: () => router.push('/settings'),
  },
  {
    separator: true
  },
  {
    label: 'Logout',
    icon: 'pi pi-fw pi-sign-out',
    command: () => handleLogout(),
  }
]);

const handleLogout = async () => {
  await authStore.logout();
  toast.add({ severity: 'warn', summary: 'Logged Out', detail: 'You have been successfully logged out', life: 3000 });

  // Only redirect if the current route requires authentication
  if (router.currentRoute.value.meta.authRequired === true) {
    router.push('/');
  }
  // Otherwise stay on the current page
};

const navigateHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Menubar :model="menuItems" class="mb-4">
      <template #start>
        <div class="flex items-center cursor-pointer" @click="navigateHome">
          <h1 class="text-xl font-semibold ml-2 hover:text-green-600 transition-colors">Django Hans</h1>
        </div>
      </template>
      <template #end>
        <div v-if="isAuthenticated" class="flex items-center">
          <span class="mr-2 text-sm">{{ user?.email }}</span>
          <Menu :model="userMenuItems" :popup="true" ref="userMenu" />
          <Button
            icon="pi pi-user"
            rounded
            text
            aria-label="User Menu"
            @click="$refs.userMenu.toggle($event)"
          />
        </div>
        <div v-else class="flex gap-2">
          <Button
            label="Login"
            icon="pi pi-sign-in"
            class="p-button-success"
            @click="router.push('/login')"
          />
          <Button
            label="Register"
            icon="pi pi-user-plus"
            class="p-button-outlined p-button-success"
            @click="router.push('/register')"
          />
        </div>
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
.cursor-pointer {
  cursor: pointer;
}
</style>
