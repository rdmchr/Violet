<script lang="ts">
	import { auth, db } from '$lib/firebase';
	import { AddIcon, CloseIcon, CopyIcon, HideIcon, ShowIcon } from './icons';
	import Spinner from './spinner/Spinner.svelte';
	import type { Invite } from './types';
	import SveltyPicker from 'svelty-picker';
	import { dateFromLocalString, dateToLocalString } from './utils';
	import {variables} from '$lib/variables';

	export let maxInvites = 10;

	let inviteCode = '';
	let inviteLoading = false;
	let inviteModal = false;
	let inviteError = '';

	let invites: Invite[] = [];
	let showAllCodes = false;
	let inviteExpires = dateToLocalString(
		new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
		true
	); // default is 7 days

	async function fetchData() {
		if (!auth.currentUser) return;
		const token = await auth.currentUser.getIdToken();
		const res = await fetch(`${variables.apiURL}invites?limit=${maxInvites}`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json',
				token
			}
		});
		if (!res.ok) return;
		const invitesData = (await res.json()) as Invite[];
		invites = invitesData;
	}

	async function createInvite() {
		inviteError = '';
		if (!auth.currentUser) return;
		inviteLoading = true;
		const token = await auth.currentUser.getIdToken();
		const expires = dateFromLocalString(inviteExpires).getTime();
		if (expires < new Date().getTime()) {
			inviteError = 'Date must be in the future.';
			inviteLoading = false;
			return;
		}
		const res = await fetch(`${variables.apiURL}createInvite`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				token
			},
			body: JSON.stringify({
				expires
			})
		});
		if (!res.ok) {
			inviteLoading = false;
			return;
		}
		const { inviteId } = await res.json();
		await fetchData();
		inviteCode = inviteId;
		inviteLoading = false;
	}

	function copyInviteCode() {
		navigator.clipboard.writeText(inviteCode);
	}

	const unsubscribe = auth.onAuthStateChanged((_) => fetchData());
</script>

<div class="border relative">
	<button on:click={() => (inviteModal = true)} class="text-2xl icon absolute top-1 left-1"
		><AddIcon /></button
	>
	<h1 class="text text-lg font-semibold text-center mb-1">Invites</h1>
	<button
		on:click={() => (showAllCodes = !showAllCodes)}
		class="text-xl icon absolute top-2 right-2"
	>
		{#if showAllCodes}
			<HideIcon />
		{:else}
			<ShowIcon />
		{/if}
	</button>
	{#await fetchData()}
		<div class="w-5 h-5 mx-auto mb-2"><Spinner /></div>
	{:then}
		{#if invites}
			{#each invites as invite}
				<div class="flex items-center px-1 border-b border-gray-400">
					<div
						class={`${
							invite.usedById ? 'bg-red-400' : 'bg-green-400 animate-ping'
						} w-2 h-2 rounded-full mr-2`}
					/>
					<p class={`${showAllCodes ? '' : 'hide-me'} text font-mono`}>{invite.id}</p>
					<p class="text ml-2 hidden sm:block">Created by {invite.createdByEmail}</p>
				</div>
			{/each}
		{:else}
			<h1 class="text">No invites found</h1>
		{/if}
	{:catch error}
		<p class="text-red-400">Something went wrong: {error.message}</p>
	{/await}
</div>

{#if inviteModal}
	<div
		class="absolute top-0 left-0 w-[100vw] h-[100vh] backdrop-blur-md backdrop-brightness-50 backdrop-grayscale"
	>
		<div
			class="w-max h-max bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-5"
		>
		<span class="absolute top-2 left-2 icon text-2xl font-semibold" on:click={() => inviteModal = false}><CloseIcon /></span>
			<h1 class="text text-center text-lg font-semibold">Create a new invite</h1>
			<p class="text mt-2">Expires at:</p>
			<SveltyPicker inputClasses="input" format="dd.mm.yy, hh:ii" bind:value={inviteExpires} />
			<br />
			{#if inviteCode}
				<p class="text mt-2">Invite code:</p>
				<div class="flex items-center" on:click={copyInviteCode}>
					<p class="text font-mono">{inviteCode}</p>
					<span class="icon ml-2 text-lg"><CopyIcon /></span>
				</div>
			{/if}
			<p class="text-red-400">{inviteError}</p>
			<div class="flex items-center">
				<button class="button mt-3 mx-auto" on:click={createInvite} disabled={inviteLoading}>
					{#if inviteLoading}
						<spinner />
					{/if}
					Create invite
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.hide-me {
		opacity: 0;
		transition: opacity 0.5s ease;
	}

	.hide-me:hover {
		opacity: 1;
	}
</style>
