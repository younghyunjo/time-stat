<template>
  <div class="home">
    <WakeUpTimes></WakeUpTimes>
  </div>
</template>

<script>
import WakeUpTimes from '@/components/wake-up-times/WakeUpTimes'

export default {
    components: {
        'WakeUpTimes': WakeUpTimes,
    },
}
</script>
