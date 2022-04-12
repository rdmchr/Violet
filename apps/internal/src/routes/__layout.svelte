<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';
	import { authState } from 'rxfire/auth';
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';
	import { auth } from '$lib/firebase';
	import * as Sentry from "@sentry/browser";

	if (browser && process.env.NODE_ENV !== 'development') {
		Sentry.init({
			dsn: 'https://4562caaca74347238d00957701cd45fb@o1186656.ingest.sentry.io/6334673',

			// Set tracesSampleRate to 1.0 to capture 100%
			// of transactions for performance monitoring.
			// We recommend adjusting this value in production
			tracesSampleRate: 0
		});
	}

	let user;

	const unsubscribe = authState(auth).subscribe((u) => {
		user = u;
		if (browser && u) goto('/');
		else if (browser && !u) goto('/login');
	});
</script>

<header>
	<Header />
</header>

<main>
	<slot />
</main>
