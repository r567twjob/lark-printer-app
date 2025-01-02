<template>
    <div :class="['table-item', { 'flex-column': isColumn }]">
        <template v-if="isHeader">
             <div class="table-field" style="width: 100%; height: 100%; text-align: center; justify-content: center; align-items: center;">
                <template v-if="item.fieldId == 'title'">
                    {{ label }}
                </template>
                <template v-if="item.fieldId == 'image'">
                    <div v-html="label"></div>
                </template>
                <template v-else>
                    <template v-if="!isHtml">
                        <span>{{ cell }}</span>
                    </template>
                    <template v-else>
                        <div v-html="cell"></div>
                    </template>
                </template>
            </div>
        </template>
        <template v-else>
            <div class="table-field" :style="{ width: isColumn ? '100%' : '50%', height: isColumn ? '50%' : '100%' }"><p>{{ label }}</p></div>
            <div class="table-value" :style="{ width: isColumn ? '100%' : '50%', height: isColumn ? '50%' : '100%' }">
               <template v-if="!isHtml">
                    <span>{{ cell }}</span>
               </template>
               <template v-else>
                    <div v-html="cell"></div>
               </template>
            </div>
        </template>
    </div>
</template>

<script>
import { bitable } from '@base-open/web-api';
import { ref, onMounted } from 'vue';
import { format as formatDate } from 'date-fns';

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
        const isHtml = ref(false)
        const isColumn = ref(false)
        const isHeader = ref(false)
        

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

            isColumn.value = item.columnChecked
            isHeader.value = item.headerChecked

            if (item.fieldId == 'title') {
                label.value = item.customData
            } else if (item.fieldId == 'image') {
                label.value = `<img style='width: 100%; height: 100%;' src='${item.customData}'/>` 
            } else {
                const fieldData = await table.getFieldMetaById(item.fieldId)
                const valueData = await table.getCellValue(item.fieldId, recordId)
                
                label.value = fieldData.name
    
    
                if (valueData == null) {
                    cell.value = ''
                    return
                }
    
                switch (fieldData.type) {
                    case 1: // 多行文本
                        cell.value = valueData.map(item => item.text || item.name).join("、");
                        break;
                    case 1005: // 自動編號
                    case 2: // 數字
                        cell.value = valueData
                        break;
                    case 3: // 單選
                        cell.value = valueData.text
                        break;
                    case 4: // 多選
                        cell.value = valueData.map(item => item.text || item.name).join("、");
                        break;
                    case 1001: // 創建時間
                    case 1002: // 最後更新時間
                    case 5: // 日期
                        cell.value = formatDate(new Date(valueData), fieldData.property.dateFormat)
                        break;
                    case 7: // 複選框
                        cell.value = valueData[0] ? "✔" : "X";
                        break;
                    case 1003: // 創建人
                    case 1004: // 修改人
                    case 11: // 人員
                        cell.value = valueData.map(item => item.name).join("、");
                        break;
                    case 13: // 電話號碼
                        cell.value = valueData
                        break;
                    case 15: // 超連結
                        cell.value = valueData.map(item => item.link).join("、");
                        break
                    case 17: // 附件
                        isHtml.value = true
                        let result = ''
                        for (let i = 0; i < valueData.length; i++) {
                            if (valueData[i].type && valueData[i].type.includes('image')) {
                                const imgUrl = await table.getAttachmentUrl(valueData[i].token);
                                result += `<img style='width: 100%; height: 100%;' src='${imgUrl}' />`
                                
                            }
                        }
                        cell.value = result
                        break;
                    case 18: // 單向連結
                        cell.value = valueData.text
                        break;
                    case 19: // 查找引用
                        cell.value = valueData.map(item => item).join("、");
                        break;
                    case 21: // 雙向連結
                        cell.value = valueData.text
                        break;
                    case 22: // 地理位置
                        cell.value = valueData.address;
                        break;
                    case 23: // 群組
                        cell.value = valueData.map(item => item.text || item.name).join("、");
                        break;
                    case 99002: // 進度
                        cell.value = `${valueData*100}%`
                        break
                    case 99003: // 貨幣
                        cell.value = new Intl.NumberFormat("en-US", {style: "currency", currency: fieldData.property.currencyCode, minimumFractionDigits: fieldData.property.decimalDigits }).format(valueData);
                        break
                    case 99004: // 評分
                        let rating = `${valueData} / ${fieldData.property.min}~${fieldData.property.max}`
                        cell.value = rating
                        break
                    default:
                        cell.value = valueData
                }
            }

            
            
        });

        return {
            item,
            label,
            cell,
            isColumn,
            isHeader,
            isHtml
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

.table-value > span {
    padding-left: 5px;
}
</style>