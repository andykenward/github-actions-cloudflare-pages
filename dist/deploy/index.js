import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp=Object.defineProperty;var __name=(target,value)=>__defProp(target,"name",{value,configurable:!0});import{EOL as EOL3}from"node:os";import{EOL}from"node:os";var __defProp2=Object.defineProperty,__name2=__name((target,value)=>__defProp2(target,"name",{value,configurable:!0}),"__name"),toCommandValue=__name2(input=>input==null?"":typeof input=="string"||input instanceof String?input:JSON.stringify(input),"toCommandValue"),toCommandProperties=__name2(annotationProperties=>!annotationProperties||Object.keys(annotationProperties).length===0?{}:{title:annotationProperties.title,file:annotationProperties.file,line:annotationProperties.startLine,endLine:annotationProperties.endLine,col:annotationProperties.startColumn,endColumn:annotationProperties.endColumn},"toCommandProperties");var __defProp3=Object.defineProperty,__name3=__name((target,value)=>__defProp3(target,"name",{value,configurable:!0}),"__name"),issueCommand=__name3((command,properties,message)=>{let cmd=new Command(command,properties,message);process.stdout.write(cmd.toString()+EOL)},"issueCommand");var CMD_STRING="::",Command=class{static{__name(this,"Command")}static{__name3(this,"Command")}#command;#message;#properties;constructor(command,properties,message){command||(command="missing.command"),this.#command=command,this.#properties=properties,this.#message=message}toString(){let cmdStr=CMD_STRING+this.#command;if(this.#properties&&Object.keys(this.#properties).length>0){cmdStr+=" ";let first=!0;for(let key in this.#properties)if(this.#properties.hasOwnProperty(key)){let val=this.#properties[key];val&&(first?first=!1:cmdStr+=",",cmdStr+=`${key}=${escapeProperty(val)}`)}}return cmdStr+=`${CMD_STRING}${escapeData(this.#message)}`,cmdStr}};function escapeData(s){return toCommandValue(s).replaceAll("%","%25").replaceAll("\r","%0D").replaceAll(`
`,"%0A")}__name(escapeData,"escapeData");__name3(escapeData,"escapeData");function escapeProperty(s){return toCommandValue(s).replaceAll("%","%25").replaceAll("\r","%0D").replaceAll(`
`,"%0A").replaceAll(":","%3A").replaceAll(",","%2C")}__name(escapeProperty,"escapeProperty");__name3(escapeProperty,"escapeProperty");import{randomUUID as uuidv4}from"node:crypto";import{appendFileSync,existsSync}from"node:fs";import{EOL as EOL2}from"node:os";var __defProp4=Object.defineProperty,__name4=__name((target,value)=>__defProp4(target,"name",{value,configurable:!0}),"__name"),issueFileCommand=__name4((command,message)=>{let filePath=process.env[`GITHUB_${command}`];if(!filePath)throw new Error(`Unable to find environment variable for file command ${command}`);if(!existsSync(filePath))throw new Error(`Missing file at path: ${filePath}`);appendFileSync(filePath,`${toCommandValue(message)}${EOL2}`,{encoding:"utf8"})},"issueFileCommand"),prepareKeyValueMessage=__name4((key,value)=>{let delimiter=`ghadelimiter_${uuidv4()}`,convertedValue=toCommandValue(value);if(key.includes(delimiter))throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);if(convertedValue.includes(delimiter))throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);return`${key}<<${delimiter}${EOL2}${convertedValue}${EOL2}${delimiter}`},"prepareKeyValueMessage");var __defProp5=Object.defineProperty,__name5=__name((target,value)=>__defProp5(target,"name",{value,configurable:!0}),"__name");var getInput=__name5((name,options)=>{let val=process.env[`INPUT_${name.replaceAll(" ","_").toUpperCase()}`]||"";if(options&&options.required&&!val)throw new Error(`Input required and not supplied: ${name}`);return options&&options.trimWhitespace===!1?val:val.trim()},"getInput");var setOutput=__name5((name,value)=>{if(process.env.GITHUB_OUTPUT||"")return issueFileCommand("OUTPUT",prepareKeyValueMessage(name,value));process.stdout.write(EOL3),issueCommand("set-output",{name},toCommandValue(value))},"setOutput");var ExitCode=(ExitCode2=>(ExitCode2[ExitCode2.Success=0]="Success",ExitCode2[ExitCode2.Failure=1]="Failure",ExitCode2))(ExitCode||{});var __defProp6=Object.defineProperty,__name6=__name((target,value)=>__defProp6(target,"name",{value,configurable:!0}),"__name"),error=__name6((message,properties={})=>{issueCommand("error",toCommandProperties(properties),message instanceof Error?message.toString():message)},"error"),setFailed=__name6(message=>{process.exitCode=ExitCode.Failure,error(message)},"setFailed");import{EOL as EOL4}from"node:os";var __defProp7=Object.defineProperty,__name7=__name((target,value)=>__defProp7(target,"name",{value,configurable:!0}),"__name"),isDebug=__name7(()=>process.env.RUNNER_DEBUG==="1","isDebug"),debug=__name7(message=>{issueCommand("debug",{},message)},"debug");var info=__name7(message=>{process.stdout.write(message+EOL4)},"info");import{constants,promises}from"node:fs";import{EOL as EOL5}from"node:os";var __defProp8=Object.defineProperty,__name8=__name((target,value)=>__defProp8(target,"name",{value,configurable:!0}),"__name"),{access,appendFile,writeFile}=promises,SUMMARY_ENV_VAR="GITHUB_STEP_SUMMARY";var Summary=class{static{__name(this,"Summary")}static{__name8(this,"Summary")}#buffer;#filePath;constructor(){this.#buffer=""}async#fileSummaryPath(){if(this.#filePath)return this.#filePath;let pathFromEnv=process.env[SUMMARY_ENV_VAR];if(!pathFromEnv)throw new Error(`Unable to find environment variable for $${SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);try{await access(pathFromEnv,constants.R_OK|constants.W_OK)}catch{throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`)}return this.#filePath=pathFromEnv,this.#filePath}#wrap(tag,content,attrs={}){let htmlAttrs=Object.entries(attrs).map(([key,value])=>` ${key}="${value}"`).join("");return content?`<${tag}${htmlAttrs}>${content}</${tag}>`:`<${tag}${htmlAttrs}>`}async write(options){let overwrite=!!options?.overwrite,filePath=await this.#fileSummaryPath();return await(overwrite?writeFile:appendFile)(filePath,this.#buffer,{encoding:"utf8"}),this.emptyBuffer()}async clear(){return this.emptyBuffer().write({overwrite:!0})}stringify(){return this.#buffer}isEmptyBuffer(){return this.#buffer.length===0}emptyBuffer(){return this.#buffer="",this}addRaw(text,addEOL=!1){return this.#buffer+=text,addEOL?this.addEOL():this}addEOL(){return this.addRaw(EOL5)}addCodeBlock(code,lang){let attrs={...lang&&{lang}},element=this.#wrap("pre",this.#wrap("code",code),attrs);return this.addRaw(element).addEOL()}addList(items,ordered=!1){let tag=ordered?"ol":"ul",listItems=items.map(item=>this.#wrap("li",item)).join(""),element=this.#wrap(tag,listItems);return this.addRaw(element).addEOL()}addTable(rows){let tableBody=rows.map(row=>{let cells=row.map(cell=>{if(typeof cell=="string")return this.#wrap("td",cell);let{header,data,colspan,rowspan}=cell,tag=header?"th":"td",attrs={...colspan&&{colspan},...rowspan&&{rowspan}};return this.#wrap(tag,data,attrs)}).join("");return this.#wrap("tr",cells)}).join(""),element=this.#wrap("table",tableBody);return this.addRaw(element).addEOL()}addDetails(label,content){let element=this.#wrap("details",this.#wrap("summary",label)+content);return this.addRaw(element).addEOL()}addImage(src,alt,options){let{width,height}=options||{},attrs={...width&&{width},...height&&{height}},element=this.#wrap("img",null,{src,alt,...attrs});return this.addRaw(element).addEOL()}addHeading(text,level){let tag=`h${level}`,allowedTag=["h1","h2","h3","h4","h5","h6"].includes(tag)?tag:"h1",element=this.#wrap(allowedTag,text);return this.addRaw(element).addEOL()}addSeparator(){let element=this.#wrap("hr",null);return this.addRaw(element).addEOL()}addBreak(){let element=this.#wrap("br",null);return this.addRaw(element).addEOL()}addQuote(text,cite){let attrs={...cite&&{cite}},element=this.#wrap("blockquote",text,attrs);return this.addRaw(element).addEOL()}addLink(text,href){let element=this.#wrap("a",text,{href});return this.addRaw(element).addEOL()}},_summary=new Summary,summary=_summary;import{strict}from"node:assert";import{exec}from"node:child_process";import{existsSync as existsSync2}from"node:fs";import path from"node:path";import{promisify}from"node:util";var raise=__name(message=>{throw new Error(message)},"raise"),raiseFail=__name(message=>{throw setFailed(message),new Error(message)},"raiseFail"),execAsync=promisify(exec),checkWorkingDirectory=__name((directory=".")=>{let p=path.normalize(directory);if(existsSync2(p))return p;throw new Error(`Directory not found: ${directory}`)},"checkWorkingDirectory");import{strict as assert}from"node:assert";import{existsSync as existsSync3,readFileSync}from"node:fs";import{EOL as EOL6}from"node:os";var EVENT_NAMES=["branch_protection_configuration","branch_protection_rule","check_run","check_suite","code_scanning_alert","commit_comment","create","custom_property","custom_property_values","delete","dependabot_alert","deploy_key","deployment","deployment_protection_rule","deployment_review","deployment_status","discussion","discussion_comment","fork","github_app_authorization","gollum","installation","installation_repositories","installation_target","issue_comment","issues","label","marketplace_purchase","member","membership","merge_group","meta","milestone","org_block","organization","package","page_build","ping","project","project_card","project_column","projects_v2_item","public","pull_request","pull_request_review","pull_request_review_comment","pull_request_review_thread","push","registry_package","release","repository","repository_dispatch","repository_import","repository_vulnerability_alert","secret_scanning_alert","secret_scanning_alert_location","security_advisory","sponsorship","star","status","team","team_add","watch","workflow_dispatch","workflow_job","workflow_run"];var getPayload=__name(()=>{if(process.env.GITHUB_EVENT_PATH){if(existsSync3(process.env.GITHUB_EVENT_PATH))return JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,{encoding:"utf8"}));{let path2=process.env.GITHUB_EVENT_PATH;process.stdout.write(`GITHUB_EVENT_PATH ${path2} does not exist${EOL6}`)}}},"getPayload"),getWorkflowEvent=__name(()=>{let eventName=process.env.GITHUB_EVENT_NAME;assert(EVENT_NAMES.includes(eventName),`eventName ${eventName} is not supported`);let payload=getPayload();return isDebug()&&(debug(`eventName: ${eventName}`),debug(`payload: ${JSON.stringify(payload)}`)),{eventName,payload}},"getWorkflowEvent");var getGitHubContext=__name(()=>{let event=getWorkflowEvent(),repo=(()=>{let[owner,repo2]=process.env.GITHUB_REPOSITORY?process.env.GITHUB_REPOSITORY.split("/"):raise("context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"),node_id="repository"in event.payload?event.payload.repository?.node_id||raise("context.repo: no repo node_id in payload"):raise("context.repo: no repo node_id in payload");return{owner,repo:repo2,node_id}})(),branch=process.env.GITHUB_HEAD_REF||process.env.GITHUB_REF_NAME,sha=process.env.GITHUB_SHA,graphqlEndpoint=process.env.GITHUB_GRAPHQL_URL,ref=(()=>{let ref2=process.env.GITHUB_HEAD_REF;return!ref2&&("ref"in event.payload?ref2=event.payload.ref:event.eventName==="pull_request"&&(ref2=event.payload.pull_request.head.ref),!ref2)?raise("context: no ref"):ref2})(),context={event,repo,branch,sha,graphqlEndpoint,ref};if(isDebug()){let debugContext={...context,event:"will debug itself as output is large"};debug(`context: ${JSON.stringify(debugContext)}`)}return context},"getGitHubContext"),_context,useContext=__name(()=>_context??(_context=getGitHubContext()),"useContext"),useContextEvent=__name(()=>useContext().event,"useContextEvent");var INPUT_KEY_CLOUDFLARE_ACCOUNT_ID="cloudflare-account-id",INPUT_KEY_CLOUDFLARE_API_TOKEN="cloudflare-api-token",INPUT_KEY_CLOUDFLARE_PROJECT_NAME="cloudflare-project-name",INPUT_KEY_DIRECTORY="directory",INPUT_KEY_GITHUB_ENVIRONMENT="github-environment",INPUT_KEY_GITHUB_TOKEN="github-token",INPUT_KEY_WORKING_DIRECTORY="working-directory";var getInputs=__name(()=>({cloudflareApiToken:getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN,{required:!0}),gitHubApiToken:getInput(INPUT_KEY_GITHUB_TOKEN,{required:!0}),gitHubEnvironment:getInput(INPUT_KEY_GITHUB_ENVIRONMENT,{required:!1})||void 0}),"getInputs"),_inputs,useCommonInputs=__name(()=>_inputs??(_inputs=getInputs()),"useCommonInputs");var API_ENDPOINT="https://api.cloudflare.com",getCloudflareApiEndpoint=__name(({path:path2,accountId,projectName})=>{let input=[`/client/v4/accounts/${accountId}/pages/projects/${projectName}`,path2].filter(Boolean).join("/");return new URL(input,API_ENDPOINT).toString()},"getCloudflareApiEndpoint"),getCloudflareLogEndpoint=__name(({id,accountId,projectName})=>new URL(`${accountId}/pages/view/${projectName}/${id}`,"https://dash.cloudflare.com").toString(),"getCloudflareLogEndpoint");var ParseError=class extends Error{static{__name(this,"ParseError")}text;notes;location;kind;code;constructor({text,notes,location,kind}){super(text),this.name=this.constructor.name,this.text=text,this.notes=notes??[],this.location=location,this.kind=kind??"error"}};var throwFetchError=__name((resource,response)=>{let error2=new ParseError({text:`A request to the Cloudflare API (${resource}) failed.`,notes:response.errors.map(err=>({text:renderError(err)}))}),code=response.errors[0]?.code;throw code&&(error2.code=code),error2.notes?.length>0&&error2.notes.map(note=>{error(`Cloudflare API: ${note.text}`)}),error2},"throwFetchError"),renderError=__name((err,level=0)=>{let chainedMessages=err.error_chain?.map(chainedError=>`
${"  ".repeat(level)}- ${renderError(chainedError,level+1)}`).join(`
`)??"";return(err.code?`${err.message} [code: ${err.code}]`:err.message)+chainedMessages},"renderError");var fetchResult=__name(async(resource,init={},queryParams,abortSignal)=>{let method=init.method??"GET",{cloudflareApiToken}=useCommonInputs(),initFetch={headers:{"Content-Type":"application/json;charset=UTF-8",Authorization:`Bearer ${cloudflareApiToken}`}},response=await fetch(resource,{method,...initFetch,signal:abortSignal}).then(response2=>response2.json());if(response.success){if(response.result===null||response.result===void 0)throw new Error("Cloudflare API: response missing 'result'");return response.result}return throwFetchError(resource,response)},"fetchResult");var getCloudflareDeploymentAlias=__name(deployment=>deployment.aliases&&deployment.aliases.length>0?deployment.aliases[0]:deployment.url,"getCloudflareDeploymentAlias"),getCloudflareLatestDeployment=__name(async({accountId,projectName})=>{let{sha:commitHash}=useContext(),deployment=(await fetchResult(getCloudflareApiEndpoint({path:"deployments",accountId,projectName})))?.find(deployment2=>deployment2.deployment_trigger.metadata.commit_hash===commitHash);if(deployment===void 0)throw new Error(`Cloudflare: could not find deployment with commitHash: ${commitHash}`);return deployment},"getCloudflareLatestDeployment");var ERROR_KEY="Status Of Deployment:",statusCloudflareDeployment=__name(async apiEndpoint=>{let deploymentStatus="unknown",deployment;do try{deployment=await getCloudflareLatestDeployment(apiEndpoint);let deployStage=deployment.stages.find(stage=>stage.name==="deploy");switch(debug(JSON.stringify(deployStage)),deployStage?.status){case"active":case"success":case"failure":case"skipped":case"canceled":{deploymentStatus=deployStage.status;break}default:await new Promise(resolve=>setTimeout(resolve,1e3))}}catch(error2){throw error2 instanceof Error?error2:error2&&typeof error2=="object"&&"stderr"in error2&&typeof error2.stderr=="string"?new Error(error2.stderr):new Error(`${ERROR_KEY} unknown error`)}while(deploymentStatus==="unknown");return{deployment,status:deploymentStatus}},"statusCloudflareDeployment");var CLOUDFLARE_API_TOKEN="CLOUDFLARE_API_TOKEN",CLOUDFLARE_ACCOUNT_ID="CLOUDFLARE_ACCOUNT_ID",ERROR_KEY2="Create Deployment:",createCloudflareDeployment=__name(async({accountId,projectName,directory,workingDirectory=""})=>{let{cloudflareApiToken}=useCommonInputs();process.env[CLOUDFLARE_API_TOKEN]=cloudflareApiToken,process.env[CLOUDFLARE_ACCOUNT_ID]=accountId;let{repo,branch,sha:commitHash}=useContext();if(branch===void 0)throw new Error(`${ERROR_KEY2} branch is undefined`);try{let WRANGLER_VERSION="3.37.0";strict(WRANGLER_VERSION,"wrangler version should exist");let{stdout}=await execAsync(`npx wrangler@${WRANGLER_VERSION} pages deploy ${directory} --project-name=${projectName} --branch=${branch} --commit-dirty=true --commit-hash=${commitHash}`,{env:process.env,cwd:workingDirectory});info(stdout);let{deployment,status}=await statusCloudflareDeployment({accountId,projectName});setOutput("id",deployment.id),setOutput("url",deployment.url),setOutput("environment",deployment.environment);let alias=getCloudflareDeploymentAlias(deployment);return setOutput("alias",alias),setOutput("wrangler",stdout),await summary.addHeading("Cloudflare Pages Deployment").addBreak().addTable([[{data:"Name",header:!0},{data:"Result",header:!0}],["Environment:",deployment.environment],["Branch:",`<a href='https://github.com/${repo.owner}/${repo.repo}/tree/${deployment.deployment_trigger.metadata.branch}'><code>${deployment.deployment_trigger.metadata.branch}</code></a>`],["Commit Hash:",`<a href='https://github.com/${repo.owner}/${repo.repo}/commit/${deployment.deployment_trigger.metadata.commit_hash}'><code>${deployment.deployment_trigger.metadata.commit_hash}</code></a>`],["Commit Message:",deployment.deployment_trigger.metadata.commit_message],["Status:",`<strong>${status.toUpperCase()||"UNKNOWN"}</strong>`],["Preview URL:",`<a href='${deployment.url}'>${deployment.url}</a>`],["Branch Preview URL:",`<a href='${alias}'>${alias}</a>`],["Wrangler Output:",`${stdout}`]]).write(),{deployment,wranglerOutput:stdout}}catch(error2){throw error2 instanceof Error?error2:error2&&typeof error2=="object"&&"stderr"in error2&&typeof error2.stderr=="string"?new Error(error2.stderr):new Error(`${ERROR_KEY2} unknown error`)}},"createCloudflareDeployment");var TypedDocumentString=class extends String{constructor(value,__meta__){super(value);this.value=value;this.__meta__=__meta__}static{__name(this,"TypedDocumentString")}__apiType;toString(){return this.value}},DeploymentFragmentFragmentDoc=new TypedDocumentString(`
    fragment DeploymentFragment on Deployment {
  id
  environment
  state
}
    `,{fragmentName:"DeploymentFragment"}),EnvironmentFragmentFragmentDoc=new TypedDocumentString(`
    fragment EnvironmentFragment on Environment {
  name
  id
}
    `,{fragmentName:"EnvironmentFragment"}),FilesDocument=new TypedDocumentString(`
    query Files($owner: String!, $repo: String!, $path: String!) {
  repository(owner: $owner, name: $repo) {
    object(expression: $path) {
      __typename
      ... on Tree {
        entries {
          name
          type
          language {
            name
          }
          object {
            __typename
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
}
    `),AddCommentDocument=new TypedDocumentString(`
    mutation AddComment($subjectId: ID!, $body: String!) {
  addComment(input: {subjectId: $subjectId, body: $body}) {
    commentEdge {
      node {
        id
      }
    }
  }
}
    `),CreateGitHubDeploymentDocument=new TypedDocumentString(`
    mutation CreateGitHubDeployment($repositoryId: ID!, $environmentName: String!, $refId: ID!, $payload: String!, $description: String) {
  createDeployment(
    input: {autoMerge: false, description: $description, environment: $environmentName, refId: $refId, repositoryId: $repositoryId, requiredContexts: [], payload: $payload}
  ) {
    deployment {
      ...DeploymentFragment
    }
  }
}
    fragment DeploymentFragment on Deployment {
  id
  environment
  state
}`),DeleteGitHubDeploymentDocument=new TypedDocumentString(`
    mutation DeleteGitHubDeployment($deploymentId: ID!) {
  deleteDeployment(input: {id: $deploymentId}) {
    clientMutationId
  }
}
    `),DeleteGitHubDeploymentAndCommentDocument=new TypedDocumentString(`
    mutation DeleteGitHubDeploymentAndComment($deploymentId: ID!, $commentId: ID!) {
  deleteDeployment(input: {id: $deploymentId}) {
    clientMutationId
  }
  deleteIssueComment(input: {id: $commentId}) {
    clientMutationId
  }
}
    `),CreateGitHubDeploymentStatusDocument=new TypedDocumentString(`
    mutation CreateGitHubDeploymentStatus($deploymentId: ID!, $environment: String, $environmentUrl: String!, $logUrl: String!, $state: DeploymentStatusState!) {
  createDeploymentStatus(
    input: {autoInactive: false, deploymentId: $deploymentId, environment: $environment, environmentUrl: $environmentUrl, logUrl: $logUrl, state: $state}
  ) {
    deploymentStatus {
      deployment {
        ...DeploymentFragment
      }
    }
  }
}
    fragment DeploymentFragment on Deployment {
  id
  environment
  state
}`),CreateEnvironmentDocument=new TypedDocumentString(`
    mutation CreateEnvironment($repositoryId: ID!, $name: String!) {
  createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {
    environment {
      ...EnvironmentFragment
    }
  }
}
    fragment EnvironmentFragment on Environment {
  name
  id
}`),GetEnvironmentDocument=new TypedDocumentString(`
    query GetEnvironment($owner: String!, $repo: String!, $environment_name: String!, $qualifiedName: String!) {
  repository(owner: $owner, name: $repo) {
    environment(name: $environment_name) {
      ...EnvironmentFragment
    }
    ref(qualifiedName: $qualifiedName) {
      id
      name
      prefix
    }
  }
}
    fragment EnvironmentFragment on Environment {
  name
  id
}`);var documents={"\n      query Files($owner: String!, $repo: String!, $path: String!) {\n        repository(owner: $owner, name: $repo) {\n          object(expression: $path) {\n            __typename\n            ... on Tree {\n              entries {\n                name\n                type\n                language {\n                  name\n                }\n                object {\n                  __typename\n                  ... on Blob {\n                    text\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ":FilesDocument,"\n  mutation AddComment($subjectId: ID!, $body: String!) {\n    addComment(input: {subjectId: $subjectId, body: $body}) {\n      commentEdge {\n        node {\n          id\n        }\n      }\n    }\n  }\n":AddCommentDocument,"\n  mutation CreateGitHubDeployment(\n    $repositoryId: ID!\n    $environmentName: String!\n    $refId: ID!\n    $payload: String!\n    $description: String\n  ) {\n    createDeployment(\n      input: {\n        autoMerge: false\n        description: $description\n        environment: $environmentName\n        refId: $refId\n        repositoryId: $repositoryId\n        requiredContexts: []\n        payload: $payload\n      }\n    ) {\n      deployment {\n        ...DeploymentFragment\n      }\n    }\n  }\n":CreateGitHubDeploymentDocument,"\n  mutation DeleteGitHubDeployment($deploymentId: ID!) {\n    deleteDeployment(input: {id: $deploymentId}) {\n      clientMutationId\n    }\n  }\n":DeleteGitHubDeploymentDocument,"\n  mutation DeleteGitHubDeploymentAndComment(\n    $deploymentId: ID!\n    $commentId: ID!\n  ) {\n    deleteDeployment(input: {id: $deploymentId}) {\n      clientMutationId\n    }\n    deleteIssueComment(input: {id: $commentId}) {\n      clientMutationId\n    }\n  }\n":DeleteGitHubDeploymentAndCommentDocument,"\n  fragment DeploymentFragment on Deployment {\n    id\n    environment\n    state\n  }\n":DeploymentFragmentFragmentDoc,"\n  mutation CreateGitHubDeploymentStatus(\n    $deploymentId: ID!\n    $environment: String\n    $environmentUrl: String!\n    $logUrl: String!\n    $state: DeploymentStatusState!\n  ) {\n    createDeploymentStatus(\n      input: {\n        autoInactive: false\n        deploymentId: $deploymentId\n        environment: $environment\n        environmentUrl: $environmentUrl\n        logUrl: $logUrl\n        state: $state\n      }\n    ) {\n      deploymentStatus {\n        deployment {\n          ...DeploymentFragment\n        }\n      }\n    }\n  }\n":CreateGitHubDeploymentStatusDocument,"\n  fragment EnvironmentFragment on Environment {\n    name\n    id\n  }\n":EnvironmentFragmentFragmentDoc,"\n  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {\n    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {\n      environment {\n        ...EnvironmentFragment\n      }\n    }\n  }\n":CreateEnvironmentDocument,"\n  query GetEnvironment(\n    $owner: String!\n    $repo: String!\n    $environment_name: String!\n    $qualifiedName: String!\n  ) {\n    repository(owner: $owner, name: $repo) {\n      environment(name: $environment_name) {\n        ...EnvironmentFragment\n      }\n      ref(qualifiedName: $qualifiedName) {\n        id\n        name\n        prefix\n      }\n    }\n  }\n":GetEnvironmentDocument};function graphql(source){return documents[source]??{}}__name(graphql,"graphql");var request=__name(async params=>{let{query,variables,options}=params,{errorThrows}=options||{errorThrows:!0},{gitHubApiToken}=useCommonInputs(),{graphqlEndpoint}=useContext();return fetch(graphqlEndpoint,{method:"POST",headers:{authorization:`bearer ${gitHubApiToken}`,"Content-Type":"application/json",Accept:"application/vnd.github.flash-preview+json"},body:JSON.stringify({query:query.toString(),variables})}).then(res=>res.json()).then(res=>{if(res.errors&&errorThrows)throw new Error(JSON.stringify(res.errors));return res})},"request");var MutationAddComment=graphql(`
  mutation AddComment($subjectId: ID!, $body: String!) {
    addComment(input: {subjectId: $subjectId, body: $body}) {
      commentEdge {
        node {
          id
        }
      }
    }
  }
`),addComment=__name(async(deployment,output)=>{let{eventName,payload}=useContextEvent();if(eventName==="pull_request"&&payload.action!=="closed"){let prNodeId=payload.pull_request.node_id??raise("No pull request node id"),{sha}=useContext(),rawBody=`## Cloudflare Pages Deployment
**Environment:** ${deployment.environment}
**Project:** ${deployment.project_name}
**Built with commit:** ${sha}
**Preview URL:** ${deployment.url}
**Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}

### Wrangler Output
${output}`;return(await request({query:MutationAddComment,variables:{subjectId:prNodeId,body:rawBody}})).data.addComment?.commentEdge?.node?.id}},"addComment");var PREFIX="GitHub Environment:",EnvironmentFragment=graphql(`
  fragment EnvironmentFragment on Environment {
    name
    id
  }
`),MutationCreateEnvironment=graphql(`
  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {
    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {
      environment {
        ...EnvironmentFragment
      }
    }
  }
`);var QueryGetEnvironment=graphql(`
  query GetEnvironment(
    $owner: String!
    $repo: String!
    $environment_name: String!
    $qualifiedName: String!
  ) {
    repository(owner: $owner, name: $repo) {
      environment(name: $environment_name) {
        ...EnvironmentFragment
      }
      ref(qualifiedName: $qualifiedName) {
        id
        name
        prefix
      }
    }
  }
`),checkEnvironment=__name(async()=>{let{gitHubEnvironment}=useCommonInputs(),{repo,ref}=useContext();if(!gitHubEnvironment)return raiseFail(`${PREFIX} missing input gitHubEnvironment ${gitHubEnvironment}`);let environment=await request({query:QueryGetEnvironment,variables:{owner:repo.owner,repo:repo.repo,environment_name:gitHubEnvironment,qualifiedName:ref},options:{errorThrows:!1}});return environment.errors?raiseFail(`${PREFIX} Errors - ${JSON.stringify(environment.errors)}`):environment.data.repository?.environment?environment.data.repository?.ref?.id?{...environment.data.repository.environment,refId:environment.data.repository?.ref?.id}:raiseFail(`${PREFIX} No ref id ${gitHubEnvironment}`):raiseFail(`${PREFIX} Not created for ${gitHubEnvironment}`)},"checkEnvironment");var MutationCreateGitHubDeploymentStatus=graphql(`
  mutation CreateGitHubDeploymentStatus(
    $deploymentId: ID!
    $environment: String
    $environmentUrl: String!
    $logUrl: String!
    $state: DeploymentStatusState!
  ) {
    createDeploymentStatus(
      input: {
        autoInactive: false
        deploymentId: $deploymentId
        environment: $environment
        environmentUrl: $environmentUrl
        logUrl: $logUrl
        state: $state
      }
    ) {
      deploymentStatus {
        deployment {
          ...DeploymentFragment
        }
      }
    }
  }
`);var MutationCreateGitHubDeployment=graphql(`
  mutation CreateGitHubDeployment(
    $repositoryId: ID!
    $environmentName: String!
    $refId: ID!
    $payload: String!
    $description: String
  ) {
    createDeployment(
      input: {
        autoMerge: false
        description: $description
        environment: $environmentName
        refId: $refId
        repositoryId: $repositoryId
        requiredContexts: []
        payload: $payload
      }
    ) {
      deployment {
        ...DeploymentFragment
      }
    }
  }
`),createGitHubDeployment=__name(async({cloudflareDeployment:{id,url,project_name:projectName},cloudflareAccountId:accountId,commentId})=>{let{name,refId}=await checkEnvironment()??raise("GitHub Deployment: GitHub Environment is required"),{repo}=useContext(),payload={cloudflare:{id,projectName,accountId},url,commentId},gitHubDeploymentId=(await request({query:MutationCreateGitHubDeployment,variables:{repositoryId:repo.node_id,environmentName:name,refId,payload:JSON.stringify(payload),description:`Cloudflare Pages Deployment: ${id}`}})).data.createDeployment?.deployment?.id??raise("GitHub Deployment: GitHub deployment id is required");await request({query:MutationCreateGitHubDeploymentStatus,variables:{environment:name,deploymentId:gitHubDeploymentId,environmentUrl:url,logUrl:getCloudflareLogEndpoint({id,accountId,projectName}),state:"SUCCESS"}})},"createGitHubDeployment");var OPTIONS={required:!0},getInputs2=__name(()=>({cloudflareAccountId:getInput(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,OPTIONS),cloudflareProjectName:getInput(INPUT_KEY_CLOUDFLARE_PROJECT_NAME,OPTIONS),directory:getInput(INPUT_KEY_DIRECTORY,OPTIONS),workingDirectory:checkWorkingDirectory(getInput(INPUT_KEY_WORKING_DIRECTORY,{required:!1}))}),"getInputs"),_inputs2,useInputs=__name(()=>_inputs2??(_inputs2=getInputs2()),"useInputs");async function run(){let{cloudflareAccountId,cloudflareProjectName,directory,workingDirectory}=useInputs(),{eventName}=useContextEvent();if(eventName!=="push"&&eventName!=="pull_request"){setFailed(`GitHub Action event name '${eventName}' not supported.`);return}let{deployment:cloudflareDeployment,wranglerOutput}=await createCloudflareDeployment({accountId:cloudflareAccountId,projectName:cloudflareProjectName,directory,workingDirectory}),commentId=await addComment(cloudflareDeployment,wranglerOutput);await createGitHubDeployment({cloudflareDeployment,commentId,cloudflareAccountId})}__name(run,"run");try{run()}catch(error2){error2 instanceof Error&&setFailed(error2.message)}
//# sourceMappingURL=index.js.map
