import React, { Component } from 'react'
import './App.css';
import Sidebar from './sidebar/sidebar'
import Editor from './editor/editor'


const firebase = require('firebase');
export default class App extends Component {
  
  constructor(){
    super()
    this.state={
      selectedNoteIndex:null,
      selectedNote:null,
      notes:null
    }
  }
  render() {
    return (
      <div className="app-container">
          <Sidebar 
          selectedNoteIndex={this.state.selectedNoteIndex} 
          notes={this.state.notes}
          deleteNote={this.deleteNote}
          selectNote={this.selectNote}
          newNote={this.newNote}
          />
          {
            this.state.selectedNote ?
              
          <Editor 
            selectedNote={this.state.selectedNote}
            selectedNoteIndex={this.state.selectedNoteIndex}
            notes={this.state.notes}
            noteUpdate={this.noteUpdate}
          />:
          <div className="initial-message">
              Select a note to get started.
          </div>
          }
      </div>
    )
  }
  componentDidMount=()=>{
    firebase
      .firestore()
      .collection('notes')
      .onSnapshot(serverUpdate => {
        const notes = serverUpdate.docs.map(_doc =>{
          const data = _doc.data();
          data['id'] = _doc.id;
          return data;
        });
        console.log(notes)
        this.setState({
          notes:notes
        })
      });

  }

selectNote=(note,index)=>{
    this.setState({selectedNoteIndex:index,selectedNote:note})
}
noteUpdate=(id,noteObj)=>{
  firebase
  .firestore()
  .collection('notes')
  .doc(id)
  .update({
    title:noteObj.title,
    body:noteObj.body,
    timestamp:firebase.firestore.FieldValue.serverTimestamp()
  })
}
newNote=async(title)=>{
  const note={
    title:title,
    body:''
  }
  const newnotedb=await firebase
  .firestore()
  .collection('notes')
  .add({
    title:note.title,
    body:note.body,
    timestamp:firebase.firestore.FieldValue.serverTimestamp()
  })
  const newId = newnotedb.id
  await this.setState({notes:[...this.state.notes,note]})
  const newNoteIndex = this.state.notes.indexOf(this.state.notes.filter(_note=>_note.id===newId)[0])
  this.setState({
    selectedNoteIndex:newNoteIndex,
    selectedNote:this.state.notes[newNoteIndex]
  })
}

deleteNote = async (note) => {
  const noteIndex = this.state.notes.indexOf(note);
  await this.setState({ notes: this.state.notes.filter(_note => _note !== note) });
  if(this.state.selectedNoteIndex === noteIndex) {
    this.setState({ selectedNoteIndex: null, selectedNote: null });
  } else {
    this.state.notes.length > 1 ?
    this.selectNote(this.state.notes[this.state.selectedNoteIndex - 1], this.state.selectedNoteIndex - 1) :
    this.setState({ selectedNoteIndex: null, selectedNote: null });
  }

  firebase
    .firestore()
    .collection('notes')
    .doc(note.id)
    .delete();
}


}
//on snapshot is called on every updation in firebase