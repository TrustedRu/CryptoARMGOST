import { is } from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { List } from "react-virtualized";
import { activeFile, deleteFile} from "../AC";
import { loadingRemoteFilesSelector } from "../selectors";
import { mapToArr } from "../utils";
import FileListItem from "./FileListItem";
import RemoteFileListItem from "./RemoteFileListItem";

interface IFileRedux {
  active: boolean;
  extension: string;
  filename: string;
  fullpath: string;
  id: number;
  lastModifiedDate: Date;
}

export interface IRemoteFile {
  extra: any;
  id: number;
  loaded: boolean;
  loading: boolean;
  name: string;
  socketId: string;
  totalSize: number;
  url: string;
}

interface IFilelistProps {
  activeFile: (id: number, active?: boolean) => void;
  deleteFile: (fileId: number) => void;
  loadingFiles: IRemoteFile[];
  files: IFileRedux[];
  operation: string;
  selectedFilesPackage: boolean;
  selectingFilesPackage: boolean;
  style: any;
}

class FileList extends React.Component<IFilelistProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    this.noGridOverflow();
  }

  componentWillUpdate() {
    this.noGridOverflow();
  }

  shouldComponentUpdate(nextProps: IFilelistProps) {
    const { files, loadingFiles, selectingFilesPackage } = this.props;

    if (selectingFilesPackage !== nextProps.selectingFilesPackage) {
      return true;
    }

    if (loadingFiles.length !== nextProps.loadingFiles.length) {
      return true;
    }

    if (selectingFilesPackage || nextProps.selectingFilesPackage) {
      return false;
    }

    if (!selectingFilesPackage && !nextProps.selectingFilesPackage && nextProps.files.length !== this.props.files.length) {
      return true;
    }

    if (files.length === nextProps.files.length) {
      for (let i = 0; i <= files.length; i++) {
        if (is(files[i], nextProps.files[i])) {
          continue;
        } else {
          return true;
        }
      }
    }

    return false;
  }

  render() {
    const { files, loadingFiles } = this.props;

    return (
      <List
        rowCount={files.length + loadingFiles.length}
        height={427}
        width={377}
        overscanRowCount={5}
        rowHeight={64}
        rowRenderer={this.rowRenderer}
        files={loadingFiles.concat(files)}
        style={{ outline: "none" }}
      />
    );
  }

  rowRenderer = ({ index, key, style }) => {
    const { files, operation, loadingFiles } = this.props;

    if (!files.length && !loadingFiles.length) {
      return null;
    }

    if (index > files.length - 1 && loadingFiles.length) {
      const realIndex = index - files.length;

      return (
        <RemoteFileListItem
          removeFiles={() => this.removeFile(loadingFiles[realIndex].id)}
          onClickBtn={() => this.toggleActive(loadingFiles[realIndex])}
          file={loadingFiles[realIndex]}
          operation={operation}
          key={key}
          index={realIndex.toString()}
          style={style}
        />
      );
    } else if (index < files.length) {
      return (
        <FileListItem
          removeFiles={() => this.removeFile(files[index].id)}
          onClickBtn={() => this.toggleActive(files[index])}
          file={files[index]}
          operation={operation}
          key={key}
          index={index}
          style={style}
        />
      );
    }
  }

  noGridOverflow() {
    const grid = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0];

    if (grid) {
      grid.style.overflow = "";
    }
  }

  removeFile = (id: number) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile } = this.props;

    deleteFile(id);
  }

  toggleActive(file: any) {
    // tslint:disable-next-line:no-shadowed-variable
    const { activeFile } = this.props;

    activeFile(file.id, !file.active);
  }
}

export default connect((state) => {
  return {
    files: mapToArr(state.files.entities),
    loadingFiles: loadingRemoteFilesSelector(state, { loading: true }),
    selectedFilesPackage: state.files.selectedFilesPackage,
    selectingFilesPackage: state.files.selectingFilesPackage,
  };
}, { activeFile, deleteFile })(FileList);
