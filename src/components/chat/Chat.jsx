import React, { useEffect, useRef, useState } from 'react'
import './chat.css'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
const Chat = () => {
  const[emoji,setEmoji]=useState(false);
  const[text,setText]=useState("");
  const[chat,setChat]=useState();
  const[img,setImg]=useState({
    file:null,
    url:""
  });
  const {chatId,user,isCurrentUserBlocked,isReceiverBlocked}=useChatStore();
  const {currentUser}=useUserStore();
  const endRef=useRef(null);

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth"})
  },[])


  useEffect(()=>{
    const unSub=onSnapshot(doc(db,"chats",chatId),(res)=>{
        setChat(res.data());
    })
    return ()=>{
      unSub();
    }
  },[chatId])

  const handlePopEmoji=()=>{
    setEmoji((prev)=>!prev)
  }
  const handleInputEmoji=(e)=>{
    setText((prev)=>prev + e.emoji);
    setEmoji(false)
  }

  const handleImg=(e)=>{
    if(e.target.files[0])
    setImg({
        file:e.target.files[0],
        url:URL.createObjectURL(e.target.files[0])
    })
}

const handleSend = async () => {
  if (text === '') return;

  let imgUrl = null;
  try {
    if (img.file) {
      imgUrl = await upload(img.file);
    }

    const newMessage = {
      senderId: currentUser.id,
      text,
      createdAt: new Date(),
    };

    if (imgUrl) {
      newMessage.img = imgUrl;
    }

    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion(newMessage),
    });

    const userIDs = [currentUser.id, user.id];

    userIDs.forEach(async (id) => {
      const userChatRefs = doc(db, "userchats", id);
      const userChatSnapshot = await getDoc(userChatRefs);

      if (userChatSnapshot.exists()) {
        const userChatData = userChatSnapshot.data();

        const chatIndex = userChatData.chats.findIndex(c => c.chatId === chatId);

        if (chatIndex !== -1) {
          userChatData.chats[chatIndex].lastMessage = text;
          userChatData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatRefs, {
            chats: userChatData.chats,
          });
        }
      }
    });

  } catch (error) {
    console.log(error);
  }

  setImg({
    file: null,
    url: ""
  });

  setText("");
};


console.log(text)
return (
  <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user.username}</span>
            <p>Lorem dwefuywdi wijeiukwj</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>



      <div className="center">
        
        {chat?.messages.map((message)=>(<div className={message.senderId===currentUser.id?"message own":"message"} key={message?.createdAt}>
          <div className="texts">
            { message.img && <img src={message.img} alt="" />}
            <p>{message.text}</p>
           {/*  <span>1 min ago..</span> */}
          </div>
        </div>))}
        {img.url && <div className="message own">
          <div className="texts">
            <img src={img.url} alt="" />
          </div>
        </div>}
        <div ref={endRef}></div>
      </div>
      

      
      <div className='bottom'>
        <div className="icons">
          <label htmlFor="file">
          <img src="./img.png" alt="" />
          </label>
          <input type="file" name="file" id="file" style={{display:"none"}}   onChange={handleImg}/>
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked?"You cannot send message": "Type a message"} value={text} onChange={e=>setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={handlePopEmoji} />
          <div className="picker"></div>
          <EmojiPicker open={emoji} onEmojiClick={handleInputEmoji}/>
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  )
}

export default Chat