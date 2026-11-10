<script setup lang="ts">
const petId = ref(1);
const { data } = await petstore('/pets/{petId}', { path: { petId } });
</script>

<template>
	<p data-testid="name">{{ data?.name }}</p>
	<button data-testid="next" @click="petId++">Next pet</button>
</template>
