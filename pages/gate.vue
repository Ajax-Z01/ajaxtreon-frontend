<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUserWithRole } from '~/composables/getCurrentUser'

const router = useRouter()

onMounted(async () => {
  const { user } = await getCurrentUserWithRole()
  if (!user || !user.role) {
    return router.replace('/auth/login')
  }

  switch (user.role) {
    case 'seller':
      router.replace('/seller/dashboard')
      break
    case 'admin':
      router.replace('/admin/dashboard')
      break
    default:
      router.replace('/customer/dashboard')
  }
})
</script>
