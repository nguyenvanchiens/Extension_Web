export function genMasterDetail(moduleName, config) {
  const {
    masterFields = [],
    detailFields = [],
    controller = moduleName,
    searchAction = 'Search',
    detailSearchAction = 'GetDetails',
    editMode = 'row',
    detailEditMode = 'popup',
    height = '70vh',
  } = config;

  const lines = [];
  lines.push(`namespace My {`);
  lines.push(`    export interface ${moduleName}Option {`);
  lines.push(`        DetailUrl: string;`);
  lines.push(`    }`);
  lines.push('');
  lines.push(`    export class ${moduleName}Index extends BaseOperateForm<${moduleName}ViewModel, ${moduleName}SearchModel, ${moduleName}Option> {`);
  lines.push(`        private ${moduleName[0].toLowerCase() + moduleName.slice(1)}Service: ${moduleName}Service;`);
  lines.push(`        private $detailGrid: any;`);
  lines.push(`        private $popupDetail: any;`);
  lines.push('');
  lines.push(`        constructor(container: JQuery, formData: ${moduleName}SearchModel, opt?: ${moduleName}Option) {`);
  lines.push(`            super(container, formData, opt);`);
  lines.push(`            this.${moduleName[0].toLowerCase() + moduleName.slice(1)}Service = new ${moduleName}Service();`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        protected onInit(): void {`);
  lines.push(`            this.excelFileName = '${moduleName}';`);
  lines.push(`            super.onInit();`);
  lines.push('');
  lines.push(`            this.$formBuilder.createForm(opts => opts.formData(this.formData)`);
  lines.push(`                .items(items => {`);
  lines.push(`                    items.addSimpleFor('FromDate', LanguageKey.Common.FromDate)`);
  lines.push(`                        .editor(e => e.createDateBox('FromDate', this.formData.FromDate));`);
  lines.push(`                    items.addSimpleFor('ToDate', LanguageKey.Common.ToDate)`);
  lines.push(`                        .editor(e => e.createDateBox('ToDate', this.formData.ToDate));`);
  lines.push(`                })`);
  lines.push(`            );`);
  lines.push('');
  lines.push(`            this.$gridBuilder.createDataGrid(opts => opts.addSearchPanel(LanguageKey.Common.Search).height('${height}')`);
  lines.push(`                .columnAutoWidth(true)`);
  lines.push(`                .allowColumnResizing(true)`);
  lines.push(`                .selection(s => {`);
  lines.push(`                    s.mode('single');`);
  lines.push(`                })`);
  lines.push(`                .editting(e => {`);
  lines.push(`                    e.mode('${editMode}');`);
  lines.push(`                })`);
  lines.push(`                .onSelectionChanged((e) => this.onMasterRowSelected(e))`);
  lines.push(`                .columns(columns => {`);

  masterFields.forEach((f) => {
    let col = `                    columns.addColumn('${f.name}', LanguageKey.${moduleName}.Table.${f.name})`;
    if (f.width) col += `.width(${f.width})`;
    if (f.alignment) col += `.alignment('${f.alignment}')`;
    if (f.type === 'date') col += `.formatDateTime('yyyy-MM-dd')`;
    if (f.type === 'datetime') col += `.formatDateTime('yyyy-MM-dd HH:mm:ss')`;
    col += ';';
    lines.push(col);
  });

  lines.push(`                })`);
  lines.push(`                .dataSource(ds => {`);
  lines.push(`                    ds.addMvc('${controller}', '${searchAction}', this.getLoadParams(), 'POST', 'Id');`);
  lines.push(`                })`);
  lines.push(`            );`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        protected bindingEvents(): void {`);
  lines.push(`            super.bindingEvents();`);
  lines.push('');
  lines.push(`            this.btnSearch.on('click', () => {`);
  lines.push(`                var grid = this.$gridBuilder.build();`);
  lines.push(`                grid.refresh();`);
  lines.push(`            });`);
  lines.push('');
  lines.push(`            this.btnExportExcel.on('click', () => {`);
  lines.push(`                this.exportExcel(this.$gridBuilder.build(), '${moduleName}');`);
  lines.push(`            });`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        private getLoadParams() {`);
  lines.push(`            return {`);
  lines.push(`                FromDate: () => { return this.$formBuilder.getDateBoxString('FromDate') },`);
  lines.push(`                ToDate: () => { return this.$formBuilder.getDateBoxString('ToDate') }`);
  lines.push(`            };`);
  lines.push(`        }`);
  lines.push('');

  // Detail grid
  lines.push(`        private createDetailGrid(masterId: string) {`);
  lines.push(`            this.$detailGrid = this.$gridBuilder.createDataGrid(opts => opts`);
  lines.push(`                .height('300px')`);
  lines.push(`                .columnAutoWidth(true)`);
  lines.push(`                .editting(e => {`);
  lines.push(`                    e.mode('${detailEditMode}');`);
  lines.push(`                    e.allowUpdating(true);`);
  lines.push(`                })`);
  lines.push(`                .columns(columns => {`);

  detailFields.forEach((f) => {
    let col = `                    columns.addColumn('${f.name}', LanguageKey.${moduleName}.Table.${f.name})`;
    if (f.width) col += `.width(${f.width})`;
    if (f.type === 'number') col += `.formatDecimal(${f.precision || 0})`;
    col += ';';
    lines.push(col);
  });

  lines.push(`                })`);
  lines.push(`                .dataSource(ds => {`);
  lines.push(`                    ds.addMvc('${controller}', '${detailSearchAction}', { masterId }, 'POST', 'Id');`);
  lines.push(`                })`);
  lines.push(`            );`);
  lines.push(`        }`);
  lines.push('');

  // Event handler
  lines.push(`        private onMasterRowSelected(e: any) {`);
  lines.push(`            if (e.selectedRowsData && e.selectedRowsData.length > 0) {`);
  lines.push(`                let masterId = e.selectedRowsData[0].Id;`);
  lines.push(`                this.createDetailGrid(masterId);`);
  lines.push(`            }`);
  lines.push(`        }`);
  lines.push(`    }`);
  lines.push(`}`);
  return lines.join('\n');
}
