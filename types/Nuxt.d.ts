import type { Auth } from 'firebase/auth';

declare module '#app' {
  interface NuxtApp {
    $auth: Auth;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: Auth;
  }
}
