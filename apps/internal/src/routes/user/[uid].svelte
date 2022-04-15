<script lang="ts">
	import { browser } from '$app/env';

	import { page } from '$app/stores';
	import { auth, db } from '$lib/firebase';
	import Spinner from '$lib/spinner/Spinner.svelte';
	import type { User } from '$lib/types';
	import { dateToLocalString, timeDifference } from '$lib/utils';
	import { LockIcon, UnlockIcon } from '$lib/icons';
	import { variables } from '$lib/variables';
	import { authState } from 'rxfire/auth';
	import { goto } from '$app/navigation';

	let loading = false;
	let resetLink = '';

	let user;

	const unsubscribe = authState(auth).subscribe((u) => {
		user = u;
	});

	const uid = $page.params.uid;
	let userData: User;
	async function fetchData() {
		if (!auth.currentUser) return;
		const token = await auth.currentUser.getIdToken();
		const res = await fetch(`${variables.apiURL}user/${uid}`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				token
			}
		});
		if (!res.ok) return;
		const user = (await res.json()) as User;
		userData = user;
	}

	async function blockUser() {
		if (!auth.currentUser) return;
		loading = true;
		const token = await auth.currentUser.getIdToken();
		const res = await fetch(`${variables.apiURL}${userData.disabled ? 'unblock' : 'block'}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				token
			},
			body: JSON.stringify({
				uid: userData.uid
			})
		});

		await fetchData();
		loading = false;
	}

	async function resetPassword() {
		if (!auth.currentUser) return;
		loading = true;
		const token = await auth.currentUser.getIdToken();
		const res = await fetch(`${variables.apiURL}resetPassword`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				token
			},
			body: JSON.stringify({
				email: userData.email
			})
		});
		if (!res.ok) {
			await fetchData();
			loading = false;
			return;
		}
		const { link } = await res.json();
		console.log(link);
		resetLink = link;
		await fetchData();
		loading = false;
	}
</script>

<div class="md:grid md:grid-cols-2 md:gap-1 lg:gap-2 mt-2 px-2 max-w-6xl mx-auto">
	<div class="border border-red-500 p-2">
		<h1 class="text text-center text-lg font-semibold">User Management</h1>
		{#if userData}
			<div class="flex flex-col gap-y-2">
				<button class="button w-max" on:click={blockUser} disabled={user?.uid === uid}>
					{#if userData.disabled}
						<span class="flex flex-row items-center gap-2 icon">Unblock <UnlockIcon /></span>
					{:else}
						<span class="flex flex-row items-center gap-2 icon">Block <LockIcon /></span>
					{/if}
				</button>
				<button class="button w-max" on:click={resetPassword}>Reset Password</button>
				{#if resetLink}
					<a class="text underline" href={resetLink} target="_blank" rel="noopener noreferrer"
						>{resetLink.substring(0, 30)}...</a
					>
				{/if}
			</div>
		{:else}
			<Spinner />
		{/if}
	</div>
	<div class="border border-red-300 p-2 mt-2 md:mt-0">
		<h1 class="text text-center text-lg font-semibold">User Details</h1>
		<p class="text">User ID: <span class="font-mono">{uid}</span></p>
		{#await fetchData()}
			<div><Spinner /></div>
		{:then}
			<p class="text">Name: {userData.name}</p>
			<p class="text">Email: {userData.email}</p>
			<p class="text">
				Last seen: {timeDifference(new Date(), userData.lastSeen)}
				<span class="text-sm">({dateToLocalString(new Date(userData.lastSeen))})</span>
			</p>
		{:catch error}
			<p class="text-red-400">Something went wrong: {error.message}</p>
		{/await}
	</div>
</div>

{#if loading}
	<div class="absolute top-0 left-0 w-full h-full z-50 backdrop-grayscale backdrop-brightness-50">
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex flex-col items-center gap-2"
		>
			<Spinner fill />
			<h1 class="text">Loading...</h1>
		</div>
	</div>
{/if}
