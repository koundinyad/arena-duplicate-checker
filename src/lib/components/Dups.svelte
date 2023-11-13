<script>
	// import { onMount } from 'svelte';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { token } from '$lib';

	export let channels;
	console.log(channels);

	let duplicatePairs = [];

	const get_channel_blocks = async (slug) => {
		const res = await fetch(`http://localhost:8011/proxy/v2/channels/${slug}/blocks?per=100`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const data = await res.json();
		channel_blocks = data.blocks;
		console.log(data);
		findDuplicatesByClassKey(channels).then((result) => {
			duplicatePairs = result;
		});

		// const dups = findDuplicatesByClassKey(data.blocks);
		// 	const duplicates = check_duplicates_by_id(data.blocks);
		// console.log(dups);

		return data;
	};

	async function compareImages(image1, image2) {
		// Implement image comparison logic here
		return true; // For example, always return true
	}

	async function findDuplicatesByClassKey(arr) {
		const seenValues = {};
		const duplicates = [];

		for (const obj of arr) {
			let key, value;

			if (obj.class === 'Link') {
				key = 'source.url';
				value = obj.source.url;
			} else if (obj.class === 'Text') {
				key = 'content';
				value = obj.content;
			} else if (obj.class === 'Image') {
				key = 'image.square.url';
				value = obj.image.square.url;
			} else {
				key = 'id';
				value = obj.id;
			}

			if (!seenValues[key]) {
				seenValues[key] = { values: [value], objects: [obj] };
			} else {
				if (obj.class === 'Image') {
					// Fetch image data for comparison
					const img1 = new Image();
					img1.src = value;

					await img1.decode();

					if (seenValues[key].values.some((v) => compareImages(img1, v))) {
						const index = seenValues[key].values.indexOf(value);
						duplicates.push({ original: seenValues[key].objects[index], duplicate: obj });
					} else {
						seenValues[key].values.push(img1);
						seenValues[key].objects.push(obj);
					}
				} else {
					if (seenValues[key].values.includes(value)) {
						const index = seenValues[key].values.indexOf(value);
						duplicates.push({ original: seenValues[key].objects[index], duplicate: obj });
					} else {
						seenValues[key].values.push(value);
						seenValues[key].objects.push(obj);
					}
				}
			}
		}

		return duplicates;
	}
</script>

<main>
	<h1>Duplicate Pairs</h1>
	{#each duplicatePairs as { original, duplicate }}
		<div>
			<p>Original: {JSON.stringify(original)}</p>
			<p>Duplicate: {JSON.stringify(duplicate)}</p>
		</div>
	{/each}
</main>

<Dropdown>
	{#each channels as channel}
		<DropdownItem on:click={() => get_channel_blocks(channel.slug)}>{channel.title}</DropdownItem>
	{/each}
</Dropdown>
