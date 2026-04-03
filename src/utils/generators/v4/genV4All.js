import { toPascalCase, toCamelCase, tableToModuleName, mysqlToCSharp, getCustomFields } from './genV4Helpers';

export function genV4All(tableName, columns, options = {}) {
  const moduleName = options.moduleName || tableToModuleName(tableName);
  const routeBase = options.routeBase || `/api/v1/${toCamelCase(moduleName)}`;
  const groupKey = options.groupKey || `${moduleName}s`;
  const namespace = options.namespace || 'Fastlink.Portal';

  const customFields = getCustomFields(columns);
  const hasUpdated = columns.some((c) => c.name.toLowerCase() === 'updated_time');
  const hasDeleted = columns.some((c) => c.name.toLowerCase() === 'is_deleted');

  return {
    entity: genEntity(moduleName, tableName, columns, customFields, hasUpdated, hasDeleted, namespace),
    repository: genRepository(moduleName, namespace),
    service: genService(moduleName, customFields, namespace),
    constFile: genConst(moduleName, routeBase, groupKey, namespace),
    models: genModels(moduleName, customFields, namespace),
    endpoints: genEndpoints(moduleName, namespace),
    validators: genValidators(moduleName, customFields, namespace),
  };
}

function genEntity(moduleName, tableName, columns, customFields, hasUpdated, hasDeleted, ns) {
  const interfaces = [];
  if (hasUpdated) interfaces.push('ICanUpdated');
  if (hasDeleted) interfaces.push('ICanDeleted');
  const impl = interfaces.length > 0 ? `, ${interfaces.join(', ')}` : '';

  let code = `using Framework.Data;\nusing System.ComponentModel.DataAnnotations.Schema;\n\nnamespace ${ns}.Business.Entities;\n\n[Table("${tableName}")]\npublic class ${moduleName}Entity : BaseEntity${impl}\n{\n`;

  customFields.forEach((col) => {
    const csType = mysqlToCSharp(col.type, col.nullable);
    const propName = toPascalCase(col.name);
    const defaultVal = csType === 'string' ? ' = string.Empty;' : '';
    code += `    public ${csType} ${propName} { get; set; }${defaultVal}\n`;
  });

  if (hasUpdated) {
    code += `    public DateTime? UpdatedTime { get; set; }\n`;
    code += `    public string? UpdatedUser { get; set; }\n`;
  }
  if (hasDeleted) {
    code += `    public bool IsDeleted { get; set; }\n`;
    code += `    public DateTime? DeletedTime { get; set; }\n`;
    code += `    public string? DeletedUser { get; set; }\n`;
  }

  code += `}`;
  return { fileName: `${moduleName}Entity.cs`, code };
}

function genRepository(moduleName, ns) {
  const code = `using ${ns}.Business.Entities;
using ${ns}.Business.Services;
using Framework.Common;
using Microsoft.EntityFrameworkCore;

namespace ${ns}.Business.Repos;

public class ${moduleName}Repository : BasePortalRepository<${moduleName}Entity>
{
    public ${moduleName}Repository(PortalDatabaseContext dbContext, ActivityConfiguration activitySettings) : base(dbContext, activitySettings)
    {
    }

    public virtual async Task<${moduleName}Entity> Create${moduleName}Async(${moduleName}Entity entity, string createdUser)
    {
        if (IsNeedActivity)
        {
            entity = await this.CreateWithActivity(entity, $"Created ${moduleName} {entity.Id}", createdUser, false);
        }
        else
        {
            entity.SetCreatedInfo(createdUser);
            await AddAsync(entity, false);
        }
        return entity;
    }

    public virtual async Task<${moduleName}Entity> Update${moduleName}Async(${moduleName}Entity entity, string updateUser)
    {
        if (IsNeedActivity)
        {
            var oldEntity = await FirstOrDefaultAsync(x => x.Id == entity.Id);
            var diffInfos = oldEntity.GetDiffWithIgnores(entity);
            entity = await this.UpdateWithActivity(entity, diffInfos, $"Updated ${moduleName} {entity.Id}", updateUser);
        }
        else
        {
            entity.SetUpdatedInfo(updateUser);
            Update(entity, false);
        }
        return entity;
    }

    public virtual async Task<${moduleName}Entity> Delete${moduleName}Async(${moduleName}Entity entity, string deleteUser)
    {
        if (IsNeedActivity)
        {
            await this.DeleteWidthActivity(entity, $"Deleted ${moduleName} {entity.Id}", deleteUser);
        }
        else
        {
            entity.SetDeletedInfo(deleteUser);
            Update(entity);
        }
        return entity;
    }

    public virtual async Task<${moduleName}Entity?> Get${moduleName}ByIdAsync(string id)
    {
        return await FirstOrDefaultAsync(x => x.Id == id && x.IsDeleted == false);
    }

    public virtual async Task<List<${moduleName}Entity>> GetList${moduleName}sAsync()
    {
        return await CreateDbSet<${moduleName}Entity>()
            .Where(x => x.IsDeleted == false)
            .OrderByDescending(x => x.CreatedTime)
            .ToListAsync();
    }
}`;
  return { fileName: `${moduleName}Repository.cs`, code };
}

