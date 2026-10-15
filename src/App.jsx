import { useState } from 'react';
import './App.css';
import { useEffect } from 'react';

function App() {
  const [userQue,setUserQue] = useState("");
  const [messageId,setMessageID]=useState(1);
  const [messages,setMessages]=useState([]);
  const fetchAnsOfUser = async (data) =>{
    try{
    const response  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ask-ai-assistant`,{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({data})
    });
    if(response.status === 200){
      const data = await response.json();
      const newMessage ={
        id:messageId,
        sender:"assistant",
        text:data,
        timeStamp:Date.now()
      }
      setMessageID(messageId+1);
      setMessages([...messages,newMessage]);
    }else if(response.status === 500){
      alert("Server error, please try after some time :(");
    }
    }catch(err){
      alert(err);
    }

  }
  const handleSendQue = ()=>{
    if(userQue.trim()===""){
      alert("Enter a valid que");
      setUserQue("");
      return;
    }
    const newMessage = {
      id:messageId,
      sender:"user",
      text:userQue,
      timeStamp:Date.now()
    }
    setMessageID(messageId+1);
    setMessages([...messages,newMessage]);
    fetchAnsOfUser(newMessage.text);
  }
  return <>
  <div>
    <div className='user'>
      <div className='user-input'>
        <input type='text'
        value={userQue}
        placeholder="Ask Shubham's Assistant"
        onChange={(e)=>setUserQue(e.target.value)}
        />
      </div>
      <div className='send-btn'>
        {userQue.length===0 ? (
          <div className='light color btn'></div>
        ):(
          <div className='send btn' onClick={handleSendQue}>send</div>
        )}
      </div>
    </div>
  </div>
  </>
}

export default App;