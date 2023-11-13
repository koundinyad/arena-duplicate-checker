<script>
	import { token } from '$lib';
	import { Button } from 'flowbite-svelte';
	import ChannelsDropdown from '$lib/components/ChannelsDropdown.svelte';
	import { Toast } from 'flowbite-svelte';
	import { Icon } from 'flowbite-svelte-icons';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	export let data;

	$token = data.access_token;
	console.log($token);

	let user_details;
	let user_channels;
	let channel_blocks;

	const fetch_user_details = async () => {
		const res = await fetch('https://api.are.na/v2/me', {
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await res.json();
		user_details = data;
		const { id } = data;
		get_user_channels(id);

		return data;
	};

	const get_user_channels = async (id) => {
		const res = await fetch(`https://api.are.na/v2/users/${id}/channels?per=100`, {
			headers: {
				Authorization: `Bearer ${$token}`
			}
		});
		const data = await res.json();
		console.log(data);
		user_channels = data.channels;
		return data;
	};

	onMount(() => {
		trigger();
	});

	// Toast Autohide
	let showToast = true;
	let counter = 3;

	function trigger() {
		showToast = true;
		counter = 6;
		timeout();
	}

	function timeout() {
		if (--counter > 0) return setTimeout(timeout, 1000);
		showToast = false;
	}
</script>

<nav class="flex gap-8">
	<a href="/">Home</a>
	<p>Authorized</p>
</nav>
<Button outline on:click={fetch_user_details}>Fetch</Button>
<main class="grid grid-cols-2 justify-center min-h-[80vh] items-center">
	<div>
		{#if !channel_blocks}
			{#if user_channels}
				<ChannelsDropdown channels={user_channels} />
			{/if}
		{/if}
	</div>
</main>

<Toast
	transition={fly}
	params={{ y: 200 }}
	color="green"
	class="fixed left-[50%] translate-x-[-50%]"
	bind:open={showToast}
>
	<svelte:fragment slot="icon">
		<Icon name="check-circle-solid" class="w-5 h-5" />
		<span class="sr-only">Check icon</span>
	</svelte:fragment>
	Authenticated
</Toast>
