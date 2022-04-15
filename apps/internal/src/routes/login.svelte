<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
import { browser } from '$app/env';

import { goto } from '$app/navigation';

	import {auth} from '$lib/firebase';
	import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

	let email = '';
	let password = '';
	let error = '';

    if (browser) {
        if(auth.currentUser) {
            goto('/');
        }
    }

	async function login(e) {
		e.preventDefault();
		try {
			const res = await signInWithEmailAndPassword(auth, email, password);
		} catch (err) {
            console.log(err.code)
            switch (err.code) {
                case 'auth/invalid-email':
                    error = 'Invalid email';
                    break;
                case 'auth/user-disabled':
                    error = 'User disabled';
                    break;
                case 'auth/user-not-found':
                    error = 'User not found';
                    break;
                case 'auth/wrong-password':
                    error = 'Wrong password';
                    break;
                default:
                    error = 'Unknown error';
                    console.log(error)
            }
		}
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<section>
	<div class="px-2 max-w-sm mx-auto mt-5">
		<h1 class="text font-semibold text-center text-2xl">Login</h1>
		<form on:submit={login}>
			<label class="label">
				<span class="label-text">Email</span>
				<input class="input" type="email" bind:value={email} />
			</label>
			<label class="label">
				<span class="label-text">Password</span>
				<input class="input" type="password" bind:value={password} />
			</label>
			<p class="text-red-400">{error}</p>
			<button class="button float-right mt-3">Login</button>
		</form>
	</div>
</section>
