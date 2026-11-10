<script setup lang="ts">
const props = defineProps<{ label: string }>();
const petId = ref(1);
const { data } = await petstore('/pets/{petId}', { path: { petId } });
</script>

<template>
	<section :data-testid="props.label">
		<p class="name">{{ data?.name }}</p>
		<button @click="petId++">Next</button>
	</section>
</template>
