import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/firebase';

export const handle: Handle = async ({ event, resolve }) => {
	/* 	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
		event.locals.userid = cookies.userid || uuid();
	
		
	
		if (!cookies.userid) {
			// if this is the first time the user has visited this app,
			// set a cookie so that we recognise them when they return
			response.headers.set(
				'set-cookie',
				cookie.serialize('userid', event.locals.userid, {
					path: '/',
					httpOnly: true
				})
			);
		} */


	/* if (auth.currentUser) {
		const token = await auth.currentUser.getIdToken();
		console.log(token)
	} else {
		console.log("NO USER")
	} */

	const response = await resolve(event);

	return response;
};
