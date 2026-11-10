<script setup lang="ts">
const { data, error } = await petstore('/pets/{petId}', { path: { petId: 404 } });
</script>

<template>
	<p data-testid="status">{{ error?.statusCode }}</p>
	<p data-testid="has-data">{{ data === undefined ? 'no data' : 'data' }}</p>
</template>
