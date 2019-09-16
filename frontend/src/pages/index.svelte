<script>
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { Button } from "svelma";

  import { exec, execPromise } from "../graphql/init.js";
  import gql from "graphql-tag";
  import { LOGGED_QUERY, WATCHEDLOGS_QUERY } from "../graphql/queries";
  import { LOGIN_MUTATION, LOGOUT_MUTATION } from "../graphql/mutations";
  import Hero from "../components/Hero.svelte";
  import LogSection from "../components/LogSection.svelte";
  import Loader from "../components/Loader.svelte";
  import { addLog } from "../helpers/util";
  import tokenStore from "../stores/token-store";

  let isLogged = false;
  let isLoading = true;
  let watchedLogs = [];
  let observables = [];
  let modalLogin = null;
  let passwordInput = null;
  let isPasswordCorrect = true;
  let isLoadingLogin = false;

  function subscribeToWatchedLogs() {
    observables.forEach(ob => {
      if (ob.uns.unsubscribe) {
        ob.uns.unsubscribe();
      }
      ob = null;
    });
    observables = [];
    // get infos for all the log watched from server
    execPromise({ query: WATCHEDLOGS_QUERY })
      .then(dataWatchedLogs => {
        watchedLogs = dataWatchedLogs.data.watchedLogs;
        // build the subscription for every log
        const subscriptions = {};
        watchedLogs.forEach(el => {
          const subQuery = gql`
              subscription {
                  ${el.name} {
                    from
                    data
                  }
                }
              `;
          subscriptions[el.name] = subQuery;
        });

        // subscribe the observable for each log
        Object.keys(subscriptions).forEach(logName => {
          const cb = {
            next: receivedData => {
              addLog(receivedData, logName);
            },
            error: error =>
              console.error(`received from '${logName}' error ${error}`),
            complete: () => console.log(`complete '${logName}'`)
          };
          const obs = exec({ query: subscriptions[logName] });
          const uns = obs.subscribe(cb);
          observables.push({ obs, uns });
        });
        isLoading = false;
      })
      .catch(err => {
        isLogged = false;
        isLoading = false;
        isLoadingLogin = false;
        isPasswordCorrect = false;
      });
  }

  function toggleModal() {
    modalLogin.classList.toggle("is-active");
    if (modalLogin.classList.contains("is-active")) {
      passwordInput.focus();
    }
  }

  function logIn() {
    isLoadingLogin = true;
    isPasswordCorrect = true;
    if (passwordInput.value) {
      execPromise({
        query: LOGIN_MUTATION,
        variables: { password: passwordInput.value }
      })
        .then(dataLogin => {
          tokenStore.setToken(dataLogin.data.login);
          isPasswordCorrect = true;
          isLogged = true;
          subscribeToWatchedLogs();
          toggleModal();
          isLoadingLogin = false;
        })
        .catch(err => {
          isLogged = false;
          isPasswordCorrect = false;
          isLoadingLogin = false;
        });
    } else {
      isLoadingLogin = false;
      isPasswordCorrect = true;
    }
  }

  async function logOut() {
    await execPromise({ query: LOGOUT_MUTATION });
    observables.forEach(ob => {
      if (ob.uns.unsubscribe) {
        ob.uns.unsubscribe();
      }
      ob = null;
    });
    // observables.forEach(ws => {
    //   ws.close();
    //   ws = null;
    // });
    observables = [];
    isLogged = false;
  }

  onMount(() => {
    isLoading = true;
    // check if user is logged
    execPromise({ query: LOGGED_QUERY })
      .then(dataLogged => {
        isLogged = dataLogged.data.logged;
        if (isLogged) {
          subscribeToWatchedLogs();
        } else {
          isLoading = false;
        }
      })
      .catch(err => {
        isLogged = false;
        isLoading = false;
      });
  });

  onDestroy(() => {
    observables.forEach(ob => {
      if (ob.uns.unsubscribe) {
        ob.uns.unsubscribe();
      }
      ob = null;
    });
    // observables.forEach(ws => {
    //   ws.close();
    //   ws = null;
    // });
    observables = [];
  });
</script>

{#if !isLoading}
  <Hero />
  <section class="section">
    {#if !isLogged}
      <p class="notification" style="font-size: 0.75rem;">
        You are not logged in.
        <span class="login-action" on:click={toggleModal}>Log In</span>
      </p>
    {:else}
      <p class="notification" style="font-size: 0.75rem;">
        You are monitoring
        <strong>{watchedLogs.length}</strong>
        {watchedLogs.length !== 1 ? 'files' : 'file'}.
        <span
          class="login-action"
          on:click={async () => {
            await logOut();
          }}>
          Log Out
        </span>
      </p>
      {#each watchedLogs as watchedLog, i (i)}
        <LogSection {watchedLog} />
      {/each}
    {/if}
  </section>
  <div class="modal" bind:this={modalLogin} transition:fade>
    <div class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Log In</p>
        <button class="delete" aria-label="close" on:click={toggleModal} />
      </header>
      <form
        on:submit|preventDefault={() => {
          logIn();
        }}>
        <div class="modal-card-body">
          <div class="container">
            <div class="field">
              <label class="label">Password</label>
              <div class="control">
                <input
                  class={`input ${!isPasswordCorrect ? 'is-danger' : ''}`}
                  type="password"
                  placeholder="Password"
                  bind:this={passwordInput} />
              </div>
              {#if !isPasswordCorrect}
                <p class="help is-danger">Invalid password!</p>
              {/if}
            </div>
          </div>
        </div>
        <footer class="modal-card-foot">
          <button
            class={`button is-info ${isLoadingLogin ? 'is-loading' : ''}`}
            disabled={isLoadingLogin}
            type="submit">
            Login
          </button>
          <div class="login-action" on:click={toggleModal}>Cancel</div>
        </footer>
      </form>
    </div>
  </div>
{:else}
  <Loader />
{/if}
