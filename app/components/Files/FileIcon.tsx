import React from "react";
import { connect } from "react-redux";
import { mapToArr } from "../../utils";

interface IFileRedux {
  active: boolean;
  extension: string;
  filename: string;
  fullpath: string;
  id: number;
  lastModifiedDate: Date;
  socket: string;
}

interface IFileIconProps {
  file: IFileRedux;
}

class FileIcon extends React.Component<IFileIconProps, {}> {
  render() {
    const { file } = this.props;

    return (
      <div className="row nobottom">
        <div className="valign-wrapper">
          <div className="col s12">
            <i className={this.getFileIconByExtname(file.extension, file.id) + " icon_file_type"} />
          </div>
        </div>
      </div>
    );
  }

  getFileIconByExtname = (extension: string, id: any) => {
    if (extension === "sig") {
      let res = true;

      const signs = this.props.signatures.getIn(["entities", id]);

      if (signs) {
        const arrSigns = mapToArr(signs);

        for (const element of arrSigns) {
          if (!element.status_verify) {
            res = false;
            break;
          }
        }

        return res ? "type_icon sig ok" : "type_icon sig error";
      } else {
        return "type_icon sig any";
      }
    } else {
      return `type_icon ${extension}`;
    }
  }
}

export default connect((state) => {
  return {
    signatures: state.signatures,
  };
})(FileIcon);
