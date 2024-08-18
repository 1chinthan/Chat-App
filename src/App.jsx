import Details from "./components/detail/Details"
import Chat from "./components/chat/Chat"
import List from "./components/list/List"
import { Login } from "./components/login/Login"
import Notification from "./components/notification/Notification"
import { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "./lib/firebase"
import { useUserStore } from "./lib/userStore"
import Loading from "./components/Loading/Loading"
import { useChatStore } from "./lib/chatStore"

const App = () => {
  const {currentUser,isLoading,fetchUserInfo}=useUserStore()
  const {chatId}=useChatStore();
  useEffect(()=>{
    const unSub=onAuthStateChanged(auth,(user)=>{
      fetchUserInfo(user?.uid);
    });
    return ()=>{
      unSub();
    }
  },[fetchUserInfo]);


  if(isLoading) return <Loading/>

  return (
    <div className='container'>
      {
        currentUser?(
          <>
           <List/>
           {chatId && <Chat/>}
           {chatId && <Details/>}
          </>
        ):(<Login/>)
      }
      <Notification/>
    </div>
  )
}

export default App