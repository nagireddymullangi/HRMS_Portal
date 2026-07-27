// src/components/common/EmptyState.jsx
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="p-4 bg-gray-100 rounded-full mb-4">
      <Icon className="h-10 w-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-gray-400 text-sm mt-1 text-center max-w-sm">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;