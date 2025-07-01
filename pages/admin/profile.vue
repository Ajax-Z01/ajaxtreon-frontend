<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUserWithToken } from '~/composables/getCurrentUser'
import { useUsers } from '~/composables/useUsers'
import { useToast } from '~/composables/useToast'
import { useCloudinaryUploader } from '~/composables/useCloudinaryUploader'
import type { User } from '~/types/User'
import { useLazyAsyncData } from '#app'
import { UserCircle, UserCog, Mail, Phone, MapPin, ShieldCheck, PencilLine, Save, XCircle, ImagePlus, LogOut } from 'lucide-vue-next'

const router = useRouter()
const { getUserById, updateUserInfo } = useUsers()
const { addToast } = useToast()
const { uploadImage } = useCloudinaryUploader()

const isEditing = ref(false)
const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const userId = ref<string | null>(null)
const form = ref<Partial<User>>({})

const getUid = async () => {
  try {
    const result = await getCurrentUserWithToken()
    if (!result?.user?.uid) throw new Error('User not authenticated')
    userId.value = result.user.uid
  } catch (error) {
    console.error('Auth error:', error)
    router.push('/auth/login')
  }
}

const { data: userData, pending: loading, refresh } = useLazyAsyncData(
  'user-profile',
  async () => {
    if (!userId.value) throw new Error('User ID not set')
    const data = await getUserById(userId.value)
    if (!data) throw new Error('User not found')
    return data
  },
  { immediate: false }
)

watch(userData, (val) => {
  if (val) form.value = { ...val }
})

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  isUploading.value = true
  uploadError.value = null

  try {
    const url = await uploadImage(file)
    form.value.profilePictureUrl = url
    addToast('Profile picture uploaded', 'success')
  } catch (error) {
    uploadError.value = (error as Error).message || 'Upload failed'
    addToast(uploadError.value, 'error')
  } finally {
    isUploading.value = false
  }
}

const saveChanges = async () => {
  if (!userId.value || !form.value.name || !form.value.email) {
    addToast('Name and email are required.', 'error')
    return
  }

  if (isUploading.value) {
    addToast('Wait until image upload is complete.', 'error')
    return
  }

  try {
    await updateUserInfo(userId.value, {
      name: form.value.name!,
      email: form.value.email!,
      phone: form.value.phone,
      address: form.value.address,
      role: form.value.role,
      isActive: form.value.isActive,
      profilePictureUrl: form.value.profilePictureUrl,
    })

    await refresh()
    isEditing.value = false
    addToast('Profile updated.', 'success')
  } catch (err) {
    addToast('Failed to update profile.', 'error')
  }
}

const cancelEdit = () => {
  if (userData.value) form.value = { ...userData.value }
  isEditing.value = false
}

getUid().then(() => {
  if (userId.value) refresh()
})
</script>

<template>
  <div class="bg-gray-100 flex justify-center items-start py-10 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-10">
      <div class="flex items-center gap-2 mb-6 text-gray-700">
        <UserCircle class="w-6 h-6" />
        <h1 class="text-xl font-semibold">My Profile</h1>
      </div>

      <div v-if="loading" class="text-center text-gray-500 py-16 text-lg">
        Loading profile...
      </div>

      <template v-else>
        <!-- Avatar -->
        <div class="flex flex-col items-center mb-8">
          <img
            v-if="form.profilePictureUrl"
            :src="form.profilePictureUrl"
            alt="Profile"
            class="w-24 h-24 rounded-full object-cover shadow mb-2"
          />
          <div
            v-else
            class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-2"
          >
            <UserCircle class="w-12 h-12" />
          </div>

          <label v-if="isEditing" class="text-blue-600 hover:underline text-sm cursor-pointer flex items-center gap-1">
            <ImagePlus class="w-4 h-4" />
            Change Photo
            <input type="file" accept="image/*" class="hidden" @change="onFileChange" :disabled="isUploading" />
          </label>
          <p v-if="isUploading" class="text-xs text-gray-500 mt-1">Uploading...</p>
          <p v-if="uploadError" class="text-xs text-red-600 mt-1">{{ uploadError }}</p>
        </div>

        <!-- Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700">
          <div>
            <label class="font-medium flex items-center gap-1"><UserCog class="w-4 h-4" /> Name</label>
            <p v-if="!isEditing" class="mt-1 font-semibold">{{ userData?.name }}</p>
            <input v-else v-model="form.name" class="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label class="font-medium flex items-center gap-1"><Mail class="w-4 h-4" /> Email</label>
            <p v-if="!isEditing" class="mt-1">{{ userData?.email }}</p>
            <input v-else v-model="form.email" class="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label class="font-medium flex items-center gap-1"><Phone class="w-4 h-4" /> Phone</label>
            <p v-if="!isEditing" class="mt-1">{{ userData?.phone || '-' }}</p>
            <input v-else v-model="form.phone" class="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label class="font-medium flex items-center gap-1"><MapPin class="w-4 h-4" /> Address</label>
            <p v-if="!isEditing" class="mt-1">{{ userData?.address || '-' }}</p>
            <textarea v-else v-model="form.address" rows="2" class="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label class="font-medium flex items-center gap-1"><ShieldCheck class="w-4 h-4" /> Status</label>
            <p class="mt-1">
              <span
                class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                :class="userData?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                <span class="w-2 h-2 rounded-full" :class="userData?.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                {{ userData?.isActive ? 'Active' : 'Inactive' }}
              </span>
            </p>
          </div>

          <div>
            <label class="font-medium flex items-center gap-1"><UserCog class="w-4 h-4" /> Role</label>
            <p class="mt-1 capitalize text-gray-600">{{ userData?.role }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-10 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
          <div class="flex gap-2 flex-wrap w-full sm:w-auto">
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition w-full sm:w-auto"
            >
              <PencilLine class="w-4 h-4" /> Edit Profile
            </button>

            <div v-else class="flex gap-2 w-full sm:w-auto flex-wrap">
              <button
                @click="saveChanges"
                :disabled="isUploading"
                class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition w-full sm:w-auto"
              >
                <Save class="w-4 h-4" /> Save
              </button>
              <button
                @click="cancelEdit"
                :disabled="isUploading"
                class="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md text-sm transition w-full sm:w-auto"
              >
                <XCircle class="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>

          <NuxtLink
            to="/auth/logout"
            class="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition w-full sm:w-auto"
          >
            <LogOut class="w-4 h-4" /> Logout
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>
