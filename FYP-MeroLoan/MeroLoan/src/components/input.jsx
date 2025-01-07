const Input = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative my-4">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-gray-500" />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2 text-sm bg-gray-100 bg-opacity-50 rounded-lg border focus:ring-gray-200 text-black placeholder-gray-400 transition duration-200"
      />
    </div>
  );
};
export default Input;
