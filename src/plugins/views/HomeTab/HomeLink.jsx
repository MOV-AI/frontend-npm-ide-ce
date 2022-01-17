import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import _debounce from "lodash/debounce";
import IconButton from "@material-ui/core/IconButton";
import { Tooltip } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { getIconByScope } from "../../../utils/Utils";

import { homeTabLinkStyles } from "./styles";

function HomeLink(props) {
  const classes = homeTabLinkStyles();
  const { t } = useTranslation();
  const { doc, openRecentDocument, removeRecentDocument } = props;
  const { id, scope, name, isDeleted } = doc;
  const rowClasses = isDeleted ? [classes.row, classes.deleted] : classes.row;

  const [open, setOpen] = React.useState(false);

  const handleOpenDocument = useCallback(
    _ => {
      openRecentDocument(doc);
    },
    [doc, openRecentDocument]
  );

  const handleTooltipOpen = _debounce(target => {
    if (!target) return;
    const hasOverflow = target.offsetWidth < target.scrollWidth;
    if (hasOverflow && !open) {
      setImmediate(() => {
        setOpen(true);
      });
    }
  }, 500);

  const handleTooltipClose = _debounce(() => {
    setOpen(false);
  }, 100);

  const handleDeleteDocument = useCallback(
    e => {
      removeRecentDocument(id);
      e.stopPropagation();
    },
    [id, removeRecentDocument]
  );

  return (
    <div
      onMouseLeave={handleTooltipClose}
      onMouseOver={evt => handleTooltipOpen(evt.target)}
    >
      <Tooltip
        arrow
        title={`${t("Open")} ${props.doc.url}`}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        placement="right-start"
        open={open}
      >
        <div className={rowClasses} onClick={handleOpenDocument}>
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
                onMouseOver={handleTooltipClose}
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
    </div>
  );
}

export default HomeLink;
