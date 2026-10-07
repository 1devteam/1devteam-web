import type { FileInput, GraphEdge, GraphNode } from "./types.ts";
const ENV=/\b[A-Z][A-Z0-9_]{1,127}\b/g;
function ext(path:string){const b=path.split("/").pop()??path;const i=b.lastIndexOf(".");return i>=0?b.slice(i).toLowerCase():"";}
function base(path:string){return path.split("/").pop()??path;}
function line(text:string,offset:number){return text.slice(0,offset).split("\n").length;}

export function collectConfigurationGraph(files:FileInput[], sourceNodeIds:Map<string,string>){
  const nodes=new Map<string,GraphNode>();const edges:GraphEdge[]=[];const deployment:Array<Record<string,unknown>>=[];
  const ensure=(name:string,source:string)=>{const id=`config:key:${name}`;if(!nodes.has(id))nodes.set(id,{id,type:"configuration_key",source,layer:"generated",name,feature_flag:/^(FEATURE_|ENABLE_|DISABLE_)/.test(name),detector:"configuration_parser"});return id;};
  const fileOwner=(source:string)=>sourceNodeIds.get(source)??`file:${source}`;

  for(const f of files){
    const suffix=ext(f.path), owner=sourceNodeIds.get(f.path);
    const reads:Array<{name:string;line:number;detector:string}>=[];
    if(suffix===".py"){
      for(const m of f.content.matchAll(/(?:os\.getenv|os\.environ\.get|environ\.get)\(\s*["']([A-Z][A-Z0-9_]{1,127})["']/g))reads.push({name:m[1],line:line(f.content,m.index??0),detector:"python_source"});
      for(const m of f.content.matchAll(/(?:os\.environ|environ)\[\s*["']([A-Z][A-Z0-9_]{1,127})["']\s*\]/g))reads.push({name:m[1],line:line(f.content,m.index??0),detector:"python_source"});
    } else if([".js",".jsx",".ts",".tsx",".mjs",".cjs",".mts",".cts"].includes(suffix)){
      const code=f.content.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"");
      for(const m of code.matchAll(/\bprocess\.env(?:\.([A-Z][A-Z0-9_]{1,127})|\[['"]([A-Z][A-Z0-9_]{1,127})['"]\])/g))reads.push({name:m[1]??m[2],line:line(code,m.index??0),detector:"javascript_env_reference"});
    } else if([".sh",".bash",".zsh"].includes(suffix)){
      const local=new Set<string>();
      for(const l of f.content.split("\n")){const m=l.match(/^\s*(?:(?:local|declare|readonly|export)\s+)?([A-Z][A-Z0-9_]{1,127})\s*=/);if(m&&!new RegExp(`\\$\\{?${m[1]}`).test(l))local.add(m[1]);}
      f.content.split("\n").forEach((l,i)=>{if(/^\s*#/.test(l))return;for(const m of l.matchAll(/\$(?:\{([A-Z][A-Z0-9_]{1,127})(?::-[^}]*)?\}|([A-Z][A-Z0-9_]{1,127})\b)/g)){const n=m[1]??m[2];if(!local.has(n))reads.push({name:n,line:i+1,detector:"shell_env_reference"});}});
    }
    if(owner)for(const r of reads)edges.push({from:owner,to:ensure(r.name,f.path),type:"reads_config",evidence:f.path,start_line:r.line,end_line:r.line,symbol:r.name,detector:r.detector,layer:"generated"});

    if(base(f.path)===".env.example"){
      const ownerId=fileOwner(f.path);
      if(!sourceNodeIds.has(f.path)&&!nodes.has(ownerId))nodes.set(ownerId,{id:ownerId,type:"configuration",source:f.path,layer:"generated",relationship_status:"parsed",detector:"configuration_parser"});
      f.content.split("\n").forEach((l,i)=>{const m=l.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]{1,127})\s*=/);if(m)edges.push({from:ownerId,to:ensure(m[1],f.path),type:"declares_config",evidence:f.path,start_line:i+1,end_line:i+1,symbol:m[1],detector:"env_example_parser",layer:"generated"});});
    }

    const deployYaml=base(f.path)==="docker-compose.yml"||base(f.path)==="docker-compose.yaml"||f.path.startsWith(".github/workflows/");
    if(deployYaml){
      const stack:Array<{indent:number;key:string}>=[];f.content.split("\n").forEach((raw,i)=>{
        if(!raw.trim()||raw.trim().startsWith("#"))return;
        const indent=raw.length-raw.trimStart().length;while(stack.length&&stack[stack.length-1].indent>=indent)stack.pop();
        const parents=stack.map((x)=>x.key);const m=raw.match(/^\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*:\s*(.*)$/);
        if(m){const key=m[1],rest=m[2].trim(),lower=key.toLowerCase();if(["command","entrypoint","healthcheck","inputs","outputs","ports","services","volumes"].includes(lower))deployment.push({kind:lower,source:f.path,line:i+1,detector:"yaml_structure_lexer"});
          if(parents.at(-1)==="services")deployment.push({kind:"service",name:key,source:f.path,line:i+1,detector:"yaml_structure_lexer"});
          if(["env","environment"].includes(parents.at(-1)??"")&&/^[A-Z][A-Z0-9_]{1,127}$/.test(key))ensure(key,f.path);
          if(!rest)stack.push({indent,key:lower});
        } else if(stack.at(-1)?.key==="ports"){const v=raw.trim().replace(/^-/,"").trim().replace(/^['"]|['"]$/g,"");if(/^[0-9.:/-]+$/.test(v))deployment.push({kind:"port",name:v,source:f.path,line:i+1,detector:"yaml_structure_lexer"});}
      });
    }

    if(base(f.path).startsWith("Dockerfile")){
      f.content.split("\n").forEach((raw,i)=>{const m=raw.match(/^\s*(ENV|EXPOSE|CMD|ENTRYPOINT|VOLUME|HEALTHCHECK)\b\s*(.*)$/i);if(!m||raw.trim().startsWith("#"))return;const kind=m[1].toLowerCase(),value=m[2].trim();const row:Record<string,unknown>={kind,source:f.path,line:i+1,detector:"dockerfile_instruction_parser"};if(kind==="expose"){const p=value.split(/\s+/).filter((x)=>/^\d+(?:\/(?:tcp|udp))?$/.test(x)).join(" ");if(p)row.name=p;}deployment.push(row);if(kind==="env"){const em=value.match(/^([A-Z][A-Z0-9_]{1,127})(?:\s*=|\s+)/);if(em)ensure(em[1],f.path);}});
    }
  }

  const counts:Record<string,number>={};for(const d of deployment){const k=String(d.kind);counts[k]=(counts[k]??0)+1;}
  const uniqueEdges=new Map<string,GraphEdge>();for(const e of edges){uniqueEdges.set(`${e.from}|${e.to}|${e.type}`,e);}
  return {nodes:[...nodes.values()],edges:[...uniqueEdges.values()],facts:{configuration_key_count:[...nodes.values()].filter((n)=>n.type==="configuration_key").length,deployment_facts:deployment,deployment_fact_count:deployment.length,deployment_fact_counts_by_kind:Object.fromEntries(Object.entries(counts).sort())}};
}
