import AddUser from "./adduser/AddUser";
import "./ChatList.css";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    // Setting up a real-time listener for user chats
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const data = res.data();
      if (!data || !data.chats) return;

      const items = data.chats;

      // Fetch user data for each chat
      const promises = items.map(async (item) => {
        try {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        } catch (err) {
          console.error("Error fetching user data:", err);
          return item;
        }
      });

      // Wait for all user data to be resolved
      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub(); // Clean up the listener on unmount
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    // Clone the chats state to avoid direct mutation
    const updatedChats = chats.map((item) => {
      if (item.chatId === chat.chatId) {
        return { ...item, isSeen: true }; // Mark the selected chat as seen
      }
      return item;
    });

    try {
      // Update the user's chat document in Firestore
      const userChatRef = doc(db, "userchats", currentUser.id);
      await updateDoc(userChatRef, {
        chats: updatedChats.map(({ user, ...rest }) => rest), // Strip user data before saving
      });

      // Change the active chat in the chat store
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.error("Error updating chat status:", err);
    }
  };

  // Filter chats based on input
  const filteredChats = chats.filter((c) =>
    c.user?.username?.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <img src="./search.png" alt="Search Icon" />
          <input
            type="text"
            placeholder="search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Toggle Add Mode"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user?.blocked?.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user?.avatar || "./default-avatar.png" // Fallback avatar if missing
            }
            alt="User Avatar"
          />
          <div className="texts">
            <span>
              {chat.user?.blocked?.includes(currentUser.id)
                ? "Blocked User"
                : chat.user?.username || "Unknown User"}
            </span>
            <p>
              {chat.user?.blocked?.includes(currentUser.id)
                ? "Blocked"
                : chat.lastMessage || "No message"}
            </p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
