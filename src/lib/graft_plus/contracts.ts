import type { FileInput, GraphEdge, GraphNode } from "./types.ts";
import { CONTRACT_SUFFIXES, language } from "./inventory.ts";
function ext(path:string){const b=path.split("/").pop()??path;const i=b.lastIndexOf(".");return i>=0?b.slice(i).toLowerCase():"";}
function line(text:string,offset:number){return text.slice(0,offset).split("\n").length;}
function decl(source:string,kind:string,name:string,start:number,parent?:string):GraphNode{return{id:`contract:${kind}:${source}:${parent?`${parent}.`:""}${name}`,type:"contract",source,layer:"generated",name,kind,parent,start_line:start,end_line:start,detector:"contract_parser"};}
function norm(base:string,raw:string){const parts=[...(base?base.split("/"):[]),...raw.split("/")],out:string[]=[];for(const p of parts){if(!p||p===".")continue;if(p==="..")out.pop();else out.push(p);}return out.join("/");}
export function collectContractGraph(files:FileInput[],sourceNodeIds:Map<string,string>){
  const contractFiles=files.filter((f)=>CONTRACT_SUFFIXES.has(ext(f.path)));const known=new Set(contractFiles.map((f)=>f.path));const nodes:GraphNode[]=[],edges:GraphEdge[]=[];
  for(const f of contractFiles){
    const fileId=`file:${f.path}`;nodes.push({id:fileId,type:"contract_source",source:f.path,layer:"generated",language:language(f.path),relationship_status:"parsed",detector:"contract_parser"});
    const add=(n:GraphNode)=>{nodes.push(n);edges.push({from:fileId,to:n.id,type:"defines_contract",evidence:f.path,start_line:n.start_line,end_line:n.end_line,symbol:n.name,detector:"contract_parser",layer:"generated"});};
    if(ext(f.path)===".proto"){
      for(const m of f.content.matchAll(/^\s*(message|enum|service)\s+([A-Za-z_]\w*)/gm))add(decl(f.path,`protobuf_${m[1]}`,m[2],line(f.content,m.index??0)));
      for(const m of f.content.matchAll(/\brpc\s+([A-Za-z_]\w*)\s*\(/g))add(decl(f.path,"protobuf_rpc",m[1],line(f.content,m.index??0)));
      for(const m of f.content.matchAll(/^\s*import\s+(?:public\s+|weak\s+)?["']([^"']+)["']\s*;/gm)){const target=norm(f.path.includes("/")?f.path.slice(0,f.path.lastIndexOf("/")):"",m[1]);if(known.has(target))edges.push({from:fileId,to:`file:${target}`,type:"imports_contract",evidence:f.path,start_line:line(f.content,m.index??0),end_line:line(f.content,m.index??0),symbol:m[1],detector:"contract_parser",layer:"generated"});}
    } else if([".gql",".graphql"].includes(ext(f.path))){
      const clean=f.content.replace(/"""[\s\S]*?"""/g,"").replace(/#.*$/gm,"");
      for(const m of clean.matchAll(/^\s*(type|input|interface|enum|scalar|union|schema)\s+([A-Za-z_]\w*)/gm))add(decl(f.path,`graphql_${m[1]}`,m[2],line(clean,m.index??0)));
      for(const root of clean.matchAll(/\btype\s+(Query|Mutation|Subscription)\b[^\{]*\{([\s\S]*?)\}/g)){for(const m of root[2].matchAll(/^\s*([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*:/gm))add(decl(f.path,"graphql_operation",m[1],line(clean,(root.index??0)+(m.index??0)),root[1]));}
    } else if(ext(f.path)===".sql"){
      const clean=f.content.replace(/\/\*[\s\S]*?\*\//g,"").replace(/--.*$/gm,"");
      for(const m of clean.matchAll(/\bCREATE\s+(?:OR\s+REPLACE\s+)?(TABLE|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["`]?([A-Za-z_]\w*)["`]?\.)?["`]?([A-Za-z_]\w*)["`]?/gi)){const q=m[2]?`${m[2]}.${m[3]}`:m[3];add(decl(f.path,`sql_${m[1].toLowerCase()}`,q,line(clean,m.index??0)));}
    } else if(ext(f.path)===".avsc"){
      try{const data=JSON.parse(f.content);const walk=(v:unknown)=>{if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==="object"){const o=v as Record<string,unknown>;if(["record","enum","fixed"].includes(String(o.type))&&typeof o.name==="string")add(decl(f.path,`avro_${o.type}`,o.name,1));Object.values(o).forEach(walk);}};walk(data);}catch{}
    }
  }
  for(const f of files){
    const owner=sourceNodeIds.get(f.path);if(!owner||known.has(f.path))continue;
    const code=ext(f.path)===".py"?f.content.replace(/#.*$/gm,""):f.content.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"");
    for(const m of code.matchAll(/["']([^"']+\.(?:avsc|gql|graphql|proto|sql))["']/gi)){const base=f.path.includes("/")?f.path.slice(0,f.path.lastIndexOf("/")):"";const candidates=[norm(base,m[1]),norm("",m[1])].filter((p)=>known.has(p));if(candidates.length===1)edges.push({from:owner,to:`file:${candidates[0]}`,type:"consumes_contract",evidence:f.path,start_line:line(code,m.index??0),end_line:line(code,m.index??0),symbol:m[1],detector:"literal_contract_reference",layer:"generated"});}
  }
  const byId=new Map(nodes.map((n)=>[n.id,n]));const unique=[...byId.values()];const kinds:Record<string,number>={};for(const n of unique)if(n.type==="contract"){const k=String(n.kind);kinds[k]=(kinds[k]??0)+1;}
  return{nodes:unique,edges,facts:{contract_source_count:contractFiles.length,contract_declaration_count:unique.filter((n)=>n.type==="contract").length,contract_declaration_counts_by_kind:Object.fromEntries(Object.entries(kinds).sort())}};
}
