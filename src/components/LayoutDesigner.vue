<template>
  <div class="layout-designer">
    <div class="controls not-print">
      <el-row :gutter="24" style="padding-top: 20px;">
            <el-col :span="8">
                <span class="text-large font-600 mr-3"> 列印 </span>
            </el-col>
            <el-col :span="6" :offset="4">
                <el-button  type="primary" :icon="Printer" plain @click="printPage">列印</el-button>
            </el-col>
            <el-col :span="6">
                <el-button  type="info" plain @click="downloadPDF">下載 PDF</el-button>
            </el-col>

      </el-row>
      <el-row :gutter="24" style="padding-top: 20px;">
        <el-col :span="8">
            <el-select v-model="selectedWidgetData" placeholder="請選擇要加入的元素">
              <el-option v-for="item in fieldsData" :key="item.id" :label="item.name" :value="item.id"/>
            </el-select>
        </el-col>
        <el-col :span="4">
          <el-input v-if="selectedWidgetData == 'title' || selectedWidgetData == 'image'" v-model="customData" placeholder="請輸入欄位名稱" size="small"/>
        </el-col>
        <el-col :span="2" :offset="6">
          <el-row>
            <el-button class="spaced-button" type="info" plain size="large" @click="addWidget">新增元素</el-button>
          </el-row>
          <el-checkbox v-model="columnChecked" label="直式" size="small"/>
          <el-checkbox v-model="headerChecked" label="表頭" size="small"/>
          <el-checkbox v-model="hideDeleteControl" label="隱藏刪除控制項" size="small"/>
        </el-col>
      </el-row>
    </div>
    <div >
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="table-container" id="pdf-container">
            <grid-layout   :layout="layout" :col-num="24" :row-height="1" :is-draggable="true" :is-resizable="true" :vertical-compact="false" :use-css-transforms="true" :margin="[1, 1]" :prevent-collision="true" :min-w="2" :max-w="12" @layout-updated="saveLayout">
              <grid-item v-for="item in layout" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" @dbclick="removeWidget(item.fieldId)">
                <TableItem :item-data="item"></TableItem>
                <el-button class="item-control not-print" type="danger" :icon="Delete" circle size="small" @click="removeWidget(item.fieldId)" :style="{display: hideDeleteControl ? 'none' : 'block'}"/>
              </grid-item>
            </grid-layout>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { GridLayout, GridItem } from "vue-grid-layout-v3"
import { ElHeader,ElSelect,ElButton,ElCheckbox } from 'element-plus'
import { Delete,Printer } from '@element-plus/icons-vue'
import { bitable } from '@lark-base-open/js-sdk';
import { ref, onMounted } from 'vue';
import TableItem from './TableItem.vue'
import html2pdf from "html2pdf.js";

import 'element-plus/theme-chalk/display.css'

export default {
  components: {
    GridLayout,
    GridItem,
    TableItem
  },
  setup(){
    const columnChecked = ref(false)
    const headerChecked = ref(false)
    const hideDeleteControl = ref(false)
    const tableData = ref([])
    const fieldsData = ref([])
    const tableId = ref('')
    const layout = ref([])
    const selectedWidgetData = ref('')
    const selectedItem = ref({})
    const customData = ref('')
    const currentIndex = ref(0)

    onMounted(async () => {
      const [selection] = await Promise.all([bitable.base.getSelection()]);
      tableId.value = selection.tableId
      const table = await bitable.base.getTableById(selection.tableId);
      // 提供新增的欄位選項
      const fieldsMeta = (await table.getFieldMetaList())

      fieldsMeta.push({
          id: "title",
          name: "新增客製標題"
      })
      fieldsMeta.push({
          id: "image",
          name: "新增客製圖片"
      })
      fieldsData.value =  fieldsMeta;

      // 檢查是否有已儲存的排版
      const savedLayout = localStorage.getItem('printLayouts');
      if (savedLayout) {
        let layoutsData = JSON.parse(savedLayout);
        if (layoutsData[selection.tableId].length > 0) {
          layout.value = layoutsData[selection.tableId];
        }
      }
      
      currentIndex.value = layout.value.length

    });

    const saveLayout = async(newLayout) => {
      layout.value = newLayout;
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
        let newWidget = {
          i: currentIndex.value,
          x: 0,
          y: currentIndex.value + 1,
          w: 10,
          h: 20,
          fieldId: selectedWidgetData.value,
          columnChecked: columnChecked.value,
          headerChecked: headerChecked.value,
          customData: customData.value
        };

        currentIndex.value = currentIndex.value + 1

        if (selectedWidgetData.value == 'title' || selectedWidgetData.value == 'image') {
          if (customData.value == '') {
            alert('請輸入欄位名稱')
            return
          }

          newWidget.headerChecked = true
        }


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

    const downloadPDF = ()=>{
      hideDeleteControl.value = true
      const element = document.getElementById("pdf-container");

      let filename = prompt("請輸入檔案名稱", "example");
      
      const options = {
        margin: 5,
        filename: `${filename}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 1, useCORS: true},
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      html2pdf().set(options).from(element).save();
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
      downloadPDF,
      columnChecked,
      headerChecked,
      hideDeleteControl,
      customData
    }
  }

}
</script>

<style>
.table-container {
  margin-top: 20px;
  /* border: #000 1px solid; */
}

#pdf-container {
  width: 100%;
  padding-bottom: 10px;
}

@media print {
  .not-print {
    display: none !important;
  }

  .table-container{
    border: none !important;
  }
}

.spaced-button {
  margin-bottom: 5px; /* 調整按鈕之間的間距 */
}


</style>

