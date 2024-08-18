import React, { useState } from 'react'
import './addUser.css'
import { collection, where,query, setDoc, serverTimestamp, updateDoc, arrayUnion, getDocs, doc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/userStore';


const AddUser = () => {
  const [user,setUser]=useState(null);
  const {currentUser}=useUserStore();


  const handleSearch= async e=>{
    e.preventDefault();
    const formData =new FormData(e.target);
    const username=formData.get("username");
    
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));

      const querySnapShot= await getDocs(q)

      if(!querySnapShot.empty)
      {
        setUser(querySnapShot.docs[0].data())
      }
      
    } catch (error) {
      console.log(error) 
    }
  }


  const handleAdd=async()=>{
    const chatRef=collection(db,"chats")
    const userChatRef=collection(db,"userchats")
    try {
      const newChatsRef=doc(chatRef)
      
      await setDoc(newChatsRef,{
        createdAt:serverTimestamp(),
        messages:[],
      });


      await updateDoc(doc(userChatRef,user.id),{
        chats:arrayUnion({
          chatId:newChatsRef.id,
          lastMessage:"",
          receiverId:currentUser.id,
          updateAt:Date.now(),
        })
      });

      await updateDoc(doc(userChatRef,currentUser.id),{
        chats:arrayUnion({
          chatId:newChatsRef.id,
          lastMessage:"",
          receiverId:user.id,
          updateAt:Date.now(),
        })
      });
      
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='addUser'>
        <form onSubmit={handleSearch} >
            <input type="text" placeholder='Username' name='username' />
            <button>Search</button>
        </form>
        {
          user && 
          <div className="user">
            <div className="detail">
                <img src={user.avatar || "./avatar.png"} alt="" />
                <span>{user.username}</span>
            </div>
            <button onClick={handleAdd}>Add User</button>
        </div>
        }
    </div>
  )
}

export default AddUser