function genService(moduleName, customFields, ns) {
  const code = `using AutoMapper;
using ${ns}.Business.Entities;
using ${ns}.Business.Repos;
using ${ns}.Shared.Models;
using ${ns}.Shared.Models.${moduleName};
using Framework.Common;
using Microsoft.Extensions.Logging;

namespace ${ns}.Business.Services;

public class ${moduleName}Service
{
    private readonly ${moduleName}Repository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<${moduleName}Service> _logger;

    public ${moduleName}Service(${moduleName}Repository repository, IMapper mapper, ILogger<${moduleName}Service> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<BusinessResult<List<${moduleName}Model>>> GetList${moduleName}sAsync()
    {
        try
        {
            var entities = await _repository.GetList${moduleName}sAsync();
            var models = _mapper.Map<List<${moduleName}Model>>(entities);
            return BusinessResult.Ok(models);
        }
        catch (Exception ex)
        {
            var msg = $"Unhandled exception: {nameof(GetList${moduleName}sAsync)}";
            _logger.LogError(ex, msg);
            return BusinessResult.Error<List<${moduleName}Model>>(msg);
        }
    }

    public async Task<BusinessResult<${moduleName}Model>> Get${moduleName}ByIdAsync(${moduleName}GetByIdRequest req)
    {
        try
        {
            var entity = await _repository.Get${moduleName}ByIdAsync(req.Id);
            if (entity == null)
                return BusinessResult.Error<${moduleName}Model>("${moduleName} not found");

            var model = _mapper.Map<${moduleName}Model>(entity);
            return BusinessResult.Ok(model);
        }
        catch (Exception ex)
        {
            var msg = $"Unhandled exception: {nameof(Get${moduleName}ByIdAsync)}";
            _logger.LogError(ex, msg);
            return BusinessResult.Error<${moduleName}Model>(msg);
        }
    }

    public async Task<BusinessResult> Create${moduleName}Async(${moduleName}CreateRequest req, string createdUser)
    {
        try
        {
            var entity = _mapper.Map<${moduleName}Entity>(req);
            await _repository.Create${moduleName}Async(entity, createdUser);
            await _repository.SaveChangesAsync();
            return BusinessResult.OK;
        }
        catch (Exception ex)
        {
            var msg = $"Unhandled exception: {nameof(Create${moduleName}Async)}";
            _logger.LogError(ex, msg);
            return BusinessResult.Error(msg);
        }
    }

    public async Task<BusinessResult> Update${moduleName}Async(${moduleName}UpdateRequest req, string updatedUser)
    {
        try
        {
            var entity = await _repository.Get${moduleName}ByIdAsync(req.Id);
            if (entity == null)
                return BusinessResult.Error("${moduleName} not found");

            _mapper.Map(req, entity);
            await _repository.Update${moduleName}Async(entity, updatedUser);
            await _repository.SaveChangesAsync();
            return BusinessResult.OK;
        }
        catch (Exception ex)
        {
            var msg = $"Unhandled exception: {nameof(Update${moduleName}Async)}";
            _logger.LogError(ex, msg);
            return BusinessResult.Error(msg);
        }
    }

    public async Task<BusinessResult> Delete${moduleName}Async(${moduleName}DeleteRequest req, string deletedUser)
    {
        try
        {
            var entity = await _repository.Get${moduleName}ByIdAsync(req.Id);
            if (entity == null)
                return BusinessResult.Error("${moduleName} not found");

            await _repository.Delete${moduleName}Async(entity, deletedUser);
            await _repository.SaveChangesAsync();
            return BusinessResult.OK;
        }
        catch (Exception ex)
        {
            var msg = $"Unhandled exception: {nameof(Delete${moduleName}Async)}";
            _logger.LogError(ex, msg);
            return BusinessResult.Error(msg);
        }
    }
}`;
  return { fileName: `${moduleName}Service.cs`, code };
}

