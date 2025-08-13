<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'
import { useSellers } from '~/composables/seller/useSellers'
import { useToast } from '~/composables/utils/useToast'
import { useCloudinaryUploader } from '~/composables/utils/useCloudinaryUploader'
import type { Seller } from '~/types/Seller'
import {
  Store, Pencil, Save, X, LogOut, LoaderCircle, ImagePlus, ArrowLeft, Facebook, Instagram, Twitter, Linkedin
} from 'lucide-vue-next'

const platformIcons: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
}

const router = useRouter()
const auth = getAuth()
const { getMe, updateSeller } = useSellers()
const { addToast } = useToast()
const { uploadImage } = useCloudinaryUploader()
const goBack = () => router.back()

const isEditing = ref(false)
const isUploadingLogo = ref(false)
const isUploadingBanner = ref(false)
const uploadError = ref<string | null>(null)

const {
  data: seller,
  refresh: refreshSeller,
  pending: loading,
  error
} = useLazyAsyncData<Seller | null>(
  'seller-profile',
  async () => {
    const data = await getMe()
    if (!data) throw new Error('Seller profile not found')
    return data
  },
  { immediate: true }
)

const editableSeller = ref<Partial<Seller>>({
  location: {
    province: '',
    city: '',
    district: '',
    postalCode: ''
  },
  socialMediaLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  }
})

const saving = ref(false)

watch(seller, (val) => {
  if (val) {
    editableSeller.value = {
      ...val,
      location: {
        province: val.location?.province || '',
        city: val.location?.city || '',
        district: val.location?.district || '',
        postalCode: val.location?.postalCode || ''
      },
      socialMediaLinks: {
        facebook: val.socialMediaLinks?.facebook || '',
        instagram: val.socialMediaLinks?.instagram || '',
        twitter: val.socialMediaLinks?.twitter || '',
        linkedin: val.socialMediaLinks?.linkedin || ''
      }
    }
  }
})

const saveChanges = async () => {
  if (!seller.value) return
  saving.value = true
  try {
    await updateSeller(seller.value.id, editableSeller.value)
    await refreshSeller()
    isEditing.value = false
    addToast('Profile updated', 'success')
  } catch (err: any) {
    addToast(err.message || 'Failed to update profile', 'error')
  } finally {
    saving.value = false
  }
}

const onFileChangeLogo = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploadingLogo.value = true
  uploadError.value = null
  try {
    const url = await uploadImage(file)
    editableSeller.value.storeLogoUrl = url
    addToast('Logo uploaded', 'success')
  } catch (err: any) {
    uploadError.value = err.message || 'Upload failed'
    addToast(uploadError.value || 'Upload failed', 'error')
  } finally {
    isUploadingLogo.value = false
  }
}

const onFileChangeBanner = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploadingBanner.value = true
  uploadError.value = null
  try {
    const url = await uploadImage(file)
    editableSeller.value.storeBannerUrl = url
    addToast('Banner uploaded', 'success')
  } catch (err: any) {
    uploadError.value = err.message || 'Upload failed'
    addToast(uploadError.value ?? 'Upload failed', 'error')
  } finally {
    isUploadingBanner.value = false
  }
}

function normalizeSellerData(seller: Seller): Partial<Seller> {
  return {
    ...seller,
    location: {
      province: seller.location?.province || '',
      city: seller.location?.city || '',
      district: seller.location?.district || '',
      postalCode: seller.location?.postalCode || ''
    },
    socialMediaLinks: {
      facebook: seller.socialMediaLinks?.facebook || '',
      instagram: seller.socialMediaLinks?.instagram || '',
      twitter: seller.socialMediaLinks?.twitter || '',
      linkedin: seller.socialMediaLinks?.linkedin || ''
    },
    returnPolicy: seller.returnPolicy || '',
    shippingPolicy: seller.shippingPolicy || '',
    paymentMethods: seller.paymentMethods || []
  }
}

const cancelEdit = () => {
  isEditing.value = false
  if (seller.value) {
    editableSeller.value = normalizeSellerData(seller.value)
  }
}

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/auth/login')
  } catch (err: any) {
    addToast('Logout failed: ' + err.message, 'error')
  }
}

