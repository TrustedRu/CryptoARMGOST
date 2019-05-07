import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { activeFile, deleteFile, filePackageDelete, filePackageSelect, selectFile } from "../../AC";
import {
  DECRYPT, DEFAULT_DOCUMENTS_PATH, ENCRYPT,
  LOCATION_ENCRYPT, LOCATION_SIGN, SIGN,
  UNSIGN, VERIFY,
} from "../../constants";
import { activeFilesSelector } from "../../selectors";
import { bytesToSize, mapToArr } from "../../utils";
import FilterDocuments from "../Documents/FilterDocuments";
import Modal from "../Modal";
import FileSelector from "./FileSelector";

interface ISignatureAndEncryptWindowProps {
  isDefaultFilters: boolean;
}

interface ISignatureAndEncryptWindowState {
  searchValue: string;
  showModalDeleteDocuments: boolean;
  showModalFilterDocments: boolean;
}

class SignatureAndEncryptWindow extends React.Component<ISignatureAndEncryptWindowProps, ISignatureAndEncryptWindowState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ISignatureAndEncryptWindowProps) {
    super(props);

    this.state = {
      searchValue: "",
      showModalDeleteDocuments: false,
      showModalFilterDocments: false,
    };
  }

  render() {
    const { localize, locale } = this.context;
    const { isDefaultFilters } = this.props;
    const classDefaultFilters = isDefaultFilters ? "filter_off" : "filter_on";

    return (
      <div className="content-noflex">
        <div className="row">
          <div className="row halfbottom" />
          <div className="col s11">
            <div className="input-field input-field-csr col s12 border_element find_box">
              <i className="material-icons prefix">search</i>
              <input
                id="search"
                type="search"
                placeholder={localize("EventsTable.search_in_doclist", locale)}
                value={this.state.searchValue}
                onChange={this.handleSearchValueChange} />
              <i className="material-icons close" onClick={() => this.setState({ searchValue: "" })} style={this.state.searchValue ? { color: "#444" } : {}}>close</i>
            </div>
          </div>
          <div className="col s1">
            <a className={"btn-small waves-effect waves-light"} onClick={this.handleShowModalFilterDocuments}>
              <i className={"material-icons " + classDefaultFilters}>filter_list</i>
            </a>
          </div>
        </div>
        <div className="row">
          <div className="col s8" style={{ width: "calc(100% - 300px)" }}>
            <FileSelector operation="SIGN" />
          </div>
          <div className="col s4" style={{ float: "right", minHeight: "calc(100vh - 114px)", width: "300px", backgroundColor: "#e1e1e1" }}>
            <div className="row halfbottom" />
            <div>
              <div className="col s12">
                <div className="desktoplic_text_item bottomitem">Выбранные элементы:</div>
              </div>
              <div className="col s11">
                <div className="col s12">
                  <div className="desktoplic_text_item topitem">{`Количество: ${this.props.activeFiles.length}`}</div>
                </div>
                <div className="col s12">
                  <div className="desktoplic_text_item topitem">{`Общий объем: ${this.getSelectedFilesSize()}`}</div>
                </div>

              </div>
              <div className="col s1">
                <div className="right">
                  <a className={"nav-small-btn waves-effect waves-light "} data-activates="dropdown-btn-set-add-files">
                    <i className="nav-small-icon material-icons">more_vert</i>
                  </a>
                  <ul id="dropdown-btn-set-add-files" className="dropdown-content">
                    <li><a onClick={this.selectedAll.bind(this)}>{localize("Settings.selected_all", locale)}</a></li>
                    <li><a onClick={this.removeSelectedAll.bind(this)}>{localize("Settings.remove_selected", locale)}</a></li>
                    <li><a onClick={this.removeAllFiles.bind(this)}>{localize("Settings.remove_all_files", locale)}</a></li>
                  </ul>
                </div>
              </div>
              <div className="row" />
              <div className="col s12">
                <div className="desktoplic_text_item bottomitem">Доступные операции:</div>
              </div>
              <div className="row" />
              <div className="col s4">
                <a className={`waves-effect waves-light  ${this.checkEnableOperationButton(SIGN) ? "" : "disabled_docs"}`}
                  data-position="bottom"
                >
                  <div className="row docmenu"><i className="material-icons docmenu_sign"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_sign", locale)}</div>
                </a>
              </div>
              <div className="col s4">
                <a className={`waves-effect waves-light  ${this.checkEnableOperationButton(VERIFY) ? "" : "disabled_docs"}`}
                  data-position="bottom"
                  data-tooltip={localize("Sign.sign_and_verify", locale)}
                >
                  <div className="row docmenu"><i className="material-icons docmenu_verifysign"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_verifysign", locale)}</div>
                </a>
              </div>
              <div className="col s4">
                <a className={`waves-effect waves-light ${this.checkEnableOperationButton(UNSIGN) ? "" : "disabled_docs"}`} data-position="bottom"
                >
                  <div className="row docmenu"><i className="material-icons docmenu_removesign"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_removesign", locale)}</div>
                </a>
              </div>
              <div className="col s4">
                <a className={`waves-effect waves-light ${this.checkEnableOperationButton(ENCRYPT) ? "" : "disabled_docs"}`}
                  data-position="bottom" >
                  <div className="row docmenu"><i className="material-icons docmenu_encrypt"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_enctypt", locale)}</div>
                </a>
              </div>
              <div className="col s4">
                <a className={`waves-effect waves-light ${this.checkEnableOperationButton(DECRYPT) ? "" : "disabled_docs"}`} data-position="bottom"
                >
                  <div className="row docmenu"><i className="material-icons docmenu_decrypt"></i></div>
                  <div className="row docmenu">{localize("Documents.docmenu_dectypt", locale)}</div>
                </a>
              </div>
            </div>
          </div>
        </div>
        {this.showModalFilterDocuments()}
      </div>
    );
  }

  selectedAll() {
    // tslint:disable-next-line:no-shadowed-variable
    const { files, activeFile } = this.props;

    for (const file of files) {
      activeFile(file.id);
    }
  }

  removeSelectedAll() {
    // tslint:disable-next-line:no-shadowed-variable
    const { files, activeFile } = this.props;

    for (const file of files) {
      activeFile(file.id, false);
    }
  }

  removeAllFiles() {
    // tslint:disable-next-line:no-shadowed-variable
    const { filePackageDelete, files } = this.props;

    const filePackage: number[] = [];

    for (const file of files) {
      filePackage.push(file.id);
    }

    filePackageDelete(filePackage);
  }

  checkEnableOperationButton = (operation: string) => {
    const { activeFiles } = this.props;

    if (!activeFiles.length) {
      return false;
    }

    switch (operation) {
      case SIGN:
        for (const document of activeFiles) {
          if (document.extname === ".enc") {
            return false;
          }
        }

        return true;

      case VERIFY:
      case UNSIGN:
        for (const document of activeFiles) {
          if (document.extname !== ".sig") {
            return false;
          }
        }

        return true;

      case ENCRYPT:
        for (const document of activeFiles) {
          if (document.extname === ".enc") {
            return false;
          }
        }

        return true;

      case DECRYPT:
        for (const document of activeFiles) {
          if (document.extname !== ".enc") {
            return false;
          }
        }

        return true;

      default:
        return false;
    }
  }

  getSelectedFilesSize = () => {
    const { activeFiles } = this.props;

    let sizeInBytes = 0;

    for (const document of activeFiles) {
      sizeInBytes += document.filesize;
    }

    return bytesToSize(sizeInBytes);
  }

  showModalFilterDocuments = () => {
    const { localize, locale } = this.context;
    const { showModalFilterDocments } = this.state;

    if (!showModalFilterDocments) {
      return;
    }

    return (
      <Modal
        isOpen={showModalFilterDocments}
        header={localize("Filters.filters_settings", locale)}
        onClose={this.handleCloseModalFilterDocuments}>

        <FilterDocuments onCancel={this.handleCloseModalFilterDocuments} />
      </Modal>
    );
  }

  handleSearchValueChange = (ev: any) => {
    this.setState({ searchValue: ev.target.value });
  }

  handleShowModalFilterDocuments = () => {
    this.setState({ showModalFilterDocments: true });
  }

  handleCloseModalFilterDocuments = () => {
    this.setState({ showModalFilterDocments: false });
  }
}

export default connect((state) => {
  return {
    activeFiles: activeFilesSelector(state, { active: true }),
    files: mapToArr(state.files.entities),
    isDefaultFilters: state.filters.documents.isDefaultFilters,
  };
}, { activeFile, deleteFile, filePackageSelect, filePackageDelete, selectFile })(SignatureAndEncryptWindow);