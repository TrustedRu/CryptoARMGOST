import { Map, OrderedMap, OrderedSet, Record } from "immutable";
import {
  FAIL, MULTI_DIRECT_OPERATION, SELECT_ALL_DOCUMENTS_IN_OPERAIONS_RESULT,
  SELECT_DOCUMENT_IN_OPERAIONS_RESULT, START, SUCCESS,
  UNSELECT_ALL_DOCUMENTS_IN_OPERAIONS_RESULT, UNSELECT_DOCUMENT_IN_OPERAIONS_RESULT,
  VERIFY_LICENSE,
} from "../constants";
import { arrayToMap } from "../utils";

export const FileModel = Record({
  active: false,
  extension: null,
  filename: null,
  filesize: null,
  fullpath: null,
  id: null,
  mtime: null,
  originalId: null,
});

const DefaultReducerState = Record({
  entities: OrderedMap({}),
  files: OrderedMap({}),
  operations: OrderedMap({}),
  performed: false,
  performing: false,
  status: false,
  selected: new OrderedSet([]),
});

export default (lastOperationResults = new DefaultReducerState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case MULTI_DIRECT_OPERATION + START:
      return lastOperationResults
        .set("performing", true)
        .set("performed", false)
        .set("operations", OrderedMap(payload.operations));

    case MULTI_DIRECT_OPERATION + SUCCESS:
      const oMap = OrderedMap(payload.directResult.files);

      return lastOperationResults
        .set("performing", false)
        .set("performed", true)
        .set("status", payload.status)
        .set("files", oMap)
        .update("entities", (entities) => arrayToMap(getFilesArray(oMap), FileModel).merge(entities));

    case MULTI_DIRECT_OPERATION + FAIL:
      return lastOperationResults
        .set("performing", false)
        .set("performed", false)
        .set("status", false);

    case SELECT_DOCUMENT_IN_OPERAIONS_RESULT:
      return lastOperationResults.update("selected", (selected) => selected.has(payload.uid)
        ? selected.remove(payload.uid)
        : selected.add(payload.uid),
      );

    case UNSELECT_DOCUMENT_IN_OPERAIONS_RESULT:
      return lastOperationResults.update("selected", (selected) => selected.remove(payload.uid));

    case UNSELECT_ALL_DOCUMENTS_IN_OPERAIONS_RESULT:
      const allDocumentsId: number[] = [];

      lastOperationResults.files.map((item: any) => allDocumentsId.push(item.id));

      return lastOperationResults.set("selected", new OrderedSet(allDocumentsId));

    case SELECT_ALL_DOCUMENTS_IN_OPERAIONS_RESULT:
      return lastOperationResults.set("selected", new OrderedSet([]));
  }

  return lastOperationResults;
};

const getFilesArray = (oMap: any) => {
  const files: any[] = [];
  oMap.valueSeq().forEach((v: any) => {
    if (v.original) {
      if (!files.find((file) => file.id === v.original.id)) {
        files.push(v.original);
      }
    }

    if (v.signing_operation && v.signing_operation.result && v.signing_operation.out) {
      if (!files.find((file) => file.id === v.signing_operation.out.id)) {
        files.push(v.signing_operation.out);
      }
    }

    if (v.archivation_operation && v.archivation_operation.result && v.archivation_operation.out) {
      if (!files.find((file) => file.id === v.archivation_operation.out.id)) {
        files.push(v.archivation_operation.out);
      }
    }

    if (v.encryption_operation && v.encryption_operation.result && v.encryption_operation.out) {
      if (!files.find((file) => file.id === v.encryption_operation.out.id)) {
        files.push(v.encryption_operation.out);
      }
    }
  });

  return files;
};