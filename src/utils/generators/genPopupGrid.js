export function genPopupGrid(moduleName, config) {
  const {
    fields = [],
    popupId = `popup_grid_${moduleName.charAt(0).toLowerCase() + moduleName.slice(1)}`,
    gridId = `grid_${moduleName.charAt(0).toLowerCase() + moduleName.slice(1)}`,
    controller = moduleName,
    searchAction = 'GetDetails',
    title = moduleName,
    width = '90%',
    height = '90%',
    gridHeight = '100%',
    editMode = 'popup',
    allowInsert = false,
    allowUpdate = true,
    allowDelete = true,
    showCloseButton = true,
    hideOnOutsideClick = false,
  } = config;


  const lines = [];

  lines.push(`namespace My {`);
  lines.push(`    export class ${moduleName}PopupGrid {`);
  lines.push(`        public readonly POPUP_ID: string = '${popupId}';`);
  lines.push(`        public readonly GRID_ID: string = '${gridId}';`);
  lines.push(`        public $popup: PopupBuilder;`);
  lines.push(`        private requestParams: any;`);
  lines.push('');
  lines.push(`        constructor() {`);
  lines.push(`            var div = document.createElement('div');`);
  lines.push(`            div.id = this.POPUP_ID;`);
  lines.push(`            document.body.appendChild(div);`);
  lines.push(`            this.$popup = new PopupBuilder(this.POPUP_ID);`);
  lines.push(`        }`);
  lines.push('');

  // createPopup
  lines.push(`        public createPopup(params?: any) {`);
  lines.push(`            this.requestParams = params || {};`);
  lines.push(`            this.$popup.createPopup(option => {`);
  lines.push(`                option.title('${title}')`);
  lines.push(`                    .width('${width}')`);
  lines.push(`                    .height('${height}')`);
  lines.push(`                    .visible(false)`);
  lines.push(`                    .showCloseButton(${showCloseButton})`);
  lines.push(`                    .hideOnOutsideClick(${hideOnOutsideClick})`);
  lines.push(`                    .onHiding(() => this.onHiding())`);
  lines.push(`                    .contentTemplate(`);
  lines.push(`                        (contentElement) => {`);
  lines.push(`                            var gridBuilder = this.createGridBuilder();`);
  lines.push(`                            contentElement.dxDataGrid(gridBuilder.build());`);
  lines.push(`                        }`);
  lines.push(`                    )`);
  lines.push(`                    .toolbarItems(x => {`);
  lines.push(`                        x.add().toolbar('bottom').location('after').widget('dxButton').options({`);
  lines.push(`                            text: Utils.l('Form.Button.Close'),`);
  lines.push(`                            onClick: () => this.hidePopup()`);
  lines.push(`                        });`);
  lines.push(`                    });`);
  lines.push(`            });`);
  lines.push(`            this.showPopup();`);
  lines.push(`        }`);
  lines.push('');

  // createGridBuilder
  lines.push(`        private createGridBuilder(): DataGridOptionBuilder<${moduleName}ViewModel> {`);
  lines.push(`            var builder = new DataGridOptionBuilder<${moduleName}ViewModel>();`);
  lines.push(`            builder.id(this.GRID_ID)`);
  lines.push(`                .showBorders(true)`);
  lines.push(`                .height('${gridHeight}')`);
  lines.push(`                .scrolling({ mode: 'standard' })`);
  lines.push(`                .addSearchPanel(Utils.l(LanguageKey.Common.Search))`);
  lines.push(`                .rowAlternationEnabled(true)`);

  // Editing config
  const hasEditing = allowInsert || allowUpdate || allowDelete;
  if (hasEditing) {
    lines.push(`                .editting(e => {`);
    lines.push(`                    e.mode('${editMode}');`);
    if (allowInsert) lines.push(`                    e.allowAdding(true);`);
    if (allowUpdate) lines.push(`                    e.allowUpdating(true);`);
    if (allowDelete) lines.push(`                    e.allowDeleting(true);`);

    lines.push(`                })`);
  }

  // Columns
  lines.push(`                .columns(columns => {`);
  fields.forEach((f) => {
    let col = `                    columns.addColumn('${f.name}', LanguageKey.${moduleName}.Popup.${f.name})`;
    if (f.width) col += `.width(${f.width})`;
    if (f.alignment) col += `.alignment('${f.alignment}')`;
    if (f.type === 'date') col += `.formatDateTime('yyyy-MM-dd')`;
    if (f.type === 'datetime') col += `.formatDateTime('yyyy-MM-dd HH:mm:ss')`;
    if (f.type === 'number') col += `.formatDecimal(${f.precision || 0})`;
    col += ';';
    lines.push(col);
  });

  // Action buttons column
  if (hasEditing) {
    lines.push(`                    columns.add().buttons(buttons => {`);
    if (allowUpdate) lines.push(`                        buttons.addEdit().icon('fas fa-edit').cssClass('text-info');`);
    if (allowDelete) lines.push(`                        buttons.addDelete().icon('fa-solid fa-trash-can').cssClass('text-danger');`);
    lines.push(`                        buttons.addSave().icon('fa-solid fa-floppy-disk').cssClass('text-success');`);
    lines.push(`                        buttons.addCancel().icon('fa-solid fa-xmark').cssClass('text-warning');`);
    lines.push(`                    }).fixedPosition('right');`);
  }

  lines.push(`                })`);

  // Summary
  const numberFields = fields.filter((f) => f.type === 'number');
  if (numberFields.length > 0) {
    lines.push(`                .summary(summary => {`);
    lines.push(`                    summary.totalItems(items => {`);
    numberFields.forEach((f) => {
      lines.push(`                        items.addFor('${f.name}').summaryType('sum').valueFormat({ type: 'fixedPoint', precision: ${f.precision || 0} });`);
    });
    lines.push(`                    });`);
    lines.push(`                })`);
  }

  // DataSource
  lines.push(`                .dataSource(options => {`);
  lines.push(`                    options.addMvc('${controller}', '${searchAction}', this.requestParams, 'POST', 'Id');`);
  if (allowUpdate) lines.push(`                    options.updateAction('Update', true);`);
  if (allowDelete) lines.push(`                    options.deleteAction('Delete', true);`);
  lines.push(`                });`);
  lines.push('');
  lines.push(`            return builder;`);
  lines.push(`        }`);
  lines.push('');

  // Lifecycle
  lines.push(`        private onHiding(): void {`);
  lines.push(`            this.$popup.build().dispose();`);
  lines.push(`        }`);
  lines.push('');

  // Show/Hide
  lines.push(`        public showPopup(): void {`);
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
