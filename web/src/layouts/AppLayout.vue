<!-- src/layouts/AppLayout.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

const toast = useToast()
const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const userMenu = ref<InstanceType<typeof Menu> | null>(null)

type AppMenuItem = MenuItem & { isLogout?: boolean }

const menuItems = ref<AppMenuItem[]>([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    to: '/',
  },
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-chart-bar',
    to: '/dashboard',
  },
])

const userMenuItems = ref<AppMenuItem[]>([
  {
    label: 'Profile',
    icon: 'pi pi-fw pi-user',
    to: '/profile',
  },
  {
    label: 'Settings',
    icon: 'pi pi-fw pi-cog',
    to: '/settings',
  },
  {
    separator: true,
  },
  {
    label: 'Logout',
    icon: 'pi pi-fw pi-sign-out',
    command: () => {
      handleLogout()
    },
    isLogout: true,
  },
])

const handleLogout = async () => {
  await authStore.logout()
  toast.add({
    severity: 'warn',
    summary: 'Logged Out',
    detail: 'You have been successfully logged out',
    life: 3000,
  })

  if (router.currentRoute.value.meta.authRequired === true) {
    router.push('/')
  }
}

const navigateHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Custom implementation of menubar with real links -->
    <div
      class="p-menubar mb-4 p-component flex justify-between items-center px-4 py-2 bg-white shadow-sm"
    >
      <div class="flex items-center">
        <div class="cursor-pointer flex items-center" @click="navigateHome">
          <h1 class="text-xl font-semibold ml-2 hover:text-green-600 transition-colors">
            Django Hans
          </h1>
        </div>

        <!-- Menu items with real links -->
        <div class="ml-6 flex space-x-4">
          <router-link
            v-for="(item, index) in menuItems"
            :key="index"
            :to="item.to!"
            class="p-menuitem-link flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <i v-if="item.icon" :class="[item.icon, 'mr-2']"></i>
            <span class="p-menuitem-text">{{ item.label }}</span>
          </router-link>
        </div>
      </div>

      <div>
        <div v-if="isAuthenticated" class="flex items-center">
          <span class="mr-2 text-sm">{{ user?.email }}</span>

          <!-- Using custom template for Menu -->
          <Menu :model="userMenuItems" :popup="true" ref="userMenu" class="user-menu">
            <template #item="{ item }">
              <!-- Regular menu items with router links -->
              <router-link
                v-if="item.to"
                :to="item.to"
                class="p-menuitem-link flex align-items-center p-3 text-color hover:surface-200 border-noround"
              >
                <i v-if="item.icon" :class="[item.icon, 'mr-2']"></i>
                <span>{{ item.label }}</span>
              </router-link>

              <!-- Special handling for logout - no href, just click handler -->
              <div
                v-else-if="item.isLogout"
                @click="handleLogout"
                class="p-menuitem-link flex align-items-center p-3 text-color hover:surface-200 border-noround cursor-pointer"
              >
                <i v-if="item.icon" :class="[item.icon, 'mr-2']"></i>
                <span>{{ item.label }}</span>
              </div>

              <!-- Other menu item types -->
              <hr v-else-if="item.separator" class="my-2 border-t border-gray-200" />
            </template>
          </Menu>

          <Button
            icon="pi pi-user"
            rounded
            text
            aria-label="User Menu"
            @click="(e) => userMenu?.toggle(e)"
          />
        </div>
        <div v-else class="flex gap-2">
          <router-link to="/login" custom v-slot="{ navigate, href }">
            <a :href="href" @click="navigate" class="no-underline">
              <Button label="Login" icon="pi pi-sign-in" class="p-button-success" />
            </a>
          </router-link>
          <router-link to="/register" custom v-slot="{ navigate, href }">
            <a :href="href" @click="navigate" class="no-underline">
              <Button
                label="Register"
                icon="pi pi-user-plus"
                class="p-button-outlined p-button-success"
              />
            </a>
          </router-link>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <router-view />
    </div>

    <Toast />
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.p-menubar {
  border: 1px solid #f0f0f0;
}

/* Remove default underline from links */
a.no-underline {
  text-decoration: none;
}

/* Style for menu items */
:deep(.p-menu) {
  border: 1px solid #e4e4e4;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.p-menuitem-link) {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #495057;
  transition:
    background-color 0.2s,
    color 0.2s;
  border-radius: 0;
}

:deep(.p-menuitem-link:hover) {
  background-color: #f8f9fa;
  text-decoration: none;
  color: #495057;
}

:deep(.p-menu .p-menuitem) {
  margin: 0;
}

:deep(.p-menu .p-submenu-header) {
  background: #f8f9fa;
  color: #6c757d;
  padding: 0.75rem 1rem;
  margin: 0;
}
</style>
