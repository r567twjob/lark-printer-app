<template>
  <div class="layout-designer">
    <div class="controls not-print">
      <el-row :gutter="20">
        <el-col :span="2">
          <el-checkbox v-model="hideDeleteControl" label="隱藏刪除控制項" size="small"/>
        </el-col>
        <el-col :span="2" :offset="16">
          <el-button  type="primary" :icon="Printer" plain @click="printPage">列印</el-button>
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
    <el-row :gutter="20">
      <el-col :span="20">
        <div class="table-container">
          <grid-layout :layout="layout" :col-num="12" :row-height="25" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :use-css-transforms="true" :margin="[0, 0]" :min-x="2" :max-x="12" @layout-updated="saveLayout">
            <grid-item v-for="item in layout" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
              <TableItem :item-data="item"></TableItem>
              <el-button class="item-control not-print" type="danger" :icon="Delete" circle size="small" @click="removeWidget(item.fieldId)" :style="{display: hideDeleteControl ? 'none' : 'block'}"/>
            </grid-item>
          </grid-layout>
        </div>
      </el-col>
    </el-row>
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
    const tableId = ref('')
    const layout = ref([])
    const selectedWidgetData = ref('')
    const selectedItem = ref({})

    onMounted(async () => {
      const [selection] = await Promise.all([bitable.base.getSelection()]);
      tableId.value = selection.tableId
      const table = await bitable.base.getTableById(selection.tableId);
      // 提供新增的欄位選項
      fieldsData.value =  (await table.getFieldMetaList()).filter(field => field.type !== 99001 && field.type !== 18 && field.type !== 21);

      // 檢查是否有已儲存的排版
      const savedLayout = localStorage.getItem('printLayouts');
      if (savedLayout) {
        let layoutsData = JSON.parse(savedLayout);
        if (layoutsData[selection.tableId].length > 0) {
          layout.value = layoutsData[selection.tableId];
        }
      } 

    });

    const saveLayout = async() => {

      const savedLayout = localStorage.getItem('printLayouts');
      const [selection] = await Promise.all([bitable.base.getSelection()]);
      const data = [...layout.value];

      let layouts = {};

      if (savedLayout) {
        layouts = JSON.parse(savedLayout);
        layouts[selection.tableId] = data;
      } else {
        layouts[selection.tableId] = data;
      }

      if (data.length > 0) {
        localStorage.setItem('printLayouts', JSON.stringify(layouts));
      }
    };


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
      hideDeleteControl.value = true
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
      saveLayout,
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
  width: 100%;
  margin-top: 20px;
  border: #000 1px solid;
}

.item-control {
  position: fixed;
  right: 0;
  top:0;
}

@media print {
  .not-print {
    display: none !important;
  }

  .table-container{
    border: none !important;
  }
}
</style>

