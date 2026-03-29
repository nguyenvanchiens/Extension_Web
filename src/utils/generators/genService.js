const TYPE_MAP = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  date: 'Date',
  datetime: 'Date',
  lookup: 'string',
};

export function genService(moduleName, methods, requestConfig) {
  const { requestName, requestFields = [] } = requestConfig || {};

  const lines = [];
  lines.push(`namespace My {`);
  lines.push(`    export class ${moduleName}Service extends BaseService {`);
  lines.push(`        constructor(baseUrl?: string) {`);
  lines.push(`            super(baseUrl || '/${moduleName}');`);
  lines.push(`        }`);

  methods.forEach((m) => {
    lines.push('');
    const params = m.params || '';
    const paramList = params
      ? params
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
      : [];
    const paramStr = paramList.map((p) => `${p}: any`).join(', ');
    const bodyObj = paramList.length > 0 ? `{ ${paramList.join(', ')} }` : '{}';

    lines.push(`        async ${m.name}(${paramStr}) {`);
    lines.push(`            let url = this.baseUrl + '/${m.name}';`);
    lines.push(`            let rs = await this.postJson(url, ${bodyObj});`);
    lines.push(`            return rs.result;`);
    lines.push(`        }`);
  });

  lines.push(`    }`);

  // Gen request interface từ fields
  if (requestFields.length > 0 && requestName) {
    lines.push('');
    lines.push(`    export interface ${requestName} {`);
    requestFields.forEach((f) => {
      const tsType = TYPE_MAP[f.type] || 'any';
      lines.push(`        ${f.name}: ${tsType};`);
    });
    lines.push(`    }`);
  }

  lines.push(`}`);
  return lines.join('\n');
}