const paymentMethodsString = computed({
  get() {
    return editableSeller.value.paymentMethods?.join(', ') || ''
  },
  set(val: string) {
    editableSeller.value.paymentMethods = val.split(',').map(v => v.trim()).filter(Boolean)
  }
})
</script>

<template>
  <div class="flex justify-center items-center bg-gray-100 p-4 min-h-screen">
    <div class="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-xl shadow space-y-8">

      <!-- Header -->
       <NuxtLink
        to="/seller/profile"
        class="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
      >
        <ArrowLeft class="w-7 h-7 text-white" /> Back to Profile
      </NuxtLink>
      <div class="flex items-center justify-center gap-2 text-3xl font-semibold text-gray-800">
        <Store class="w-7 h-7 text-blue-600" />
        Profil Store
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="text-center text-gray-500">Loading data...</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

      <!-- Profile Form -->
      <template v-else-if="seller">
        <!-- Logo & Banner -->
        <div class="flex flex-col sm:flex-row sm:space-x-10 items-center justify-center">

          <!-- Logo -->
          <div class="flex flex-col items-center">
            <div
              class="w-36 h-36 rounded-md border border-gray-300 shadow-sm overflow-hidden bg-gray-50 flex items-center justify-center"
              :class="{'border-blue-500': isEditing}"
              title="Recommended size logo: 144x144px"
            >
              <img
                v-if="editableSeller.storeLogoUrl"
                :src="editableSeller.storeLogoUrl"
                alt="Store Logo"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-gray-400 select-none">No Logo</span>
            </div>

            <label
              v-if="isEditing"
              class="mt-3 flex items-center gap-1 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium"
            >
              <ImagePlus class="w-5 h-5" />
              Upload Logo
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChangeLogo"
                :disabled="isUploadingLogo"
              />
            </label>

            <p
              v-if="isUploadingLogo"
              class="text-xs text-gray-500 mt-1 flex items-center gap-1 select-none"
            >
              <LoaderCircle class="w-4 h-4 animate-spin" />
              Uploading logo...
            </p>

            <p class="mt-1 text-xs text-gray-400 italic select-none">
              * Ukuran ideal logo 144x144 px
            </p>
          </div>

          <!-- Banner -->
          <div class="flex flex-col items-center mt-8 sm:mt-0">
            <div
              class="w-72 h-40 rounded-md border border-gray-300 shadow-sm overflow-hidden bg-gray-50 flex items-center justify-center"
              :class="{'border-blue-500': isEditing}"
              title="Ukuran ideal banner: 720x400px"
            >
              <img
                v-if="editableSeller.storeBannerUrl"
                :src="editableSeller.storeBannerUrl"
                alt="Store Banner"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-gray-400 select-none">No Banner</span>
            </div>

            <label
              v-if="isEditing"
              class="mt-3 flex items-center gap-1 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium"
            >
              <ImagePlus class="w-5 h-5" />
              Upload Banner
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChangeBanner"
                :disabled="isUploadingBanner"
              />
            </label>

            <p
              v-if="isUploadingBanner"
              class="text-xs text-gray-500 mt-1 flex items-center gap-1 select-none"
            >
              <LoaderCircle class="w-4 h-4 animate-spin" />
              Uploading banner...
            </p>

            <p class="mt-1 text-xs text-gray-400 italic select-none">
              * Ukuran ideal banner 720x400 px
            </p>
          </div>

        </div>


        <hr />

        <!-- Informasi Umum -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="font-semibold">Store Name:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.storeName" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else>{{ seller.storeName || seller.name }}</div>
          </div>

          <div>
            <label class="font-semibold">Email:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.email" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else>{{ seller.email || '-' }}</div>
          </div>

          <div>
            <label class="font-semibold">Phone:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.phone" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else>{{ seller.phone || '-' }}</div>
          </div>

          <div>
            <label class="font-semibold">Address:</label>
            <div v-if="isEditing">
              <textarea v-model="editableSeller.address" class="form-textarea w-full border rounded p-2" rows="2" />
            </div>
            <div v-else>{{ seller.address || '-' }}</div>
          </div>

          <div class="col-span-2">
            <label class="font-semibold">Website:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.website" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else-if="seller.website">
              <a :href="seller.website" class="text-blue-600 hover:underline" target="_blank">{{ seller.website }}</a>
            </div>
            <div v-else>-</div>
          </div>

          <div class="col-span-2">
            <label class="font-semibold">Store Description:</label>
            <div v-if="isEditing">
              <textarea v-model="editableSeller.storeDescription" class="form-textarea w-full border rounded p-2" rows="3" />
            </div>
            <div v-else>{{ seller.storeDescription || '-' }}</div>
          </div>
        </div>

        <hr />

        <!-- Social Media -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="(platform, key) in editableSeller.socialMediaLinks"
            :key="key"
            class="flex flex-col break-words"
          >
            <!-- Label + Icon -->
            <label class="flex items-center gap-1 font-semibold capitalize mb-1">
              <component :is="platformIcons[key]" class="w-4 h-4" />
              {{ key }}
            </label>

            <!-- Edit Mode -->
            <div v-if="isEditing">
              <input
                v-model="editableSeller.socialMediaLinks![key]"
                class="form-input w-full border rounded p-2"
                placeholder="Enter link"
              />
            </div>

            <!-- View Mode with link -->
            <div v-else-if="seller.socialMediaLinks?.[key]">
              <a
                :href="seller.socialMediaLinks[key]"
                target="_blank"
                class="text-blue-600 hover:underline break-all"
              >
                {{ seller.socialMediaLinks[key] }}
              </a>
            </div>

            <!-- View Mode empty -->
            <div v-else class="text-gray-400">-</div>
          </div>
        </div>

        <hr />

        <!-- Lokasi -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="font-semibold">Province:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.location!.province" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else>{{ seller.location?.province || '-' }}</div>
          </div>

          <div>
            <label class="font-semibold">City:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.location!.city" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else>{{ seller.location?.city || '-' }}</div>
          </div>

          <div>
            <label class="font-semibold">District:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.location!.district" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else>{{ seller.location?.district || '-' }}</div>
          </div>

          <div>
            <label class="font-semibold">Postal Code:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.location!.postalCode" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else>{{ seller.location?.postalCode || '-' }}</div>
          </div>
        </div>

        <hr />

        <!-- Kebijakan -->
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="font-semibold">Return Policy:</label>
            <div v-if="isEditing">
              <textarea v-model="editableSeller.returnPolicy" class="form-textarea w-full border rounded p-2" rows="3" />
            </div>
            <div v-else>{{ seller.returnPolicy || '-' }}</div>
          </div>

          <div>
            <label class="font-semibold">Shipping Policy:</label>
            <div v-if="isEditing">
              <textarea v-model="editableSeller.shippingPolicy" class="form-textarea w-full border rounded p-2" rows="3" />
            </div>
            <div v-else>{{ seller.shippingPolicy || '-' }}</div>
          </div>

          <div>
            <label class="font-semibold">Payment Methods:</label>
            <div v-if="isEditing">
              <input
                v-model="paymentMethodsString"
                class="form-input w-full border rounded p-2"
                placeholder="e.g. Credit Card, Bank Transfer, COD"
              />
            </div>
            <div v-else>{{ seller.paymentMethods?.join(', ') || '-' }}</div>
          </div>
        </div>

        <!-- Tombol Aksi -->
        <div class="mt-6 flex flex-wrap gap-4 justify-between items-center">
          <button
            @click="isEditing ? saveChanges() : isEditing = true"
            class="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            :disabled="saving || isUploadingLogo || isUploadingBanner"
          >
            <component :is="isEditing ? Save : Pencil" class="w-4 h-4" />
            <span>{{ isEditing ? (saving ? 'Saving...' : 'Save') : 'Edit Profile' }}</span>
            <LoaderCircle v-if="saving" class="w-4 h-4 animate-spin ml-2" />
          </button>

          <button
            v-if="isEditing"
            @click="cancelEdit"
            class="flex items-center gap-2 bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition"
            :disabled="saving || isUploadingLogo || isUploadingBanner"
          >
            <X class="w-4 h-4" /> Cancel
          </button>

          <button
            @click="handleLogout"
            class="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
          >
            <LogOut class="w-4 h-4" /> Logout
          </button>
        </div>
      </template>

      <div v-else class="text-center text-gray-500">Seller not found.</div>
    </div>
  </div>
</template>
