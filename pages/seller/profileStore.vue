<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'
import { useSellers } from '~/composables/useSellers'
import { useToast } from '~/composables/useToast'
import { useCloudinaryUploader } from '~/composables/useCloudinaryUploader'
import type { Seller } from '~/types/Seller'

const router = useRouter()
const auth = getAuth()
const { getMe, updateSeller } = useSellers()
const { addToast } = useToast()
const { uploadImage } = useCloudinaryUploader()

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
  <div class="flex justify-center items-center min-h-screen bg-gray-100 p-4">
    <div class="max-w-3xl w-full bg-white p-8 rounded shadow-lg space-y-6 overflow-auto max-h-[90vh]">
      <h2 class="text-3xl font-semibold text-center">Profil Store</h2>

      <div v-if="loading" class="text-center text-gray-500">Memuat data...</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

      <template v-else-if="seller">
        <!-- Logo & Banner -->
        <div class="flex flex-col sm:flex-row sm:space-x-6 items-center">
          <div class="flex flex-col items-center">
            <img
              v-if="editableSeller.storeLogoUrl"
              :src="editableSeller.storeLogoUrl"
              alt="Store Logo"
              class="w-32 h-32 object-cover rounded-md border"
            />
            <div v-else class="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              No Logo
            </div>
            <label
              v-if="isEditing"
              class="mt-2 cursor-pointer text-blue-600 hover:underline text-sm"
            >
              Upload Logo
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChangeLogo"
                :disabled="isUploadingLogo"
              />
            </label>
            <p v-if="isUploadingLogo" class="text-xs text-gray-500 mt-1">Uploading logo...</p>
          </div>

          <div class="flex flex-col items-center mt-4 sm:mt-0">
            <img
              v-if="editableSeller.storeBannerUrl"
              :src="editableSeller.storeBannerUrl"
              alt="Store Banner"
              class="w-64 h-32 object-cover rounded-md border"
            />
            <div v-else class="w-64 h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              No Banner
            </div>
            <label
              v-if="isEditing"
              class="mt-2 cursor-pointer text-blue-600 hover:underline text-sm"
            >
              Upload Banner
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChangeBanner"
                :disabled="isUploadingBanner"
              />
            </label>
            <p v-if="isUploadingBanner" class="text-xs text-gray-500 mt-1">Uploading banner...</p>
          </div>
        </div>

        <!-- Store Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="font-semibold">Nama Toko:</label>
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
            <label class="font-semibold">Telepon:</label>
            <div v-if="isEditing">
              <input v-model="editableSeller.phone" class="form-input w-full border rounded p-2" />
            </div>
            <div v-else>{{ seller.phone || '-' }}</div>
          </div>

          <div>
            <label class="font-semibold">Alamat:</label>
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
              <a :href="seller.website" class="text-blue-600 hover:underline" target="_blank">
                {{ seller.website }}
              </a>
            </div>
            <div v-else>-</div>
          </div>

          <div class="col-span-2">
            <label class="font-semibold">Deskripsi Toko:</label>
            <div v-if="isEditing">
              <textarea v-model="editableSeller.storeDescription" class="form-textarea w-full border rounded p-2" rows="3" />
            </div>
            <div v-else>{{ seller.storeDescription || '-' }}</div>
          </div>

          <!-- Social Media Links -->
          <div class="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label class="font-semibold">Facebook:</label>
              <div v-if="isEditing">
                <input
                  v-model="editableSeller.socialMediaLinks!.facebook"
                  class="form-input w-full border rounded p-2"
                />
              </div>
              <div v-else-if="seller.socialMediaLinks?.facebook">
                <a :href="seller.socialMediaLinks.facebook" target="_blank" class="text-blue-600 hover:underline">
                  {{ seller.socialMediaLinks.facebook }}
                </a>
              </div>
              <div v-else>-</div>
            </div>

            <div>
              <label class="font-semibold">Instagram:</label>
              <div v-if="isEditing">
                <input
                  v-model="editableSeller.socialMediaLinks!.instagram"
                  class="form-input w-full border rounded p-2"
                />
              </div>
              <div v-else-if="seller.socialMediaLinks?.instagram">
                <a :href="seller.socialMediaLinks.instagram" target="_blank" class="text-pink-600 hover:underline">
                  {{ seller.socialMediaLinks.instagram }}
                </a>
              </div>
              <div v-else>-</div>
            </div>

            <div>
              <label class="font-semibold">Twitter:</label>
              <div v-if="isEditing">
                <input
                  v-model="editableSeller.socialMediaLinks!.twitter"
                  class="form-input w-full border rounded p-2"
                />
              </div>
              <div v-else-if="seller.socialMediaLinks?.twitter">
                <a :href="seller.socialMediaLinks.twitter" target="_blank" class="text-blue-400 hover:underline">
                  {{ seller.socialMediaLinks.twitter }}
                </a>
              </div>
              <div v-else>-</div>
            </div>

            <div>
              <label class="font-semibold">LinkedIn:</label>
              <div v-if="isEditing">
                <input
                  v-model="editableSeller.socialMediaLinks!.linkedin"
                  class="form-input w-full border rounded p-2"
                />
              </div>
              <div v-else-if="seller.socialMediaLinks?.linkedin">
                <a :href="seller.socialMediaLinks.linkedin" target="_blank" class="text-blue-700 hover:underline">
                  {{ seller.socialMediaLinks.linkedin }}
                </a>
              </div>
              <div v-else>-</div>
            </div>
          </div>

          <!-- Location -->
          <div class="col-span-2 grid grid-cols-2 gap-4">
            <div>
                <label class="font-semibold">Provinsi:</label>
                <div v-if="isEditing">
                <input
                    v-model="editableSeller.location!.province"
                    class="form-input w-full border rounded p-2"
                />
                </div>
                <div v-else>{{ seller.location?.province || '-' }}</div>
            </div>

            <div>
                <label class="font-semibold">Kota:</label>
                <div v-if="isEditing">
                <input
                    v-model="editableSeller.location!.city"
                    class="form-input w-full border rounded p-2"
                />
                </div>
                <div v-else>{{ seller.location?.city || '-' }}</div>
            </div>

            <div>
                <label class="font-semibold">Kecamatan:</label>
                <div v-if="isEditing">
                <input
                    v-model="editableSeller.location!.district"
                    class="form-input w-full border rounded p-2"
                />
                </div>
                <div v-else>{{ seller.location?.district || '-' }}</div>
            </div>

            <div>
                <label class="font-semibold">Kode Pos:</label>
                <div v-if="isEditing">
                <input
                    v-model="editableSeller.location!.postalCode"
                    class="form-input w-full border rounded p-2"
                />
                </div>
                <div v-else>{{ seller.location?.postalCode || '-' }}</div>
            </div>
          </div>

          <!-- Optional Policies -->
          <div class="col-span-2">
            <label class="font-semibold">Kebijakan Pengembalian:</label>
            <div v-if="isEditing">
              <textarea v-model="editableSeller.returnPolicy" class="form-textarea w-full border rounded p-2" rows="3" />
            </div>
            <div v-else>{{ seller.returnPolicy || '-' }}</div>
          </div>

          <div class="col-span-2">
            <label class="font-semibold">Kebijakan Pengiriman:</label>
            <div v-if="isEditing">
              <textarea v-model="editableSeller.shippingPolicy" class="form-textarea w-full border rounded p-2" rows="3" />
            </div>
            <div v-else>{{ seller.shippingPolicy || '-' }}</div>
          </div>

          <div class="col-span-2">
            <label class="font-semibold">Metode Pembayaran (pisahkan dengan koma):</label>
            <div v-if="isEditing">
              <input
                v-model="paymentMethodsString"
                class="form-input w-full border rounded p-2"
                placeholder="e.g. Credit Card, Bank Transfer, COD"
              />
            </div>
            <div v-else>
              {{ seller.paymentMethods?.join(', ') || '-' }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex justify-between items-center">
          <button
            @click="isEditing ? saveChanges() : isEditing = true"
            class="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
            :disabled="saving || isUploadingLogo || isUploadingBanner"
          >
            {{ isEditing ? (saving ? 'Menyimpan...' : 'Simpan') : 'Edit Profil' }}
          </button>

          <button
            v-if="isEditing"
            @click="cancelEdit"
            class="bg-gray-400 text-white py-2 px-6 rounded hover:bg-gray-500 transition"
            :disabled="saving || isUploadingLogo || isUploadingBanner"
          >
            Batal
          </button>

          <button
            @click="handleLogout"
            class="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </template>

      <div v-else class="text-center text-gray-500">Data seller tidak ditemukan.</div>
    </div>
  </div>
</template>
