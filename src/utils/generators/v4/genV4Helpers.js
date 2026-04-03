// Chuyển snake_case -> PascalCase: ma_bang_ke -> MaBangKe
export function toPascalCase(str) {
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

// Chuyển snake_case -> camelCase: ma_bang_ke -> maBangKe
export function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// Chuyển table name -> Module name: op_au_super_market_check_in -> SuperMarketCheckIn
export function tableToModuleName(tableName) {
  // Bỏ prefix phổ biến
  let name = tableName;
  const prefixes = ['op_au_', 'op_', 'sys_', 'cfg_', 'log_'];
  for (const p of prefixes) {
    if (name.startsWith(p)) {
      name = name.slice(p.length);
      break;
    }
  }
  return toPascalCase(name);
}

// Map MySQL type -> C# type
export function mysqlToCSharp(type, nullable) {
  const t = type.toLowerCase();
  let csType = 'string';
  if (t === 'bit' || t === 'tinyint') csType = 'bool';
  else if (t === 'bigint') csType = 'long';
  else if (t === 'int' || t === 'mediumint' || t === 'smallint') csType = 'int';
  else if (t === 'decimal' || t === 'numeric') csType = 'decimal';
  else if (t === 'float') csType = 'float';
  else if (t === 'double') csType = 'double';
  else if (t === 'datetime' || t === 'timestamp') csType = 'DateTime';
  else if (t === 'date') csType = 'DateTime';
  else if (t === 'time') csType = 'TimeSpan';
  else if (t === 'blob' || t === 'longblob' || t === 'binary' || t === 'varbinary') csType = 'byte[]';
  else if (t === 'json') csType = 'string';

  if (nullable && csType !== 'string' && csType !== 'byte[]') csType += '?';
  return csType;
}

// Lọc bỏ các field base (BaseEntity, ICanUpdated, ICanDeleted đã có)
const BASE_FIELDS = ['id', 'created_time', 'created_user', 'updated_time', 'updated_user', 'is_deleted', 'deleted_time', 'deleted_user'];

export function isBaseField(name) {
  return BASE_FIELDS.includes(name.toLowerCase());
}

export function getCustomFields(columns) {
  return columns.filter((c) => !isBaseField(c.name));
}
