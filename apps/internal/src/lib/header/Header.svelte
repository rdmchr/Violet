<script lang="ts">
	import { browser } from '$app/env';

	import { page } from '$app/stores';
	import { MoonIcon, SunIcon } from '$lib/icons';
	import logo from './V.svg';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';

	let theme = '';
	let user;
	const unsubscribe = auth.onAuthStateChanged((u) => user = u);

	if (browser) {
		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			theme = 'dark';
			document.documentElement.classList.add('dark');
		} else {
			theme = 'light';
			document.documentElement.classList.remove('dark');
		}
	}

	function toggleDarkMode() {
		if (localStorage.theme === 'dark') {
			localStorage.theme = 'light';
			document.documentElement.classList.remove('dark');
			theme = 'light';
		} else {
			localStorage.theme = 'dark';
			document.documentElement.classList.add('dark');
			theme = 'dark';
		}
	}

	async function logout() {
		await auth.signOut();
		goto('/login');
	}
</script>

<header class="max-w-[100vw] flex justify-between items-center w-[100vw] px-2">
	<div class="corner">
		<a href="https://violet.schule">
			<img src={logo} alt="SvelteKit" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></li>
			<li class:active={$page.url.pathname === '/login'}>
				{#if user}
					<p on:click={logout}>Logout</p>
				{:else}
					<a sveltekit:prefetch href="/login">Login</a>
				{/if}
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="flex items-center justify-items-center">
		<!-- TODO put something else here? github link? -->
		<button on:click={toggleDarkMode}>
			{#if theme === 'light'}
				<span class="icon text-2xl w-max"><MoonIcon /></span>
			{:else}
				<span class="icon text-2xl w-max"><SunIcon /></span>
			{/if}
		</button>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	nav p {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	p:hove {
		color: var(--accent-color);
	}

	a:hover {
		color: var(--accent-color);
	}
</style>
