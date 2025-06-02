import { CodeModelUnit } from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";

interface RawCodeItem {
  id: string;
  name: string;
  type: string;
  content?: string[];
  extension?: string;
  pathElements?: string[];
  parentId?: string | null;
}

export function parseCodeFromACM(content: string): CodeModelUnit {
  const rawJson = JSON.parse(content);

  if (!rawJson.codeItemRepository?.repository) {
    throw new Error("Invalid ACM JSON structure: 'codeItemRepository.repository' not found.");
  }

  const repository: { [id: string]: RawCodeItem } = rawJson.codeItemRepository.repository;
  const parsedUnits = new Map<string, CodeModelUnit>();

  const leafPackageIds = new Set<string>();
  const rootPackageIds = new Set<string>();

  const createAndStoreUnit = (
      id: string,
      name: string,
      type: string,
      children: CodeModelUnit[] = [],
      customPath?: string
  ): CodeModelUnit => {
    const unit = new CodeModelUnit(id, name, type, children, customPath);
    parsedUnits.set(id, unit);
    return unit;
  };

  const resolveChildren = (childIds: string[]): CodeModelUnit[] => {
    const children: CodeModelUnit[] = [];
    for (const childId of childIds) {
      const childUnit = parsedUnits.get(childId);
      if (childUnit) {
        children.push(childUnit);
      } else {
        console.warn(`Could not resolve child ID "${childId}". Missing or unparsed item.`);
      }
    }
    return children;
  };

  // Parse atomic units and their immediate children
  for (const id in repository) {
    const item = repository[id];
    switch (item.type) {
      case "ControlElement":
        createAndStoreUnit(item.id, item.name, item.type);
        break;
      case "ClassUnit":
      case "InterfaceUnit":
        const contentChildren = item.content ? resolveChildren(item.content) : [];
        createAndStoreUnit(item.id, item.name, item.type, contentChildren);
        break;
      default:
        break;
    }
  }

  // Pass 2: Parse CodeCompilationUnits (files) and track potential leaf packages
  for (const id in repository) {
    const item = repository[id];
    if (item.type === "CodeCompilationUnit") {
      const content: CodeModelUnit[] = [];
      if (item.content) {
        for (const contentId of item.content) {
          const childUnit = parsedUnits.get(contentId);
          if (childUnit) {
            content.push(childUnit);
          } else {
            console.warn(`Content ID "${contentId}" in compilation unit "${item.name}" could not be resolved.`);
          }
        }
      }

      const fileName = `${item.name}.${item.extension || '?'}`;
      const fullPath = item.pathElements ? `${item.pathElements.join("/")}/${fileName}` : fileName;

      createAndStoreUnit(item.id, fileName, item.type, content, fullPath);

      if (item.parentId != null) {
        leafPackageIds.add(item.parentId);
      }
    }
  }

  // Determine root packages by tracing up from leaf packages
  for (const leafId of leafPackageIds) {
    let currentItem: RawCodeItem | undefined = repository[leafId];
    while (currentItem && currentItem.parentId != null) {
      currentItem = repository[currentItem.parentId];
    }
    if (currentItem) {
      rootPackageIds.add(currentItem.id);
    } else {
      console.warn(`Could not trace parent chain for leaf ID "${leafId}".`);
    }
  }

  // Recursively parse CodePackages to build the hierarchy
  const recursivelyParsePackage = (rawPackage: RawCodeItem): CodeModelUnit => {
    const children: CodeModelUnit[] = [];
    if (rawPackage.content) {
      for (const childId of rawPackage.content) {
        const childItem = repository[childId];
        if (!childItem) {
          console.warn(`Child ID "${childId}" not found for package "${rawPackage.name}".`);
          continue;
        }

        if (childItem.type === "CodePackage") {
          children.push(recursivelyParsePackage(childItem));
        } else if (childItem.type === "CodeCompilationUnit") {
          const compilationUnit = parsedUnits.get(childId);
          if (compilationUnit) {
            children.push(compilationUnit);
          } else {
            console.error(`CodeCompilationUnit "${childId}" referenced in package "${rawPackage.name}" was not pre-parsed.`);
          }
        } else {
          console.error(`Unexpected child type "${childItem.type}" in package "${rawPackage.name}".`);
        }
      }
    }
    return createAndStoreUnit(rawPackage.id, rawPackage.name, "CodePackage", children);
  };

  let rootPackages: CodeModelUnit[] = [];
  for (const rootId of rootPackageIds) {
    const rootItem = repository[rootId];
    if (rootItem?.type === "CodePackage") {
      rootPackages.push(recursivelyParsePackage(rootItem));
    } else {
      console.warn(`Root ID "${rootId}" does not correspond to a "CodePackage". Actual type: ${rootItem?.type || 'undefined'}.`);
    }
  }

  let root: CodeModelUnit;
  if (rootPackages.length > 1) {
    root = new CodeModelUnit("synthetic-root", "Code Model", "CodeModel", rootPackages);
  } else if (rootPackages.length === 1) {
    root = rootPackages[0];
  } else {
    console.warn("No root packages found. Creating a synthetic root from all top-level compilation units.");
    root = new CodeModelUnit("synthetic-root", "Code Model", "CodeModel", Array.from(parsedUnits.values()).filter(unit => unit.type === "CodeCompilationUnit" && !repository[unit.id]?.parentId));
  }

  setCodeModelUnitPaths(root);

  return root;
}

export function setCodeModelUnitPaths(node: CodeModelUnit, parentPath: string = ""): void {
  const separator = node.type === "CodeCompilationUnit" ? "" : "/";

  if (!node.path || node.id === "synthetic-root") {
    if (parentPath === "" && node.type !== "CodeModel") {
      node.path = node.name;
    } else if (parentPath === "" && node.type === "CodeModel") {
      node.path = node.name;
    } else {
      node.path = `${parentPath}${separator}${node.name}`;
    }
  }

  for (const child of node.children) {
    setCodeModelUnitPaths(child, node.path);
  }
}