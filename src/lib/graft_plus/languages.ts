import type { FileInput, GraphEdge, GraphNode, UnresolvedReference } from "./types.ts";
import { language } from "./inventory.ts";

const TEST_RE = /(?:^|\/)(?:tests?|specs?|__tests__)(?:\/|$)|(?:\.test|\.spec)\.[^.]+$/i;
const RUNTIME_PREFIXES: Record<string, string[]> = {
  rust:["alloc","core","proc_macro","std","test"],
  ruby:["abbrev","base64","benchmark","bigdecimal","cgi","csv","date","digest","fileutils","json","logger","net/","openssl","optparse","pathname","set","stringio","time","uri","yaml"],
  jvm:["java.","javax.","jdk.","kotlin.","scala."],
  dotnet:["Microsoft.CSharp","System"],
  elixir:["Access","Application","Enum","GenServer","Kernel","Logger","Map","Process","Stream","String","Supervisor","Task"],
  swift:["Combine","CoreData","CoreFoundation","Darwin","Dispatch","Foundation","Swift","SwiftUI","UIKit"],
};
function isTest(path:string){const stem=(path.split("/").pop()??path).replace(/\.[^.]+$/,"");return TEST_RE.test(path)||/^test_|_test$|_spec$|Test$|Tests$|Spec$|Specs$/.test(stem);}
function norm(path:string){const out:string[]=[];for(const p of path.split("/")){if(!p||p===".")continue;if(p==="..")out.pop();else out.push(p);}return out.join("/");}
function parent(path:string){const i=path.lastIndexOf("/");return i>=0?path.slice(0,i):"";}
function nodeId(path:string){const lang=language(path);const prefix=lang==="rust"?"rs":lang==="ruby"?"rb":lang==="php"?"php":["c","cpp"].includes(lang)?"native":["java","kotlin","scala"].includes(lang)?"jvm":lang==="csharp"?"dotnet":lang==="lua"?"lua":lang==="elixir"?"ex":lang==="swift"?"swift":lang==="go"?"go":lang==="shell"?"sh":lang==="javascript"||lang==="typescript"?"js":lang;return isTest(path)?`test:${path}`:`${prefix}:${path}`;}
function runtime(kind:string,value:string){return (RUNTIME_PREFIXES[kind]??[]).some((p)=>value===p||value.startsWith(p));}
function stripComments(text:string,lang:string){
  if(["rust","php","c","cpp","java","kotlin","scala","csharp","swift"].includes(lang)) return text.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"");
  if(lang==="ruby") return text.replace(/^=begin\b[\s\S]*?^=end\b/gm,"").replace(/^\s*#.*$/gm,"");
  if(lang==="lua") return text.replace(/--\[\[[\s\S]*?\]\]/g,"").replace(/--.*$/gm,"");
  if(lang==="elixir") return text.replace(/^\s*#.*$/gm,"");
  return text;
}
function resolveRelative(source:string, raw:string, candidates:Set<string>, suffixes:string[]){
  const base=norm([parent(source),raw.replace(/^\.\//,"")].filter(Boolean).join("/"));
  const tries=[base,...suffixes.map((s)=>base.endsWith(s)?base:base+s),...suffixes.map((s)=>`${base}/index${s}`)];
  return tries.find((p)=>candidates.has(p));
}
export function collectLanguageGraph(files:FileInput[]){
  const nodes:GraphNode[]=[];const edges:GraphEdge[]=[];const unresolved:UnresolvedReference[]=[];
  const sourceFiles=files.filter((f)=>["rust","ruby","php","c","cpp","java","kotlin","scala","csharp","lua","elixir","swift","go","shell"].includes(language(f.path)));
  const fileSet=new Set(sourceFiles.map((f)=>f.path));
  const symbols=new Map<string,string[]>();
  for(const f of sourceFiles){
    const lang=language(f.path);nodes.push({id:nodeId(f.path),type:isTest(f.path)?"test_module":lang==="rust"?"rust_module":lang==="ruby"?"ruby_module":lang==="php"?"php_module":["c","cpp"].includes(lang)?"native_module":["java","kotlin","scala"].includes(lang)?"jvm_module":lang==="csharp"?"dotnet_module":lang==="lua"?"lua_module":lang==="elixir"?"elixir_module":lang==="swift"?"swift_module":lang==="go"?"go_module":"shell_module",source:f.path,layer:"generated"});
    const text=stripComments(f.content,lang);
    if(["java","kotlin","scala"].includes(lang)){const pkg=text.match(/^\s*package\s+([\w.]+)/m)?.[1]??"";symbols.set([pkg,(f.path.split("/").pop()??"").replace(/\.[^.]+$/,"")].filter(Boolean).join("."),[f.path]);}
    if(lang==="csharp"){for(const m of text.matchAll(/^\s*namespace\s+([A-Za-z_][\w.]*)/gm))symbols.set(m[1],[f.path]);}
    if(lang==="elixir"){for(const m of text.matchAll(/^\s*defmodule\s+([A-Z][\w.]*)/gm))symbols.set(m[1],[f.path]);}
  }
  for(const f of sourceFiles){
    const lang=language(f.path), text=stripComments(f.content,lang), src=nodeId(f.path);
    const refs:Array<[string,string]>=[];
    if(lang==="rust"){
      for(const m of text.matchAll(/^\s*(?:pub\s+)?mod\s+([A-Za-z_]\w*)\s*;/gm))refs.push(["rust_mod",m[1]]);
      for(const m of text.matchAll(/^\s*use\s+crate::([A-Za-z_][\w:]*)/gm))refs.push(["rust_crate",m[1]]);
      for(const m of text.matchAll(/^\s*(?:use|extern\s+crate)\s+([A-Za-z_]\w*)/gm))if(!["alloc","core","crate","self","std","super"].includes(m[1]))refs.push(["external",m[1]]);
    } else if(lang==="ruby"){
      for(const m of text.matchAll(/^\s*require_relative\s*\(?\s*['"]([^'"]+)['"]/gm))refs.push(["relative",m[1]]);
      for(const m of text.matchAll(/^\s*require\s*\(?\s*['"]([^'"]+)['"]/gm))refs.push(["external",m[1]]);
    } else if(lang==="php"){
      for(const m of text.matchAll(/\b(?:include|include_once|require|require_once)\s*(?:\(\s*)?(?:__DIR__\s*\.\s*)?['"]([^'"]+)['"]/g))refs.push(["relative",m[1]]);
    } else if(["c","cpp"].includes(lang)){
      for(const m of text.matchAll(/^\s*#\s*include\s*"([^"]+)"/gm))refs.push(["relative",m[1]]);
    } else if(["java","kotlin","scala"].includes(lang)){
      for(const m of text.matchAll(/^\s*import\s+(?:static\s+)?([A-Za-z_][\w.$]*(?:\.[A-Za-z_*][\w*]*)?)/gm))refs.push(["symbol",m[1]]);
    } else if(lang==="csharp"){
      for(const m of text.matchAll(/^\s*using\s+(?:static\s+)?(?:[A-Za-z_]\w*\s*=\s*)?([A-Za-z_][\w.]*)\s*;/gm))refs.push(["symbol",m[1]]);
    } else if(lang==="elixir"){
      for(const m of text.matchAll(/^\s*(?:alias|import|require|use)\s+([A-Z][\w.]*)/gm))refs.push(["symbol",m[1]]);
    } else if(lang==="swift"){
      for(const m of text.matchAll(/^\s*import\s+(?:class|struct|enum|protocol|func|var|let|typealias\s+)?([A-Za-z_][\w.]*)/gm))refs.push(["symbol",m[1]]);
    } else if(lang==="lua"){
      for(const m of text.matchAll(/\brequire\s*\(?\s*['"]([^'"]+)['"]/g))refs.push(["module",m[1]]);
    } else if(lang==="go"){
      for(const m of text.matchAll(/import\s+(?:\([^)]*?["']([^"']+)["'][^)]*\)|["']([^"']+)["'])/gs)){const v=m[1]??m[2];if(v)refs.push(["go",v]);}
    } else if(lang==="shell"){
      for(const m of text.matchAll(/^\s*(?:source|\.)\s+['"]?([^'"\s;]+)/gm))refs.push(["relative",m[1].replace(/^\$\{?[A-Za-z_]\w*\}?\/?/,"")]);
    }
    for(const [kind,value] of refs){
      let target:string|undefined;
      if(kind==="relative") target=resolveRelative(f.path,value,fileSet,[".rb",".php",".h",".hpp",".c",".cc",".cpp",".sh",".bash",".zsh"]);
      else if(kind==="rust_mod") target=[norm(`${parent(f.path)}/${value}.rs`),norm(`${parent(f.path)}/${value}/mod.rs`)].find((p)=>fileSet.has(p));
      else if(kind==="rust_crate"){const first=value.split("::")[0];target=[...fileSet].find((p)=>p.endsWith(`/${first}.rs`)||p.endsWith(`/${first}/mod.rs`));}
      else if(kind==="module"&&lang==="lua"){const p=value.replace(/\./g,"/");target=[...fileSet].find((x)=>x.endsWith(`/${p}.lua`)||x.endsWith(`/${p}/init.lua`)||x===`${p}.lua`);}
      else if(kind==="symbol"){const exact=value.replace(/\.\*$/,"");target=(symbols.get(exact)??symbols.get(exact.replace(/\.[^.]+$/,""))??[])[0];}
      else if(kind==="go"){target=[...fileSet].find((p)=>value.endsWith("/"+parent(p))||value.endsWith("/"+p.replace(/\/[^/]+$/,"")));}
      if(target&&target!==f.path)edges.push({from:src,to:nodeId(target),type:isTest(f.path)&&!isTest(target)?"tests":"imports",evidence:f.path,layer:"generated"});
      else if(["external","symbol"].includes(kind)&&!runtime(["java","kotlin","scala"].includes(lang)?"jvm":lang==="csharp"?"dotnet":lang,value))unresolved.push({specifier:value,from:f.path});
      else if(["relative","rust_mod","module"].includes(kind))unresolved.push({specifier:value,from:f.path});
    }
  }
  const goMod = files.find((f) => f.path === "go.mod");
  const moduleName = goMod?.content.match(/^module\s+([^\s]+)$/m)?.[1];
  if (moduleName) {
    const goFiles = sourceFiles.filter((f) => language(f.path) === "go");
    const packageIds = new Map<string, string>();
    const packageFor = (path: string) => {
      const dir = parent(path);
      const suffix = dir ? `/${dir}` : "";
      const name = moduleName + suffix;
      const id = `go:package:${name}`;
      if (!packageIds.has(name)) {
        packageIds.set(name, id);
        nodes.push({ id, type: "go_package", source: "go.mod", layer: "generated", name });
      }
      return id;
    };
    for (const file of goFiles) packageFor(file.path);
    for (const file of goFiles) {
      const sourceId = nodeId(file.path);
      const text = stripComments(file.content, "go");
      for (const m of text.matchAll(/["']([^"']+)["']/g)) {
        const imported = m[1];
        const target = packageIds.get(imported);
        if (target) {
          edges.push({
            from: sourceId,
            to: target,
            type: isTest(file.path) ? "tests" : "imports",
            evidence: file.path,
            layer: "generated",
          });
        }
      }
    }
  }

  const pythonByPath = new Map(
    files.filter((f) => f.path.endsWith(".py")).map((f) => [f.path, `py:${moduleForPython(f.path)}`]),
  );
  for (const file of sourceFiles.filter((f) => language(f.path) === "shell")) {
    const sourceId = nodeId(file.path);
    for (const m of file.content.matchAll(/\bpython(?:3(?:\.\d+)?)?\s+["']?([^'"\s;]+\.py)/g)) {
      const cleaned = m[1].replace(/^\$\{?[A-Za-z_]\w*\}?\/?/, "");
      const candidates = [norm([parent(file.path), cleaned].filter(Boolean).join("/")), norm(cleaned)];
      const hit = candidates.find((candidate) => pythonByPath.has(candidate));
      if (hit) {
        edges.push({
          from: sourceId,
          to: pythonByPath.get(hit)!,
          type: "invokes",
          evidence: file.path,
          layer: "generated",
        });
      }
    }
  }

  return {nodes,edges,unresolved};
}
function moduleForPython(path: string) {
  const parts = path.replace(/\.py$/, "").split("/").filter(Boolean);
  if (parts[0] === "src") parts.shift();
  if (parts.at(-1) === "__init__") parts.pop();
  return parts.join(".");
}
