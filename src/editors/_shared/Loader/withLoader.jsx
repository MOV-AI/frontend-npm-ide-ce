import Loader from "./Loader";

const withLoader = Component => {
  return (props, ref) => {
    const renderLoader = () => <Loader />;

    const renderComponent = () => <Component {...props} ref={ref} />;

    return props.data?.id ? renderComponent() : renderLoader();
  };
};

export default withLoader;
