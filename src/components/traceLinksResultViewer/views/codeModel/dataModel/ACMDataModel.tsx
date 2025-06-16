/**
 * Represents a unit in the code model, such as a class, interface, or package.
 * It is used to represent the structure of the code in a hierarchical manner for visualization.
 */
export class CodeModelUnit {
  id: string;
  name: string;
  type: string; // e.g. "ClassUnit", "InterfaceUnit", "ControlElement", "CodeCompilationUnit", "CodePackage"
  children: CodeModelUnit[];
  path: string;

  /**
   * Constructs a new instance of the CodeModelUnit class.
   *
   * @param id - The unique identifier of the code model unit.
   * @param name - The name of the code model unit.
   * @param type - The type of the code model unit.
   * @param children - The child units of this code model unit.
   * @param path - (Optional) The file path associated with this code model unit.
   */
  constructor(id: string, name: string, type: string, children: CodeModelUnit[], path?: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.children = children;
    this.path = path || "";
  }

}
