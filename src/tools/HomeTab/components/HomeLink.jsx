import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import IconButton from "@material-ui/core/IconButton";
import { Tooltip } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { getIconByScope } from "../../../utils/Utils";

import { homeTabLinkStyles } from "../styles";

function HomeLink(props) {
  const { doc, openRecentDocument, removeRecentDocument } = props;
  const { id, scope, name, isDeleted } = doc;
  const { t } = useTranslation();
  const classes = homeTabLinkStyles();
  const rowClasses = isDeleted ? [classes.row, classes.deleted] : classes.row;

  const handleOpenDocument = useCallback(
    () => openRecentDocument(doc),
    [doc, openRecentDocument]
  );

  const handleDeleteDocument = useCallback(
    e => {
      removeRecentDocument(id);
      e.stopPropagation();
    },
    [id, removeRecentDocument]
  );

  return (
    <Tooltip
      arrow
      title={t("OpenDocUrl", { docUrl: props.doc.url })}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      placement="right-start"
    >
      <div
        data-testid="input_open-document"
        className={rowClasses}
        onClick={handleOpenDocument}
      >
        <Tooltip title={id}>
          <div className={classes.iconLink}>
            {getIconByScope(scope)}
            <span href="#" underline="none" className={classes.link}>
              {name}
            </span>
          </div>
        </Tooltip>
        <div>
          <Tooltip title={t("Remove")}>
            <IconButton
              onClick={handleDeleteDocument}
              size="small"
              className={classes.deleteDocument}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Tooltip>
  );
}

export default HomeLink;
