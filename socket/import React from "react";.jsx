import React from "react";
import "./messenger.css";
import Topbar from "../../components/topbar/Topbar";
import Conversations from "../../components/conversations/Conversations";
import Message from "../../components/message/Message";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useRef } from "react";
import {io} from "socket.io-client"

// const socket = io("ws://localhost/8500")

const instance = axios.create({
  baseURL: "http://localhost:8000/api",
});

function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("")
  const socket = useRef()

  const { user } = useContext(AuthContext);


  // const socket = useRef(io("ws://localhost:8500"))

  useEffect(() => {
    socket.current = io("ws://localhost:8500")
  }, [])



  useEffect(() => {
    socket.current.emit("addUser", user?._id)
    socket.current.on("getUser", users => {
      console.log(users)
    })
  }, [user])
 


  const scrollRef = useRef()

  useEffect(() => {
    const getConversations = async () => {
      try {
        const response = await instance.get("/conversations/" + user?._id);
        setConversations(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user._id]);

  useEffect(() => {
    const getMessages = async () => {
      try{
        const response = await instance.get("/messages/"+currentChat?._id)
        // console.log(response) 
        setMessages(response.data)
      }
      catch(err){
        console.log(err)
    }
    }
    getMessages()
  }, [currentChat])


  //todo: come here again

  useEffect(() => {
    socket?.on("welcome", message => {
      console.log(message)
    })
  }, [socket])

  console.log(messages)


  const handleSubmit = async (e) => {
    e.preventDefault()
    const message = {
      sender : user._id,
      text : newMessage,
      conversationId : currentChat._id
    }

    try{
      const response = await instance.post("/messages", message)
      setMessages([...messages, response.data])
      setNewMessage("")
    }
    catch(err){
      console.log(err)
    }
  }


  useEffect(() => {
    scrollRef.current?.scrollIntoView({behavior : "smooth"})
  }, [messages])


  return (
    <div>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input
              type="text"
              className="chatMenuInput"
              placeholder="search for friends"
            />

            {conversations.map((c) => (
              <div onClick={() => setCurrentChat(c)}>
                <Conversations conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            { currentChat 
              ? 
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message message={m} own={m.sender === user._id}/>
                    </div>
                  ))}
                </div>

                <div className="chatBoxBottom">
                  <textarea
                    placeholder="Write something..."
                    className="chatMessageInput"
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>

                  <button className="chatSubmitButton" onClick={handleSubmit}>send</button>
                </div>
              </>

              : 
                <span className="noConversationText">Opne a Conversation to start a chat.</span>
            }
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper"></div>
        </div>
      </div>
    </div>
  );
}

export default Messenger;