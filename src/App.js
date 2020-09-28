import React, { useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  useCollectionData,
  userCollectionData,
} from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "",
  authDomain: "appchat-28c00.firebaseapp.com",
  databaseURL: "https://appchat-28c00.firebaseio.com",
  projectId: "appchat-28c00",
  storageBucket: "appchat-28c00.appspot.com",
  messagingSenderId: "",
  appId: "1::web:43d1cd2a2a8330a64b4fb0",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chatroom</h1>
        <SignOut />
      </header>
      <section>{user ? <Chatroom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <div>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}
function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function Chatroom() {
  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(25);
  const [formValue, setFormValue] = useState("");
  const [messages] = useCollectionData(query, { idField: "id" });
  const dummy = useRef();
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behaviour: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <Chatmessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage} action="">
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          type="text"
        />
        <button type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}

function Chatmessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={"message ${messageClass}"}>
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  );
}
export default App;
