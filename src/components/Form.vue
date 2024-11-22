<template>
  <div>
    <LayoutDesigner></LayoutDesigner>
  </div>
</template>

<script>
import LayoutDesigner from './LayoutDesigner.vue';

export default {
  components: {
    LayoutDesigner
  }
};
</script>

<style scoped>
.header {
  margin: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.body {
  width: 90%;
  margin: 15px;
}

h1 {
  color: #42b983;
}

@media print {
  .header,.not-print {
    display: none;
  }

  .grid-item.selected {
    box-shadow: none;
    z-index: 1;
  }

  body {
    margin: 30px;
  }

  @page {
    margin: 30px;
  }
}
</style>