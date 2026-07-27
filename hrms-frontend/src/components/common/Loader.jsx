// src/components/common/Loader.jsx
const Loader = ({ fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="h-10 w-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-10 w-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
};

export default Loader;