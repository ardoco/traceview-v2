import {CodeModelUnit} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/ACMDataModel";


/**
 * Parses a architecture code model from a JSON string
 * @param content The JSON string
 * @returns The parsed code model
 */
export function parseCodeFromACM2(content: string): CodeModelUnit {
  const json = JSON.parse(content);
  const types = new Set();
  const typeInstances = new Map();
  for (let key of Object.keys(json.codeItemRepository.repository)) {
    types.add(json.codeItemRepository.repository[key].type);
    // create new key in map for type, if type does not exist
    if (!typeInstances.has(json.codeItemRepository.repository[key].type)) {
      typeInstances.set(json.codeItemRepository.repository[key].type, []);
    }
    // add current element to the list of elements for the type
    typeInstances.set(
      json.codeItemRepository.repository[key].type,
      typeInstances
        .get(json.codeItemRepository.repository[key].type)
        .concat(json.codeItemRepository.repository[key]),
    );
  }
  const classes = new Map<string, CodeModelUnit>();
  const interfaces = new Map<string, CodeModelUnit>();
  const controlElements = new Map<string, CodeModelUnit>();
  const codeCompilationUnits = new Map<string, CodeModelUnit>();
  const leafPackageIds = new Set<string>();
  const rootPackageIds = new Set<string>();

  // create list of control elements using the list of found instances from the type Instances map
  for (let controlElement of typeInstances.get("ControlElement")) {
    controlElements.set(
      controlElement.id,
      new CodeModelUnit(controlElement.id, controlElement.name, "ControlElement", []),
    );
  }
  // create list of class unit elements using the list of found instances from the type Instances map
  for (let clazz of typeInstances.get("ClassUnit")) {
    classes.set(
      clazz.id,
      new CodeModelUnit(
        clazz.id,
        clazz.name,
        "ClassUnit",
        clazz.content.map((id: string) => controlElements.get(id)!), //children  are control elements
      ),
    );
  }
  // create list of interface unit elements using the list of found instances from the type Instances map
  for (let inter of typeInstances.get("InterfaceUnit")) {
    interfaces.set(
      inter.id,
      new CodeModelUnit(
        inter.id,
        inter.name,
        "InterfaceUnit",
        inter.content.map((id: string) => controlElements.get(id)!),
      ),
    );
  }
  // create list of code compilation unit elements using the list of found instances from the type Instances map
  // add the content classes and interfaces to the code compilation unit by searching the previously created lists.
  for (let codecompilationunit of typeInstances.get("CodeCompilationUnit")) {
    const content = [];
    for (let contentId of codecompilationunit.content) { // add classes and interfaces to the content
      content.push(
        json.codeItemRepository.repository[contentId].type == "ClassUnit"
          ? classes.get(contentId)!
          : interfaces.get(contentId)!,
      );
    }
    codeCompilationUnits.set(
      codecompilationunit.id,
      new CodeModelUnit(
        codecompilationunit.id,
        codecompilationunit.name + "." + codecompilationunit.extension,
        "CodeCompilationUnit",
        content,
      ),
    );
    // if the code compilation unit itself has a parent, add it to the list of leaf packages
    if (codecompilationunit.parentId != null) {
      leafPackageIds.add(codecompilationunit.parentId);
    }
  }
  // TODO: Why cant I use the codeCompilationUnits which have  a parentId == null directly?
  for (let leafId of leafPackageIds) {
    let head = json.codeItemRepository.repository[leafId];
    let suffix = head.name;
    while (head.parentId != null) {
      head = json.codeItemRepository.repository[head.parentId];
      suffix = head.name + "." + suffix;
    }
    rootPackageIds.add(head.id);
  }

  // for each compilation unit and CodePackage, add the children  codecompilation and codepackage parents.
  // for the code packages create a new ACM packag

  function recursivelyParsePackage(pack: any): CodeModelUnit {
    const childPackages = [];
    const compilationUnits = [];
    for (let childId of pack.content) {
      const child = json.codeItemRepository.repository[childId];
      if (child.type == "CodePackage") {
        childPackages.push(recursivelyParsePackage(child));
      } else if (child.type == "CodeCompilationUnit") {
        compilationUnits.push(codeCompilationUnits.get(childId)!);
      } else {
        throw "unexpected type";
      }
    }
    return new CodeModelUnit(pack.id, pack.name, "CodePackage", childPackages.concat(compilationUnits));
  }
  let rootPackages = [];
  for (let rootId of rootPackageIds) {
    const root = json.codeItemRepository.repository[rootId];
    rootPackages.push(recursivelyParsePackage(root));
  }




  // merge codePackages which only contain one child. new name = current name + "." + child.name
  function mergeCodePackages(node: CodeModelUnit): CodeModelUnit {
    if (node.children.length == 1 && node.type == "CodePackage") {
      const child = node.children[0];
      node.name = node.name + "/" + child.name;
      node.type = child.type;
      node.children = child.children;
      mergeCodePackages(node);
    } else {
      for (const child of node.children) {
        mergeCodePackages(child);
      }
    }
    return node;
  }
    rootPackages.forEach((rootPackage) => {
        mergeCodePackages(rootPackage);
    });

  let root
  if (rootPackages.length > 1) {
    root = new CodeModelUnit("root", "", "CodeModel", rootPackages);
  } else {
    root = rootPackages[0];
  }

  return root;
}
