# ControlStack three-lane operating environment

This environment separates feature work by Git worktree and binds each chat app to one root only.

| Lane | Root | Required branch | MCP | Companion service | Named gate |
|---|---|---|---|---|---|
| Selector & Engine | `C:\ControlStack_Worktrees\selector-engine` | `lane/selector-engine` | `127.0.0.1:8000/mcp` | Selector runtime `127.0.0.1:8788` | `selector-engine` |
| Lab / IES Authority | `C:\ControlStack_Worktrees\code-pilot-lab` | `lane/code-pilot-lab` | `127.0.0.1:8021/mcp` | Demo/spec remains read-only on `:8899` | `lab-ies` |
| Program & Integrate | `C:\ControlStack_Worktrees\program-integrate` | `lane/program-integrate` | `127.0.0.1:8022/mcp` | none | `program-integrate` |

## Enforced policy

- Every mutation verifies the exact required `lane/*` branch.
- Writes and staging are restricted to the configured lane path globs.
- Commit requires an already-staged explicit set and the lane's most recent named gate to be green.
- Push targets the current `lane/*` branch only. A lane app cannot push `main`.
- Delete, movement, cross-root copy, arbitrary shell and force push are disabled.
- Donor/spec roots are read-only. Program & Integrate has no donor root.
- No lane app is rooted at `C:\ControlStack_Runtime`; main is updated only through a reviewed integration/merge step.

## Patrick's start instructions

- Selector & Engine: open a fresh chat in the Selector project and use the **ControlStack Selector and Engine Lane** app. It can write/stage scoped Selector/Engine files, run `selector-engine`, and gated-commit/push its lane branch. It cannot write main, Lab, or donor.
- Lab / IES: open a fresh chat in the Lab Implementation project and use the **ControlStack Lab and IES Authority Lane** app. It can write/stage Lab/IES paths, run `lab-ies`, and gated-commit/push its lane branch. It can read the `C:\ControlStack_Lab` demo/spec but cannot write it.
- Program & Integrate: open a fresh chat in the Program & Integrate project and use the **ControlStack Program and Integrate Lane** app. It can reconcile and stage any path in its isolated integration worktree, run `program-integrate`, and gated-commit/push its lane branch. Promotion to main remains a separate reviewed merge.

Use one orchestrator/writer chat per lane. Worker chats may inspect and propose, but only the lane orchestrator stages and invokes the gated commit/push operation.
