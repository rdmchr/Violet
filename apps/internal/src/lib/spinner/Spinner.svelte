<script lang="ts">
    import Spinner from '$lib/spinner/Spinner.svg';
    export let fill = false;
</script>

<img src={Spinner} alt="Spinner" class={`w-${fill ? 'full' : 5} h-${fill ? 'full' : 5} animate-spin`} />