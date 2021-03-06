import { LOCATION_CERTIFICATES, LOCATION_MAIN, MY, SHOW_DIAGNOSTIC_MODAL_NO_CERT } from "../constants";
import { IUrlCommandApiV4Type } from "../parse-app-url";
import { openWindow, paramsRequest, postRequest, removeWarningMessage } from "./urlCmdUtils";
import { showDiagnosticModalNoCert } from "./trustedServicesActions";

export interface IStartViewParameters {
  uiView: string;
  description: string;
}

function paramsRequestDiag(id: string) {
  return JSON.stringify(paramsRequest("startView.parameters", id, false));
}

export function handleUrlCommandStartView(command: IUrlCommandApiV4Type) {
  postRequest(command.url, paramsRequestDiag(command.id)).then(
    (data: any) => {
      const uiView = data.result.uiView;
      if (!uiView || !uiView.length) {
        // tslint:disable-next-line: no-console
        console.log("Error! Empty operation list.");
        return;
      }

      switch (uiView) {
        case "CERTIFICATES_MY":
          openWindow(LOCATION_CERTIFICATES, MY);
          break;

        case "DIAGNOSTIC_PROBLEM_PERSONAL_CERTIFICATES":
          showDiagnosticModalNoCert();
          break;

        default:
          // tslint:disable-next-line: no-console
          console.error("Error! View " + uiView + " is not supported");
          break;
      }
    },
    (error) => {
      // tslint:disable-next-line: no-console
      console.log(
        "Error recieving parameters of start view command with id " +
        command.id +
        ". Error description: " +
        error,
      );
    },
  );
}
