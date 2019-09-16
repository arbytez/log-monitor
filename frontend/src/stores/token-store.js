import { writable } from 'svelte/store';

const tokenStore = writable('');

const customTokenStore = {
  subscribe: tokenStore.subscribe,
  setToken: tokenData => {
    tokenStore.set(tokenData);
  },
  resetToken: () => {
    tokenStore.update(() => '');
  }
};

export default customTokenStore;
