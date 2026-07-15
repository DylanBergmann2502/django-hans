<!-- src/pages/HomePage.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Check, ExternalLink, Palette, Play, Server, Settings } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const features = [
  {
    icon: Server,
    title: 'Django Backend',
    description: 'Robust Python web framework with built-in authentication and admin panel',
  },
  {
    icon: Palette,
    title: 'Vue 3 & shadcn-vue',
    description: 'Modern reactive UI with accessible, source-owned components',
  },
  {
    icon: Palette,
    title: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid custom designs',
  },
  {
    icon: Settings,
    title: 'RESTful API',
    description: 'Clean API architecture with Django REST Framework',
  },
]
const resources = [
  { name: 'Django Documentation', url: 'https://docs.djangoproject.com/' },
  { name: 'Vue 3 Guide', url: 'https://vuejs.org/guide/introduction.html' },
  { name: 'shadcn-vue Components', url: 'https://www.shadcn-vue.com/' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/docs' },
]
</script>

<template>
  <div class="space-y-6">
    <section
      class="rounded-xl bg-linear-to-r from-emerald-500 to-green-600 p-8 text-white shadow-lg"
    >
      <h1 class="mb-4 text-3xl font-bold">
        Welcome to Django Hans<span v-if="isAuthenticated && user"> - {{ user.email }}</span>
      </h1>
      <p class="mb-6 max-w-3xl text-lg">
        A modern full-stack template combining the power of Django with the reactivity of Vue 3. Get
        started quickly with this production-ready development environment.
      </p>
      <Button variant="secondary"><Play :size="16" /> Get Started</Button>
    </section>

    <section>
      <h2 class="mb-4 text-2xl font-bold">Key Features</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card v-for="feature in features" :key="feature.title"
          ><CardHeader class="items-center bg-green-50"
            ><component :is="feature.icon" class="text-green-600" :size="36" /><CardTitle>{{
              feature.title
            }}</CardTitle></CardHeader
          ><CardContent
            ><p class="text-muted-foreground">{{ feature.description }}</p></CardContent
          ></Card
        >
      </div>
    </section>

    <section>
      <div class="mb-4">
        <h2 class="text-2xl font-bold">UI Component Library</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Source-owned components, styled for Django Hans.
        </p>
      </div>
      <div
        class="grid grid-cols-2 gap-3 rounded-xl border border-green-200 bg-linear-to-br from-green-50/80 via-background to-emerald-50/60 p-6 shadow-sm sm:grid-cols-5"
      >
        <Button class="w-full"><Check :size="16" /> Primary</Button>
        <Button class="w-full" variant="secondary">Secondary</Button>
        <Button class="w-full" variant="outline">Outline</Button>
        <Button class="w-full" variant="ghost">Ghost</Button>
        <Button class="col-span-2 w-full sm:col-span-1" variant="destructive">Danger</Button>
      </div>
    </section>

    <section class="rounded-xl border bg-background shadow-sm">
      <div class="flex items-center justify-between border-b p-6">
        <h2 class="text-xl font-semibold">Resources & Documentation</h2>
      </div>
      <div class="flex flex-col gap-1 p-4">
        <a
          v-for="resource in resources"
          :key="resource.name"
          :href="resource.url"
          target="_blank"
          class="flex items-center gap-2 rounded-md p-2 text-primary hover:bg-green-50"
          ><ExternalLink :size="16" />{{ resource.name }}</a
        >
      </div>
    </section>

    <section class="rounded-xl border border-green-100 bg-green-50 p-6">
      <h2 class="mb-3 text-xl font-semibold text-green-700">Getting Started</h2>
      <p class="text-gray-700">
        Edit
        <code class="rounded border border-green-200 bg-white px-1 py-0.5"
          >src/pages/HomePage.vue</code
        >
        to customize this page. The application uses a Django backend with Django REST Framework and
        a Vue 3 frontend with shadcn-vue components.
      </p>
      <div
        class="mt-4 rounded border border-green-200 bg-white p-4 font-mono text-sm text-green-600"
      >
        ./bin/run start
      </div>
    </section>
  </div>
</template>
