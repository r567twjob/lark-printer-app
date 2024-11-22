<template>
  <div>
    <LayoutDesigner></LayoutDesigner>
  </div>
</template>

<script>
import { ElButton } from 'element-plus';
import { Printer } from '@element-plus/icons-vue';
import { ref, onMounted } from 'vue';
import { bitable } from '@base-open/web-api';
import LayoutDesigner from './LayoutDesigner.vue';
import 'element-plus/theme-chalk/display.css'

export default {
  components: {
    LayoutDesigner
  },
  setup() {
    
    const formData = ref({table: ''});
    const tableMetaList = ref([]);
    const fieldsMetaList = ref([]);

    onMounted(async () => {
        const [tableList, selection] = await Promise.all([bitable.base.getTableMetaList(), bitable.base.getSelection()]);
        formData.value.table = selection.tableId;
        // tableMetaList.value = tableList;
    });

    return {
      formData,
      tableMetaList,
      Printer
    };
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