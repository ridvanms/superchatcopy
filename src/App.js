import logo from './logo.svg';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { addDoc, collection, getFirestore, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useRef, useState } from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore'
import {useAuthState} from 'react-firebase-hooks/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDagLFKtNqQeUQiLDDpga1qbUtRvnKb6fc",
  authDomain: "superchat-cd120.firebaseapp.com",
  projectId: "superchat-cd120",
  storageBucket: "superchat-cd120.firebasestorage.app",
  messagingSenderId: "626329271484",
  appId: "1:626329271484:web:fd6982460de9246c6e64b9"
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function SignIn(){
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }
  return(
    <button 
    onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const dummy = useRef();

  const messagesRef = collection(db,'messages');
  const messagesQuery = query(messagesRef,orderBy('createdAt'),limit(25));
  const [messages] = useCollectionData(messagesQuery,{idField: 'id'});

  const[formValue,setFormValue] = useState('');
  
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid,photoURL} = auth.currentUser;

    await addDoc(messagesRef,{
      text: formValue,
      createdAt:serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({behavior:"smooth"});
  }

  return(
    <>
      <main>
        <SignOut/>
        {messages && messages.map((msg,index) => <ChatMessage key={index} message={msg}/>)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value) } />
        <button type='submit'>📩</button>
      </form>
    </>

  )

}

function ChatMessage(props){
  const {text,uid,photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div
      className={`message ${messageClass}`}
    >
      <img src={photoURL} alt="profile" />
      <p>{text}</p>
    </div>
  )
}


function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        
      </header>
      <section>
        {user ? <ChatRoom/> : <SignIn/>}
      </section>
    </div>
  );
}

export default App;
