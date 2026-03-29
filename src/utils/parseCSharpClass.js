/**
 * Parse C# class string to extract properties as fields.
 * Supports: auto-properties, nullable types, List<T>, [Required], [IsDate], inheritance, etc.
 */
export function parseCSharpClass(code) {
  const result = {
    className: '',
    baseClass: '',
    fields: [],
  };

  // Extract class name and base class
  const classMatch = code.match(
    /public\s+class\s+(\w+)\s*(?::\s*([\w<>,\s]+))?\s*\{/
  );
  if (classMatch) {
    result.className = classMatch[1];
    result.baseClass = classMatch[2] ? classMatch[2].trim() : '';
  }

  // Extract properties line by line
  const lines = code.split('\n');
  let pendingAttributes = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Collect attributes
    const attrMatch = line.match(/^\[(\w+)(?:\(.*?\))?\]$/);
    if (attrMatch) {
      pendingAttributes.push(attrMatch[1]);
      continue;
    }

    // Match auto-properties: public Type Name { get; set; }
    const propMatch = line.match(
      /public\s+([\w<>?,\s[\]]+?)\s+(\w+)\s*\{\s*get;\s*set;\s*\}/
    );
    if (propMatch) {
      const csharpType = propMatch[1].trim();
      const name = propMatch[2];
      const tsType = mapCSharpTypeToTs(csharpType);
      const dataType = inferDataType(csharpType);
      const editorType = inferEditorType(csharpType, dataType);
      const required = pendingAttributes.includes('Required');

      result.fields.push({
        name,
        label: splitPascalCase(name),
        type: dataType || 'string',
        editorType,
        width: '',
        alignment: inferAlignment(dataType),
        required,
        visible: true,
        csharpType,
      });

      pendingAttributes = [];
      continue;
    }

    // If line doesn't match, reset attributes (unless it's a comment or empty)
    if (line && !line.startsWith('//') && !line.startsWith('///') && !line.startsWith('[') && !line.startsWith('{') && !line.startsWith('}')) {
      pendingAttributes = [];
    }
  }

  return result;
}

function mapCSharpTypeToTs(csharpType) {
  const t = csharpType.replace('?', '').trim();
  const map = {
    string: 'string',
    int: 'number',
    long: 'number',
    float: 'number',
    double: 'number',
    decimal: 'number',
    bool: 'boolean',
    boolean: 'boolean',
    DateTime: 'Date',
    'byte[]': 'string',
    Guid: 'string',
  };
  if (map[t]) return map[t];
  if (t.startsWith('List<') || t.startsWith('IList<') || t.startsWith('IEnumerable<')) {
    const inner = t.match(/<(.+)>/);
    if (inner) return `${mapCSharpTypeToTs(inner[1])}[]`;
    return 'any[]';
  }
  return 'any';
}

function inferDataType(csharpType) {
  const t = csharpType.replace('?', '').trim();
  if (t === 'DateTime') return 'datetime';
  if (['int', 'long', 'float', 'double', 'decimal'].includes(t)) return 'number';
  if (t === 'bool' || t === 'boolean') return 'boolean';
  return 'string';
}

function inferEditorType(csharpType, dataType) {
  if (dataType === 'datetime') return 'dxDateBox';
  if (dataType === 'number') return 'dxNumberBox';
  if (dataType === 'boolean') return 'dxCheckBox';
  if (csharpType.startsWith('List<') || csharpType.startsWith('IList<')) return '';
  return '';
}

function inferAlignment(dataType) {
  if (dataType === 'number') return 'right';
  if (dataType === 'datetime') return 'center';
  if (dataType === 'boolean') return 'center';
  return '';
}

function splitPascalCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}
