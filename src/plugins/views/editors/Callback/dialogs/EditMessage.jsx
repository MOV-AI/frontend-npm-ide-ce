import React from "react";
import Loader from "../../_shared/Loader/Loader";
import MaterialTree from "../../_shared/MaterialTree/MaterialTree";
import { Grid, Typography, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { searchMessages } from "./utils";
import Search from "../../_shared/Search/Search";

const useStyles = makeStyles(theme => ({
  treeRoot: {
    overflowY: "auto",
    overflowX: "hidden",
    paddingLeft: 5,
    justifyContent: "center",
    width: "100%"
  }
}));

const EditMessage = props => {
  // Props
  const { call, scope, selectedMessage, onSelectionChange } = props;
  // State hooks
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState();
  const [filteredMsg, setFilteredMsg] = React.useState();
  // Style hook
  const classes = useStyles();

  //========================================================================================
  /*                                                                                      *
   *                                  Private Methods                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Format message list to tree structure
   */
  const _updateMessages = React.useCallback(list => {
    let messagesStruct = [];
    Object.keys(list)
      .sort()
      .forEach((pack, idx1) => {
        messagesStruct.push({
          id: (idx1 + 1) * 100,
          text: pack,
          children: list[pack].sort().map((message, idx2) => {
            return {
              id: (idx1 + 1) * 100 + idx2 + 1,
              text: message,
              isLeaf: true
            };
          })
        });
      });
    // TODO : If create a CB from NodeEditor append the corresponding Message
    setMessages(messagesStruct);
    setFilteredMsg(messagesStruct);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                   Handle Events                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * On change selected Message
   * @param {*} selectedMessage
   */
  const onSelectMessage = _selectedMessage => {
    const messagePath = _selectedMessage.split("/");
    if (messagePath.length <= 1) return;
    // Return selectedMessage
    onSelectionChange(_selectedMessage);
  };

  /**
   * On search tree
   */
  const onSearch = React.useCallback(
    value => {
      const result = searchMessages(value, messages);
      setFilteredMsg(result);
    },
    [messages]
  );

  //========================================================================================
  /*                                                                                      *
   *                                  React Lifecycle                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Component mounted
   */
  React.useEffect(() => {
    setLoading(true);
    call("docManager", "getStore", scope).then(store => {
      store.helper.getAllMessages().then(msgs => {
        if (msgs) _updateMessages(msgs);
        setLoading(false);
      });
    });
  }, [call, scope, _updateMessages]);

  //========================================================================================
  /*                                                                                      *
   *                                       Render                                         *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Material Tree to select python lib
   * @returns {ReactElement}
   */
  const renderTree = () => {
    // Return loader if data is not ready
    if (loading) return <Loader />;
    // Return when data is ready or error message if not
    return messages ? (
      <MaterialTree
        data={filteredMsg}
        onNodeSelect={onSelectMessage}
      ></MaterialTree>
    ) : (
      <>
        <h2>Something went wrong :(</h2>
        <h3>Failed to load messages</h3>
      </>
    );
  };

  return (
    <Typography component="div" style={{ overflow: "hidden" }}>
      <Grid container direction="row">
        <Grid item xs={12} style={{ textAlign: "center" }}>
          <Search onSearch={onSearch} />
        </Grid>
        <Grid item xs={12}>
          <Typography component="div" className={classes.treeRoot}>
            {renderTree()}
          </Typography>
        </Grid>
        <Grid item xs={12} style={{ textAlign: "center" }}>
          <TextField
            fullWidth
            label={"Message"}
            value={selectedMessage}
            margin="normal"
            disabled
          />
        </Grid>
      </Grid>
    </Typography>
  );
};

export default EditMessage;
