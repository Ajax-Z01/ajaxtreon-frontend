import { useNuxtApp } from '#app';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { AuthError } from 'firebase/auth';
import { ref } from 'vue';

export const useAuth = () => {
  const { $auth } = useNuxtApp();
  const error = ref<string | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);

  // Login Function
  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const userCredential = await signInWithEmailAndPassword($auth, email, password);
      const user = userCredential.user;
  
      const idToken = await user.getIdToken();
      token.value = idToken;
  
      localStorage.setItem('userToken', idToken);
    } catch (err) {
      const authError = err as AuthError;
      error.value = authError.message || 'Unknown error occurred during login.';
      console.error('Login error:', authError);
    } finally {
      loading.value = false;
    }
  };  

  // Logout Function
  const logout = async () => {
    loading.value = true;
    error.value = null;
    try {
      await signOut($auth);
    } catch (err) {
      const authError = err as AuthError;
      error.value = authError.message || 'Unknown error occurred during logout.';
      console.error('Logout error:', authError);
    } finally {
      loading.value = false;
    }
  };

  return {
    login,
    logout,
    error,
    loading,
  };
};
