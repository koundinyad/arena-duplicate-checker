<script>
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { Icon } from 'flowbite-svelte-icons';

	import { token, formatDate } from '$lib';

	export let channels;

	let channel_blocks;

	let value_title;
	let current_channel_slug;
	let duplicates;
	console.log($token);

	const get_channel_blocks = async (slug) => {
		const res = await fetch(`https://api.are.na/v2/channels/${slug}/blocks?per=100`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const data = await res.json();
		channel_blocks = data.blocks;
		console.log(data);

		const dups = await findDuplicatesByClassKey(data.blocks);

		console.log(dups);
		duplicates = dups;

		return data;
	};

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
			} else {
				key = 'id';
				value = obj.id;
			}

			if (!seenValues[key]) {
				seenValues[key] = { values: [value], objects: [obj] };
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

		return duplicates;
	}
</script>

<main class="grid grid-cols-2">
	<div>
		<Button
			>{value_title ? value_title : 'Select channel'}<Icon
				name="chevron-down-solid"
				class="w-3 h-3 ml-2 text-white dark:text-white"
			/></Button
		>
		<Dropdown>
			{#each channels as channel}
				<DropdownItem
					on:click={() => {
						value_title = channel.title;
						current_channel_slug = channel.slug;
						get_channel_blocks(channel.slug);
					}}>{channel.title}</DropdownItem
				>
			{/each}
		</Dropdown>
	</div>
	<div>
		{#if duplicates}
			{#each duplicates as { original, duplicate }}
				<div class="grid grid-cols-2 gap-8">
					<div>
						<img src={original.image.thumb.url} alt="thumbnail" />
						<div class="flex flex-col">
							<p>
								Created by <a href={`https://are.na/${original.user.slug}`}
									>{original.user.username}</a
								>
							</p>
							<p>
								Created at <a href={`https://are.na/${original.user.slug}`}
									>{formatDate(original.created_at)}</a
								>
							</p>
							<Button
								on:click={() => {
									fetch(
										`http://api.are.na/v2/channels/${current_channel_slug}/blocks/${original.id}`,
										{
											method: 'DELETE',
											headers: {
												Authorization: `Bearer ${$token}`,
												'Content-Type': 'application/json'
											}
										}
									)
										.then((response) => {
											if (response.ok) {
												console.log('Block deleted successfully');
											} else {
												throw new Error('Failed to delete block');
											}
										})
										.catch((error) => {
											console.error('Error deleting block:', error);
										});
								}}>Delete</Button
							>
						</div>
					</div>
					<div>
						<img src={duplicate.image.thumb.url} alt="thumbnail" />
						<div class="flex flex-col">
							<p>
								Created by <a href={`https://are.na/${duplicate.user.slug}`}
									>{duplicate.user.username}</a
								>
							</p>
							<p>
								Created at <a href={`https://are.na/${duplicate.user.slug}`}
									>{formatDate(duplicate.created_at)}</a
								>
							</p>
							<Button
								on:click={() => {
									fetch(
										`https://api.are.na/v2/channels/${current_channel_slug}/connections/${duplicate.id}`,
										{
											method: 'DELETE',
											headers: {
												Authorization: `Bearer ${$token}`
											}
										}
									)
										.then((response) => {
											if (response.ok) {
												console.log('Connection deleted successfully');
											} else {
												throw new Error('Failed to delete connection');
											}
										})
										.catch((error) => {
											console.error('Error deleting connection:', error);
										});
								}}>Delete</Button
							>
						</div>
					</div>
				</div>
			{/each}
		{:else}
			<p>No duplicates found in this channel</p>
		{/if}
	</div>
</main>
