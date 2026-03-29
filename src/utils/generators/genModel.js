export function genViewModel(moduleName, fields) {
  const lines = [];
  lines.push(`namespace My {`);
  lines.push(`    export interface ${moduleName}ViewModel extends BaseOperateViewModel {`);
  fields.forEach((f) => {
    lines.push(`        ${f.name}: ${f.type};`);
  });
  lines.push(`    }`);
  lines.push(`}`);
  return lines.join('\n');
}

export function genSearchModel(moduleName, searchFields) {
  const lines = [];
  lines.push(`namespace My {`);
  lines.push(`    export interface ${moduleName}SearchModel extends BaseOperateFormModel {`);
  searchFields.forEach((f) => {
    lines.push(`        ${f.name}: ${f.type};`);
  });
  lines.push(`    }`);
  lines.push(`}`);
  return lines.join('\n');
}
