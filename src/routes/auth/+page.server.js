import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

export async function load({ url, cookies }) {
	const code = url.searchParams.get('code');

	const cookie_token = cookies.get('access_token');

	// if (!cookie_token) {
	const res = await fetch(
		`http://dev.are.na/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=https://localhost:5173/auth`,
		{
			method: 'POST'
		}
	);
	const body = await res.json();
	const access_token = body.access_token;
	cookies.set('access_token', access_token);
	return {
		status: 200,
		access_token
	};
}
