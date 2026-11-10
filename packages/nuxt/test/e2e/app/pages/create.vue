<script setup lang="ts">
const body = reactive({ name: 'Frog' });
const { data } = await petstore('/pets', { method: 'POST', body });
</script>

<template>
	<input v-model="body.name" data-testid="name-input" />
	<p data-testid="created">{{ data?.name }}</p>
</template>
