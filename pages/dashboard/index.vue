<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { Product, Category } from '~/types/Inventory'; // Type-only import

const router = useRouter();
const db = getFirestore();
const auth = getAuth();

const stats = ref([
  { label: 'Products', value: 0 },
  { label: 'Categories', value: 0 }
]);

const recentProducts = ref<Product[]>([]); // Set type Product
const user = ref<{ email: string | null, uid: string | null } | null>(null);

const fetchUser = async () => {
  const authUser = auth.currentUser;
  if (authUser) {
    user.value = {
      email: authUser.email,
      uid: authUser.uid
    };
  } else {
    router.push('/auth/login');
  }
};

const fetchStats = async () => {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const productsData: Product[] = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name ?? '', // Add the 'name' field if it's missing
      categoryId: doc.data().categoryId ?? '', // Add the 'categoryId' field if it's missing
      price: doc.data().price ?? 0, // Ensure price is a number
      quantity: doc.data().quantity ?? 0, // Ensure quantity is a number
      createdAt: doc.data().createdAt.toDate(), // Convert Firestore timestamp to Date
      updatedAt: doc.data().updatedAt.toDate() // Convert Firestore timestamp to Date
    }));

    stats.value[0].value = productsSnapshot.size;
    recentProducts.value = productsData.slice(0, 5); // Ambil 5 produk pertama

    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData: Category[] = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name ?? '', // Add the 'name' field if it's missing
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    }));

    stats.value[1].value = categoriesSnapshot.size;

    console.log('Products:', productsData);
    console.log('Categories:', categoriesData);
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

onMounted(async () => {
  await fetchUser();
  await fetchStats();
});
</script>


<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Welcome back, {{ user?.email }}!</h1>

    <!-- Statistik -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-5xl font-bold text-blue-600">{{ stat.value }}</div>
        <div class="mt-2 text-gray-500">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Produk Terbaru -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-semibold mb-4">Recent Products</h2>
      <div v-if="recentProducts.length > 0">
        <ul class="divide-y">
          <li v-for="product in recentProducts" :key="product.id" class="py-2">
            <div class="flex justify-between">
              <span class="font-medium">{{ product.name }}</span>
              <span class="text-gray-400 text-sm">${{ product.price }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="text-gray-400">No products available.</div>
    </div>

    <!-- Aksi Navigasi -->
    <div class="flex space-x-4">
      <button
        @click="$router.push('/products')"
        class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
      >
        Manage Products
      </button>
      <button
        @click="$router.push('/categories')"
        class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
      >
        Manage Categories
      </button>
    </div>
  </div>
</template>
