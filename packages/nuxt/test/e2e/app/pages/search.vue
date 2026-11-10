<script setup lang="ts">
const q = ref('frog');
const { data } = await petstore('/pets/search', { query: { q } });
</script>

<template>
	<input v-model="q" data-testid="q" />
	<p data-testid="result">{{ data?.results[0]?.name }}</p>
</template>
