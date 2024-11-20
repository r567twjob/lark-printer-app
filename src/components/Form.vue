<script>
  import { bitable } from '@base-open/web-api';
  import { ref, onMounted } from 'vue';
  import {
    ElButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElMessage
  } from 'element-plus';
  import laborInsuranceRanges from '@/data/insurance.json'; // 確保路徑正確
  import 'element-plus/dist/index.css';

  export default {
    components: {
      ElButton,
      ElForm,
      ElFormItem,
      ElSelect,
      ElOption,
      ElMessage
    },
    setup() {
      const fieldsConfig = ref([
        { label: "計算健保費個人負擔", model: "healthPersonal" },
        { label: "計算健保費公司負擔", model: "healthCompany" },
        { label: "計算勞保費個人負擔", model: "laborPersonal" },
        { label: "計算勞保費公司負擔", model: "laborCompany" },
        { label: "計算勞工退休金", model: "laborPension" },
      ]);

      const formData = ref({
        table: '', 
        salary: '', 
        healthPersonal: '',
        healthCompany: '',
        laborPersonal: '',
        laborCompany: '',
        laborPension: ''
      });
      const tableMetaList = ref([]);
      const fieldsMetaList = ref([]);
      const fieldsCalcMetaList = ref([]);

      const updateFields = async () => {
        const tableId = formData.value.table;
        // 設定薪資欄位的列表
        if (tableId) {
          const table = await bitable.base.getTableById(tableId);
          const fields = await table.getFieldMetaList();
          fieldsMetaList.value  = fields.filter((meta) => meta.type == 2);
        }
        // 如果有薪資欄位已設定則處理被計算欄位的列表
        if (formData.value.salary) {
          fieldsCalcMetaList.value = fieldsMetaList.value
            .filter((meta) => meta.id != formData.value.salary)
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      };

      const calc_salary = async () => {
        const tableId = formData.value.table;
        if (tableId) {
          const table = await bitable.base.getTableById(tableId);
          const salaryField = formData.value.salary;
          const recordIdList = await table.getRecordIdList();

          if (salaryField == '') {
            ElMessage({
              showClose: true,
              message: '請先選擇薪資欄位',
              type: 'error',
            })
            return;
          }

          if (recordIdList.length == 0) {
            ElMessage({
              showClose: true,
              message: '請先確認資料表裡有紀錄可計算',
              type: 'error',
            })
            return;
          }

          recordIdList.forEach(async (recordId) => {
            let salaryValue = await table.getCellValue(salaryField,recordId);
            
            const ranges = laborInsuranceRanges.filter((range) => {
              if (salaryValue > range.min && salaryValue <= range.max) {
                return range;
              }
            })

            // 定義映射表
            const mapping = [
              { key: 'healthPersonal', rangeKey: 'healthPersonal' },
              { key: 'healthCompany', rangeKey: 'healthCompany' },
              { key: 'laborPersonal', rangeKey: 'laborPersonal' },
              { key: 'laborCompany', rangeKey: 'laborCompany' },
              { key: 'laborPension', rangeKey: 'laborPension' }
            ];

            if (ranges.length == 0) {
              // 表示是突破天際的情況
              // console.log('這裡是突破天際的情況')
              // console.log(laborInsuranceRanges[laborInsuranceRanges.length - 1])
              mapping.forEach(({ key, rangeKey }) => {
                if (formData.value[key]) {
                  table.setCellValue(formData.value[key], recordId, laborInsuranceRanges[laborInsuranceRanges.length - 1][rangeKey]);
                }
              });
            } else {
              // 迴圈處理每個項目
              mapping.forEach(({ key, rangeKey }) => {
                if (formData.value[key]) {
                  table.setCellValue(formData.value[key], recordId, ranges[0][rangeKey]);
                }
              });
            }

          })
        }
      }

      onMounted(async () => {
        const [tableList, selection] = await Promise.all([bitable.base.getTableMetaList(), bitable.base.getSelection()]);
        formData.value.table = selection.tableId;
        tableMetaList.value = tableList;
        const table = await bitable.base.getTableById(selection.tableId);
        const fields = await table.getFieldMetaList();
        // 一開始先設定薪資欄位的列表, 只有數字型態的欄位可以被設定
        fieldsMetaList.value  = fields.filter((meta) => meta.type == 2).sort((a, b) => a.name.localeCompare(b.name));;
      });

      return {
        fieldsConfig,
        formData,
        tableMetaList, // 資料表列表
        fieldsMetaList, // 薪資設定欄位列表
        fieldsCalcMetaList, // 被計算欄位列表
        updateFields,
        calc_salary
      };
    },
  };
</script>

<template>
  <el-form ref="form" class="form" :model="formData" label-position="top">
    <el-form-item label="請選擇資料表" size="large">
        <el-select v-model="formData.table" placeholder="請選擇資料表" @change="updateFields">
          <el-option v-for="meta in tableMetaList" :key="meta.id" :label="meta.name" :value="meta.id"/>
        </el-select>
    </el-form-item>
    <el-form-item label="設定底薪欄位" size="large" v-show="formData.table">
        <el-select v-model="formData.salary" placeholder="請選擇薪資欄位" @change="updateFields">
          <el-option v-for="meta in fieldsMetaList" :key="meta.id" :label="meta.name" :value="meta.id"/>
        </el-select>
    </el-form-item>

    <el-form-item v-for="field in fieldsConfig" :key="field.model" :label="field.label" size="large" v-show="formData.table">
        <el-select v-model="formData[field.model]" placeholder="請選擇要放的欄位">
          <el-option v-for="meta in fieldsCalcMetaList" :key="meta.id" :label="meta.name" :value="meta.id"/>
        </el-select>
    </el-form-item>

    <el-button type="primary" plain size="large" @click="calc_salary">開始計算</el-button>
    
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
  .el-select {
    width: 100%;
  }
</style>
