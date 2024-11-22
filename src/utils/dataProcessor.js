import { format as formatDate } from 'date-fns';

export async function processTableData(record, tableFieldMeta, table) {
  const result = [];
  const resultFieldMeta = {};

  Object.keys(tableFieldMeta).forEach((key) => {
    resultFieldMeta[tableFieldMeta[key].id] = tableFieldMeta[key];
  });

  for (let key of Object.keys(record.fields)) {
    const field = resultFieldMeta[key];
    let value = await processFieldValue(record.fields[key], field, table);

    result.push({
      type: field.type,
      id: key,
      fieldName: field.name,
      value: value,
    });
  }

  const tableName = await table.getName();

  result.push({
    type: 0,
    id: 0,
    fieldName: "title",
    value: tableName,
  })

  return result;
}

export async function processFieldValue(fieldValue, fieldMeta, table) {
  if (fieldValue == null) {
    return "";
  }
  const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

  switch (fieldMeta.type) {
    case 4:
    case 11:
      return values.map(item => item.text || item.name).join("、");
    case 17:
      const imgUrl = await table.getAttachmentUrl(values[0].token);
      return imgUrl;
    case 7:
      return values[0] ? "✔" : "X";
    case 5:
      return formatDate(new Date(values[0]), fieldMeta.property.dateFormat);
    default:
      return values.map(item => {
        if (typeof item === 'object' && item !== null) {
          return item.text || '';
        }
        return item;
      }).join("");
  }
}
