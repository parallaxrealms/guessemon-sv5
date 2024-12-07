<script lang="ts">
	import { CircleHelp } from 'lucide-svelte';

	function showPopup() {
		alert('!');
	}
</script>

<button onclick={showPopup} class="h-8 w-8 my-auto">
	<CircleHelp strokeWidth="1.25" />
</button>
