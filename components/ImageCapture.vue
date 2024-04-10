<template>
  <UModal :model-value="capture" @update:model-value="capture = false">
    <div class="p-4 flex flex-col">
      <canvas ref="captureCanvas" class="hidden" />
      <video ref="captureVideo" autoplay class="rounded" />
      <UButton icon="i-heroicons-camera" class="mx-auto mt-2" @click="captureImage" />
    </div>
  </UModal>
</template>

<script setup lang="ts">
const capture = defineModel<boolean>('capture', {
  required: true,
});

const emit = defineEmits<{
  (event: 'file', file: File): void;
}>();

const captureCanvas = ref<HTMLCanvasElement>();
const captureVideo = ref<HTMLVideoElement>();
const captureStream = ref<MediaStream>();

async function startCapture() {
  nextTick(async () => {
    captureStream.value = await navigator.mediaDevices.getUserMedia({ video: true });

    if (!captureVideo.value) {
      throw new Error('No video element');
    }
    captureVideo.value.srcObject = captureStream.value;
    captureVideo.value.play();
  });
}

watch(capture, (value) => {
  if (value) {
    startCapture();
  } else {
    captureStream.value?.getTracks().forEach((track) => {
      track.stop();
    });
  }
});

async function captureImage() {
  if (!captureVideo.value) {
    throw new Error('No video element');
  }

  const canvas = captureCanvas.value;
  if (!canvas) {
    throw new Error('No canvas element');
  }

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No canvas context');
  }

  const { width, height } = captureVideo.value.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;

  context.drawImage(captureVideo.value, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
  if (!blob) {
    return;
  }

  const file = new File([blob], 'capture.png', { type: 'image/png' });
  emit('file', file);

  capture.value = false;
}
</script>
