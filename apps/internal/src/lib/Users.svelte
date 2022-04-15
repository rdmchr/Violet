<script lang="ts">
	import { auth, db } from '$lib/firebase';
	import type { User } from '$lib/types';
	import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
	import Spinner from '$lib/spinner/Spinner.svelte';
	import { goto } from '$app/navigation';
	import { variables } from './variables';

	export let maxUsers = 10;
	let users: User[] = [];
	let userLoading = true;

	const usersRef = collection(db, 'userData');
	const q = query(usersRef, orderBy('lastSeen'), limit(maxUsers));

	async function loadData() {
		if (!auth.currentUser) {
			console.log('No user logged in');
			return;
		}
		userLoading = true;
		users = [];
		const token = await auth.currentUser.getIdToken();
		const querySnapshot = await getDocs(q);
		const u = [];
		const tempU = [];
		querySnapshot.forEach((doc) => {
			u.push(doc.id);
		});
		for (const uIndex in u) {
			const uid = u[uIndex];
			const res = await fetch(`${variables.apiURL}user/${uid}`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json',
					token
				}
			});
			if (!res.ok) continue;
			const user = (await res.json()) as User;
			tempU.push(user);
		}
		users = tempU;
		userLoading = false;
	}

	const unsubscribe = auth.onAuthStateChanged((_) => loadData());
</script>

<section>
	<div class="border px-1 w-full">
		<h1 class="text font-bold text-center text-lg">Users</h1>
		{#if userLoading}
			<div class="w-5 h-5 mx-auto my-2">
				<Spinner />
			</div>
		{/if}
		{#await loadData()}
			<div />
		{:then}
			{#if users}
				{#each users as user}
					<p
						class="text py-1 border-b border-gray-400 cursor-pointer"
						on:click={() => goto(`/user/${user.uid}`)}
					>
						<span class="text">{user.name}</span> (<span class="text-gray-405 text-sm"
							>{user.email}</span
						>)
					</p>
				{/each}
			{:else}
				<div>
					<h1>No users</h1>
				</div>
			{/if}
		{:catch error}
			<p class="text-red-400">Something went wrong: {error.message}</p>
		{/await}
	</div>
</section>

<style>
</style>
