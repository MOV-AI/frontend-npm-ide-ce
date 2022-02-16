import React, { useCallback } from "react";
import CallMadeIcon from "@material-ui/icons/CallMade";
import Button from "@material-ui/core/Button";
import { stopPropagation } from "../../../../utils/Utils";

import { homeTabCardStyles } from "../styles";

function HomeTabCard(props) {
  const classes = homeTabCardStyles();
  const { example, openDocument } = props;

  const handleOnClick = useCallback(
    () => openDocument({ id: example.url, scope: example.scope }),
    [example, openDocument]
  );

  return (
    <div className={classes.card} onClick={handleOnClick}>
      <div
        className={example.imageLink ? classes.haveImage : classes.fullWidth}
      >
        <div className={classes.cardHeader}>
          <div className={classes.title}>{example.title}</div>
        </div>
        <div className={classes.cardBody}>
          <p className={classes.paragraph}>{example.description}</p>
        </div>
        {example.externalLink && (
          <div className={classes.cardFooter}>
            <Button
              className={classes.externalLinkButton}
              variant="outlined"
              endIcon={<CallMadeIcon />}
            >
              <a
                href={example.externalLink}
                rel="noopener noreferrer"
                target="_blank"
                onClick={stopPropagation}
                className={classes.externalLinkLabel}
              >
                {example.externalLinkLabel || example.externalLink}
              </a>
            </Button>
          </div>
        )}
      </div>
      {example.imageLink && (
        <div className={classes.exampleImage}>
          <img
            src={example.imageLink}
            alt={example.imageDescription || example.title}
          />
        </div>
      )}
    </div>
  );
}

export default HomeTabCard;
