import React, { useCallback } from "react";
import CodeIcon from "@material-ui/icons/Code";
import CallMadeIcon from "@material-ui/icons/CallMade";
import Button from "@material-ui/core/Button";
import movaiIcon from "../editors/_shared/Loader/movai_red.svg";
import { stopPropagation } from "../../../utils/Utils";

import { homeTabCardStyles } from "./styles";

function HomeTabCard(props) {
  const classes = homeTabCardStyles();
  const { sample, openDocument } = props;

  const handleOnClick = useCallback(
    _ => {
      openDocument({ id: sample.url, scope: sample.scope });
    },
    [sample, openDocument]
  );

  return (
    <>
      <div className={classes.card} onClick={handleOnClick}>
        <div className={classes.avatar}>
          {!props.certified ? (
            <div>
              <img
                src={movaiIcon}
                alt="MOV.AI Logo"
                className={classes.movaiIcon}
              />
            </div>
          ) : (
            <CodeIcon className={classes.cardIcon} />
          )}
        </div>
        <div>
          <div className={classes.cardHeader}>
            <div className={classes.title}>{sample.title}</div>
          </div>
          <div className={classes.cardBody}>
            <p className={classes.paragraph}>{sample.description}</p>
          </div>
          {sample.externalLink && (
            <div className={classes.cardFooter}>
              <Button
                className={classes.externalLinkButton}
                variant="outlined"
                endIcon={<CallMadeIcon />}
              >
                <a
                  href={sample.externalLink}
                  rel="noopener noreferrer"
                  target="_blank"
                  onClick={stopPropagation}
                  className={classes.externalLinkLabel}
                >
                  {sample.externalLinkLabel || sample.externalLink}
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default HomeTabCard;
