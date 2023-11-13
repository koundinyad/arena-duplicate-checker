export async function load({ url, cookies }) {
	const access_token = cookies.get('access_token');
	if (!access_token) {
		return {
			status: 401,
			error: 'Unauthorized'
		};
	} else {
		return {
			status: 200,
			access_token
		};
	}
}
