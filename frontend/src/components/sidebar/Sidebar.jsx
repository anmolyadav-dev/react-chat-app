import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton.jsx";
import SearchInput from "./SearchInput";

const Sidebar = () => {
  return (
    <div className="w-80 bg-gradient-to-b from-purple-600/20 to-blue-600/20 backdrop-blur-md border-r border-white/10 p-6 flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Chats</h2>
        <p className="text-gray-300 text-sm">Connect with friends</p>
      </div>
      <SearchInput />
      <div className="h-px bg-white/20 my-4"></div>
      <Conversations />
      <LogoutButton />
    </div>
  );
};
export default Sidebar;
