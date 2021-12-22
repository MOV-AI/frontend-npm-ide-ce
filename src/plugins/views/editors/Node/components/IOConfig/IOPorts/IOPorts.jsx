import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Divider from "@material-ui/core/Divider";
import Callback from "./components/Callback";
import Parameters from "./components/Parameters";

const useStyles = makeStyles(theme => {
  return {
    root: {
      padding: "0 12px",
      width: "calc(100% - 24px)"
    },
    heading: {
      fontSize: "0.875rem"
    },
    ioPortTitle: {
      boxShadow: "none",
      padding: "0px 50px 0px 50px"
    },
    row: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center"
    },
    paddingLR: {
      padding: "0px 12px",
      lineHeight: "100%"
    },
    details: {
      display: "flex",
      flexDirection: "column",
      padding: "0px 100px 0px 100px"
    }
  };
});

const IOPorts = props => {
  // Props
  const { editable, handleOpenCallback, handleOpenSelectScopeModal } = props;
  // Hooks
  const classes = useStyles();

  /**
   *
   * @param {*} direction
   * @returns
   */
  const getPortIcon = direction => {
    const iconClass = {
      portIn: "icon-in",
      portOut: "icon-out"
    };

    return (
      <i className={iconClass[direction]} style={{ fontSize: "1.5rem" }}></i>
    );
  };

  /**
   * Render Input/Output Port
   * @param {string} direction : One of options: "portIn" or "portOut"
   * @returns {ReactElement} Input/Output Port
   */
  const renderIoPort = direction => {
    return (
      <div>
        {props.rowData[direction] !== undefined &&
          Object.keys(props.rowData[direction]).map((ioPort, ioPortIndex) => {
            const callback = props.rowData[direction][ioPort].callback;
            const message = props.rowData[direction][ioPort].message;
            const parameters = props.rowData[direction][ioPort].parameters;
            const disableAccordion = !parameters && !callback;
            return (
              <Accordion
                defaultExpanded
                className={classes.ioPortTitle}
                key={ioPortIndex + direction}
                expanded={disableAccordion ? true : undefined}
              >
                <AccordionSummary
                  expandIcon={disableAccordion ? undefined : <ExpandMoreIcon />}
                >
                  <div className={classes.heading}>
                    {/* Icon */}
                    <div className={classes.row}>
                      {getPortIcon(direction)}
                      {/* Ioport Name */}
                      <div className={classes.paddingLR}>
                        <b>{ioPort}</b>
                      </div>
                      {/* Effective Message */}
                      <div className={classes.paddingLR}>{`(${message})`}</div>
                    </div>
                  </div>
                </AccordionSummary>
                <Divider />
                <AccordionDetails className={classes.details}>
                  {/* ------------------------- Callback ------------------------- */}
                  {callback !== null && (
                    <Callback
                      id={callback}
                      ioPort={ioPort}
                      editable={editable}
                      message={message}
                      direction={direction}
                      portName={props.rowData.name}
                      handleOpenCallback={handleOpenCallback}
                      handleOpenSelectScopeModal={handleOpenSelectScopeModal}
                    />
                  )}
                  {/* ------------------------- Parameters ------------------------- */}
                  {Object.keys(parameters).map((param, paramIndex) => {
                    return (
                      <Parameters
                        {...props}
                        key={paramIndex + direction}
                        editable={editable}
                        param={param}
                        paramValue={parameters[param]}
                        direction={direction}
                        ioPort={ioPort}
                      />
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            );
          })}
      </div>
    );
  };

  return (
    <div className={`${classes.root} ${props.classNames}`}>
      {renderIoPort("portIn")}
      {renderIoPort("portOut")}
    </div>
  );
};

export default IOPorts;
