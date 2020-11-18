<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
import loadsh from 'lodash'
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style>
.example {
  color: red;
}
</style>