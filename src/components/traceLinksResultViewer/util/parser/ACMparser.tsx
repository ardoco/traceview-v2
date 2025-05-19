// import {
//   ACMClassUnit,
//   ACMCodeCompilationUnit,
//   ACMControlElement,
//   ACMInterfaceUnit, ACMPackage,
//   CodeModel
// } from "../dataModelsInputFiles/ACMDataModel";
//
//
// /**
//  * Parses a architecture code model from a JSON string
//  * @param content The JSON string
//  * @returns The parsed code model
//  */
// export function parseCodeFromACM(content: string): CodeModel {
//   const json = JSON.parse(content);
//   const types = new Set();
//   const typeInstances = new Map();
//   for (let key of Object.keys(json.codeItemRepository.repository)) {
//     types.add(json.codeItemRepository.repository[key].type);
//     // create new key in map for type, if type does not exist
//     if (!typeInstances.has(json.codeItemRepository.repository[key].type)) {
//       typeInstances.set(json.codeItemRepository.repository[key].type, []);
//     }
//     // add current element to the list of elements for the type
//     typeInstances.set(
//         json.codeItemRepository.repository[key].type,
//         typeInstances
//             .get(json.codeItemRepository.repository[key].type)
//             .concat(json.codeItemRepository.repository[key]),
//     );
//   }
//   const classes = new Map<string, ACMClassUnit>();
//   const interfaces = new Map<string, ACMInterfaceUnit>();
//   const controlElements = new Map<string, ACMControlElement>();
//   const codeCompilationUnits = new Map<string, ACMCodeCompilationUnit>();
//   const leafPackageIds = new Set<string>();
//   const rootPackageIds = new Set<string>();
//
//   // create list of control elements using the list of found instances from the type Instances map
//   for (let controlElement of typeInstances.get("ControlElement")) {
//     controlElements.set(
//         controlElement.id,
//         new ACMControlElement(controlElement.id, controlElement.name),
//     );
//   }
//   // create list of class unit elements using the list of found instances from the type Instances map
//   for (let clazz of typeInstances.get("ClassUnit")) {
//     classes.set(
//         clazz.id,
//         new ACMClassUnit(
//             clazz.id,
//             clazz.name,
//             clazz.content.map((id: string) => controlElements.get(id)!),
//         ),
//     );
//   }
//   // create list of interface unit elements using the list of found instances from the type Instances map
//   for (let inter of typeInstances.get("InterfaceUnit")) {
//     interfaces.set(
//         inter.id,
//         new ACMInterfaceUnit(
//             inter.id,
//             inter.name,
//             inter.content.map((id: string) => controlElements.get(id)!),
//         ),
//     );
//   }
//   // create list of code compilation unit elements using the list of found instances from the type Instances map
//   // add the content classes and interfaces to the code compilation unit by searching the previously created lists.
//   for (let codecompilationunit of typeInstances.get("CodeCompilationUnit")) {
//     const content = [];
//     for (let contentId of codecompilationunit.content) {
//       content.push(
//           json.codeItemRepository.repository[contentId].type == "ClassUnit"
//               ? classes.get(contentId)!
//               : interfaces.get(contentId)!,
//       );
//     }
//     codeCompilationUnits.set(
//         codecompilationunit.id,
//         new ACMCodeCompilationUnit(
//             codecompilationunit.id,
//             codecompilationunit.name + "." + codecompilationunit.extension,
//             content,
//         ),
//     );
//     // if the code compilation unit itself has a parent, add it to the list of leaf packages
//     if (codecompilationunit.parentId != null) {
//       leafPackageIds.add(codecompilationunit.parentId);
//     }
//   }
//   for (let leafId of leafPackageIds) {
//     let head = json.codeItemRepository.repository[leafId];
//     let suffix = head.name;
//     while (head.parentId != null) {
//       head = json.codeItemRepository.repository[head.parentId];
//       suffix = head.name + "." + suffix;
//     }
//     rootPackageIds.add(head.id);
//   }
//   function recursivelyParsePackage(pack: any): ACMPackage {
//     const childPackages = [];
//     const compilationUnits = [];
//     for (let childId of pack.content) {
//       const child = json.codeItemRepository.repository[childId];
//       if (child.type == "CodePackage") {
//         childPackages.push(recursivelyParsePackage(child));
//       } else if (child.type == "CodeCompilationUnit") {
//         compilationUnits.push(codeCompilationUnits.get(childId)!);
//       } else {
//         throw "unexpected type";
//       }
//     }
//     return new ACMPackage(pack.id, pack.name, childPackages, compilationUnits);
//   }
//   const rootPackages = [];
//   for (let rootId of rootPackageIds) {
//     const root = json.codeItemRepository.repository[rootId];
//     rootPackages.push(recursivelyParsePackage(root));
//   }
//   return new CodeModel(rootPackages);
// }
