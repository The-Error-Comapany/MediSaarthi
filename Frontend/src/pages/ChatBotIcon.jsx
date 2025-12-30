import { useNavigate } from "react-router-dom";
import "./chatbot.css"

const ChatBotIcon = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/app/chatbot");
  };

  return (
    <div className="chatbot-fab" onClick={handleClick} title="Open Saarthi">
  💬
</div>
  );
};

export default ChatBotIcon;
