<template>
  <video 
    autoplay
    playsinline 
    :srcObject.prop="stream.srcObject"
    :muted="stream.muted"
    :id="stream.id">    
  </video>
</template>

<script>
  export default {
    data(){
      return {
        
      }
    },
    props: {
      stream: null
    },
    methods: {
      

    },
    computed: {
      
    },
  }
</script>

<style>
  
</style>