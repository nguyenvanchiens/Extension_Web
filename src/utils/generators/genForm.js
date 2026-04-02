import { genLanguageKey } from './genLanguageKey';
import { genService } from './genService';

export function genForm(moduleName, config) {
  const {
    fields = [],
    controller = moduleName,
    getAction = 'GetDetail',
    saveAction = 'Save',
    colCount = 2,
  } = config;

  const camel = moduleName[0].toLowerCase() + moduleName.slice(1);
  const lines = [];
  lines.push(`namespace My {`);
  lines.push(`    export class ${moduleName}Detail extends BaseOperateForm<${moduleName}ViewModel, any, any> {`);
  lines.push(`        private ${camel}Service: ${moduleName}Service;`);
  lines.push('');
  lines.push(`        constructor(container: JQuery, opt?: any) {`);
  lines.push(`            super(container, opt);`);
  lines.push(`            this.${camel}Service = new ${moduleName}Service();`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        protected onInit(): void {`);
  lines.push(`            super.onInit();`);
  lines.push('');
  lines.push(`            this.$formBuilder.createForm(opts => opts`);
  lines.push(`                .colCount(${colCount})`);
  lines.push(`                .formData(this.formData)`);
  lines.push(`                .items(items => {`);

  fields.forEach((f) => {
    let item = `                    items.addSimpleFor('${f.name}', LanguageKey.${moduleName}.Form.${f.name})`;
    if (f.required) item += `.required()`;
    if (f.editorType === 'dxTextArea') {
      item += `\n                        .editor(e => e.createTextArea('${f.name}').height(80))`;
    } else if (f.editorType === 'dxDateBox') {
      item += `\n                        .editor(e => e.createDateBox('${f.name}'))`;
    } else if (f.editorType === 'dxNumberBox') {
      item += `\n                        .editor(e => e.createNumberBox('${f.name}', ${f.precision || 0}))`;
    } else if (f.editorType === 'dxSelectBox') {
      item += `\n                        .editor(e => e.createSelectBox('${f.name}'))`;
    } else if (f.editorType === 'dxCheckBox') {
      item += `\n                        .editor(e => e.createCheckBox('${f.name}'))`;
    } else {
      item += `\n                        .editor(e => e.createTextBox('${f.name}'))`;
    }
    item += ';';
    lines.push(item);
  });

  lines.push(`                })`);
  lines.push(`            );`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        protected bindingEvents(): void {`);
  lines.push(`            super.bindingEvents();`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        async loadData(id: string) {`);
  lines.push(`            let url = '/${controller}/${getAction}';`);
  lines.push(`            let rs = await this.${camel}Service.postJson(url, { id });`);
  lines.push(`            if (rs.result) {`);
  lines.push(`                this.formData = rs.result;`);
  lines.push(`                this.$formBuilder.updateData(this.formData);`);
  lines.push(`            }`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        async saveData() {`);
  lines.push(`            let url = '/${controller}/${saveAction}';`);
  lines.push(`            let rs = await this.${camel}Service.postJson(url, this.formData);`);
  lines.push(`            return rs.result;`);
  lines.push(`        }`);
  lines.push(`    }`);
  lines.push(`}`);

  const formCode = lines.join('\n');

  const languageKeyCode = genLanguageKey(moduleName, {
    fields: fields,
    section: 'Form',
  });

  const serviceCode = genService(moduleName, []);

  return {
    formCode,
    languageKeyCode,
    serviceCode,
  };
}
