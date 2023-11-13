// place files you want to import through the `$lib` alias in this folder.
import { writable } from 'svelte/store';
import { TidyURL } from 'tidy-url';

export const token = writable(null);

export function formatDate(d) {
	const date = new Date(d);
	let dd = date.getDate();
	let mm = date.getMonth() + 1;
	const yyyy = date.getFullYear();
	const hh = date.getHours();
	const min = date.getMinutes();
	const sec = date.getSeconds();
	if (dd < 10) {
		dd = '0' + dd;
	}
	if (mm < 10) {
		mm = '0' + mm;
	}
	return (d = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min + ':' + sec);
}

export function find_duplicates_by_class(arr) {
	const seenValues = {};
	const duplicates = [];

	arr.forEach((obj) => {
		const classKey = obj.class === 'Link' ? 'source.url' : obj.class === 'Text' ? 'content' : 'id';
		const value =
			classKey === 'source.url' ? obj.source.url : classKey === 'content' ? obj.content : obj.id;

		if (!seenValues[classKey]) {
			seenValues[classKey] = { values: [value], objects: [obj] };
		} else {
			if (seenValues[classKey].values.includes(value)) {
				const index = seenValues[classKey].values.indexOf(value);
				duplicates.push({ original: seenValues[classKey].objects[index], duplicate: obj });
			} else {
				seenValues[classKey].values.push(value);
				seenValues[classKey].objects.push(obj);
			}
		}
	});

	return duplicates;
}
