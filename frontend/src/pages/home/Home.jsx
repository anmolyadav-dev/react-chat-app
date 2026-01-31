import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";

const Home = () => {
  return (
    <div className="flex h-[90vh] max-h-[900px] w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
      <Sidebar />
      <MessageContainer />
    </div>
  );
};
export default Home;
