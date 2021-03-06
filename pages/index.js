import Head from 'next/head'

import firebase from 'firebase/app';
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useEffect, useRef, useState } from 'react';




if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
  })
} else {
  firebase.app()
}

const auth = firebase.auth()
const firestore = firebase.firestore()



export default function Home() {
  const [user] = useAuthState(auth)

  return (
    <div >
        <header className="bg-white w-full fixed top-0 p-4 flex justify-between justify-center border-b-2 border-gray-100">
          <h1 className="text-2xl"><span>🔥</span>greg's guestbook</h1>
          {user && <SignOut />}
        </header>
          <div className="bg=gray-500 maxW-80">{user ? <Feed /> : <SignIn />}</div>
    </div>
  )
}

function SignIn() {
  function signInWithGoogle(){
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return (
    <div className="mx-auto w-6/12 pt-64 flex">
      <button className="py-4 px-8 mx-auto text-lg display-block font-semibold shadow-md text-white bg-black hover:bg-gray-800 rounded-md" onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className="py-2 px-4 font-semibold shadow-md text-white bg-black hover:bg-gray-800 rounded-md" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function Feed() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const bottomRef = useRef(null)
  const [messages] = useCollectionData(query, {idField: 'id'})
  const [formValue, setFormValue] = useState('');

  const scrollToBottom = () => {
    bottomRef.current.scrollIntoView({  behavior: "smooth",
    block: "start", })
  }

  const sendMessage = async(e) => {
    e.preventDefault()

    const { uid, photoURL } = auth.currentUser

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    })

    setFormValue('')

    scrollToBottom()
  }

  useEffect(() => {
    scrollToBottom()
  })

  return (
    <section className="my-12">
      <main className="p-4 h-4/5 overflow-x-hidden ">
        {messages && messages.map(msg => <Message key={msg.id} message={msg} />)}
        <span ref={bottomRef}></span>
      </main>
      <form className="bg-gray-500 w-full flex justify-between fixed bottom-0" onSubmit={sendMessage}>
        <input className="h-16 w-4/5 rounded-none bg-gray-200 px-8 text-lg" placeholder="Share something nice here :)" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button disabled={!formValue} className={`disabled:opacity-50 disabled:cursor-not-allowed rounded-none h-16 w-1/5 py-2 px-4 font-semibold shadow-md text-white bg-black rounded-none text-lg`} type="submit">Send <span>🕊</span></button>
      </form>
    </section>
  )
}

function Message(props){
  const { text, uid, photoURL, id } = props.message
  const messagesRef = firestore.collection('messages')

  const messageStatus = uid === auth.currentUser.uid ? 'sent' : 'received'

  const deleteMessage = async (e, docId) => {
    e.preventDefault()

    const { uid } = auth.currentUser

    if (uid === auth.currentUser.uid) {
      await messagesRef.doc(`${docId}`).delete().then(() => {
        console.log('successfully deleted!!');
      }).catch((error) => {
        console.error('something went wrong!', error);
      })
    }
  }

  return (
    <div className={`flex my-6 items-center ${messageStatus === 'sent' ? 'flex-row-reverse' : 'flex-row'}`}>
      <img className="rounded-full h-14 w-14 mr-2" src={photoURL} alt="" />
      <div className={`${messageStatus === 'sent' ? 'p-4 bg-black text-white rounded-l-full rounded-tr-full' : 'p-4 bg-gray-200 rounded-r-full rounded-tl-full'} mr-2`}>
        <h3 className="text-md">{text}</h3>
      </div>
      {messageStatus === "sent" && <span onClick={(e) => deleteMessage(e, id)} className="cursor-pointer mr-2">🗑</span>}
    </div>
  )
}