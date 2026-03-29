export function genLanguageKey(moduleName, config) {
  const {
    fields = [],
    section = 'Table',
    hasPopup = false,
  } = config;

  const lines = [];
  lines.push(`namespace My {`);
  lines.push(`    export namespace LanguageKey {`);
  lines.push(`        export const ${moduleName} = {`);
  lines.push(`            ${section}: {`);

  fields.forEach((f, i) => {
    const name = f.name || f;
    const comma = i < fields.length - 1 ? ',' : '';
    lines.push(`                ${name}: '${moduleName}.${section}.${name}'${comma}`);
  });

  lines.push(`            }${hasPopup ? ',' : ''}`);

  if (hasPopup) {
    lines.push(`            Popup: {`);
    lines.push(`                Title: '${moduleName}.Popup.Title'`);
    lines.push(`            }`);
  }

  lines.push(`        };`);
  lines.push(`    }`);
  lines.push(`}`);
  return lines.join('\n');
}