function genConst(moduleName, routeBase, groupKey, ns) {
  const code = `namespace ${ns}.Shared.Models.${moduleName};

public class ${moduleName}Const
{
    public const string BaseRoute = "${routeBase}";
    public const string GroupKey = "${groupKey}";

    public const string GetList${moduleName}s = $"{BaseRoute}/get-list";
    public const string Get${moduleName}ById = $"{BaseRoute}/get-by-id";
    public const string Create${moduleName} = $"{BaseRoute}/create";
    public const string Update${moduleName} = $"{BaseRoute}/update";
    public const string Delete${moduleName} = $"{BaseRoute}/delete";
}`;
  return { fileName: `${moduleName}Const.cs`, code };
}

function genModels(moduleName, customFields, ns) {
  const fields = customFields.map((col) => {
    const csType = mysqlToCSharp(col.type, col.nullable);
    const propName = toPascalCase(col.name);
    const defaultVal = csType === 'string' ? ' = string.Empty;' : '';
    return `    public ${csType} ${propName} { get; set; }${defaultVal}`;
  }).join('\n');

  const model = `namespace ${ns}.Shared.Models;

public class ${moduleName}Model
{
    public string Id { get; set; } = string.Empty;
${fields}
}`;

  const createRequest = `namespace ${ns}.Shared.Models;

public class ${moduleName}CreateRequest
{
${fields}
}`;

  const updateRequest = `namespace ${ns}.Shared.Models;

public class ${moduleName}UpdateRequest
{
    public string Id { get; set; } = string.Empty;
${fields}
}`;

  const getByIdRequest = `namespace ${ns}.Shared.Models;

public class ${moduleName}GetByIdRequest
{
    public string Id { get; set; } = string.Empty;
}`;

  const deleteRequest = `namespace ${ns}.Shared.Models;

public class ${moduleName}DeleteRequest
{
    public string Id { get; set; } = string.Empty;
}`;

  return [
    { fileName: `${moduleName}Model.cs`, code: model },
    { fileName: `${moduleName}CreateRequest.cs`, code: createRequest },
    { fileName: `${moduleName}UpdateRequest.cs`, code: updateRequest },
    { fileName: `${moduleName}GetByIdRequest.cs`, code: getByIdRequest },
    { fileName: `${moduleName}DeleteRequest.cs`, code: deleteRequest },
  ];
}

