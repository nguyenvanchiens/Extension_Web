import { genLanguageKey } from './genLanguageKey';
import { genService } from './genService';

export function genGrid(moduleName, config) {
  const {
    fields = [],
    controller = moduleName,
    searchAction = 'Search',
    insertAction = 'Insert',
    updateAction = 'Update',
    deleteAction = 'Delete',
    editMode = 'row',
    allowInsert = true,
    allowUpdate = true,
    allowDelete = true,
    height = '70vh',
    hasParams = false,
    searchParams = [],
    hasExportExcel = true,
    excelFileName = moduleName,
    cacheSearch = false,
    serviceMethods = [],
  } = config;

  const customParams = searchParams.filter(
    (p) => p.name !== 'FromDate' && p.name !== 'ToDate'
  );
  const hasCustomCache = cacheSearch && customParams.length > 0;

  const lines = [];

  if (hasParams) {
    lines.push(`namespace My {`);
    lines.push(`    export class ${moduleName}Index extends BaseOperateForm<${moduleName}ViewModel, ${moduleName}SearchModel, any> {`);
    lines.push(`        constructor(container: JQuery, formData: ${moduleName}SearchModel, opt?: any) {`);
    lines.push(`            super(container, formData, opt);`);
    lines.push(`        }`);
  } else {
    lines.push(`namespace My {`);
    lines.push(`    export class ${moduleName}Index extends BaseDevExGridForm<${moduleName}ViewModel, any, any> {`);
    lines.push(`        constructor(container: JQuery) {`);
    lines.push(`            super(container);`);
    lines.push(`        }`);
  }

  // onInit
  lines.push('');
  lines.push(`        protected onInit(): void {`);
  if (hasExportExcel) {
    lines.push(`            this.excelFileName = '${excelFileName}';`);
  }
  lines.push(`            super.onInit();`);
  lines.push('');

  // Search form inline
  if (hasParams) {
    lines.push(`            this.$formBuilder.createForm(opts => opts.formData(this.formData)`);
    lines.push(`                .items(items => {`);

    searchParams.forEach((p) => {
      const lk = p.name === 'FromDate' ? 'LanguageKey.Common.FromDate'
        : p.name === 'ToDate' ? 'LanguageKey.Common.ToDate'
        : `LanguageKey.${moduleName}.Search.${p.name}`;
      if (p.type === 'date' || p.type === 'datetime') {
        lines.push(`                    items.addSimpleFor('${p.name}', ${lk})`);
        lines.push(`                        .editor(e => e.createDateBox('${p.name}', this.formData.${p.name}));`);
      } else if (p.type === 'select') {
        lines.push(`                    items.addSimpleFor('${p.name}', ${lk})`);
        lines.push(`                        .editor(e => e.createSelectBox('${p.name}'));`);
      } else {
        lines.push(`                    items.addSimpleFor('${p.name}', ${lk});`);
      }
    });

    lines.push(`                })`);
    lines.push(`            );`);
    lines.push('');
  }

  // Grid inline
  lines.push(`            this.$gridBuilder.createDataGrid(opts => opts.addSearchPanel(LanguageKey.Common.Search).height('${height}')`);
  lines.push(`                .columnAutoWidth(true)`);
  lines.push(`                .allowColumnResizing(true)`);
  lines.push(`                .editting(e => {`);
  lines.push(`                    e.mode('${editMode}');`);
  if (allowInsert) lines.push(`                    e.allowAdding(true);`);
  if (allowUpdate) lines.push(`                    e.allowUpdating(true);`);
  if (allowDelete) lines.push(`                    e.allowDeleting(true);`);

  if (editMode === 'popup') {
    lines.push(`                    e.popup(p => p.title(LanguageKey.${moduleName}.Popup.Title).width(900).height(500));`);
    lines.push(`                    e.form(f => {`);
    lines.push(`                        f.items(items => {`);
    fields.forEach((f) => {
      let item = `                            items.addSimpleFor('${f.name}', LanguageKey.${moduleName}.Table.${f.name}`;
      if (f.required) item += `, true`;
      item += `)`;
      if (f.type === 'datetime' || f.type === 'date') {
        item += `\n                                .editor(e => e.createDateBox('${f.name}'))`;
      } else if (f.type === 'number') {
        item += `\n                                .editor(e => e.createNumberBox('${f.name}', ${f.precision || 0}))`;
      } else if (f.type === 'boolean') {
        item += `\n                                .editor(e => e.createCheckBox('${f.name}'))`;
      } else if (f.type === 'lookup' && f.lookupDataSource) {
        item += `\n                                .editor(e => e.createSelectBox('${f.name}', ${f.lookupDataSource}))`;
      } else {
        item += `\n                                .editor(e => e.createTextBox('${f.name}'))`;
      }
      item += ';';
      lines.push(item);
    });
    lines.push(`                        });`);
    lines.push(`                    });`);
  }

  lines.push(`                })`);
  lines.push(`                .columns(columns => {`);

  fields.forEach((f) => {
    let col = `                    columns.addColumn('${f.name}', LanguageKey.${moduleName}.Table.${f.name})`;
    if (f.width) col += `.width(${f.width})`;
    if (f.alignment) col += `.alignment('${f.alignment}')`;
    if (f.type === 'date') col += `.formatDateTime('yyyy-MM-dd')`;
    if (f.type === 'datetime') col += `.formatDateTime('yyyy-MM-dd HH:mm:ss')`;
    if (f.type === 'number') col += `.formatDecimal(${f.precision || 0})`;
    if (f.type === 'lookup' && f.lookupDataSource) {
      col += `\n                        .lookup(x => x.dataSource(${f.lookupDataSource}))`;
    }
    if (f.required) col += `.validationRules(v => v.addRequired())`;
    if (f.visible === false) col += `.visible(false)`;
    col += ';';
    lines.push(col);
  });

  lines.push(`                })`);
  lines.push(`                .buttons(button => {`);
  if (allowUpdate) lines.push(`                    button.addEdit();`);
  if (allowDelete) lines.push(`                    button.addDelete();`);
  if (allowInsert) lines.push(`                    button.addSave();`);
  lines.push(`                    button.addCancel();`);
  lines.push(`                })`);
  lines.push(`                .dataSource(ds => {`);

  if (hasParams) {
    lines.push(`                    ds.addMvc('${controller}', '${searchAction}', this.getLoadParams(), 'POST', 'Id');`);
  } else {
    lines.push(`                    ds.addMvc('${controller}', '${searchAction}', {}, 'POST', 'Id');`);
  }

  if (allowInsert) lines.push(`                    ds.insertAction('${insertAction}');`);
  if (allowUpdate) lines.push(`                    ds.updateAction('${updateAction}');`);
  if (allowDelete) lines.push(`                    ds.deleteAction('${deleteAction}');`);
  lines.push(`                })`);
  lines.push(`            );`);

  if (hasParams && cacheSearch) {
    lines.push('');
    lines.push(`            this.loadSearchValue('${moduleName}');`);
  }
  lines.push(`        }`);

  // bindingEvents
  lines.push('');
  lines.push(`        protected bindingEvents(): void {`);
  lines.push(`            super.bindingEvents();`);
  lines.push('');
  lines.push(`            this.btnSearch.on('click', () => {`);
  lines.push(`                var grid = this.$gridBuilder.build();`);
  lines.push(`                grid.refresh();`);
  if (hasParams && cacheSearch) {
    lines.push(`                this.saveSearchValue('${moduleName}');`);
  }
  lines.push(`            });`);

  if (hasExportExcel) {
    lines.push('');
    lines.push(`            this.btnExportExcel.on('click', () => {`);
    lines.push(`                this.exportExcel(this.$gridBuilder.build(), '${excelFileName}');`);
    lines.push(`            });`);
  }

  lines.push(`        }`);

  // getLoadParams
  if (hasParams) {
    lines.push('');
    lines.push(`        private getLoadParams() {`);
    lines.push(`            return {`);
    searchParams.forEach((p, i) => {
      const comma = i < searchParams.length - 1 ? ',' : '';
      if (p.type === 'date' || p.type === 'datetime') {
        lines.push(`                ${p.name}: () => { return this.$formBuilder.getDateBoxString('${p.name}') }${comma}`);
      } else {
        lines.push(`                ${p.name}: () => { return this.$formBuilder.getData().${p.name} }${comma}`);
      }
    });
    lines.push(`            };`);
    lines.push(`        }`);
  }

  // Override saveSearchValue / loadSearchValue
  if (hasCustomCache) {
    lines.push('');
    lines.push(`        protected saveSearchValue(controllerName: string): void {`);
    lines.push(`            super.saveSearchValue(controllerName);`);
    customParams.forEach((p) => {
      lines.push(`            sessionStorage.setItem('${moduleName}_${p.name}', this.$formBuilder.getData().${p.name} || '');`);
    });
    lines.push(`        }`);
    lines.push('');
    lines.push(`        public loadSearchValue(controllerName: string): void {`);
    lines.push(`            super.loadSearchValue(controllerName);`);
    lines.push(`            let controller = sessionStorage.getItem('Controller');`);
    lines.push(`            if (controller == controllerName) {`);
    customParams.forEach((p) => {
      lines.push(`                let ${p.name} = sessionStorage.getItem('${moduleName}_${p.name}');`);
      if (p.type === 'select') {
        lines.push(`                if (${p.name}) {`);
        lines.push(`                    var selectBox = this.$formBuilder.getSelectBox('${p.name}');`);
        lines.push(`                    selectBox.option('value', ${p.name});`);
        lines.push(`                }`);
      } else {
        lines.push(`                if (${p.name}) {`);
        lines.push(`                    this.formData.${p.name} = ${p.name};`);
        lines.push(`                }`);
      }
    });
    lines.push(`            }`);
    lines.push(`        }`);
  }

  lines.push(`    }`);
  lines.push(`}`);

  const indexCode = lines.join('\n');

  // Gen LanguageKey
  const languageKeyCode = genLanguageKey(moduleName, {
    fields: fields,
    section: 'Table',
    hasPopup: editMode === 'popup',
  });

  // Gen Service
  const serviceCode = genService(moduleName, serviceMethods || []);

  return {
    indexCode,
    languageKeyCode,
    serviceCode,
  };
}
