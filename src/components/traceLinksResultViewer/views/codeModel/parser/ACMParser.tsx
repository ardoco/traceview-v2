import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";

// Defines the structure of raw data items from the JSON file.
interface RawCodeItem {
    id: string;
    name: string;
    type: string;
    content?: string[];
    extension?: string;
    pathElements?: string[];
    parentId?: string | null;
    compilationUnitId?: string;
}

/**
 * Creates a unique, stable ID for a package based on its full path.
 * This is crucial for the merging logic.
 * @param path - The array of path segments.
 * @returns A unique string ID for the package.
 */
function createPackageIdFromPath(path: string[]): string {
    return `package_` + path.join('_').replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * The main parser function that orchestrates the conversion from flat data to a tree.
 * @param content - The raw JSON string from the codeModel.txt file.
 * @returns The single root CodeModelUnit of the fully constructed tree.
 */
export function parseACMFile(content: string): CodeModelUnit {
    const rawJson = JSON.parse(content);

    if (!rawJson.codeItemRepository?.repository) {
        throw new Error("Invalid ACM JSON structure: 'codeItemRepository.repository' not found.");
    }

    const repository: { [id: string]: RawCodeItem } = rawJson.codeItemRepository.repository;
    const idToUnitMap = new Map<string, CodeModelUnit>();
    const pathToPackageUnitMap = new Map<string, CodeModelUnit>();

    // Step 1: Create all CodeModelUnit instances from the repository
    // This ensures every item exists as an object before building relationships.
    for (const id in repository) {
        const rawItem = repository[id];
        let unitName = rawItem.name;
        let path = rawItem.pathElements ? rawItem.pathElements.join('/') : '';
        // For files, create the full filename with extension.
        if (rawItem.type === "CodeCompilationUnit") {
            unitName = `${rawItem.name}${rawItem.extension ? '.' + rawItem.extension : ''}`;
            path = path ? `${path}/${unitName}` : unitName;
        }
        const unit = new CodeModelUnit(id, unitName, rawItem.type, [], path);
        idToUnitMap.set(id, unit);
    }

    // Step 2: Build the folder/package hierarchy from pathElements
    const artificialRoot = new CodeModelUnit("temp-synthetic-root", "Path Root", "CodeModel", []);

    for (const unit of idToUnitMap.values()) {
        const rawItem = repository[unit.id];

        if (unit.type === "CodeCompilationUnit" && rawItem.pathElements) {
            let currentParent = artificialRoot;
            const currentPathSegments: string[] = [];

            // Create a chain of nested packages for each segment of the path.
            for (const segment of rawItem.pathElements) {
                currentPathSegments.push(segment);
                const pathKey = currentPathSegments.join('/');
                let packageUnit = pathToPackageUnitMap.get(pathKey);

                if (!packageUnit) {
                    // If this package path hasn't been seen, create a new package unit.
                    const packageId = createPackageIdFromPath(currentPathSegments);
                    packageUnit = new CodeModelUnit(packageId, segment, "CodePackage", []);
                    idToUnitMap.set(packageId, packageUnit);
                    pathToPackageUnitMap.set(pathKey, packageUnit);

                    if (!currentParent.children.find(c => c.id === packageUnit!.id)) {
                        currentParent.children.push(packageUnit);
                    }
                }
                currentParent = packageUnit;
            }
            // Place the file into its correct parent package.
            if (!currentParent.children.find(c => c.id === unit.id)) {
                currentParent.children.push(unit);
            }
        }
    }

    //   Step 3: Link contained children (methods in classes, classes in codeCompilationUnits)
    for (const unit of idToUnitMap.values()) {
        const rawItem = repository[unit.id];
        // Check if the item is a container (File, Class, Interface) and has content.
        if ((unit.type === "CodeCompilationUnit" || unit.type === "ClassUnit" || unit.type === "InterfaceUnit") && rawItem.content) {
            for (const childId of rawItem.content) {
                const childUnit = idToUnitMap.get(childId);
                if (childUnit) {
                    if (!unit.children.find(c => c.id === childUnit.id)) {
                        unit.children.push(childUnit);
                    }
                } else {
                    console.warn(`[ACMParser] Content Child ID "${childId}" for item "${unit.name}" not found.`);
                }
            }
        }
    }

    // Step 4: Merge sibling nodes with the same name and type to remove duplicates
    function mergeSiblingsRecursive(node: CodeModelUnit): void {
        if (!node.children || node.children.length === 0) return;

        // Recursively process children first (bottom-up merging).
        node.children.forEach(child => mergeSiblingsRecursive(child));

        const mergedChildren: CodeModelUnit[] = [];
        const distinctChildrenMap = new Map<string, CodeModelUnit>();

        for (const child of node.children) {
            const childKey = `${child.name}_${child.type}`;
            const existingSibling = distinctChildrenMap.get(childKey);

            if (existingSibling) {
                // If a sibling with the same name/type exists, merge children into it.
                child.children.forEach(grandChild => {
                    if (!existingSibling.children.find(egc => egc.id === grandChild.id)) {
                        existingSibling.children.push(grandChild);
                    }
                });
                // After adding new children, the merged node might need its own children merged.
                mergeSiblingsRecursive(existingSibling);
            } else {
                distinctChildrenMap.set(childKey, child);
                mergedChildren.push(child);
            }
        }
        node.children = mergedChildren;
    }

    mergeSiblingsRecursive(artificialRoot);

    // Step 5: Collapse single-child packages to simplify the tree view
    function collapseSingleChildPackagesRecursive(node: CodeModelUnit): void {
        if (!node.children) return;

        node.children.forEach(collapseSingleChildPackagesRecursive);

        const collapsedChildren: CodeModelUnit[] = [];
        for (const child of node.children) {
            const current = child;

            while (
                current.type === "CodePackage" &&
                current.children.length === 1 &&
                current.children[0].type === "CodePackage"
                ) {
                const singleChildPackage = current.children[0];
                current.name = `${current.name}/${singleChildPackage.name}`;
                current.children = singleChildPackage.children;
            }
            collapsedChildren.push(current);
        }
        node.children = collapsedChildren;
    }

    collapseSingleChildPackagesRecursive(artificialRoot);

    // Step 6: Determine the final root node
    let root: CodeModelUnit;
    if (artificialRoot.children.length > 1) {
        root = new CodeModelUnit("synthetic-root", "Code Model", "CodeModel", artificialRoot.children);
    } else if (artificialRoot.children.length === 1) {
        root = artificialRoot.children[0];
    } else {
        root = new CodeModelUnit("synthetic-root-empty", "Code Model", "CodeModel", []);
    }

    // Recursively apply the merge again on the final root to catch any top-level merges.
    mergeSiblingsRecursive(root);

    setCodeModelUnitPaths(root, "");

    return root;
}

/**
 * Recursively sets the 'path' property for each CodeModelUnit in the tree.
 * @param unit The current CodeModelUnit node.
 * @param basePath The path of the parent/container unit.
 */
export function setCodeModelUnitPaths(unit: CodeModelUnit, basePath: string): void {
    if (unit.id.startsWith("synthetic-root") || unit.type === "CodeModel") {
        unit.path = unit.name;
        basePath = "";
    } else if (unit.type === "CodeCompilationUnit") {
        // The path for a file is already absolute and was set in Step 1.
        basePath = unit.path!;

    } else if (unit.type === "CodePackage") {
        unit.path = basePath ? `${basePath}/${unit.name}` : unit.name;
        basePath = unit.path;
    } else {
        unit.path = `${basePath}::${unit.name}`;
        basePath = unit.path;
    }

    for (const child of unit.children) {
        setCodeModelUnitPaths(child, basePath);
    }
}