function genEndpoints(moduleName, ns) {
  const ep = (name, reqType, resType, summary, hasUser, noJwt) => {
    const jwt = noJwt ? `\n        public override bool RequiredJwt => false;` : '';
    const userLine = hasUser ? `\n            var createdUser = this.GetUserName();` : '';
    const userArg = hasUser ? ', createdUser' : '';
    const serviceCall = name.includes('GetList') ? `GetList${moduleName}sAsync`
      : name.includes('GetById') ? `Get${moduleName}ByIdAsync`
      : name.includes('Create') ? `Create${moduleName}Async`
      : name.includes('Update') ? `Update${moduleName}Async`
      : `Delete${moduleName}Async`;

    return `using FastEndpoints;
using ${ns}.Business.Services;
using ${ns}.Shared.Models;
using ${ns}.Shared.Models.${moduleName};
using Framework.Common;
using Framework.Endpoints;

namespace ${ns}.Endpoints;

public class ${name}Endpoint : BasePostEndpoint<${reqType}, ${resType}>
{
    public override string Group => ${moduleName}Const.GroupKey;
    public override string Path => ${moduleName}Const.${name.replace('Endpoint', '').replace(moduleName, '')};${jwt}
    public override EndpointSummary EndpointSummary => new()
    {
        Summary = "${summary}",
        Description = "${summary}",
    };

    private readonly ${moduleName}Service _service;

    public ${name}Endpoint(${moduleName}Service service)
    {
        _service = service;
    }

    public override async Task HandleAsync(${reqType} req, CancellationToken ct)
    {${userLine}
        var result = await _service.${serviceCall}(${reqType === `${moduleName}GetListRequest` ? '' : 'req'}${userArg});
        await Send.OkAsync(result, ct);
    }
}`;
  };

  // Fix const name mapping
  const getListEp = ep(`GetList${moduleName}s`, `${moduleName}GetListRequest`, `BusinessResult<List<${moduleName}Model>>`, `Get list ${moduleName}s`, false, true)
    .replace(`${moduleName}Const.GetList`, `${moduleName}Const.GetList${moduleName}s`);

  const getByIdEp = ep(`Get${moduleName}ById`, `${moduleName}GetByIdRequest`, `BusinessResult<${moduleName}Model>`, `Get ${moduleName} by id`, false, true)
    .replace(`${moduleName}Const.GetById`, `${moduleName}Const.Get${moduleName}ById`);

  const createEp = ep(`Create${moduleName}`, `${moduleName}CreateRequest`, `BusinessResult`, `Create ${moduleName}`, true, false)
    .replace(`${moduleName}Const.Create`, `${moduleName}Const.Create${moduleName}`);

  const updateEp = ep(`Update${moduleName}`, `${moduleName}UpdateRequest`, `BusinessResult`, `Update ${moduleName}`, true, false)
    .replace(`${moduleName}Const.Update`, `${moduleName}Const.Update${moduleName}`);

  const deleteEp = ep(`Delete${moduleName}`, `${moduleName}DeleteRequest`, `BusinessResult`, `Delete ${moduleName}`, true, false)
    .replace(`${moduleName}Const.Delete`, `${moduleName}Const.Delete${moduleName}`);

  // Fix service call for getList (no req param)
  const fixedGetListEp = getListEp.replace(`_service.GetList${moduleName}sAsync()`, `_service.GetList${moduleName}sAsync()`);

  // Add GetListRequest model
  const getListRequest = `namespace ${ns}.Shared.Models;

public class ${moduleName}GetListRequest
{
}`;

  return [
    { fileName: `GetList${moduleName}sEndpoint.cs`, code: fixedGetListEp },
    { fileName: `Get${moduleName}ByIdEndpoint.cs`, code: getByIdEp },
    { fileName: `Create${moduleName}Endpoint.cs`, code: createEp },
    { fileName: `Update${moduleName}Endpoint.cs`, code: updateEp },
    { fileName: `Delete${moduleName}Endpoint.cs`, code: deleteEp },
    { fileName: `${moduleName}GetListRequest.cs`, code: getListRequest },
  ];
}

function genValidators(moduleName, customFields, ns) {
  const requiredFields = customFields.filter((c) => !c.nullable && c.type !== 'bit' && c.type !== 'tinyint');

  const rules = requiredFields.map((f) => {
    const propName = toPascalCase(f.name);
    return `            RuleFor(x => x.${propName})\n                .NotEmpty()\n                .WithMessage("${propName} is required");`;
  }).join('\n\n');

  const createValidator = `using FastEndpoints;
using ${ns}.Shared.Models;
using FluentValidation;

namespace ${ns}.Endpoints;

public class ${moduleName}CreateRequestValidator : Validator<${moduleName}CreateRequest>
{
    public ${moduleName}CreateRequestValidator()
    {
${rules}
    }
}`;

  const updateValidator = `using FastEndpoints;
using ${ns}.Shared.Models;
using FluentValidation;

namespace ${ns}.Endpoints;

public class ${moduleName}UpdateRequestValidator : Validator<${moduleName}UpdateRequest>
{
    public ${moduleName}UpdateRequestValidator()
    {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Id is required");

${rules}
    }
}`;

  return [
    { fileName: `${moduleName}CreateRequestValidator.cs`, code: createValidator },
    { fileName: `${moduleName}UpdateRequestValidator.cs`, code: updateValidator },
  ];
}
