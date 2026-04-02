const TS_TYPE_MAP = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  date: 'Date',
  datetime: 'Date',
  lookup: 'string',
  'ValueTextModel[]': 'ValueTextModel[]',
};

function toTsType(type) {
  return TS_TYPE_MAP[type] || type;
}

export function genViewModel(moduleName, fields) {
  const lines = [];
  lines.push(`namespace My {`);
  lines.push(`    export interface ${moduleName}ViewModel extends BaseOperateViewModel {`);
  fields.forEach((f) => {
    lines.push(`        ${f.name}: ${toTsType(f.type)};`);
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
    lines.push(`        ${f.name}: ${toTsType(f.type)};`);
  });
  lines.push(`    }`);
  lines.push(`}`);
  return lines.join('\n');
}
