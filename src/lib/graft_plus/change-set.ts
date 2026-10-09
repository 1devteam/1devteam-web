export const CHANGE_SET_FILE = "graph-change-set.v1.json" as const;

export type FactualChangeSet = {
  schema_version: "1.0";
  role: "factual-change-set";
  requested: false;
  base_ref: null;
  head_ref: null;
  base_sha: null;
  head_sha: null;
  changed_files: [];
  direct_node_mappings: [];
  changed_node_ids: [];
  unmapped_changed_files: [];
  changed_file_count: 0;
  changed_node_count: 0;
  unmapped_changed_file_count: 0;
};

/**
 * The public browser workbench reconstructs one resolved SHA at a time.
 * It therefore emits canonical G.R.A.F.T.+'s explicit no-range change-set
 * rather than inventing transitive impact or a synthetic git comparison.
 */
export function buildNoRangeChangeSet(): FactualChangeSet {
  return {
    schema_version: "1.0",
    role: "factual-change-set",
    requested: false,
    base_ref: null,
    head_ref: null,
    base_sha: null,
    head_sha: null,
    changed_files: [],
    direct_node_mappings: [],
    changed_node_ids: [],
    unmapped_changed_files: [],
    changed_file_count: 0,
    changed_node_count: 0,
    unmapped_changed_file_count: 0,
  };
}
