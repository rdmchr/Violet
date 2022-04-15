<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';

	import { auth } from '$lib/firebase';

	import Invites from '$lib/Invites.svelte';
	import Users from '$lib/Users.svelte';

	const unsubscribe = auth.onAuthStateChanged((u) => {
		if (browser && !u) goto('/login');
	});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<div class="max-w-6xl mx-auto">
		<div class="grid px-2 mt-2">
			<Users />
			<br />
			<Invites />
		</div>
	</div>
</section>

<style>
</style>
