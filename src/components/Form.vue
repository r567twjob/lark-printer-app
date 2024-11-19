<script>
  import { bitable } from '@base-open/web-api';
  import { ref, onMounted } from 'vue';
  import {
    ElButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
  } from 'element-plus';
  import laborInsuranceRanges from '@/data/insurance-ranges'; // 確保路徑正確

  export default {
    components: {
      ElButton,
      ElForm,
      ElFormItem,
      ElSelect,
      ElOption,
    },
    setup() {
      const formData = ref({ table: '', field: '', calc: '' });
      const tableMetaList = ref([]);
      const fieldsMetaList = ref([]);

      const updateFields = async () => {
        const tableId = formData.value.table;
        if (tableId) {
          const table = await bitable.base.getTableById(tableId);
          const fields = await table.getFieldMetaList();
          fieldsMetaList.value  = fields.filter((meta) => meta.type == 2);
        }
      };

      const calc_salary = async () => {
        const tableId = formData.value.table;
        if (tableId) {
          const table = await bitable.base.getTableById(tableId);
          const salaryField = formData.value.field;
          const calcId = formData.value.calc;
          const recordIdList = await table.getRecordIdList();

          recordIdList.forEach(async (recordId) => {
            let salaryValue = await table.getCellValue(salaryField,recordId);
            table.setCellValue(calcId,recordId, salaryValue + 2000);
          })
        }
      }

      onMounted(async () => {
        // alert(JSON.stringify(laborInsuranceRanges))
        const [tableList, selection] = await Promise.all([bitable.base.getTableMetaList(), bitable.base.getSelection()]);
        formData.value.table = selection.tableId;
        tableMetaList.value = tableList;
        const table = await bitable.base.getTableById(selection.tableId);
        const fields = await table.getFieldMetaList();
        fieldsMetaList.value  = fields.filter((meta) => meta.type == 2);
      });

      return {
        formData,
        tableMetaList,
        fieldsMetaList,
        updateFields,
        calc_salary
      };
    },
  };
</script>

<template>
  <el-form ref="form" class="form" :model="formData" label-position="top">
    <el-form-item label="开发指南">
      <a
        href="https://bytedance.feishu.cn/docx/HazFdSHH9ofRGKx8424cwzLlnZc"
        target="_blank"
        rel="noopener noreferrer"
      >
        扩展脚本开发指南
      </a>
      、
      <a
        href="https://bytedance.feishu.cn/docx/VxhudDXbyo1V7jxAcTbctJQ5nvc"
        target="_blank"
        rel="noopener noreferrer"
      >
        Base Extension Scripts Guide
      </a>
    </el-form-item>
    <el-form-item label="API">
      <a
        href="https://bytedance.feishu.cn/docx/HjCEd1sPzoVnxIxF3LrcKnepnUf"
        target="_blank"
        rel="noopener noreferrer"
      >
        扩展脚本API
      </a>
      、
      <a
        href="https://bytedance.feishu.cn/docx/OPatd1tBZoWogFxKKtmcBZMxnle"
        target="_blank"
        rel="noopener noreferrer"
      >
        Base Extension Scripts Front-end API
      </a>
    </el-form-item>
    <el-form-item label="选择数据表" size="large">
        <el-select v-model="formData.table" placeholder="请选择数据表" style="width: 100%" @change="updateFields">
          <el-option
            v-for="meta in tableMetaList"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
    </el-form-item>
    <el-form-item label="底薪欄位" size="large" v-show="formData.table">
        <el-select v-model="formData.field" placeholder="請選擇底薪欄位" style="width: 100%">
          <el-option
            v-for="meta in fieldsMetaList"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
    </el-form-item>

    <el-form-item label="計算欄位" size="large" v-show="formData.table">
        <el-select v-model="formData.calc" placeholder="請選擇要放的欄位" style="width: 100%">
          <el-option
            v-for="meta in fieldsMetaList"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
    </el-form-item>
    <el-button type="primary" plain size="large" @click="calc_salary">新增一行记录</el-button>
  </el-form>
</template>

<style scoped>
  .form :deep(.el-form-item__label) {
    font-size: 16px;
    color: var(--el-text-color-primary);
    margin-bottom: 0;
  }
  .form :deep(.el-form-item__content) {
    font-size: 16px;
  }
</style>
