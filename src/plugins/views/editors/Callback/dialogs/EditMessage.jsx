import React from "react";
import Loader from "../../_shared/Loader/Loader";

const EditMessage = props => {
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    console.log("debug LOAD MESSAGES");
  }, []);

  return loading ? <Loader /> : <h1>Edit message</h1>;
};

export default EditMessage;
