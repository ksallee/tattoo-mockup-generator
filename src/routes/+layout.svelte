<script>
	import '../app.css';
	import { onMount } from 'svelte';
	let { children } = $props();
	onMount(() => import('iconify-icon'));
</script>

<svelte:head>
	<title>Tattoo Mockup Generator</title>
	<meta
		name="description"
		content="Upload a tattoo design and see how it would look on real skin, powered by Google Nano Banana Pro."
	/>
</svelte:head>

{@render children()}
