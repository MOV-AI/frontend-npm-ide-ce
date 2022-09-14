import { getIconByScope } from "../../../../utils/Utils";
import { PLUGINS } from "../../../../utils/Constants";

export const buildNewFileSubmenu = async call => {
  const menu = [];
  await call(
    PLUGINS.DOC_MANAGER.NAME,
    PLUGINS.DOC_MANAGER.CALL.GET_DOC_TYPES
  ).then(docTypes => {
    docTypes.forEach(docType => {
      menu.push({
        id: docType.name,
        title: docType.scope,
        icon: getIconByScope(docType.scope),
        callback: () => {
          call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.CREATE, {
            scope: docType.scope
          }).then(document => {
            call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
              id: document.getUrl(),
              name: document.getName(),
              scope: docType.scope,
              isNew: true
            });
          });
        }
      });
    });
  });
  return menu;
};
