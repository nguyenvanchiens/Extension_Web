export function genPopupForm(moduleName, config) {
  const {
    fields = [],
    popupId = `popup_${moduleName.charAt(0).toLowerCase() + moduleName.slice(1)}`,
    formId = `form_${moduleName.charAt(0).toLowerCase() + moduleName.slice(1)}`,
    title = moduleName,
    width = 800,
    height = 600,
    labelLocation = 'top',
    colCount = 2,
    showCloseButton = true,
    hideOnOutsideClick = false,
  } = config;

  const camel = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);
  const lines = [];

  lines.push(`namespace My {`);
  lines.push(`    export class ${moduleName}PopupForm {`);
  lines.push(`        public readonly POPUP_ID: string = '${popupId}';`);
  lines.push(`        public readonly FORM_ID: string = '${formId}';`);
  lines.push(`        public $popup: PopupBuilder;`);
  lines.push(`        private ${camel}Service: ${moduleName}Service;`);
  lines.push(`        private modelEditing: ${moduleName}ViewModel;`);
  lines.push('');
  lines.push(`        constructor() {`);
  lines.push(`            var div = document.createElement('div');`);
  lines.push(`            div.id = this.POPUP_ID;`);
  lines.push(`            document.body.appendChild(div);`);
  lines.push(`            this.$popup = new PopupBuilder(this.POPUP_ID);`);
  lines.push(`            this.${camel}Service = new ${moduleName}Service();`);
  lines.push(`            this.createPopup();`);
  lines.push(`        }`);
  lines.push('');

  // createPopup
  lines.push(`        private createPopup() {`);
  lines.push(`            this.$popup.createPopup(option => {`);
  lines.push(`                option.title('${title}')`);
  lines.push(`                    .width(${width})`);
  lines.push(`                    .height(${height})`);
  lines.push(`                    .visible(false)`);
  lines.push(`                    .showCloseButton(${showCloseButton})`);
  lines.push(`                    .hideOnOutsideClick(${hideOnOutsideClick})`);
  lines.push(`                    .onShowing(e => this.onShowing(e))`);
  lines.push(`                    .onHidden(e => this.onHidden(e))`);
  lines.push(`                    .contentTemplate(`);
  lines.push(`                        (contentElement) => {`);
  lines.push(`                            var formOption = this.createFormBuilder();`);
  lines.push(`                            contentElement.dxForm(formOption.build());`);
  lines.push(`                        }`);
  lines.push(`                    )`);
  lines.push(`                    .toolbarItems(x => {`);
  lines.push(`                        x.add().toolbar('bottom').location('after').widget('dxButton').options({`);
  lines.push(`                            text: Utils.l('Form.Button.Save'),`);
  lines.push(`                            onClick: () => this.onSave()`);
  lines.push(`                        });`);
  lines.push(`                        x.add().toolbar('bottom').location('after').widget('dxButton').options({`);
  lines.push(`                            text: Utils.l('Form.Button.Close'),`);
  lines.push(`                            onClick: () => this.hidePopup()`);
  lines.push(`                        });`);
  lines.push(`                    });`);
  lines.push(`            });`);
  lines.push(`        }`);
  lines.push('');

  // createFormBuilder
  lines.push(`        private createFormBuilder(): FormOptionBuilder<${moduleName}ViewModel> {`);
  lines.push(`            var builder = new FormOptionBuilder<${moduleName}ViewModel>();`);
  lines.push(`            builder.id(this.FORM_ID)`);
  lines.push(`                .labelLocation('${labelLocation}')`);
  lines.push(`                .labelMode('outside')`);
  lines.push(`                .showColonAfterLabel(true)`);
  lines.push(`                .minColWidth(300)`);
  lines.push(`                .readOnly(false)`);
  lines.push(`                .items(item => {`);
  lines.push(`                    item.addGroup().colCount(${colCount}).items(groupItems => {`);

  fields.forEach((f) => {
    let line = `                        groupItems.addSimpleFor('${f.name}')`;
    if (f.required) line += `.required()`;
    line += `.label(Utils.l(LanguageKey.${moduleName}.Popup.${f.name}))`;

    if (f.editorType === 'dxTextArea') {
      line += `\n                            .editor(e => e.createTextArea('${f.name}').height(80))`;
    } else if (f.editorType === 'dxDateBox') {
      line += `\n                            .editor(e => e.createDateBox('${f.name}', 'yyyy-MM-dd').type('date'))`;
    } else if (f.editorType === 'dxNumberBox') {
      line += `\n                            .editor(e => e.createNumberBox('${f.name}', ${f.precision || 0}))`;
    } else if (f.editorType === 'dxSelectBox') {
      line += `\n                            .editor(e => e.createSelectBox('${f.name}'))`;
    } else if (f.editorType === 'dxCheckBox') {
      line += `\n                            .editor(e => e.createCheckBox('${f.name}'))`;
    } else {
      line += `\n                            .editor(e => e.createTextBox('${f.name}'))`;
    }
    line += ';';
    lines.push(line);
  });

  lines.push(`                    });`);
  lines.push(`                });`);
  lines.push(`            return builder;`);
  lines.push(`        }`);
  lines.push('');

  // Lifecycle
  lines.push(`        private onShowing(e: DevExpress.ui.dxPopup.ShowingEvent): void {`);
  lines.push(`            $(\`#\${this.FORM_ID}\`).dxForm('instance').option('formData', this.modelEditing);`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        private onHidden(e: DevExpress.ui.dxPopup.HiddenEvent): void {`);
  lines.push(`            $(\`#\${this.FORM_ID}\`).dxForm('instance').reset();`);
  lines.push(`        }`);
  lines.push('');

  // Save
  lines.push(`        private async onSave(): Promise<void> {`);
  lines.push(`            var formInstance = $(\`#\${this.FORM_ID}\`).dxForm('instance');`);
  lines.push(`            var validateResult = formInstance.validate();`);
  lines.push(`            if (!validateResult.isValid) return;`);
  lines.push('');
  lines.push(`            var data = formInstance.option('formData');`);
  lines.push(`            // TODO: call service to save`);
  lines.push(`            // await this.${camel}Service.save(data);`);
  lines.push(`            this.hidePopup();`);
  lines.push(`        }`);
  lines.push('');

  // Show/Hide
  lines.push(`        public showPopup(model?: ${moduleName}ViewModel): void {`);
  lines.push(`            this.modelEditing = model || {} as ${moduleName}ViewModel;`);
  lines.push(`            this.$popup.build().instance().show();`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        public hidePopup(): void {`);
  lines.push(`            this.$popup.build().instance().hide();`);
  lines.push(`        }`);
  lines.push(`    }`);
  lines.push(`}`);
  return lines.join('\n');
}
