<template>
  <div class="layout-designer">
    <div class="controls not-print">
      <el-row :gutter="20">
        <el-col :span="2">
          <el-checkbox v-model="hideDeleteControl" label="隱藏刪除控制項" size="small"/>
        </el-col>
        <el-col :span="2" :offset="16">
          <el-button  type="primary" :icon="Printer" plain>列印</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="padding-top: 20px;">
        <el-col :span="8">
            <el-select v-model="selectedWidgetData" placeholder="請選擇要加入的元素">
              <el-option v-for="item in fieldsData" :key="item.id" :label="item.name" :value="item.id"/>
            </el-select>
        </el-col>
        <el-col :span="2" :offset="10">
          <el-button type="info" plain size="large" @click="addWidget">新增元素</el-button>
          <el-checkbox v-model="columnChecked" label="直式" size="small"/>
        </el-col>
      </el-row>
    </div>
    <div class="table-container">
      <grid-layout :layout="layout" :col-num="12" :row-height="25" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :use-css-transforms="true" :margin="[0, 0]" :min-x="2" :max-x="12">
        <grid-item v-for="item in layout" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
          <TableItem :item-data="item"></TableItem>
          <el-button class="item-control" type="danger" :icon="Delete" circle size="small" @click="removeWidget(item.fieldId)" :style="{display: hideDeleteControl ? 'none' : 'block'}"/>
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script>
import { GridLayout, GridItem } from "vue-grid-layout-v3"
import { ElSelect,ElButton,ElCheckbox } from 'element-plus'
import { Delete,Printer } from '@element-plus/icons-vue'
import { bitable } from '@base-open/web-api';
import { ref, onMounted } from 'vue';
import TableItem from './TableItem.vue'

import 'element-plus/theme-chalk/display.css'

export default {
  components: {
    GridLayout,
    GridItem,
    TableItem
  },
  setup(){
    const columnChecked = ref(false)
    const hideDeleteControl = ref(false)
    const tableData = ref([])
    const fieldsData = ref([])
    const layout = ref([])
    const selectedWidgetData = ref('')
    const selectedItem = ref({})
    const savedLayout = ref([])
    const selectedRecord = ref({})

    onMounted(async () => {
      const [selection] = await Promise.all([bitable.base.getSelection()]);
      
      const table = await bitable.base.getTableById(selection.tableId);
      fieldsData.value =  await table.getFieldMetaList();
    });


    const addWidget = async() => {
        // console.log(selectedWidgetData)
        const newWidget = {
          x: 0,
          y: layout.value.length + 12,
          w: 2,
          h: 2,
          i: String(layout.value.length),
          fieldId: selectedWidgetData.value,
          columnChecked: columnChecked.value
        };

        layout.value = [...layout.value, newWidget];
      
    };

    const removeWidget = async(fieldId) => {
      const layoutData = layout.value

      layout.value = layoutData.filter((layout) => layout.fieldId != fieldId)
    };

    const printPage = ()=>{
      // 在列印之前清除選擇
      window.print();
    }
   
    return {
      tableData,
      fieldsData,
      addWidget,
      removeWidget,
      layout,
      selectedWidgetData, 
      selectedItem,
      savedLayout,
      Delete,
      Printer,
      printPage,
      columnChecked,
      hideDeleteControl
    }
  }

}
</script>

<style>
.table-container {
  margin-top: 20px;
  border: #000 1px solid;
}

.item-control {
  position: fixed;
  right: 0;
  top:0;
}
</style>

