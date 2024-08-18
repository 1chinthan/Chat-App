import React, { useEffect, useState } from 'react'
import './chatlist.css'
import AddUser from './addUser/AddUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';
export const ChatList = () => {
const [add,setAdd]=useState(false);
const [chats,setChats]=useState([]);
const [input,setInput]=useState("")

const handleAddButton=()=>{
  setAdd((prev)=>!prev);
}

const {currentUser} =useUserStore();
const {chatId,changeChat}=useChatStore();

useEffect(()=>{
  const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
  const items=res.data().chats;

  const promises=items.map(async(item)=>{
    const userDocRef=doc(db,'users',item.receiverId);
    const userDocSnap=await getDoc(userDocRef)

    const user=userDocSnap.data();

    return {...item,user};
  });

  const chatdata= await Promise.all(promises)

  setChats(chatdata.sort((a,b)=>b.updatedAt- a.updatedAt));
});

return ()=>{
  unSub();
}
},[currentUser.id]);


const handleSelect = async (chat) => {
  const userChats = chats.map(item => {
    const { user, ...rest } = item;
    return rest;
  });

  const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);

  if (chatIndex !== -1) {
    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, 'userchats', currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  } else {
    console.warn(`Chat with chatId ${chat.chatId} not found.`);
  }
}


const filterChats=chats.filter(c=>
  c.user.username.toLowerCase().includes(input.toLowerCase())
)

  return (
    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder='Search...' onChange={(e)=>setInput(e.target.value)} />
        </div>
        <img className='add' src={add?'./plus.png':'./minus.png'} alt="" onClick={handleAddButton}/>
      </div>

 {filterChats.map((chat)=>(
      <div className="item" key={chat.chatId} onClick={()=>handleSelect(chat)} style={{backgroundColor:chat?.isSeen?"transparent":"blue"}}>
        <img src={chat.user.blocked.includes(currentUser.id)? "./avatar.png" : chat.user.avatar || "./avatar.png"} alt="" />
        <div className="texts">
          <span>{chat.user.blocked.includes(currentUser.id)?"User":chat.user.username}</span>
          <p>{chat.lastMessage}</p>
        </div>
      </div>
 ))}

      
      {add && <AddUser/>}
    </div>
  )
}
