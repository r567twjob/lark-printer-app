<template>
    <div :class="['table-item', { 'flex-column': isColumn }]">
        <div class="table-field" :style="{ width: isColumn ? '100%' : '50%', height: isColumn ? '50%' : '100%' }"><p>{{ label }}</p></div>
        <div class="table-value" :style="{ width: isColumn ? '100%' : '50%', height: isColumn ? '50%' : '100%' }"><p>{{ cell }}</p></div>
    </div>
</template>

<script>
import { bitable } from '@base-open/web-api';
import { ref, onMounted } from 'vue';

export default {
    props: {
        itemData: {
            type: Object,
            required: true, 
        },
    },
    setup(props) {
        const item = {...props.itemData}
        const label = ref('')
        const cell = ref('')
        const isColumn = ref(false)
        

        onMounted(async () => {
            const [selection] = await Promise.all([bitable.base.getSelection()]);
            const table = await bitable.base.getTableById(selection.tableId)
            
            let recordId = ''
            if (selection.recordId) {
                recordId = selection.recordId
            } else {
                let recordList = await table.getRecordIdList();
                recordId = recordList[0]
            }

            const fieldData = await table.getFieldMetaById(item.fieldId)
            const valueData = await table.getCellValue(item.fieldId, recordId)
            label.value = fieldData.name

            console.log(valueData)

            cell.value = valueData
            isColumn.value = item.columnChecked
        });

        return {
            item,
            label,
            cell,
            isColumn
        }

    }

}
</script>

<style>

.table-item {
  display: flex;
  width:  100%;
  height: 100%;
}

/* 預設為 Row 模式 */
.table-item:not(.flex-column) {
  flex-direction: row;
}

/* Column 模式 */
.flex-column {
  flex-direction: column;
  height: 100%;
}

.table-item , .table-field , .table-value {
  display: flex;
  align-items: center;
  border: #000 1px solid;
}

.table-field > p {
    padding-left: 5px;
}

.table-value > p {
    padding-left: 5px;
}
</style>